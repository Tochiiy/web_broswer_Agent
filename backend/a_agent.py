import asyncio
import base64
import json
import os
from dataclasses import dataclass
from typing import Any
from playwright.async_api import async_playwright
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()


client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
    timeout=60.0 
)

VISION_MODEL = "openrouter/free"
MAX_STEPS = 15


@dataclass
class Action:
    name: str
    args: dict
    reasoning: str


TOOLS = [

    {
        "type": "function",
        "function": {
            "name": "click",
            "description": "Click at a specific x,y coordinate on the page",
            "parameters": {
                "type": "object",
                "properties": {
                    "x": {"type": "number", "description": "X coordinate"},
                    "y": {"type": "number", "description": "Y coordinate"},
                    "reasoning": {"type": "string", "description": "Why you are clicking here"}
                },
                "required": ["x", "y", "reasoning"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "type",
            "description": "Type text into the currently focused element",
            "parameters": {
                "type": "object",
                "properties": {
                    "text": {"type": "string", "description": "Text to type"},
                    "reasoning": {"type": "string", "description": "Why you are typing this"}
                },
                "required": ["text", "reasoning"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "navigate",
            "description": "Navigate the browser to a URL",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {"type": "string", "description": "Full URL to navigate to"},
                    "reasoning": {"type": "string", "description": "Why you are navigating here"}
                },
                "required": ["url", "reasoning"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "scroll",
            "description": "Scroll the page up or down",
            "parameters": {
                "type": "object",
                "properties": {
                    "direction": {"type": "string", "enum": ["up", "down"]},
                    "amount": {"type": "number", "description": "Pixels to scroll"},
                    "reasoning": {"type": "string", "description": "Why you are scrolling"}
                },
                "required": ["direction", "amount", "reasoning"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "wait",
            "description": "Wait for the page to load or an animation to finish",
            "parameters": {
                "type": "object",
                "properties": {
                    "milliseconds": {"type": "number", "description": "How long to wait"},
                    "reasoning": {"type": "string", "description": "Why you are waiting"}
                },
                "required": ["milliseconds", "reasoning"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "done",
            "description": "Call this when the task is fully complete",
            "parameters": {
                "type": "object",
                "properties": {
                    "result": {"type": "string", "description": "Final answer or summary"},
                    "reasoning": {"type": "string", "description": "Why the task is complete"}
                },
                "required": ["result", "reasoning"]
            }
        }
    }
]


class AutonomousAgent:
    def __init__(self, callback=None):
        self.playwright = None
        self.browser = None
        self.page = None
        self.callback = callback or self._default_callback

    async def _default_callback(self, event_type: str, data: Any):
        if event_type == "thought":
            print(f" {data}")
        elif event_type == "action":
            print(f" Action: {data['name']} — {data['reasoning']}")
        elif event_type == "done":
            print(f"Done: {data}")
        elif event_type == "error":
            print(f"Error: {data}")

    async def init_browser(self):
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-gpu",
                "--disable-dev-shm-usage",
            ]
        )
        self.page = await self.browser.new_page(
            viewport={"width": 1280, "height": 720}
        )
        print("🌐 Browser ready")

    async def close_browser(self):
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
        self.playwright = None
        self.browser = None
        self.page = None

    async def _dismiss_modals(self):
        """Attempts to automatically click away common cookie banners before giving context to the LLM"""
        try:
            await self.page.evaluate("""
                () => {
                    const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
                    const consentButton = buttons.find(b => 
                        b.innerText.match(/accept all|reject all|agree|alles accepteren/i)
                    );
                    if (consentButton) consentButton.click();
                }
            """)
           
            await self.page.wait_for_timeout(500)
        except Exception:
            pass 

    async def get_screenshot_base64(self) -> str:
        screenshot_bytes = await self.page.screenshot(
            type="png",
            full_page=False
        )
        return base64.b64encode(screenshot_bytes).decode("utf-8")

    async def get_page_context(self) -> dict:
        try:
            return {
                "url": self.page.url,
                "title": await self.page.title(),
                "text": await self.page.evaluate("""
                    () => document.body.innerText.slice(0, 3000)
                """)
            }
        except Exception:
            return {"url": "unknown", "title": "unknown", "text": "not available"}

    async def decide_action(self, goal: str, screenshot_b64: str, history: list, context: dict = None) -> Action:
        messages = [
            {
                "role": "system",
                "content": """You are an autonomous web agent controlling a real browser.

You will receive:
- A goal to accomplish
- Current page URL and title
- Visible page text (first 3000 chars)
- A screenshot of the current browser state
- History of actions already taken

CRITICAL RULES:
1. Decide the SINGLE best next action to take.
2. If you see a blocking pop-up, modal, or cookie banner covering the screen, you MUST dismiss it first (by clicking its close/accept button) before interacting with the main UI.
3. Be precise with coordinates — click exactly on buttons/links you can see in the screenshot.
4. If you need to type in a field, click it first, then type.
5. Do NOT call done() until you visually verify on the screen that the expected outcome has actually occurred."""
            }
        ]

        for step in history:
            messages.append({
                "role": "assistant",
                "content": f"Step {step['step']}: {step['thought']}\nAction taken: {step['action']}\nOutcome: {step['outcome']}"
            })

        messages.append({
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": f"""Goal: {goal}

Current URL: {context['url'] if context else 'unknown'}
Page title: {context['title'] if context else 'unknown'}
Page text (first 3000 chars):
{context['text'] if context else 'not available'}

Screenshot attached. What is your next action?"""
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/png;base64,{screenshot_b64}"
                    }
                }
            ]
        })

        response = client.chat.completions.create(
            model=VISION_MODEL,
            messages=messages,
            tools=TOOLS,
            tool_choice="required",
            max_tokens=1000,
        )

        tool_call = response.choices[0].message.tool_calls[0]
        tool_name = tool_call.function.name
        tool_args = json.loads(tool_call.function.arguments)

        return Action(
            name=tool_name,
            args=tool_args,
            reasoning=tool_args.get("reasoning", "")
        )

    async def execute_action(self, action: Action) -> str:
        args = action.args

        if action.name == "click":
            x, y = args["x"], args["y"]
            await self.page.mouse.click(x, y)
            await self.page.wait_for_timeout(1000)
            return f"Clicked at ({x}, {y})"

        elif action.name == "type":
            text = args["text"]
            await self.page.keyboard.type(text)
            await self.page.wait_for_timeout(500)
            return f"Typed: {text}"

        elif action.name == "navigate":
            url = args["url"]
            await self.page.goto(url, wait_until="load", timeout=60000)
            await self.page.wait_for_timeout(2000)
            return f"Navigated to: {url}"

        elif action.name == "scroll":
            direction = args["direction"]
            amount = args.get("amount", 300)
            if direction == "down":
                await self.page.evaluate(f"window.scrollBy(0, {amount})")
            else:
                await self.page.evaluate(f"window.scrollBy(0, -{amount})")
            await self.page.wait_for_timeout(500)
            return f"Scrolled {direction} by {amount}px"

        elif action.name == "wait":
            ms = args.get("milliseconds", 2000)
            await self.page.wait_for_timeout(ms)
            return f"Waited {ms}ms"

        elif action.name == "done":
            return "DONE"

        return "Unknown action"

    async def run(self, goal: str) -> str:
        history = []
        result = "Agent did not complete the task"

        try:
            await self.init_browser()
            await self.callback("thought", f"Starting task: {goal}")

            for step in range(1, MAX_STEPS + 1):
                await self.callback("thought", f"Step {step}: Observing page...")

                # Auto-dismiss modals BEFORE taking the screenshot
                await self._dismiss_modals()
                
                screenshot_b64 = await self.get_screenshot_base64()
                await self.callback("screenshot", screenshot_b64)
                context = await self.get_page_context()

                await self.callback("thought", f"Step {step}: Thinking...")
                action = await self.decide_action(goal, screenshot_b64, history, context)

                await self.callback("thought", f"Step {step}: {action.reasoning}")
                await self.callback("action", {
                    "name": action.name,
                    "args": action.args,
                    "reasoning": action.reasoning
                })

                outcome = await self.execute_action(action)

                history.append({
                    "step": step,
                    "thought": action.reasoning,
                    "action": f"{action.name}({action.args})",
                    "outcome": outcome
                })

                if action.name == "done":
                    result = action.args.get("result", "Task completed")
                    await self.callback("done", result)
                    break

                if step == MAX_STEPS:
                    result = "Reached maximum steps without completing task"
                    await self.callback("error", result)

        except Exception as e:
            import traceback
            error_msg = f"Agent error: {str(e)}"
            traceback.print_exc()
            await self.callback("error", error_msg)
            result = error_msg

        finally:
            await self.close_browser()

        return result


# ─────────────────────────────────────────────
# TEST
# ─────────────────────────────────────────────
async def main():
    agent = AutonomousAgent()
    result = await agent.run("Go to google.com and search for AI news")
    print(f"\n🎯 Final result: {result}")

if __name__ == "__main__":
    asyncio.run(main())

import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from a_agent import AutonomousAgent

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://web-browser-agent.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "Agent server running"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("🔌 Frontend connected")

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message["type"] == "goal":
                goal = message["payload"]
                print(f"🎯 Received goal: {goal}")

                async def callback(event_type: str, data):
                    payload = data if isinstance(data, str) else json.dumps(data)
                    await websocket.send_text(json.dumps({
                        "type": event_type,
                        "payload": payload
                    }))

                agent = AutonomousAgent(callback=callback)
                await agent.run(goal)

    except WebSocketDisconnect:
        print("🔌 Frontend disconnected")
    except Exception as e:
        print(f"❌ Error: {e}")
        try:
            await websocket.send_text(json.dumps({
                "type": "error",
                "payload": str(e)
            }))
        except:
            pass

if __name__ == "__main__":
    import uvicorn
    import sys

    if sys.platform == "win32":
        import asyncio
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

    uvicorn.run(app, host="0.0.0.0", port=8000, loop="asyncio")
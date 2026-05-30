# Autonomous Web Agent

# live link https://web-browser-agent.vercel.app

https://web-browser-agent.vercel.app

A browser agent that uses vision LLM to autonomously control
a real browser and complete web tasks.

## Stack

- **Backend**: FastAPI + WebSocket + Playwright
- **Frontend**: React + TypeScript + Vite
- **LLM**: Google Gemini 2.0 Flash (via OpenRouter)
- **Hosting**: Railway (backend) + Vercel (frontend)

## How it works

1. User types a goal in the UI
2. Agent opens a real browser
3. Takes screenshots → sends to vision LLM
4. LLM decides: click / type / navigate / scroll
5. Repeats until goal is complete

## Features

- Live browser screenshots streamed to UI
- Real-time agent thought log
- Vision + HTML text context for smarter decisions
- Tool calling for structured actions

## Setup

1. Clone the repo
2. Add `.env` with `OPENROUTER_API_KEY`
3. `uv sync && uv run playwright install chromium`
4. `uv run uvicorn main:app --port 8000`

- Autonomous agent loops (observe → think → act)
- Vision LLM tool calling
- WebSocket streaming
- FastAPI + React full stack
- Docker + Railway deployment

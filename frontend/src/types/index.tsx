export type AgentStatus = "idle" | "running" | "done" | "error"

export type ThoughtEntry = {
  id: number
  step: number
  thought: string
  timestamp: string
  action?: string
}

export type WebSocketMessage =
  | { type: "screenshot"; payload: string }
  | { type: "thought";    payload: string }
  | { type: "action";     payload: { name: string } | string }
  | { type: "done";       payload: string }
  | { type: "error";      payload: string }

export const ACTION_COLORS: Record<string, string> = {
  click:    "#3b82f6",
  type:     "#10b981",
  navigate: "#f59e0b",
  scroll:   "#8b5cf6",
  wait:     "#6b7280",
  done:     "#22c55e",
}
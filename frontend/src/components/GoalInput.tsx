import { useState } from "react"
import type { AgentStatus } from "../types"

type Props = {
  status: AgentStatus
  isConnected: boolean
  onSubmit: (goal: string) => void
}

export default function GoalInput({ status, isConnected, onSubmit }: Props) {
  const [goal, setGoal] = useState("")
  const running = status === "running"

  const handleSubmit = () => {
    if (!goal.trim() || running || !isConnected) return
    onSubmit(goal)
  }

  return (
    <div style={{
      display: "flex",
      gap: "10px",
      padding: "14px 20px",
      borderBottom: "1px solid #1a1a1a",
      background: "#0d0d0d",
    }}>
      <input
        value={goal}
        onChange={e => setGoal(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleSubmit()}
        disabled={running}
        placeholder="Enter goal...  e.g. Go to google.com and search for AI news"
        style={{
          flex: 1,
          background: "#111",
          border: "1px solid #1f1f1f",
          borderRadius: "8px",
          padding: "10px 14px",
          color: "#e5e5e5",
          fontSize: "13px",
          fontFamily: "inherit",
          outline: "none",
          opacity: running ? 0.5 : 1,
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={running || !goal.trim() || !isConnected}
        style={{
          background: running ? "#1a1a1a" : "#fff",
          color: running ? "#444" : "#000",
          border: "none",
          borderRadius: "8px",
          padding: "10px 22px",
          fontSize: "13px",
          fontWeight: 600,
          cursor: running ? "not-allowed" : "pointer",
          fontFamily: "inherit",
          letterSpacing: "0.05em",
          transition: "background 0.15s",
        }}
      >
        {running ? "RUNNING..." : "RUN →"}
      </button>
    </div>
  )
}
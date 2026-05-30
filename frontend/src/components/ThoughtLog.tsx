import { useEffect, useRef } from "react"
import type { ThoughtEntry } from "../types"
import { ACTION_COLORS } from "../types"

type Props = {
  thoughts: ThoughtEntry[]
  status: string
}

export default function ThoughtLog({ thoughts, status }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [thoughts])

  return (
    <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{
        padding: "10px 16px",
        borderBottom: "1px solid #1a1a1a",
        fontSize: "10px",
        color: "#444",
        letterSpacing: "0.1em",
      }}>
        AGENT THOUGHTS
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        {thoughts.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "48px", opacity: 0.3 }}>
            <div style={{ fontSize: "28px", marginBottom: "8px" }}>💭</div>
            <div style={{ fontSize: "11px", color: "#555" }}>
              {status === "running" ? "Thinking..." : "Waiting for goal..."}
            </div>
          </div>
        ) : (
          thoughts.map(entry => (
            <div key={entry.id} style={{
              marginBottom: "10px",
              padding: "10px 12px",
              background: "#111",
              borderRadius: "6px",
              borderLeft: `3px solid ${entry.action ? (ACTION_COLORS[entry.action] ?? "#555") : "#222"}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontSize: "10px", color: "#555", letterSpacing: "0.05em" }}>
                  STEP {entry.step}
                </span>
                <span style={{ fontSize: "10px", color: "#333" }}>{entry.timestamp}</span>
              </div>

              <p style={{ fontSize: "12px", color: "#aaa", margin: 0, lineHeight: 1.5 }}>
                {entry.thought}
              </p>

              {entry.action && (
                <span style={{
                  display: "inline-block",
                  marginTop: "6px",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "10px",
                  letterSpacing: "0.05em",
                  background: `${ACTION_COLORS[entry.action] ?? "#333"}22`,
                  color: ACTION_COLORS[entry.action] ?? "#666",
                }}>
                  {entry.action.toUpperCase()}
                </span>
              )}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
import type { AgentStatus}  from "../types"
import   { ACTION_COLORS } from "../types"

type Props = {
  status: AgentStatus
  isConnected: boolean
  stepCount: number
  onReset: () => void
}

const statusColor = (s: AgentStatus) => ({
  running: "#f59e0b",
  done:    "#22c55e",
  error:   "#ef4444",
  idle:    "#333",
}[s])

export default function Sidebar({ status, isConnected, stepCount, onReset }: Props) {
  return (
    <aside style={{
      width: "220px",
      minWidth: "220px",
      borderRight: "1px solid #1a1a1a",
      background: "#0d0d0d",
      display: "flex",
      flexDirection: "column",
      padding: "20px 16px",
      gap: "28px",
    }}>

      {/* Logo */}
      <div>
        <p style={{ fontSize: "10px", color: "#444", letterSpacing: "0.15em", margin: 0 }}>
          AUTONOMOUS AGENT
        </p>
        <h1 style={{ fontSize: "17px", fontWeight: 700, color: "#fff", margin: "4px 0 0" }}>
          WebAgent
        </h1>
      </div>

      {/* Status */}
      <section>
        <Label>STATUS</Label>
        <Dot color={isConnected ? "#22c55e" : "#ef4444"} glow />
        <span style={{ fontSize: "12px", color: "#888" }}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>
        <div style={{ height: "8px" }} />
        <Dot color={statusColor(status)} />
        <span style={{ fontSize: "12px", color: "#888", textTransform: "uppercase" }}>
          {status}
        </span>
      </section>

      {/* Steps */}
      <section>
        <Label>STEPS TAKEN</Label>
        <p style={{ fontSize: "32px", fontWeight: 700, color: "#fff", margin: 0 }}>
          {stepCount}
        </p>
      </section>

      {/* Action legend */}
      <section>
        <Label>ACTIONS</Label>
        {Object.entries(ACTION_COLORS).map(([name, color]) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "2px", background: color }} />
            <span style={{ fontSize: "11px", color: "#555" }}>{name}</span>
          </div>
        ))}
      </section>

      {/* Reset */}
      {status !== "idle" && (
        <button onClick={onReset} style={{
          marginTop: "auto",
          background: "transparent",
          border: "1px solid #222",
          color: "#555",
          padding: "8px 12px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "12px",
          fontFamily: "inherit",
          letterSpacing: "0.05em",
        }}>
          ↺  RESET
        </button>
      )}
    </aside>
  )
}

// ── small helpers ──────────────────────────────
function Label({ children }: { children: string }) {
  return (
    <p style={{ fontSize: "10px", color: "#444", letterSpacing: "0.12em", margin: "0 0 8px" }}>
      {children}
    </p>
  )
}

function Dot({ color, glow }: { color: string; glow?: boolean }) {
  return (
    <span style={{
      display: "inline-block",
      width: "7px", height: "7px",
      borderRadius: "50%",
      background: color,
      boxShadow: glow ? `0 0 6px ${color}` : "none",
      marginRight: "8px",
      verticalAlign: "middle",
    }} />
  )
}
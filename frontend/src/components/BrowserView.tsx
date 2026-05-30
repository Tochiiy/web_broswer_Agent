import type { AgentStatus } from "../types"

type Props = {
  screenshot: string | null
  status: AgentStatus
  result: string | null
  error: string | null
}

export default function BrowserView({ screenshot, status, result, error }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", borderRight: "1px solid #1a1a1a" }}>

      <SectionHeader>BROWSER VIEW</SectionHeader>

      {/* Screenshot area */}
      <div style={{
        flex: 1,
        overflow: "auto",
        background: "#080808",
        display: "flex",
        alignItems: screenshot ? "flex-start" : "center",
        justifyContent: "center",
        padding: "16px",
      }}>
        {screenshot ? (
          <img
            src={`data:image/png;base64,${screenshot}`}
            alt="Browser screenshot"
            style={{ width: "100%", borderRadius: "6px", border: "1px solid #1a1a1a" }}
          />
        ) : (
          <div style={{ textAlign: "center", opacity: 0.4 }}>
            <div style={{ fontSize: "36px", marginBottom: "10px" }}>🌐</div>
            <div style={{ fontSize: "12px", color: "#444" }}>
              {status === "running" ? "Loading browser..." : "Screenshot will appear here"}
            </div>
          </div>
        )}
      </div>

      {/* Result / Error strip */}
      {(result || error) && (
        <div style={{
          borderTop: "1px solid #1a1a1a",
          padding: "12px 16px",
          background: result ? "#0a1a0a" : "#1a0a0a",
        }}>
          <p style={{
            fontSize: "10px",
            letterSpacing: "0.1em",
            color: result ? "#22c55e" : "#ef4444",
            margin: "0 0 4px",
          }}>
            {result ? "✓ RESULT" : "✗ ERROR"}
          </p>
          <p style={{ fontSize: "12px", color: result ? "#86efac" : "#fca5a5", margin: 0, lineHeight: 1.6 }}>
            {result ?? error}
          </p>
        </div>
      )}
    </div>
  )
}

function SectionHeader({ children }: { children: string }) {
  return (
    <div style={{
      padding: "10px 16px",
      borderBottom: "1px solid #1a1a1a",
      fontSize: "10px",
      color: "#444",
      letterSpacing: "0.1em",
    }}>
      {children}
    </div>
  )
}
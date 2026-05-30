import { useWebSocket } from "./hooks/useWebSocket"
import Sidebar from "./components/Sidebar"
import GoalInput   from "./components/GoalInput"
import BrowserView from "./components/BrowserView"
import ThoughtLog  from "./components/ThoughtLog"

export default function App() {
//const isLocalhost = window.location.hostname === "localhost";
  
 
  //const wsUrl = isLocalhost 
   // ? "ws://localhost:8000/ws" 
   // : "wss:webbrosweragent-production.up.railway.app/ws";



  const {
    status, screenshot, thoughts,
    result, error, isConnected,
    stepCount, sendGoal, reset,
  } = useWebSocket("wss://web-broswer-agent.onrender.com/ws")

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: "#0a0a0a",
      color: "#e5e5e5",
      fontFamily: "'Geist Mono', 'Fira Code', monospace",
      overflow: "hidden",
    }}>
      <Sidebar
        status={status}
        isConnected={isConnected}
        stepCount={stepCount}
        onReset={reset}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <GoalInput
          status={status}
          isConnected={isConnected}
          onSubmit={sendGoal}
        />

        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 320px", overflow: "hidden" }}>
          <BrowserView
            screenshot={screenshot}
            status={status}
            result={result}
            error={error}
          />
          <ThoughtLog
            thoughts={thoughts}
            status={status}
          />
        </div>
      </div>
    </div>
  )
}
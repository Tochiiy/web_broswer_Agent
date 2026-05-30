import { useState, useEffect, useRef } from "react"
import type { AgentStatus, ThoughtEntry, WebSocketMessage } from "../types/index"

export function useWebSocket(url: string) {
  const [status, setStatus]       = useState<AgentStatus>("idle")
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [thoughts, setThoughts]   = useState<ThoughtEntry[]>([])
  const [result, setResult]       = useState<string | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const wsRef   = useRef<WebSocket | null>(null)
  const stepRef = useRef(0)

  useEffect(() => {
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen  = () => setIsConnected(true)
    ws.onclose = () => setIsConnected(false)

    ws.onmessage = (event) => {
      const msg: WebSocketMessage = JSON.parse(event.data)

      switch (msg.type) {
        case "screenshot":
          setScreenshot(msg.payload)
          break

        case "thought":
          stepRef.current += 1
          setThoughts(prev => [...prev, {
            id:        Date.now(),
            step:      stepRef.current,
            thought:   msg.payload,
            timestamp: new Date().toLocaleTimeString(),
          }])
          break

        case "action":
          setThoughts(prev => {
            if (prev.length === 0) return prev
            const updated = [...prev]
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              action: typeof msg.payload === "string"
                ? msg.payload
                : msg.payload.name,
            }
            return updated
          })
          break

        case "done":
          setResult(msg.payload)
          setStatus("done")
          break

        case "error":
          setError(msg.payload)
          setStatus("error")
          break
      }
    }

    return () => ws.close()
  }, [url])

  const sendGoal = (goal: string) => {
    if (!wsRef.current || !goal.trim()) return
    setStatus("running")
    setThoughts([])
    setScreenshot(null)
    setResult(null)
    setError(null)
    stepRef.current = 0
    wsRef.current.send(JSON.stringify({ type: "goal", payload: goal }))
  }

  const reset = () => {
    setStatus("idle")
    setThoughts([])
    setScreenshot(null)
    setResult(null)
    setError(null)
    stepRef.current = 0
  }

  return {
    status, screenshot, thoughts,
    result, error, isConnected,
    stepCount: stepRef.current,
    sendGoal, reset,
  }
}
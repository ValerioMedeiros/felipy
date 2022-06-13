import { useEffect } from "react"
import { Turtle } from "turtle-graphics"

const pyodideWorker = new Worker("pyodideWorker.js")

export function getCodeRunner(
  setLoading: (loaded: boolean) => void,
  setCodeRunning: (running: boolean) => void,
  onError: (error: string) => void
) {
  const interruptBuffer = new Uint8Array(new SharedArrayBuffer(1))
  const awaitBuffer = new Int32Array(new SharedArrayBuffer(1024))

  pyodideWorker.postMessage({ cmd: "setInterruptBuffer", interruptBuffer })
  pyodideWorker.postMessage({ cmd: "setAwaitBuffer", awaitBuffer })

  function interruptExecution() {
    interruptBuffer[0] = 2
  }

  function runCode(code: string) {
    interruptBuffer[0] = 0
    pyodideWorker.postMessage({ cmd: "runCode", code })
    setCodeRunning(true)
  }

  useEffect(() => {
    const turtle = new Turtle(document.getElementById("turtle")!)
    console.log(turtle)
  }, [])

  pyodideWorker.onmessage = (msg) => {
    switch (msg.data.cmd) {
      case "loaded":
        setLoading(false)
        break
      case "runCodeResult":
        setCodeRunning(false)
        break
      case "runCodeError":
        setCodeRunning(false)
        onError(msg.data.error)
        break
    }
  }

  return {
    interruptExecution,
    runCode
  }
}

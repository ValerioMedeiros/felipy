import { TargetProxy } from "./proxy/target"

const pyodideWorker = new Worker("pyodideWorker.js")
const targetProxy = new TargetProxy(pyodideWorker)
targetProxy.register("document", document)

export function getCodeRunner(
  setLoading: (loaded: boolean) => void,
  setCodeRunning: (running: boolean) => void
) {
  const interruptBuffer = new Uint8Array(new SharedArrayBuffer(1))

  pyodideWorker.postMessage({ cmd: "setInterruptBuffer", interruptBuffer })

  function interruptExecution() {
    interruptBuffer[0] = 2
  }

  function runCode(code: string) {
    interruptBuffer[0] = 0
    pyodideWorker.postMessage({ cmd: "runCode", code })
    setCodeRunning(true)
  }

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
        break
    }
  }

  return {
    interruptExecution,
    runCode
  }
}

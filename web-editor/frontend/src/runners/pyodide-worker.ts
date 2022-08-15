const pyodideWorker = new Worker(
  new URL("./pyodideWorker.ts", import.meta.url),
  {
    type: "module"
  }
)

export function getCodeRunner(
  setLoading: (loaded: boolean) => void,
  setCodeRunning: (running: boolean) => void,
  onError: (error: string) => void
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
      case "runCodeOutput":
        console.log(msg.data.output)
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

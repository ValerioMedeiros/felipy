import { useEffect, useRef } from "preact/hooks"

interface IParams {
  setLoading: (loaded: boolean) => void,
  setCodeRunning: (running: boolean) => void,
  onOutput: (output: string, error: boolean) => void,
  onInput: () => Promise<string>,
  onFlush: (final?: boolean) => void
}

export function useCodeRunner({ setLoading, setCodeRunning, onOutput, onInput, onFlush }: IParams) {
  const pyodideWorker = useRef<Worker>()
  const interruptBuffer = useRef<Uint8Array>(new Uint8Array(new SharedArrayBuffer(1)))

  useEffect(() => {
    pyodideWorker.current = new Worker(new URL("../pyodideWorker.ts", import.meta.url))

    const interruptBuffer = new Uint8Array(new SharedArrayBuffer(1))

    pyodideWorker.current.postMessage({ cmd: "setInterruptBuffer", interruptBuffer })

    pyodideWorker.current.onmessage = (msg) => {
      switch (msg.data.cmd) {
        case "loaded":
          setLoading(false)
          break
        case "consoleFlush":
          onFlush(msg.data.final)

          if (msg.data.final) {
            setCodeRunning(false)
          }

          break
        case "consoleOutput":
          onOutput(msg.data.output, msg.data.error)
          break
      }
    }
  }, [])

  function interruptExecution() {
    interruptBuffer.current[0] = 2
  }

  function runCode(code: string) {
    interruptBuffer.current[0] = 0
    pyodideWorker.current?.postMessage({ cmd: "runCode", code })
    setCodeRunning(true)
  }

  return {
    interruptExecution,
    runCode
  }
}

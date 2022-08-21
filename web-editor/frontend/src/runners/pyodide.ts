import { useEffect, useRef } from "preact/hooks"
import type { PyodideInterface } from "pyodide/api"
import type { loadPyodide as loadPyodideInterface } from "pyodide/pyodide"
import { Turtle } from "turtle-graphics"

declare const loadPyodide: typeof loadPyodideInterface

interface IParams {
  setLoading: (loaded: boolean) => void,
  setCodeRunning: (running: boolean) => void,
  onOutput: (output: string) => void,
  onInput: () => string,
  onError: (error: string) => void
}

export function useCodeRunner({ setLoading, setCodeRunning, onOutput, onInput, onError }: IParams) {
  const interruptBuffer = new Uint8Array(new SharedArrayBuffer(1))

  const pyodide = useRef<PyodideInterface>()

  useEffect(() => {
    ;(async () => {
      await import("https://cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js")

      pyodide.current = await loadPyodide({
        stderr: onError,
        stdout: onOutput,
        stdin: onInput
      })
      await pyodide.current.loadPackage("micropip")
      await pyodide.current.runPythonAsync(`
        import micropip

        await micropip.install("freegames")
      `)

      pyodide.current.setInterruptBuffer(interruptBuffer)

      const turtle = new Turtle(document.getElementById("turtle")!)

      pyodide.current.registerJsModule("turtle", turtle)

      setLoading(false)
    })()
  }, [])

  function interruptExecution() {
    interruptBuffer[0] = 2
  }

  async function runCode(code: string) {
    interruptBuffer[0] = 0

    setCodeRunning(true)

    try {
      await pyodide.current?.runPythonAsync(code)
    } catch (error) {
      onError(error as string)
    } finally {
      setCodeRunning(false)
    }
  }

  return {
    interruptExecution,
    runCode
  }
}

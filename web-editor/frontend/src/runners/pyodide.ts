import { useEffect, useRef } from "preact/hooks"
import type { PyodideInterface } from "pyodide/api"
import type { loadPyodide as loadPyodideInterface } from "pyodide/pyodide"
import { Turtle } from "turtle-graphics"

declare const loadPyodide: typeof loadPyodideInterface

export function getCodeRunner(
  setLoading: (loaded: boolean) => void,
  setCodeRunning: (running: boolean) => void,
  onError: (error: string) => void
) {
  const interruptBuffer = new Uint8Array(new SharedArrayBuffer(1))

  const pyodide = useRef<PyodideInterface>()

  useEffect(() => {
    ;(async () => {
      await import("https://cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js")

      pyodide.current = await loadPyodide({
        stderr: (error: string) => {
          console.error(error)
        },
        stdout: (output: string) => {
          console.log(output)
        },
        stdin: () => {
          return String(prompt())
        }
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

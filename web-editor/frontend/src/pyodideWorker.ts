import type { PyodideInterface } from "pyodide/api"
import type { loadPyodide as loadPyodideInterface } from "pyodide/pyodide"

declare const loadPyodide: typeof loadPyodideInterface
let pyodide: PyodideInterface

async function loadPyodideAndPackages() {
  await import("https://cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js")

  pyodide = await loadPyodide({
    stderr: (error: string) => self.postMessage({ cmd: "runCodeError", error }),
    stdout: (output: string) =>
      self.postMessage({ cmd: "runCodeOutput", output }),
    stdin: () => {
      return "Teste"
    }
  })
  await pyodide.loadPackage("micropip")
  await pyodide.runPythonAsync(`
    import micropip

    await micropip.install("freegames")
  `)
  self.postMessage({ cmd: "loaded" })
}

const pyodideReadyPromise = loadPyodideAndPackages()

self.addEventListener("message", async (msg) => {
  await pyodideReadyPromise

  switch (msg.data.cmd) {
    case "setInterruptBuffer":
      pyodide.setInterruptBuffer(msg.data.interruptBuffer)
      break
    case "runCode":
      try {
        const result = await pyodide.runPythonAsync(msg.data.code)
        self.postMessage({ cmd: "runCodeResult", result })
      } catch (error) {
        self.postMessage({ cmd: "runCodeError", error })
      }
      break
  }
})

export {}

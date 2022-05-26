import { WorkerProxyObject } from "./src/proxy/worker"

// eslint-disable-next-line no-undef
importScripts("https://cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js")

async function loadPyodideAndPackages() {
  // eslint-disable-next-line no-undef
  self.document = WorkerProxyObject("document")
  self.pyodide = await loadPyodide()
  self.postMessage({ cmd: "loaded" })
  await self.pyodide.loadPackage("micropip")
  await self.pyodide.runPythonAsync(`
    import micropip
    await micropip.install("http://localhost:8080/turtle-0.0.1-py3-none-any.whl")
    await micropip.install("freegames")
  `)
}
const pyodideReadyPromise = loadPyodideAndPackages()

self.addEventListener("message", async (msg) => {
  await pyodideReadyPromise

  switch (msg.data.cmd) {
    case "setInterruptBuffer":
      self.pyodide.setInterruptBuffer(msg.data.interruptBuffer)
      break
    case "runCode":
      try {
        const result = await self.pyodide.runPythonAsync(msg.data.code)
        self.postMessage({ cmd: "runCodeResult", result })
      } catch (error) {
        self.postMessage({ cmd: "runCodeError", error })
      }
      break
  }
})

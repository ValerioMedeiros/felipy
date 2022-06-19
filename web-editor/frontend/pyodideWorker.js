// eslint-disable-next-line no-undef
importScripts("https://cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js")

async function loadPyodideAndPackages() {
  // eslint-disable-next-line no-undef
  self.pyodide = await loadPyodide({
    stderr: (error) => self.postMessage({ cmd: "runCodeError", error })
  })
  await self.pyodide.loadPackage("micropip")
  await self.pyodide.runPythonAsync(`
    import micropip

    await micropip.install("freegames")
  `)
  self.id = 0
  self.postMessage({ cmd: "loaded" })
}
const pyodideReadyPromise = loadPyodideAndPackages()

self.addEventListener("message", async (msg) => {
  await pyodideReadyPromise

  const test = new Proxy(
    {},
    {
      get: (_, key) => {
        self.postMessage({ cmd: "turtle", key })
        return Atomics.wait(self.awaitBuffer, 0, 0)
      }
    }
  )

  switch (msg.data.cmd) {
    case "setInterruptBuffer":
      self.pyodide.setInterruptBuffer(msg.data.interruptBuffer)
      break
    case "setAwaitBuffer":
      self.awaitBuffer = msg.data.awaitBuffer
      console.log(test.oi)
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

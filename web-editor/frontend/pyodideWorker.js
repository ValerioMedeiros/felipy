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
    await micropip.install("http://localhost:8080/turtle-0.0.1-py3-none-any.whl")
    await micropip.install("freegames")
  `)
  // eslint-disable-next-line no-undef
  importScripts(
    "./src/via/controller/object.js",
    "./src/via/controller/property.js",
    "./src/via/controller/controller.js"
  )
  // eslint-disable-next-line no-undef
  Via.postMessage = (data) => self.postMessage(data)
  // eslint-disable-next-line no-undef
  self.document = via.document
  console.log(document.getElementById("turtle").innerHTML)
  self.postMessage({ cmd: "loaded" })
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
    default:
      // eslint-disable-next-line no-undef
      Via.OnMessage(msg.data)
      break
  }
})

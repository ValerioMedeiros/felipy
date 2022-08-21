importScripts("https://cdn.jsdelivr.net/pyodide/v0.20.0/full/pyodide.js")

declare const loadPyodide: any
let pyodide: any

async function loadPyodideAndPackages() {
  pyodide = await loadPyodide({
    stdin: () => {
      return "Teste"
    }
  })
  await pyodide.loadPackage("micropip")
  pyodide.registerJsModule("console", {
    write: (message: string, error: boolean) => {
      self.postMessage({ cmd: "consoleOutput", output: message, error })
    },
    flush: () => {
      self.postMessage({ cmd: "consoleFlush" })
    }
  })
  await pyodide.runPythonAsync(`
    import sys
    import micropip
    import console

    await micropip.install("freegames")

    class StdOut:
      def __init__(self, error = False):
        self.error = error

      def write(self, string):
        console.write(string, self.error)

      def flush(self):
        console.flush()

    sys.stdout = StdOut()
    sys.stderr = StdOut(True)
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
        self.postMessage({ cmd: "consoleFlush", final: true })
      } catch (error) {
        self.postMessage({ cmd: "consoleOutput", output: error, error: true })
        self.postMessage({ cmd: "consoleFlush", final: true })
      }
      break
  }
})

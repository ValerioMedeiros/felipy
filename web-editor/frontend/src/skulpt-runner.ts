import { useEffect } from "preact/hooks"

declare const Sk: any

export function getCodeRunner(
  setLoading: (loaded: boolean) => void,
  setCodeRunning: (running: boolean) => void,
  onError: (error: string) => void
) {
  useEffect(() => {
    ;(async () => {
      await import("src/lib/skulpt/skulpt.min.js")
      await import("src/lib/skulpt/skulpt-stdlib.js")

      setLoading(false)
    })()
  }, [])

  function builtinRead(x: any) {
    if (
      Sk.builtinFiles === undefined ||
      Sk.builtinFiles.files[x] === undefined
    ) {
      throw new Error(`File not found: "${x}"`)
    }
    return Sk.builtinFiles.files[x]
  }

  function interruptExecution() {}

  async function runCode(code: string) {
    setCodeRunning(true)

    Sk.pre = "output"
    Sk.configure({ output: console.log, read: builtinRead })
    ;(Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = "turtle"
    const myPromise = Sk.misceval.asyncToPromise(function () {
      return Sk.importMainWithBody("<stdin>", false, code, true)
    })

    myPromise.then(
      function (mod: any) {
        setCodeRunning(false)
      },
      function (err: any) {
        onError(err.toString())
        setCodeRunning(false)
      }
    )
  }

  return {
    interruptExecution,
    runCode
  }
}

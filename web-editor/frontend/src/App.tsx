import Editor from "./components/Editor"
import Split from "react-split"
import "./index.css"
import { useState } from "react"
import Terminal from "./components/Terminal"
import { classes } from "./utils"
import { getCodeRunner } from "./py-worker"

function App() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(true)
  const [codeRunning, setCodeRunning] = useState(false)

  const { runCode, interruptExecution } = getCodeRunner(
    setLoading,
    setCodeRunning,
    console.error
  )

  return (
    <div className="w-full h-full">
      <div className="flex flex-col h-full">
        <div className="h-10 bg-gray-700"></div>
        <div className="h-full">
          <Split className="split-horizontal">
            <Editor language="python" code="" onCodeChange={setCode} />
            <Split direction="vertical" className="split-vertical">
              <div id="turtle">Oi</div>
              <div className="flex flex-col">
                <div>
                  <button
                    onClick={() => runCode(code)}
                    disabled={loading || codeRunning}
                    className={classes(
                      { "opacity-50": loading || codeRunning },
                      "rounded border-0 py-1 px-3 bg-green-500 text-green-900 text-base"
                    )}
                  >
                    {codeRunning ? "Executando" : "Executar"}
                  </button>
                  <button
                    onClick={() => interruptExecution()}
                    disabled={loading || !codeRunning}
                    className={classes(
                      { "opacity-50": loading || !codeRunning },
                      "rounded border-0 py-1 px-3 bg-red-500 text-red-900 text-base"
                    )}
                  >
                    Parar
                  </button>
                </div>
                <div></div>
                <Terminal onCommand={console.log} />
              </div>
            </Split>
          </Split>
        </div>
      </div>
    </div>
  )
}

export default App

import Editor from "../components/Editor"
import Split from "react-split"
import "../index.css"
import { useState } from "preact/hooks"
import Terminal from "../components/Terminal"
import { classes } from "../utils"
import { getCodeRunner } from "../runners/pyodide"
import { BlocklyEditor } from "../components/Blockly"
import { useRoute } from "wouter-preact"

function EditorPage() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(true)
  const [codeRunning, setCodeRunning] = useState(false)

  const [, params] = useRoute<{ runner: string, editor: string }>("/editor/:runner/:editor")

  const { runCode, interruptExecution } = getCodeRunner(
    setLoading,
    setCodeRunning,
    console.error
  )

  return (
    <div class="w-full h-full">
      <div class="flex flex-col h-full">
        <div class="h-10 bg-gray-700">
          <div>
            <button
              onClick={() => runCode(code)}
              disabled={loading || codeRunning}
              class={classes(
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
        </div>
        <div className="h-full">
          {/* @ts-ignore */}
          <Split class="split-horizontal">
            {params?.editor === "codemirror" ? <Editor language="python" code="" onCodeChange={setCode} /> : <BlocklyEditor onCodeChange={setCode} />}
            {/* @ts-ignore */}
            <Split direction="vertical" class="split-vertical">
              <div id="turtle" class="w-full h-full"></div>
              <Terminal onCommand={console.log} />
            </Split>
          </Split>
        </div>
      </div>
    </div>
  )
}

export default EditorPage

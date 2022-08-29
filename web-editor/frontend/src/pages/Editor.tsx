import Editor from "../components/Editor"
import Split from "react-split"
import "../index.css"
import { useState } from "preact/hooks"
import { useTerminal } from "../components/Terminal"
import { classes } from "../utils"
import { useCodeRunner } from "../runners/pyodide"
import { BlocklyEditor } from "../components/Blockly"
import { useRoute } from "wouter-preact"

function EditorPage() {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(true)
  const [codeRunning, setCodeRunning] = useState(false)

  const [, params] = useRoute<{ runner: string, editor: string }>("/editor/:runner/:editor")

  const { write, flush, receiveOutput, clear, terminalRef } = useTerminal()

  const { runCode, interruptExecution } = useCodeRunner({
    setLoading,
    setCodeRunning,
    onOutput: write,
    onFlush: flush,
    onInput: receiveOutput
  })

  const executeCode = () => {
    clear()
    runCode(code)
  }

  return (
    <div class="w-full h-full overflow-hidden">
      <div class="flex flex-col h-full">
        <div class="h-10 bg-gray-700">
          <div>
            <button
              onClick={() => executeCode()}
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
            {params?.editor === "codemirror" ? <Editor language="python" code={code} onCodeChange={setCode} /> : <BlocklyEditor onCodeChange={setCode} />}
            {/* @ts-ignore */}
            <Split direction="vertical" class="split-vertical">
              <div id="turtle" ></div>
              <div ref={terminalRef}></div>
            </Split>
          </Split>
        </div>
      </div>
    </div>
  )
}

export default EditorPage

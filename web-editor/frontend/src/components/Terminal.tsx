import { useEffect } from "react"
import { Terminal as Xterm } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import "xterm/css/xterm.css"
import { useResizeDetector } from "react-resize-detector"

interface Props {
  onCommand: (command: string) => void
}

function Terminal(props: Props) {
  const term = new Xterm({ rendererType: "dom" })
  term.setOption("theme", {
    background: "#202B33",
    foreground: "#F5F8FA"
  })
  const fitAddon = new FitAddon()
  term.loadAddon(fitAddon)
  const { ref: terminalRef } = useResizeDetector({
    onResize: () => {
      fitAddon.fit()
    }
  })

  useEffect(() => {
    term.open(terminalRef.current!)
    fitAddon.fit()
    const prompt = () => {
      const shellPrompt = "$ "
      term.write("\r\n" + shellPrompt)
    }
    let data = ""
    term.onKey((key) => {
      const char = key.domEvent.key
      if (char === "Enter") {
        prompt()
        props.onCommand(data)
        data = ""
      } else if (char === "Backspace") {
        if (data.length > 0) {
          term.write("\b \b")
          data = data.slice(0, -1)
        }
      } else {
        term.write(char)
        data += char
      }
    })

    prompt()
  }, [])

  return <div className="h-full w-full" ref={terminalRef}></div>
}

export default Terminal

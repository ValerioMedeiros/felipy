import { useEffect, useState } from "preact/hooks"
import { Terminal as Xterm } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import "xterm/css/xterm.css"
import { useResizeDetector } from "react-resize-detector"

export function useTerminal() {
  const term = new Xterm()
  term.setOption("theme", {
    background: "#202B33",
    foreground: "#F5F8FA"
  })
  const fitAddon = new FitAddon()
  const { ref: terminalRef } = useResizeDetector({
    onResize: () => {
      fitAddon.fit()
    }
  })

  let textToWrite = ""

  useEffect(() => {
    term.open(terminalRef.current!)
    term.loadAddon(fitAddon)
    fitAddon.fit()
  }, [])

  const write = (text: string, error: boolean) => {
    if (error) {
      term.write(`\x1b[31m${text}\x1b[0m`)
    } else {
      if (text.includes("\n")) {
        term.write(textToWrite)
        textToWrite = ""

        const lines = text.split("\n")

        term.write(lines.splice(0, -1).join("\r\n"))

      const lastLine = lines[0]

        if (lastLine === "") {
          term.write(lastLine + "\r\n")
        } else {
          textToWrite += lastLine
        }
      } else {
        textToWrite += text
      }
    }
  }

  const flush = (final = false) => {
    if (final) {
      term.write("\r")
    }

    if (textToWrite) {
      term.write(textToWrite + "\n")
      textToWrite = ""
    }
  }

  const receiveOutput = (): Promise<string> => {
    return new Promise(resolve => {
      let data = ""

      term.onKey((key) => {
        const char = key.domEvent.key
        if (char === "Enter") {
          resolve(data)
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
    })
  }

  const clear = () => {
    term.clear()
  }

  return {
    terminalRef,
    write,
    flush,
    clear,
    receiveOutput
  }
}

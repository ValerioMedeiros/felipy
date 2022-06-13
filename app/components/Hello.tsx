import React from "react"
import { useTailwind } from "tailwind-rn"
import CodeEditor, { CodeEditorSyntaxStyles } from "@rivascva/react-native-code-editor"
import { Keyboard } from "react-native-ui-lib"

const KeyboardAccessoryView = Keyboard.KeyboardAccessoryView

export default function Hello() {
  const t = useTailwind()

  return (
    <CodeEditor
      style={{
        fontSize: 20,
        inputLineHeight: 26,
        highlighterLineHeight: 26,
      }}
      language="javascript"
      syntaxStyle={CodeEditorSyntaxStyles.atomOneDark}
      showLineNumbers
    />
  )
}

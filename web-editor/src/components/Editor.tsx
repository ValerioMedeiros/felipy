import MonacoEditor, { Monaco } from "@monaco-editor/react"
import { useEffect, useRef } from "react"
import type monaco from "monaco-editor"

interface Props {
  language: string
  code: string
  readonly?: boolean
  onCodeChange: (code: string) => void
}

function Editor(props: Props) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue()
      if (currentValue !== props.code) {
        editorRef.current.setValue(props.code)
      }
    }
  }, [props.code])

  function handleEditorDidMount(
    editor: monaco.editor.IStandaloneCodeEditor,
    _monaco: Monaco
  ) {
    editorRef.current = editor
    editorRef.current.getModel()!.onDidChangeContent(() => {
      props.onCodeChange(editor.getValue())
    })
  }

  return (
    <MonacoEditor
      defaultLanguage={props.language}
      defaultValue={props.code}
      onMount={handleEditorDidMount}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        readOnly: props.readonly
      }}
    />
  )
}

Editor.defaultProps = {
  readonly: false
}

export default Editor

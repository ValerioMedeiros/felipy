import CodeMirror from "@uiw/react-codemirror"
import { python } from "@codemirror/lang-python"
import { dracula } from "@uiw/codemirror-theme-dracula"

interface Props {
  language: string
  code: string
  readonly?: boolean
  onCodeChange: (code: string) => void
}

function Editor(props: Props) {
  return (
    <CodeMirror
      value={props.code}
      height="100%"
      extensions={[python()]}
      theme={dracula}
      onChange={props.onCodeChange}
    />
  )
}

Editor.defaultProps = {
  readonly: false
}

export default Editor

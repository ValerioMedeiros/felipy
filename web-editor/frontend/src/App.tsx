import { Route } from "wouter-preact"
import LoginPage from "./pages/auth/Login"
import RegisterPage from "./pages/auth/Register"
import EditorPage from "./pages/Editor"

function App() {
  return (
    <>
      <Route path="/auth/login" component={LoginPage} />
      <Route path="/auth/register" component={RegisterPage} />
      <Route path="/editor" component={EditorPage} />
    </>
  )
}

export default App

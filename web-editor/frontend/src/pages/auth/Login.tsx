import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

interface IFormInputs {
  name: string
  email: string
  password: string
  passwordConfirmation: string
}

const schema = yup
  .object({
    name: yup.string().required("Campo obrigatório"),
    email: yup.string().email("Email inválido").required("Campo obrigatório"),
    password: yup
      .string()
      .min(6, "A senha deve conter mais de 6 caracteres")
      .required("Campo obrigatório"),
    passwordConfirmation: yup
      .string()
      .oneOf([yup.ref("password"), null], "As senhas precisam ser iguais")
      .required("Campo obrigatório")
  })
  .required()

function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema)
  })

  function onSubmit(data: IFormInputs) {}

  return (
    <div className="w-full h-full flex content-center justify-center items-center">
      <div className="rounded shadow-md mx-auto w-full md:w-1/2 lg:w-1/3 h-min p-2">
        <h1>Register</h1>
        <form onSubmit={handleSubmit(onSubmit)}></form>
      </div>
    </div>
  )
}

export default LoginPage

import fastify from "fastify"
import awsLambdaFastify from "@fastify/aws-lambda"
import type { APIGatewayProxyHandlerV2 } from "aws-lambda"

const app = fastify()

app.get("/", (req, res) => {
  return res.status(200).send({ hello: "world" })
})

export const handler: APIGatewayProxyHandlerV2 = awsLambdaFastify(app)

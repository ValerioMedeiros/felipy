import fastify from "fastify"
import { Server } from "socket.io"
import parser from "socket.io-msgpack-parser"
import eiows from "eiows"
import cors from "@fastify/cors"
import helmet from "@fastify/helmet"
import { nanoid } from "nanoid/non-secure"

const { Server: wsEngine } = eiows

const app = fastify({ logger: true })

app.register(cors)
app.register(helmet)

const io = new Server(app.server, { parser, wsEngine })

app.post("/createRoom", async (req, res) => {
  const roomId = nanoid()

  const room = io.of(`/${roomId}`)
  room.use((socket, next) => {
    next()
  })
  room.on("connection", (socket) => {
    console.log(socket.id)
  })

  return { roomId }
})

app.listen({ port: 9000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`server listening on ${address}`)
})

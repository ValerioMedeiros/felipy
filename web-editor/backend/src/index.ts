import express from "express"
import http from "http"
import { Server } from "socket.io"
import helmet from "helmet"
import cors from "cors"
import morgan from "morgan"
import parser from "socket.io-msgpack-parser"
import { Server as wsEngine } from "eiows"

const app = express()

app.use(cors({ origin: "*" }))
app.use(helmet())
app.use(express.json())
app.use(morgan("dev"))

const server = http.createServer(app)

const io = new Server(server, { parser, wsEngine })

io.on("connection", (socket) => {
  console.log("a user connected with id:", socket.id)
})

server.listen(3000, () => {
  console.log("Server listening on port 3000")
})

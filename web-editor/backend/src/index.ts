import fastify, { FastifyReply, FastifyRequest } from "fastify"
import { Server } from "socket.io"
import parser from "socket.io-msgpack-parser"
import eiows from "eiows"
import cors from "@fastify/cors"
import helmet from "@fastify/helmet"
import { nanoid } from "nanoid/non-secure"
import { PrismaClient } from "@prisma/client"
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox"
import { Type } from "@sinclair/typebox"
import { hash, verify } from "argon2"
import jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library"

const googleAuthClientId = process.env.GOOGLE_AUTH_CLIENT_ID
const googleAuthClient = new OAuth2Client(googleAuthClientId)

const prisma = new PrismaClient()

const jwtSecret = process.env.JWT_SECRET

const app = fastify({
  logger: true,
  ajv: {
    customOptions: {
      strict: "log",
      keywords: ["kind", "modifier"]
    }
  }
}).withTypeProvider<TypeBoxTypeProvider>()

app.register(cors)
app.register(helmet)

app.decorateRequest("user", null)

const io = new Server(app.server, { parser, wsEngine: eiows.Server })

async function authenticate(req: FastifyRequest, res: FastifyReply) {
  try {
    // @ts-ignore
    const { email }: jwt.JwtPayload & { email: string } = jwt.verify(req.headers.authorization!, jwtSecret)

    // @ts-ignore
    app.user = { email }
  } catch (err) {
    res.send(err)
  }
}

async function getJWT(email: string) {
  const token: string = await new Promise((resolve, reject) => {jwt.sign({ email }, jwtSecret, { expiresIn: "30m" }, (err, token) => {
    if (err) {
      reject(err)
    } else {
      resolve(token)
    }
  })})

  return token
}

async function getTokens(userId: string, email: string) {
  const { id: refreshToken } = await prisma.refreshToken.create({ data: { userId }, select: { id: true } })

  const token = await getJWT(email)

  return { token, refreshToken }
}

app.post(
  "/register",
  {
    schema: {
      body: Type.Object({
        name: Type.String(),
        email: Type.String({ format: "email" }),
        password: Type.String(),
        picture: Type.Optional(Type.String())
      })
    }
  },
  async (req) => {
    const { name, email, password, picture } = req.body

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        name,
        email,
        picture,
        password: await hash(password),
        refreshTokens: {
          create: {}
        }
      },
      update: {
        refreshTokens: {
          create: {}
        }
      },
      select: {
        id: true,
        refreshTokens: {
          select: {
            id: true
          }
        }
      }
    })

    const { id: refreshToken } = user.refreshTokens[user.refreshTokens.length - 1]

    const token = await getJWT(email)

    return { token, refreshToken }
  }
)

app.post("/googleAuth", { schema: Type.Object({ token: Type.String() }) }, async (req) => {
  const { token } = req.body

  const ticket = await googleAuthClient.verifyIdToken({
    idToken: token,
    audience: googleAuthClientId
  })

  const { name, email, picture } = ticket.getPayload()

  const user = await prisma.user.upsert({
    where: { email },
    create: {
      name,
      email,
      picture
    },
    update: {}
  })

  return await getTokens(user.id, email)
})

app.post("/login", { schema: Type.Object({ email: Type.String({ format: "email" }), password: Type.String() }) }, async(req) => {
  const { email, password } = req.body

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new Error("Invalid email")
  }

  if(await verify(user.password, password)) {
    return await getTokens(user.id, email)
  } else {
    throw new Error("Invalid password")
  }
})

app.post("/refreshToken", { schema: Type.Object({ refreshToken: Type.String() }) }, async (req, res) => {
  const { refreshToken } = req.body

  const { user: { email } } = await prisma.refreshToken.findUnique({ where: { id: refreshToken }, include: { user: { select: { email: true } } } })

  return {
    token: await getJWT(email)
  }
})

app.post("/createRoom", (req, res) => {
  // @ts-ignore
  const roomId = nanoid()

  io.of(`/room/${roomId}`)
    .use((socket, next) => {
      next()
    })
    .on("connection", (socket) => {
      console.log(socket.id)
    })

  return { roomId }
})

const calls: { [key: string]: { owner: string | null, participants: string[] } } = {}

app.post("/createP2PRoom", (req, res) => {
  const roomId = nanoid()

  calls[roomId] = { owner: null, participants: [] }

  io.of(`/p2p/${roomId}`)
    .use((socket, next) => {
      if (calls[roomId].participants.length < 4) {
        next()
      } else {
        next(new Error("Room full"))
      }
    })
    .on("connection", (socket) => {
      if (calls[roomId].participants.length == 0) {
        calls[roomId].owner = socket.id
      }

      calls[roomId].participants.push(socket.id)

      socket.on("disconnect", () => {
        calls[roomId].participants.splice(calls[roomId].participants.indexOf(socket.id), 1)
      })
    })

  return { roomId }
})

app.listen({ port: 8000 }, async () => {
  await prisma.$connect()
})

app.after(async () => {
  io.close()
  await prisma.$disconnect()
})

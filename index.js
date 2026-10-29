import Fastify from 'fastify'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import { createStore } from './db.js'
import { defineRoutes } from './routes.js'

const PORT = Number(process.env.PORT ?? 8787)
const HOST = process.env.HOST ?? '0.0.0.0'
const CORS_ORIGIN = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX ?? 10)

const app = Fastify({
  logger: { level: process.env.LOG_LEVEL ?? 'info' },
  bodyLimit: 65536,
  trustProxy: true,
})

await app.register(cors, {
  origin: CORS_ORIGIN,
  methods: ['POST', 'GET', 'OPTIONS'],
})

await app.register(rateLimit, {
  max: RATE_LIMIT_MAX,
  timeWindow: '1 minute',
  keyGenerator: (req) => req.ip,
  errorResponseBuilder: () => ({
    statusCode: 429,
    ok: false,
    message: 'Too many requests. Please wait a moment and try again.',
  }),
})

app.setErrorHandler((err, req, reply) => {
  if (err.statusCode === 429) {
    return reply.code(429).send({ ok: false, message: err.message ?? 'Too many requests. Please wait a moment.' })
  }
  if (err.code === 'FST_ERR_CTP_INVALID_JSON_BODY') {
    return reply.code(400).send({ ok: false, message: 'The request body was not valid JSON.' })
  }
  req.log.error({ err, url: req.url }, 'request failed')
  return reply.code(500).send({ ok: false, message: 'Internal error. Please try again.' })
})

const store = await createStore()
try {
  await store.init()
  app.log.info({ store: store.kind }, 'lead store ready')
} catch (err) {
  app.log.fatal({ err }, 'database unavailable')
  process.exit(1)
}

await defineRoutes(app, store)

const shutdown = async (signal) => {
  app.log.info({ signal }, 'shutting down')
  await store.close()
  await app.close()
  process.exit(0)
}
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

try {
  await app.listen({ port: PORT, host: HOST })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
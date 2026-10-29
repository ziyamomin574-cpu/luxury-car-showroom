import { registerSchema, testDriveSchema, contactSchema, firstIssueMessage } from './schemas.js'

const MIN_FORM_MS = 1200

export async function defineRoutes(app, store) {
  app.get('/', async () => ({
    service: 'luxe-showroom-server',
    ok: true,
    store: store.kind,
    endpoints: [
      { method: 'GET', path: '/api/health' },
      { method: 'POST', path: '/api/register', description: 'Register interest in a car' },
      { method: 'POST', path: '/api/test-drive', description: 'Book a test drive' },
      { method: 'POST', path: '/api/contact', description: 'Contact the showroom' },
    ],
    frame: 'POST JSON bodies validated with zod; honeypot + timing checks; rate limited per IP.',
  }))

  app.get('/api/health', async () => ({
    ok: true,
    service: 'luxe-showroom-server',
    store: store.kind,
    now: new Date().toISOString(),
  }))

  app.post('/api/register', async (req, reply) => {
    return storeLead(req, reply, store, 'register', registerSchema, 'Registration received.')
  })

  app.post('/api/test-drive', async (req, reply) => {
    return storeLead(req, reply, store, 'test_drive', testDriveSchema, 'Test drive request received.')
  })

  app.post('/api/contact', async (req, reply) => {
    return storeLead(req, reply, store, 'contact', contactSchema, 'Message received.')
  })
}

async function storeLead(req, reply, store, kind, schema, okMessage) {
  const parsed = schema.safeParse(req.body === undefined ? {} : req.body)
  if (!parsed.success) {
    return reply.code(400).send({ ok: false, message: firstIssueMessage(parsed.error) })
  }

  const input = parsed.data
  if (input.formStartedAt && Date.now() - input.formStartedAt < MIN_FORM_MS) {
    return reply
      .code(429)
      .send({ ok: false, message: 'That was submitted a little too quickly. Please try again.' })
  }

  try {
    const { ref } = await store.insert(kind, input)
    req.log.info({ kind, ref }, 'lead stored')
    return reply.code(201).send({ ok: true, reference: ref, message: okMessage })
  } catch (err) {
    req.log.error({ err, kind }, 'failed to store lead')
    return reply.code(503).send({ ok: false, message: 'We could not save this right now. Please try again.' })
  }
}
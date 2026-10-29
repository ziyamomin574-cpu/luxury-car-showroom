import { randomUUID } from 'node:crypto'
import pg from 'pg'

const { Pool } = pg

const HONEYPOT_FIELDS = ['website', 'formStartedAt']

function cleanLead(input) {
  const payload = { ...input }
  for (const key of HONEYPOT_FIELDS) delete payload[key]
  payload.consentAt = new Date().toISOString()
  return payload
}

function makeReference(kind) {
  const tag = kind === 'test_drive' ? 'TEST' : kind === 'contact' ? 'CONT' : 'REG'
  return `LUXE-${tag}-${randomUUID().slice(0, 8).toUpperCase()}`
}

async function makePostgresStore(connectionString) {
  const pool = new Pool({ connectionString, max: 10, idleTimeoutMillis: 30_000 })
  pool.on('error', (err) => console.error('[db] idle client error:', err.message))
  return {
    kind: 'pg',
    async init() {
      await pool.query('SELECT 1')
    },
    async insert(kind, input) {
      const ref = makeReference(kind)
      const { rows } = await pool.query(
        'INSERT INTO leads (kind, ref, payload) VALUES ($1, $2, $3) RETURNING id, ref, created_at',
        [kind, ref, JSON.stringify(cleanLead(input))],
      )
      return { ref: rows[0].ref }
    },
    async close() {
      await pool.end()
    },
  }
}

function makeMemoryStore() {
  const rows = []
  return {
    kind: 'memory',
    async init() {},
    async insert(kind, input) {
      const ref = makeReference(kind)
      rows.push({ kind, ref, payload: cleanLead(input), created_at: new Date() })
      return { ref }
    },
    async close() {},
  }
}

export function createStore() {
  const connectionString = process.env.DATABASE_URL
  if (connectionString) return makePostgresStore(connectionString)
  return makeMemoryStore()
}
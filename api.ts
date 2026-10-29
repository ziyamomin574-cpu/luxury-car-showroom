import { z } from 'zod'
import type { Car } from '@/data/cars'

const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '')

const phone = z
  .string()
  .trim()
  .min(7, 'Enter a phone number with the country code')
  .max(20, 'That phone number looks too long')
  .regex(/^\+?[\d\s-]{7,20}$/, 'Use digits, spaces, + and - only')

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(5, 'Enter your email address')
  .max(254, 'That email address looks too long')
  .email('Enter a valid email address')

const name = z.string().trim().min(2, 'Enter your full name').max(80, 'That name looks too long')

/** Honeypot + timing: a real visitor never fills these. */
const antiBot = {
  website: z.string().max(0, 'Submission rejected'),
  formStartedAt: z.number(),
}

const consent = z
  .boolean()
  .refine((value) => value === true, { message: 'Please accept the privacy notice' })

export const registerSchema = z.object({
  name,
  email,
  phone,
  city: z.string().trim().max(60, 'City name is too long').optional().or(z.literal('')),
  carSlug: z.string().trim().min(1, 'Choose a car'),
  colorId: z.string().trim().min(1, 'Choose a colour'),
  consent,
  ...antiBot,
})

export const testDriveSchema = registerSchema
  .extend({
    preferredDate: z.string().trim().min(1, 'Pick a date').refine(isFutureDate, 'Pick a future date'),
    timeSlot: z.string().trim().min(1, 'Pick a time slot'),
  })
  .partial({ city: true })

export const contactSchema = z.object({
  name,
  email,
  phone: phone.optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Tell us a little more').max(2000, 'Please shorten the message'),
  consent,
  ...antiBot,
})

function isFutureDate(value: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const picked = new Date(`${value}T00:00:00`)
  return !Number.isNaN(picked.getTime()) && picked.getTime() >= today.getTime()
}

export type RegisterInput = z.infer<typeof registerSchema>
export type TestDriveInput = z.infer<typeof testDriveSchema>
export type ContactInput = z.infer<typeof contactSchema>

export type LeadResult = { ok: true; reference: string } | { ok: false; message: string }

const MIN_FORM_MS = 1200

async function post(path: string, body: unknown): Promise<LeadResult> {
  if (typeof body === 'object' && body !== null) {
    const started = (body as { formStartedAt?: number }).formStartedAt ?? 0
    if (started && Date.now() - started < MIN_FORM_MS) {
      return { ok: false, message: 'That was submitted a little too quickly. Please try again.' }
    }
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body),
    })

    const data = (await res.json().catch(() => ({}))) as { reference?: string; message?: string }

    if (!res.ok) {
      return { ok: false, message: data.message ?? `Request failed (${res.status}). Please try again.` }
    }
    return { ok: true, reference: data.reference ?? 'PENDING' }
  } catch {
    return {
      ok: false,
      message: 'We could not reach the showroom service. Your details are kept — please retry in a moment.',
    }
  }
}

export const api = {
  register: (input: RegisterInput) => post('/api/register', input),
  testDrive: (input: TestDriveInput) => post('/api/test-drive', input),
  contact: (input: ContactInput) => post('/api/contact', input),
}

/** Best value in a numeric compare row; `lowerIsBetter` for times/prices. */
export function compareWinner(
  a: number | undefined,
  b: number | undefined,
  lowerIsBetter = false,
): 'a' | 'b' | null {
  if (a === undefined || b === undefined || a === b) return null
  const aWins = lowerIsBetter ? a < b : a > b
  return aWins ? 'a' : 'b'
}

export function carLabel(car: Car): string {
  return `${car.brand} ${car.name}`
}

export const TIME_SLOTS = ['10:00 – 11:30', '11:30 – 13:00', '14:00 – 15:30', '16:00 – 17:30', '18:00 – 19:30']

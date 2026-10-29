/**
 * Server-side validation. Mirrors src/lib/api.ts on the frontend so both
 * sides agree on the same wire contract. The honeypot fields are validated
 * then stripped before anything is stored.
 */
import { z } from 'zod'

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

const antiBot = {
  website: z.string().max(0, 'Submission rejected'),
  formStartedAt: z.number(),
}

const consent = z.boolean().refine((value) => value === true, { message: 'Please accept the privacy notice' })

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

export const testDriveSchema = registerSchema.extend({
  preferredDate: z.string().trim().min(1, 'Pick a date').refine(isFutureDate, 'Pick a future date'),
  timeSlot: z.string().trim().min(1, 'Pick a time slot'),
}).partial({ city: true })

export const contactSchema = z.object({
  name,
  email,
  phone: phone.optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Tell us a little more').max(2000, 'Please shorten the message'),
  consent,
  ...antiBot,
})

function isFutureDate(value) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const picked = new Date(`${value}T00:00:00`)
  return !Number.isNaN(picked.getTime()) && picked.getTime() >= today.getTime()
}

export function firstIssueMessage(error) {
  return error.issues[0]?.message ?? 'One of the fields is invalid.'
}
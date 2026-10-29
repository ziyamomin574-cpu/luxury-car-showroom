import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams } from 'react-router-dom'
import { cars } from '@/data/cars'
import {
  api,
  contactSchema,
  registerSchema,
  testDriveSchema,
  TIME_SLOTS,
  type ContactInput,
  type LeadResult,
  type RegisterInput,
  type TestDriveInput,
} from '@/lib/api'

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; reference: string }
  | { kind: 'error'; message: string }

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="label">{label}</span>
      {children}
      {hint && !error && <span className="text-[11px] text-detail">{hint}</span>}
      {error && (
        <span role="alert" className="text-[11px] text-highlight">
          {error}
        </span>
      )}
    </label>
  )
}

function StatusMessage({ status }: { status: Status }) {
  if (status.kind === 'success') {
    return (
      <div role="status" className="glass flex flex-col gap-1 p-4 text-sm">
        <p className="label">Received</p>
        <p>
          Thank you. Your reference is <strong>{status.reference}</strong>. The showroom team will
          confirm by email shortly.
        </p>
      </div>
    )
  }
  if (status.kind === 'error') {
    return (
      <div role="alert" className="glass flex flex-col gap-1 border-highlight p-4 text-sm">
        <p className="label">Not sent</p>
        <p>{status.message}</p>
      </div>
    )
  }
  return null
}

function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string
  title: string
  lead: string
  children: React.ReactNode
}) {
  return (
    <section id={id} data-reveal className="glass flex flex-col gap-5 p-5 sm:p-6">
      <header>
        <h2 className="font-display text-2xl leading-tight">{title}</h2>
        <p className="mt-1 text-sm text-detail">{lead}</p>
      </header>
      {children}
    </section>
  )
}

const TABS = [
  { id: 'test-drive', label: 'Book a test drive' },
  { id: 'register', label: 'Register' },
  { id: 'enquiry', label: 'General enquiry' },
] as const

export function Contact() {
  const [search] = useSearchParams()
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('test-drive')

  const prefillCar = search.get('car') ?? ''
  const prefillColor = search.get('color') ?? ''
  const preCar = cars.find((c) => c.slug === prefillCar) ?? cars[0]
  const preColor = preCar.colors.some((c) => c.id === prefillColor) ? prefillColor : preCar.colors[0].id

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const drive = useForm<TestDriveInput>({
    resolver: zodResolver(testDriveSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      city: '',
      carSlug: preCar.slug,
      colorId: preColor,
      preferredDate: '',
      timeSlot: '',
      consent: true,
      website: '',
      formStartedAt: Date.now(),
    },
  })
  const register = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      city: '',
      carSlug: preCar.slug,
      colorId: preColor,
      consent: false,
      website: '',
      formStartedAt: Date.now(),
    },
  })
  const enquiry = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      consent: false,
      website: '',
      formStartedAt: Date.now(),
    },
  })

  const [driveStatus, setDriveStatus] = useState<Status>({ kind: 'idle' })
  const [registerStatus, setRegisterStatus] = useState<Status>({ kind: 'idle' })
  const [enquiryStatus, setEnquiryStatus] = useState<Status>({ kind: 'idle' })

  useEffect(() => {
    if (!prefillCar) return
    drive.setValue('carSlug', preCar.slug)
    drive.setValue('colorId', preColor)
    drive.setValue('formStartedAt', Date.now())
  }, [prefillCar, preCar.slug, preColor, drive])

  const watchCar = drive.watch('carSlug')
  const selectedCar = cars.find((c) => c.slug === watchCar) ?? cars[0]
  const selectedColor = selectedCar.colors.find((c) => c.id === drive.watch('colorId')) ?? selectedCar.colors[0]

  const settle = (setStatus: (status: Status) => void) => (result: LeadResult) => {
    if (result.ok) {
      setStatus({ kind: 'success', reference: result.reference })
    } else {
      setStatus({ kind: 'error', message: result.message })
    }
  }

  const onDrive = drive.handleSubmit(async (values) => {
    setDriveStatus({ kind: 'loading' })
    settle(setDriveStatus)(await api.testDrive(values))
  })

  const onRegister = register.handleSubmit(async (values) => {
    setRegisterStatus({ kind: 'loading' })
    settle(setRegisterStatus)(await api.register(values))
  })

  const onEnquiry = enquiry.handleSubmit(async (values) => {
    setEnquiryStatus({ kind: 'loading' })
    settle(setEnquiryStatus)(await api.contact(values))
  })

  const driveErrors = drive.formState.errors
  const registerErrors = register.formState.errors
  const enquiryErrors = enquiry.formState.errors

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header data-reveal className="max-w-2xl">
        <p className="label">One page</p>
        <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">Book, register, ask</h1>
        <p className="mt-3 text-sm leading-relaxed text-detail">
          Three short forms on one page. Nothing is shared outside the sales team, and you can ask us
          to delete it at any time.
        </p>
      </header>

      <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto" role="tablist" aria-label="Forms">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            id={`tab-${item.id}`}
            className={`btn shrink-0 ${tab === item.id ? 'btn-primary' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div
        className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
      >
        <div className="flex flex-col gap-6">
          {tab === 'test-drive' && (
            <Section id="test-drive" title="Book a test drive" lead="Pick the car, the paint and a slot. We will call to confirm.">
              <form onSubmit={onDrive} noValidate className="flex flex-col gap-5">
                <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
                  <label>
                    Website
                    <input tabIndex={-1} autoComplete="off" {...drive.register('website')} />
                  </label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" error={driveErrors.name?.message}>
                    <input className="field" autoComplete="name" {...drive.register('name')} />
                  </Field>
                  <Field label="Phone (with country code)" error={driveErrors.phone?.message}>
                    <input className="field" inputMode="tel" placeholder="+91 98765 43210" {...drive.register('phone')} />
                  </Field>
                  <Field label="Email" error={driveErrors.email?.message}>
                    <input className="field" type="email" autoComplete="email" {...drive.register('email')} />
                  </Field>
                  <Field label="City" error={driveErrors.city?.message}>
                    <input className="field" autoComplete="address-level2" {...drive.register('city')} />
                  </Field>
                  <Field label="Car" error={driveErrors.carSlug?.message}>
                    <select
                      className="field"
                      {...drive.register('carSlug')}
                      onChange={(event) => {
                        const next = cars.find((c) => c.slug === event.target.value)
                        drive.setValue('colorId', next?.colors[0].id ?? '')
                      }}
                    >
                      {cars.map((car) => (
                        <option key={car.slug} value={car.slug}>
                          {car.brand} {car.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Colour" error={driveErrors.colorId?.message}>
                    <select className="field" {...drive.register('colorId')}>
                      {selectedCar.colors.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Preferred date" error={driveErrors.preferredDate?.message}>
                    <input className="field" type="date" min={today} {...drive.register('preferredDate')} />
                  </Field>
                  <Field label="Time slot" error={driveErrors.timeSlot?.message}>
                    <select className="field" {...drive.register('timeSlot')}>
                      <option value="">Choose a slot</option>
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <p className="text-xs text-detail">
                  Booking for the <strong>{selectedCar.brand} {selectedCar.name}</strong> in{' '}
                  <strong>{selectedColor.label}</strong>.
                </p>

                <label className="flex cursor-pointer items-start gap-3 text-sm text-detail">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 shrink-0 accent-highlight"
                    aria-invalid={Boolean(driveErrors.consent)}
                    {...drive.register('consent')}
                  />
                  <span>
                    I agree that the showroom may store these details and contact me about a test
                    drive. See the{' '}
                    <a href="#privacy" className="underline underline-offset-2 hover:text-ink">
                      privacy notice
                    </a>
                    .
                  </span>
                </label>
                {driveErrors.consent && (
                  <span role="alert" className="text-[11px] text-highlight">
                    {driveErrors.consent.message}
                  </span>
                )}

                <div className="flex flex-wrap items-center gap-4">
                  <button className="btn btn-primary" type="submit" disabled={driveStatus.kind === 'loading'}>
                    {driveStatus.kind === 'loading' ? 'Sending…' : 'Request this slot'}
                  </button>
                  <StatusMessage status={driveStatus} />
                </div>
              </form>
            </Section>
          )}

          {tab === 'register' && (
            <Section id="register" title="Register" lead="Save a car to your shortlist. No password, no marketing list.">
              <form onSubmit={onRegister} noValidate className="flex flex-col gap-5">
                <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
                  <label>
                    Website
                    <input tabIndex={-1} autoComplete="off" {...register.register('website')} />
                  </label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" error={registerErrors.name?.message}>
                    <input className="field" autoComplete="name" {...register.register('name')} />
                  </Field>
                  <Field label="Phone (with country code)" error={registerErrors.phone?.message}>
                    <input className="field" inputMode="tel" placeholder="+91 98765 43210" {...register.register('phone')} />
                  </Field>
                  <Field label="Email" error={registerErrors.email?.message}>
                    <input className="field" type="email" autoComplete="email" {...register.register('email')} />
                  </Field>
                  <Field label="City" error={registerErrors.city?.message}>
                    <input className="field" autoComplete="address-level2" {...register.register('city')} />
                  </Field>
                  <Field label="Car of interest" error={registerErrors.carSlug?.message}>
                    <select
                      className="field"
                      {...register.register('carSlug')}
                      onChange={(event) => {
                        const next = cars.find((c) => c.slug === event.target.value)
                        register.setValue('colorId', next?.colors[0].id ?? '')
                      }}
                    >
                      {cars.map((car) => (
                        <option key={car.slug} value={car.slug}>
                          {car.brand} {car.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Colour" error={registerErrors.colorId?.message}>
                    <select className="field" {...register.register('colorId')}>
                      {(cars.find((c) => c.slug === register.watch('carSlug')) ?? cars[0]).colors.map((color) => (
                        <option key={color.id} value={color.id}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <label className="flex cursor-pointer items-start gap-3 text-sm text-detail">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 shrink-0 accent-highlight"
                    aria-invalid={Boolean(registerErrors.consent)}
                    {...register.register('consent')}
                  />
                  <span>
                    I agree that the showroom may store these details and contact me. See the{' '}
                    <a href="#privacy" className="underline underline-offset-2 hover:text-ink">
                      privacy notice
                    </a>
                    .
                  </span>
                </label>
                {registerErrors.consent && (
                  <span role="alert" className="text-[11px] text-highlight">
                    {registerErrors.consent.message}
                  </span>
                )}

                <div className="flex flex-wrap items-center gap-4">
                  <button className="btn btn-primary" type="submit" disabled={registerStatus.kind === 'loading'}>
                    {registerStatus.kind === 'loading' ? 'Sending…' : 'Register'}
                  </button>
                  <StatusMessage status={registerStatus} />
                </div>
              </form>
            </Section>
          )}

          {tab === 'enquiry' && (
            <Section id="enquiry" title="General enquiry" lead="Finance, trade-in, service, anything else.">
              <form onSubmit={onEnquiry} noValidate className="flex flex-col gap-5">
                <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
                  <label>
                    Website
                    <input tabIndex={-1} autoComplete="off" {...enquiry.register('website')} />
                  </label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" error={enquiryErrors.name?.message}>
                    <input className="field" autoComplete="name" {...enquiry.register('name')} />
                  </Field>
                  <Field label="Email" error={enquiryErrors.email?.message}>
                    <input className="field" type="email" autoComplete="email" {...enquiry.register('email')} />
                  </Field>
                  <Field label="Phone (optional)" error={enquiryErrors.phone?.message}>
                    <input className="field" inputMode="tel" {...enquiry.register('phone')} />
                  </Field>
                </div>
                <Field label="Message" error={enquiryErrors.message?.message}>
                  <textarea rows={5} className="field resize-y" {...enquiry.register('message')} />
                </Field>

                <label className="flex cursor-pointer items-start gap-3 text-sm text-detail">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 shrink-0 accent-highlight"
                    aria-invalid={Boolean(enquiryErrors.consent)}
                    {...enquiry.register('consent')}
                  />
                  <span>
                    I agree that the showroom may store these details and contact me. See the{' '}
                    <a href="#privacy" className="underline underline-offset-2 hover:text-ink">
                      privacy notice
                    </a>
                    .
                  </span>
                </label>
                {enquiryErrors.consent && (
                  <span role="alert" className="text-[11px] text-highlight">
                    {enquiryErrors.consent.message}
                  </span>
                )}

                <div className="flex flex-wrap items-center gap-4">
                  <button className="btn btn-primary" type="submit" disabled={enquiryStatus.kind === 'loading'}>
                    {enquiryStatus.kind === 'loading' ? 'Sending…' : 'Send message'}
                  </button>
                  <StatusMessage status={enquiryStatus} />
                </div>
              </form>
            </Section>
          )}

          <div id="privacy" data-reveal className="glass p-5 sm:p-6">
            <h2 className="font-display text-xl">Privacy notice</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-detail">
              <p>
                We collect only what these forms ask for: your name, phone number, email address, the
                city you are in, and the car, colour and date you selected. We use it to answer your
                enquiry and arrange a test drive.
              </p>
              <p>
                Leads are retained for 24 months from the last interaction, then deleted. Ask us at{' '}
                <a className="underline underline-offset-2 hover:text-ink" href="mailto:drive@luxe-showroom.example">
                  drive@luxe-showroom.example
                </a>{' '}
                and we will remove your record within 30 days. Submissions are rate-limited and
                protected by a honeypot field; nothing is sold to third parties.
              </p>
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="glass flex flex-col gap-3 p-5 sm:p-6">
            <p className="label">The showroom</p>
            <address className="text-sm not-italic leading-relaxed text-detail">
              Level 1, Signature Hall
              <br />
              Auto District, Bengaluru 560001
            </address>
            <hr className="rule" />
            <p className="text-sm">
              <a className="hover:text-ink" href="tel:+918000000000">+91 80000 00000</a>
              <br />
              <a className="hover:text-ink" href="mailto:drive@luxe-showroom.example">drive@luxe-showroom.example</a>
            </p>
            <hr className="rule" />
            <p className="text-sm text-detail">Mon – Sat, 10:00 – 19:30. Test drives by appointment.</p>
            <div
              className="mt-2 grid h-40 place-items-center rounded-2xl border border-ink/10 text-xs text-detail"
              role="img"
              aria-label="Map placeholder for the showroom location"
            >
              Map placeholder
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}

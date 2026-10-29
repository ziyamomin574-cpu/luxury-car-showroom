/**
 * Single source of truth for the catalogue.
 *
 * Every price and specification carries a "checked on" date and a market
 * disclaimer (PRD 1.4 / F-05). Re-verify against official manufacturer
 * sources before each launch and bump SPECS_CHECKED_ON.
 */

export type Vec3 = [number, number, number]

export type CarColor = {
  id: string
  label: string
  hex: string
}

export type CarSpecs = {
  engine: string
  powerHp: number
  torqueNm: number
  transmission: string
  zeroTo100: number
  fuel: string
  seats: number
  evRangeKm?: number
  dimensions: { lengthMm: number; widthMm: number; heightMm: number }
}

/** Proportions used by the built-in procedural model. Real GLBs override this. */
export type CarShape = {
  length: number
  width: number
  height: number
  wheelbase: number
  wheelRadius: number
  wheelWidth: number
  rideHeight: number
  noseLength: number
  cabin: 'coupe' | 'fastback' | 'hyper' | 'suv'
  cabinLength: number
  cabinHeight: number
  /** Distance from the nose to the base of the windscreen, in metres. */
  cabinFront: number
  wing: 'none' | 'lip' | 'swan'
  wheels: 'open' | 'aero'
}

export type Car = {
  slug: string
  brand: string
  name: string
  type: string
  tagline: string
  price: { amount: number; currency: string; note: string }
  specs: CarSpecs
  colors: CarColor[]
  description: string
  model: {
    kind: 'procedural' | 'glb'
    glb?: string
    /** Name of the paint material inside the GLB. Must be a separate material. */
    bodyMaterial: string
    exteriorCam: { position: Vec3; target: Vec3 }
    interiorCam: Vec3
  }
  images: { fallback: string }
  specsSource: { url: string; checkedOn: string }
  shape: CarShape
}

export const SPECS_CHECKED_ON = '2026-09-15'
export const PRICE_DISCLAIMER = 'Indicative ex-showroom price. Varies by market, variant and registration.'

const black = { id: 'black', label: 'Black', hex: '#141414' }
const white = { id: 'white', label: 'White', hex: '#EDEAE4' }
const silver = { id: 'silver', label: 'Silver', hex: '#B9BCC0' }
const grey = { id: 'grey', label: 'Grey', hex: '#6E7276' }
const blue = { id: 'blue', label: 'Blue', hex: '#1E4C8A' }
const red = { id: 'red', label: 'Red', hex: '#A31621' }
const yellow = { id: 'yellow', label: 'Yellow', hex: '#D8B23A' }
const green = { id: 'green', label: 'Green', hex: '#204A38' }
const ferrariRed = { id: 'ferrari-red', label: 'Ferrari Red', hex: '#C8102E' }

export const cars: Car[] = [
  {
    slug: 'bmw-m4-competition',
    brand: 'BMW',
    name: 'M4 Competition',
    type: 'Performance Coupe',
    tagline: 'Precision, sharpened.',
    price: { amount: 15500000, currency: 'INR', note: PRICE_DISCLAIMER },
    specs: {
      engine: '3.0L twin-turbo inline-6, mild hybrid',
      powerHp: 530,
      torqueNm: 650,
      transmission: '8-speed M Steptronic, xDrive',
      zeroTo100: 3.5,
      fuel: 'Petrol',
      seats: 4,
      dimensions: { lengthMm: 4794, widthMm: 1887, heightMm: 1393 },
    },
    colors: [black, white, blue, grey, red],
    description:
      'A track-bred four-door coupé with a straight-six that revs to a 7200 rpm ceiling. Adaptive M suspension, an active M differential and carbon-ceramic brakes turn every corner into a decision you already made.',
    model: {
      kind: 'procedural',
      bodyMaterial: 'Body_Paint',
      exteriorCam: { position: [6.2, 2.3, 6.6], target: [0, 0.7, 0] },
      interiorCam: [0.5, 0.99, 0.34],
    },
    images: { fallback: '/images/bmw-m4-competition.jpg' },
    specsSource: { url: 'https://www.bmw.com/en/models/m/m4-coupe/2023/highlights.html', checkedOn: SPECS_CHECKED_ON },
    shape: {
      length: 4.79,
      width: 1.89,
      height: 1.39,
      wheelbase: 2.86,
      wheelRadius: 0.35,
      wheelWidth: 0.28,
      rideHeight: 0.13,
      noseLength: 1.05,
      cabin: 'coupe',
      cabinLength: 2.1,
      cabinHeight: 0.52,
      cabinFront: 1.55,
      wing: 'lip',
      wheels: 'open',
    },
  },
  {
    slug: 'mercedes-amg-gt',
    brand: 'Mercedes-AMG',
    name: 'AMG GT3',
    type: 'GT3 Race Car',
    tagline: 'Built to do one thing, very fast.',
    price: { amount: 45000000, currency: 'INR', note: 'Indicative list price. Track-only; allocation subject to series homologation.' },
    specs: {
      engine: '4.0L twin-turbo V8 (BoP-restricted)',
      powerHp: 550,
      torqueNm: 650,
      transmission: '6-speed sequential, RWD',
      zeroTo100: 3.0,
      fuel: 'Petrol (race spec)',
      seats: 2,
      dimensions: { lengthMm: 4592, widthMm: 2045, heightMm: 1245 },
    },
    colors: [black, white, silver, red],
    description:
      'A customer race car, straight from Affalterbach: a 4.0-litre V8 restricted for Balance of Performance, a six-speed sequential box with dog rings, and an aero package that makes downforce the luxury item. Not road-legal, not shy.',
    model: {
      kind: 'procedural',
      bodyMaterial: 'Body_Paint',
      exteriorCam: { position: [6.4, 2.2, 6.4], target: [0, 0.6, 0] },
      interiorCam: [0.32, 0.9, 0.3],
    },
    images: { fallback: '/images/mercedes-amg-gt.jpg' },
    specsSource: { url: 'https://www.mercedes-amg.com/en/race/gt3.html', checkedOn: SPECS_CHECKED_ON },
    shape: {
      length: 4.59,
      width: 2.05,
      height: 1.28,
      wheelbase: 2.63,
      wheelRadius: 0.37,
      wheelWidth: 0.34,
      rideHeight: 0.07,
      noseLength: 1.3,
      cabin: 'hyper',
      cabinLength: 1.35,
      cabinHeight: 0.46,
      cabinFront: 1.55,
      wing: 'swan',
      wheels: 'aero',
    },
  },
  {
    slug: 'porsche-911-turbo-s',
    brand: 'Porsche',
    name: '911 Turbo S',
    type: 'Sports Car',
    tagline: 'The one they all measure against.',
    price: { amount: 35000000, currency: 'INR', note: PRICE_DISCLAIMER },
    specs: {
      engine: '3.8L twin-turbo flat-six',
      powerHp: 650,
      torqueNm: 850,
      transmission: '8-speed PDK, AWD',
      zeroTo100: 2.7,
      fuel: 'Petrol',
      seats: 4,
      dimensions: { lengthMm: 4535, widthMm: 1900, heightMm: 1303 },
    },
    colors: [black, white, silver, red, blue],
    description:
      'Sixty years of rear-engine stubbornness, sharpened with 3.0 bar of boost. The 2020.2 facelift brought a 920 rpm turbo spin-up, rear-axle steering and a front lift system that makes it usable every morning.',
    model: {
      kind: 'procedural',
      bodyMaterial: 'Body_Paint',
      exteriorCam: { position: [6, 2.1, 6.2], target: [0, 0.6, 0] },
      interiorCam: [0.77, 0.98, 0.33],
    },
    images: { fallback: '/images/porsche-911-turbo-s.jpg' },
    specsSource: { url: 'https://www.porsche.com/uk/models/911/911-turbo-s/', checkedOn: SPECS_CHECKED_ON },
    shape: {
      length: 4.54,
      width: 1.9,
      height: 1.3,
      wheelbase: 2.45,
      wheelRadius: 0.35,
      wheelWidth: 0.31,
      rideHeight: 0.1,
      noseLength: 0.95,
      cabin: 'fastback',
      cabinLength: 1.95,
      cabinHeight: 0.6,
      cabinFront: 1.15,
      wing: 'lip',
      wheels: 'aero',
    },
  },
  {
    slug: 'lamborghini-revuelto',
    brand: 'Lamborghini',
    name: 'Revuelto',
    type: 'Supercar',
    tagline: 'V12, and then some.',
    price: { amount: 65000000, currency: 'INR', note: PRICE_DISCLAIMER },
    specs: {
      engine: '6.5L naturally aspirated V12 + 3 electric motors',
      powerHp: 1001,
      torqueNm: 725,
      transmission: '8-speed dual-clutch, e-axle AWD',
      zeroTo100: 2.5,
      fuel: 'Petrol (plug-in hybrid)',
      seats: 2,
      dimensions: { lengthMm: 4947, widthMm: 2033, heightMm: 1160 },
    },
    colors: [black, white, yellow, red, green],
    description:
      'A 6.5-litre V12 that revs to 8,500 rpm, joined to three motors and a 2.3 kWh battery. Carbon monocoque, a centre-tunnel spine and 8,600 rpm of theatre in a cabin that feels like a cockpit rather than a car.',
    model: {
      kind: 'procedural',
      bodyMaterial: 'Body_Paint',
      exteriorCam: { position: [6.6, 2.2, 6.0], target: [0, 0.6, 0] },
      interiorCam: [0.22, 0.81, 0.3],
    },
    images: { fallback: '/images/lamborghini-revuelto.jpg' },
    specsSource: { url: 'https://www.lamborghini.com/en-en/models/revuelto', checkedOn: SPECS_CHECKED_ON },
    shape: {
      length: 4.95,
      width: 2.03,
      height: 1.16,
      wheelbase: 2.78,
      wheelRadius: 0.37,
      wheelWidth: 0.34,
      rideHeight: 0.08,
      noseLength: 1.5,
      cabin: 'hyper',
      cabinLength: 1.35,
      cabinHeight: 0.46,
      cabinFront: 1.9,
      wing: 'swan',
      wheels: 'aero',
    },
  },
  {
    slug: 'ferrari-12cilindri',
    brand: 'Ferrari',
    name: '12Cilindri',
    type: 'Supercar',
    tagline: 'Naturally aspirated, unapologetically.',
    price: { amount: 41000000, currency: 'INR', note: PRICE_DISCLAIMER },
    specs: {
      engine: '6.5L naturally aspirated V12',
      powerHp: 789,
      torqueNm: 718,
      transmission: '8-speed dual-clutch',
      zeroTo100: 2.9,
      fuel: 'Petrol',
      seats: 2,
      dimensions: { lengthMm: 4653, widthMm: 1920, heightMm: 1219 },
    },
    colors: [ferrariRed, black, white, yellow, blue],
    description:
      'The first Ferrari V12 to rev past 8,000 rpm since the F40 lineage of the nineties. Side-mounted air intakes feed the flat-plane crank, and the whole rear end is a structural carbon fibre bridge.',
    model: {
      kind: 'procedural',
      bodyMaterial: 'Body_Paint',
      exteriorCam: { position: [6.3, 2.1, 6.1], target: [0, 0.65, 0] },
      interiorCam: [0.23, 0.88, 0.3],
    },
    images: { fallback: '/images/ferrari-12cilindri.jpg' },
    specsSource: { url: 'https://www.ferrari.com/en-EN/auto/12cilindri', checkedOn: SPECS_CHECKED_ON },
    shape: {
      length: 4.65,
      width: 1.92,
      height: 1.22,
      wheelbase: 2.65,
      wheelRadius: 0.36,
      wheelWidth: 0.32,
      rideHeight: 0.1,
      noseLength: 1.25,
      cabin: 'hyper',
      cabinLength: 1.4,
      cabinHeight: 0.5,
      cabinFront: 1.75,
      wing: 'swan',
      wheels: 'aero',
    },
  },
  {
    slug: 'range-rover-autobiography',
    brand: 'Range Rover',
    name: 'Autobiography',
    type: 'Luxury SUV',
    tagline: 'Arrives quietly, everywhere.',
    price: { amount: 23000000, currency: 'INR', note: PRICE_DISCLAIMER },
    specs: {
      engine: '3.0L supercharged inline-6, mild hybrid',
      powerHp: 523,
      torqueNm: 700,
      transmission: '8-speed automatic, AWD',
      zeroTo100: 5.2,
      fuel: 'Petrol / Diesel',
      seats: 5,
      dimensions: { lengthMm: 5252, widthMm: 1998, heightMm: 1800 },
    },
    colors: [black, white, silver, grey, green],
    description:
      'A 3.0-litre supercharged six with 48-volt assistance, air suspension that can raise the car for off-road work, and a cabin that stays the quietest place in the building. Full-time four-wheel drive.',
    model: {
      kind: 'procedural',
      bodyMaterial: 'Body_Paint',
      exteriorCam: { position: [7.2, 3.0, 7.2], target: [0, 1.0, 0] },
      interiorCam: [0.53, 1.6, 0.36],
    },
    images: { fallback: '/images/range-rover-autobiography.jpg' },
    specsSource: { url: 'https://www.landrover.com/in/range-rover', checkedOn: SPECS_CHECKED_ON },
    shape: {
      length: 5.25,
      width: 2.0,
      height: 1.8,
      wheelbase: 3.22,
      wheelRadius: 0.42,
      wheelWidth: 0.32,
      rideHeight: 0.24,
      noseLength: 1.1,
      cabin: 'suv',
      cabinLength: 2.6,
      cabinHeight: 0.86,
      cabinFront: 1.75,
      wing: 'none',
      wheels: 'open',
    },
  },
]

/** Fixed carousel order (PRD 1.4 / frontend spec 4.3). */
export const CAR_ORDER = cars.map((car) => car.slug)

const indexOf = new Map(CAR_ORDER.map((slug, i) => [slug, i]))

export function getCar(slug: string | undefined): Car | undefined {
  return slug ? cars.find((car) => car.slug === slug) : undefined
}

export function prevCar(slug: string): Car {
  const i = indexOf.get(slug) ?? 0
  return cars[(i - 1 + cars.length) % cars.length]
}

export function nextCar(slug: string): Car {
  const i = indexOf.get(slug) ?? 0
  return cars[(i + 1) % cars.length]
}

export function neighbourSlugs(slug: string): [string, string] {
  return [prevCar(slug).slug, nextCar(slug).slug]
}

export function formatPrice(price: Car['price']): string {
  if (price.currency === 'INR') {
    const crore = price.amount / 10000000
    return `₹${crore.toFixed(2)} Cr`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency,
    maximumFractionDigits: 0,
  }).format(price.amount)
}

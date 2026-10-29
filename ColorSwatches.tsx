import type { CarColor } from '@/data/cars'

type Props = {
  colors: CarColor[]
  value: string
  onChange: (id: string) => void
  carLabel: string
}

export function ColorSwatches({ colors, value, onChange, carLabel }: Props) {
  const active = colors.find((c) => c.id === value) ?? colors[0]
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <span className="label">Paint</span>
        <span className="text-sm text-detail">{active.label}</span>
      </div>
      <ul className="flex flex-wrap items-center gap-3">
        {colors.map((color) => {
          const selected = color.id === active.id
          return (
            <li key={color.id}>
              <button
                type="button"
                onClick={() => onChange(color.id)}
                aria-label={`Select ${color.label}`}
                aria-pressed={selected}
                className={`grid h-11 w-11 place-items-center rounded-full border transition-transform duration-300 ease-out hover:scale-105 ${
                  selected ? 'border-ink' : 'border-muted'
                }`}
                title={`${carLabel} in ${color.label}`}
              >
                <span
                  className="h-6 w-6 rounded-full ring-1 ring-black/40"
                  style={{ backgroundColor: color.hex }}
                />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

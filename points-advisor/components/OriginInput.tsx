'use client'

interface CityEntry {
  city: string
  airports: string[]
}

const CITIES: CityEntry[] = [
  { city: 'Atlanta', airports: ['ATL'] },
  { city: 'Chicago', airports: ['ORD'] },
  { city: 'Dallas', airports: ['DFW'] },
  { city: 'Denver', airports: ['DEN'] },
  { city: 'Los Angeles', airports: ['LAX'] },
  { city: 'Miami', airports: ['MIA'] },
  { city: 'New York', airports: ['JFK', 'EWR'] },
  { city: 'Washington DC', airports: ['IAD'] },
]

// Returns "City (A1/A2/A3)" for the prompt, or just the city name if not in the list
export function formatOriginForPrompt(city: string): string {
  const entry = CITIES.find((c) => c.city.toLowerCase() === city.toLowerCase())
  if (!entry) return city
  return `${entry.city} (${entry.airports.join('/')})`
}

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function OriginInput({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {CITIES.map((c) => (
        <button
          key={c.city}
          type="button"
          onClick={() => onChange(value === c.city ? '' : c.city)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
            value === c.city
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
          }`}
        >
          {c.city} ({c.airports.join('/')})
        </button>
      ))}
    </div>
  )
}

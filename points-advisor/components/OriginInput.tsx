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
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-64 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
    >
      <option value="">Select your city...</option>
      {CITIES.map((c) => (
        <option key={c.city} value={c.city}>
          {c.city} ({c.airports.join('/')})
        </option>
      ))}
    </select>
  )
}

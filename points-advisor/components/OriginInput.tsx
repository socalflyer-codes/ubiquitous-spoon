'use client'

interface CityEntry {
  city: string
  airports: string[]
}

const CITIES: CityEntry[] = [
  { city: 'Atlanta', airports: ['ATL'] },
  { city: 'Austin', airports: ['AUS'] },
  { city: 'Boston', airports: ['BOS'] },
  { city: 'Charlotte', airports: ['CLT'] },
  { city: 'Chicago', airports: ['ORD', 'MDW'] },
  { city: 'Dallas', airports: ['DFW', 'DAL'] },
  { city: 'Denver', airports: ['DEN'] },
  { city: 'Detroit', airports: ['DTW'] },
  { city: 'Houston', airports: ['IAH', 'HOU'] },
  { city: 'Las Vegas', airports: ['LAS'] },
  { city: 'Los Angeles', airports: ['LAX', 'BUR', 'LGB', 'SNA'] },
  { city: 'Miami', airports: ['MIA', 'FLL'] },
  { city: 'Minneapolis', airports: ['MSP'] },
  { city: 'Nashville', airports: ['BNA'] },
  { city: 'New York', airports: ['JFK', 'LGA', 'EWR'] },
  { city: 'Orlando', airports: ['MCO'] },
  { city: 'Philadelphia', airports: ['PHL'] },
  { city: 'Phoenix', airports: ['PHX'] },
  { city: 'Portland', airports: ['PDX'] },
  { city: 'Salt Lake City', airports: ['SLC'] },
  { city: 'San Francisco', airports: ['SFO', 'OAK', 'SJC'] },
  { city: 'Seattle', airports: ['SEA'] },
  { city: 'Tampa', airports: ['TPA'] },
  { city: 'Washington DC', airports: ['IAD', 'DCA', 'BWI'] },
  // International
  { city: 'Amsterdam', airports: ['AMS'] },
  { city: 'Dubai', airports: ['DXB'] },
  { city: 'Frankfurt', airports: ['FRA'] },
  { city: 'Hong Kong', airports: ['HKG'] },
  { city: 'London', airports: ['LHR', 'LGW', 'STN'] },
  { city: 'Montreal', airports: ['YUL'] },
  { city: 'Paris', airports: ['CDG', 'ORY'] },
  { city: 'Singapore', airports: ['SIN'] },
  { city: 'Sydney', airports: ['SYD'] },
  { city: 'Tokyo', airports: ['NRT', 'HND'] },
  { city: 'Toronto', airports: ['YYZ'] },
  { city: 'Vancouver', airports: ['YVR'] },
]

// Returns "City (A1/A2/A3)" for the prompt, or just the city name if not in the list
export function formatOriginForPrompt(city: string): string {
  const entry = CITIES.find((c) => c.city.toLowerCase() === city.toLowerCase())
  if (!entry) return city
  return `${entry.city} (${entry.airports.join('/')})`
}

function getSuggestion(value: string): CityEntry | null {
  if (!value) return null
  const lower = value.toLowerCase()
  const match = CITIES.find((c) => c.city.toLowerCase().startsWith(lower))
  return match && match.city.toLowerCase() !== lower ? match : null
}

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function OriginInput({ value, onChange }: Props) {
  const suggestion = getSuggestion(value)
  const ghost = suggestion ? suggestion.city.slice(value.length) : ''

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault()
      onChange(suggestion.city)
    }
  }

  return (
    <div className="relative w-56">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center px-4 text-sm"
      >
        <span className="invisible">{value}</span>
        <span className="text-gray-400">{ghost}</span>
      </div>
      <input
        type="text"
        placeholder="e.g. New York, Chicago"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
        autoComplete="off"
      />
    </div>
  )
}

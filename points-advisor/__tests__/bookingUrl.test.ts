import { describe, it, expect } from 'vitest'

// Inline the same logic from ResultCard to test URL construction
const DESTINATION_CODES: Record<string, string> = {
  'Chicago': 'ORD', 'Las Vegas': 'LAS', 'Los Angeles': 'LAX',
  'Miami': 'MIA', 'New York': 'JFK', 'Philadelphia': 'PHL',
  'San Diego': 'SAN', 'Seattle': 'SEA', 'Washington DC': 'IAD',
}
const ORIGIN_CODES: Record<string, string> = {
  'Atlanta': 'ATL', 'Chicago': 'ORD', 'Dallas': 'DFW',
  'Denver': 'DEN', 'Los Angeles': 'LAX', 'Miami': 'MIA',
  'New York': 'JFK', 'Washington DC': 'IAD',
}

function buildBookingUrl(matchedProgram: string, origin: string, destination: string): string | null {
  const from = ORIGIN_CODES[origin] ?? origin
  const to = DESTINATION_CODES[destination]
  if (!to) return null
  if (matchedProgram.includes('United MileagePlus')) {
    return `https://www.united.com/en/us/fsr/choose-flights?f=${from}&t=${to}&tt=1&at=1&sc=7&px=1&taxng=1&fareFamily=mixed`
  }
  if (matchedProgram.includes('British Airways Avios')) {
    return `https://www.aa.com/booking/search?locale=en_US&pax=1&adult=1&type=OneWay&searchType=Award&cabin=&carriers=ALL&maxStops=0&origin=${from}&destination=${to}`
  }
  return null
}

describe('buildBookingUrl', () => {
  it('builds correct United URL from Chicago to Miami', () => {
    const url = buildBookingUrl('Chase Ultimate Rewards → United MileagePlus', 'Chicago', 'Miami')
    expect(url).toBe('https://www.united.com/en/us/fsr/choose-flights?f=ORD&t=MIA&tt=1&at=1&sc=7&px=1&taxng=1&fareFamily=mixed')
  })

  it('builds correct United URL from Atlanta to New York', () => {
    const url = buildBookingUrl('Chase Ultimate Rewards → United MileagePlus', 'Atlanta', 'New York')
    expect(url).toContain('f=ATL&t=JFK')
  })

  it('builds correct AA URL for Avios from Denver to Seattle', () => {
    const url = buildBookingUrl('Chase Ultimate Rewards → British Airways Avios', 'Denver', 'Seattle')
    expect(url).toBe('https://www.aa.com/booking/search?locale=en_US&pax=1&adult=1&type=OneWay&searchType=Award&cabin=&carriers=ALL&maxStops=0&origin=DEN&destination=SEA')
  })

  it('returns null for unknown destination', () => {
    const url = buildBookingUrl('Chase Ultimate Rewards → United MileagePlus', 'Chicago', 'Unknown City')
    expect(url).toBeNull()
  })

  it('never uses NYC as destination code — uses JFK instead', () => {
    const url = buildBookingUrl('Chase Ultimate Rewards → United MileagePlus', 'Chicago', 'New York')
    expect(url).not.toContain('NYC')
    expect(url).toContain('JFK')
  })
})

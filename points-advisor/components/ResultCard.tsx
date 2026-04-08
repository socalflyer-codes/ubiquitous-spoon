'use client'

import { useState } from 'react'
import type { RedemptionEntry } from '@/types'

interface Props {
  entry: RedemptionEntry
  matchedProgram: string
  userBalance: number
  gap?: number | null
  hasProgram?: boolean
  originCode?: string  // IATA code of departure airport e.g. "ORD"
}

// Primary IATA code per destination city (largest airport)
const DESTINATION_CODES: Record<string, string> = {
  'Chicago': 'ORD',
  'Las Vegas': 'LAS',
  'Los Angeles': 'LAX',
  'Miami': 'MIA',
  'New York': 'JFK',
  'Philadelphia': 'PHL',
  'San Diego': 'SAN',
  'Seattle': 'SEA',
  'Washington DC': 'IAD',
}

// Primary IATA code per origin city
const ORIGIN_CODES: Record<string, string> = {
  'Atlanta': 'ATL',
  'Chicago': 'ORD',
  'Dallas': 'DFW',
  'Denver': 'DEN',
  'Los Angeles': 'LAX',
  'Miami': 'MIA',
  'New York': 'JFK',
  'Washington DC': 'IAD',
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

function getAirlineName(matchedProgram: string): string {
  if (matchedProgram.includes('United MileagePlus')) return 'United Airlines'
  if (matchedProgram.includes('British Airways Avios')) return 'American Airlines'
  return matchedProgram
}

export default function ResultCard({ entry, matchedProgram, userBalance, gap, hasProgram = true, originCode }: Props) {
  const [showDetails, setShowDetails] = useState(false)

  const pointsDisplay = entry.pricing_type === 'dynamic' && entry.points_range
    ? `${entry.points_range[0].toLocaleString()}–${entry.points_range[1].toLocaleString()} points one-way`
    : `${entry.points_required.toLocaleString()} points one-way`

  const bookingUrl = originCode
    ? buildBookingUrl(matchedProgram, originCode, entry.destination)
    : null
  const airlineName = getAirlineName(matchedProgram)
  const canBook = hasProgram && gap == null

  // Plain-English transfer instruction e.g. "Transfer Chase points → United, then book"
  const transferInstruction = matchedProgram.includes('United MileagePlus')
    ? 'Transfer your Chase points to United MileagePlus, then book on united.com'
    : matchedProgram.includes('British Airways Avios')
    ? 'Transfer your Chase points to British Airways Avios, then book on aa.com'
    : null

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-900 text-xl">{entry.destination}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {canBook
              ? pointsDisplay
              : !hasProgram
              ? `You'd need to earn ${entry.program} points`
              : `You need ${gap?.toLocaleString()} more points`}
          </p>
        </div>
        {canBook && (
          <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
            Bookable
          </span>
        )}
        {gap != null && (
          <span className="shrink-0 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
            {gap.toLocaleString()} pts short
          </span>
        )}
      </div>

      {/* Cabin + airline */}
      {entry.cabin && (
        <p className="text-sm text-gray-600">
          {entry.cabin} class · {airlineName}
        </p>
      )}

      {/* How to book — transfer instruction */}
      {canBook && transferInstruction && (
        <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          {transferInstruction}
        </p>
      )}

      {/* CTA */}
      {canBook && bookingUrl && (
        <div>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Search availability →
          </a>
        </div>
      )}

      {/* Details toggle — always on its own line */}
      <div>
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          {showDetails ? 'Hide details' : 'Show details'}
        </button>
      </div>

      {showDetails && (
        <div className="text-xs text-gray-400 space-y-1 border-t border-gray-100 pt-3">
          {entry.notes && <p>{entry.notes}</p>}
          <p>Source: {entry.source_site} · {entry.published_date}</p>
        </div>
      )}
    </div>
  )
}

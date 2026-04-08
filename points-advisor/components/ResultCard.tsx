'use client'

import { useState } from 'react'
import type { RedemptionEntry } from '@/types'

interface Props {
  entry: RedemptionEntry
  matchedProgram: string
  userBalance: number
  gap?: number | null
  hasProgram?: boolean
}

// Maps program name to its booking URL
const BOOKING_URLS: Record<string, string> = {
  'United MileagePlus': 'https://www.united.com/en/us/book-flight/united-awards',
  'British Airways Avios': 'https://www.aa.com/reservation/startSSO.do',
}

function getBookingUrl(matchedProgram: string): string | null {
  if (matchedProgram.includes('United MileagePlus')) return BOOKING_URLS['United MileagePlus']
  if (matchedProgram.includes('British Airways Avios')) return BOOKING_URLS['British Airways Avios']
  return null
}

function getAirlineName(matchedProgram: string): string {
  if (matchedProgram.includes('United MileagePlus')) return 'United Airlines'
  if (matchedProgram.includes('British Airways Avios')) return 'American Airlines'
  return matchedProgram
}

export default function ResultCard({ entry, matchedProgram, userBalance, gap, hasProgram = true }: Props) {
  const [showDetails, setShowDetails] = useState(false)

  const startingPoints = entry.pricing_type === 'dynamic' && entry.points_range
    ? entry.points_range[0]
    : entry.points_required

  const bookingUrl = getBookingUrl(matchedProgram)
  const airlineName = getAirlineName(matchedProgram)
  const canBook = hasProgram && gap == null

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-900 text-xl">{entry.destination}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {canBook
              ? `Starting from ${startingPoints.toLocaleString()} points one-way`
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

      {/* Cabin */}
      {entry.cabin && (
        <p className="text-sm text-gray-600">
          {entry.cabin} class · {airlineName}
        </p>
      )}

      {/* CTA */}
      {canBook && bookingUrl && (
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Search availability →
        </a>
      )}

      {/* Details toggle */}
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-gray-400 hover:text-gray-600"
      >
        {showDetails ? 'Hide details' : 'Show details'}
      </button>

      {showDetails && (
        <div className="text-xs text-gray-400 space-y-1 border-t border-gray-100 pt-3">
          {entry.pricing_type === 'dynamic' && entry.points_range && (
            <p>Points range: {entry.points_range[0].toLocaleString()}–{entry.points_range[1].toLocaleString()} depending on dates</p>
          )}
          {entry.notes && <p>{entry.notes}</p>}
          <p>Source: {entry.source_site} · {entry.published_date}</p>
        </div>
      )}
    </div>
  )
}

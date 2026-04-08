'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ResultCard from '@/components/ResultCard'
import ResultsSection from '@/components/ResultsSection'
import type { RecommendResponse } from '@/types'

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<RecommendResponse | null>(null)
  const [inspire, setInspire] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('results')
    if (!stored) {
      router.replace('/')
      return
    }
    setResults(JSON.parse(stored))
    setInspire(sessionStorage.getItem('inspire') === 'true')
  }, [router])

  if (!results) return null

  // Don't show "US Domestic" as a destination — it's an internal dataset label
  const dreamDestinationNames = new Set(results.dream_destinations.map((d) => d.destination))
  const reachableFiltered = results.reachable.filter(
    (r) => r.entry.destination !== 'US Domestic' && !dreamDestinationNames.has(r.entry.destination)
  )

  const hasReachable = reachableFiltered.length > 0
  const hasDreams = results.dream_destinations.length > 0

  // Inspire mode: single featured pick
  if (inspire && results.reachable.length > 0) {
    const pick = results.reachable[0]
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Your Next Trip</h1>
          <button onClick={() => router.push('/')} className="text-sm text-blue-600 hover:underline">
            ← Start over
          </button>
        </div>
        {results.explanation && (
          <p className="text-lg text-gray-700 leading-relaxed">{results.explanation}</p>
        )}
        <ResultCard
          entry={pick.entry}
          matchedProgram={pick.matched_program}
          userBalance={pick.user_balance}
        />
        <button
          onClick={() => {
            sessionStorage.setItem('inspire', 'false')
            setInspire(false)
          }}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Show all my redemptions instead
        </button>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16 space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Your Redemptions</h1>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Start over
        </button>
      </div>

      {results.explanation && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-sm text-blue-800 leading-relaxed">
          {results.explanation}
        </div>
      )}

      {hasDreams && (
        <ResultsSection heading="Your Dream Destinations">
          <div className="space-y-4">
            {results.dream_destinations.map((d, i) => (
              <div key={i}>
                {d.best_entry ? (
                  <ResultCard
                    entry={d.best_entry}
                    matchedProgram={d.matched_program ?? d.best_entry.program}
                    userBalance={d.user_balance ?? 0}
                    gap={d.reachable ? null : d.gap}
                    hasProgram={d.matched_program !== null}
                  />
                ) : (
                  <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
                    <h3 className="font-semibold text-gray-700">{d.destination}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      No redemption data found for this destination yet.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ResultsSection>
      )}

      {hasReachable && (
        <ResultsSection heading="You Can Go Here Now">
          <div className="space-y-4">
            {reachableFiltered.map((r, i) => (
              <ResultCard
                key={i}
                entry={r.entry}
                matchedProgram={r.matched_program}
                userBalance={r.user_balance}
              />
            ))}
          </div>
        </ResultsSection>
      )}

      {!hasReachable && !hasDreams && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No redemptions found for your current balances.</p>
          <p className="text-sm mt-2">Try adding more programs or increasing your balances.</p>
        </div>
      )}

      <div className="border-t border-gray-100 pt-8 text-sm text-gray-500 leading-relaxed">
        <p>
          Don't see what you're looking for? Try a different departure city or adjust your balance — Chase Ultimate Rewards transfer 1:1 to United MileagePlus and British Airways Avios.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-3 text-blue-600 hover:underline text-sm"
        >
          ← Start over
        </button>
      </div>
    </main>
  )
}

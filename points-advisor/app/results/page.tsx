'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ResultCard from '@/components/ResultCard'
import ResultsSection from '@/components/ResultsSection'
import type { RecommendResponse } from '@/types'

export default function ResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<RecommendResponse | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('results')
    if (!stored) {
      router.replace('/')
      return
    }
    setResults(JSON.parse(stored))
  }, [router])

  if (!results) return null

  const hasReachable = results.reachable.length > 0
  const hasDreams = results.dream_destinations.length > 0

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

      {hasReachable && (
        <ResultsSection heading="You Can Go Here Now">
          <div className="space-y-4">
            {results.reachable.map((r, i) => (
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

      {hasDreams && (
        <ResultsSection heading="Your Dream Destinations">
          <div className="space-y-4">
            {results.dream_destinations.map((d, i) => (
              <div key={i}>
                {d.best_entry ? (
                  <ResultCard
                    entry={d.best_entry}
                    matchedProgram={d.matched_program ?? d.destination}
                    userBalance={d.user_balance ?? 0}
                    gap={d.reachable ? null : d.gap}
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

      {!hasReachable && !hasDreams && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No redemptions found for your current balances.</p>
          <p className="text-sm mt-2">Try adding more programs or increasing your balances.</p>
        </div>
      )}
    </main>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BalanceInput from '@/components/BalanceInput'
import DestinationInput from '@/components/DestinationInput'
import type { Balance } from '@/types'

export default function HomePage() {
  const router = useRouter()
  const [balances, setBalances] = useState<Balance[]>([{ program: '', amount: 0 }])
  const [destinations, setDestinations] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const validBalances = balances.filter((b) => b.program.trim() && b.amount > 0)
    if (validBalances.length === 0) {
      setError('Please enter at least one loyalty program with a point balance.')
      return
    }

    setLoading(true)
    try {
      const destinationList = destinations
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean)

      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ balances: validBalances, destinations: destinationList }),
      })

      if (!res.ok) throw new Error('Request failed')

      const data = await res.json()
      sessionStorage.setItem('results', JSON.stringify(data))
      router.push('/results')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <div className="space-y-2 mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Points Advisor</h1>
        <p className="text-gray-500 text-lg">
          Enter your loyalty point balances and find out where you can go.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Your Point Balances
          </label>
          <BalanceInput balances={balances} onChange={setBalances} />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Dream Destinations
            <span className="text-gray-400 font-normal normal-case ml-2">(optional)</span>
          </label>
          <DestinationInput value={destinations} onChange={setDestinations} />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          {loading ? 'Analyzing your points...' : 'Find My Redemptions'}
        </button>
      </form>
    </main>
  )
}

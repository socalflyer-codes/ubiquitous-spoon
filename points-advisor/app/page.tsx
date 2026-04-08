'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BalanceInput from '@/components/BalanceInput'
import DestinationInput from '@/components/DestinationInput'
import OriginInput, { formatOriginForPrompt } from '@/components/OriginInput'
import type { Cabin } from '@/types'

export default function HomePage() {
  const router = useRouter()
  const [balance, setBalance] = useState(0)
  const [destinations, setDestinations] = useState<string[]>([])
  const [cabins, setCabins] = useState<Cabin[]>([])
  const [origin, setOrigin] = useState('')

  function handleOriginChange(city: string) {
    setOrigin(city)
    // Remove the newly selected origin from destinations if it was already picked
    setDestinations((prev) => prev.filter((d) => d.toLowerCase() !== city.toLowerCase()))
  }
  const [loading, setLoading] = useState<false | 'search' | 'inspire'>(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(inspire: boolean) {
    setError(null)

    if (!balance || balance <= 0) {
      setError('Please enter your Chase Ultimate Rewards balance.')
      return
    }

    if (!origin) {
      setError('Please select your departure city.')
      return
    }

    setLoading(inspire ? 'inspire' : 'search')
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          balances: [{ program: 'Chase Ultimate Rewards', amount: balance }],
          destinations: inspire ? [] : destinations,
          inspire,
          cabins: cabins.length > 0 ? cabins : undefined,
          origin: formatOriginForPrompt(origin),
        }),
      })

      if (!res.ok) throw new Error('Request failed')

      const data = await res.json()
      sessionStorage.setItem('results', JSON.stringify(data))
      sessionStorage.setItem('inspire', inspire ? 'true' : 'false')
      sessionStorage.setItem('origin', origin)
      router.push('/results')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false as false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <div className="space-y-2 mb-10">
        <h1 className="text-4xl font-bold text-gray-900">Points Advisor</h1>
        <p className="text-gray-500 text-lg">
          Find out where your Chase points can take you.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); submit(false) }} className="space-y-8">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Your Balance
          </label>
          <BalanceInput balance={balance} onChange={setBalance} />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Departure City
          </label>
          <OriginInput value={origin} onChange={handleOriginChange} />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Dream Destinations
            <span className="text-gray-400 font-normal normal-case ml-2">(optional)</span>
          </label>
          <DestinationInput value={destinations} onChange={setDestinations} excludeCity={origin} />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Cabin Class
            <span className="text-gray-400 font-normal normal-case ml-2">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {(['Economy', 'First'] as Cabin[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCabins(cabins.includes(c) ? cabins.filter((x) => x !== c) : [...cabins, c])}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  cabins.includes(c)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="space-y-3">
          <button
            type="submit"
            disabled={loading !== false}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            {loading === 'search' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing your points...
              </span>
            ) : 'Find My Redemptions'}
          </button>
          <button
            type="button"
            disabled={loading !== false}
            onClick={() => submit(true)}
            className="w-full bg-white hover:bg-gray-50 disabled:opacity-50 border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            {loading === 'inspire' ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Finding inspiration...
              </span>
            ) : 'Inspire Me'}
          </button>
        </div>
      </form>
    </main>
  )
}

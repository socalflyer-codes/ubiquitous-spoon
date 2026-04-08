'use client'

import type { Balance } from '@/types'

interface Props {
  balance: number
  onChange: (balance: number) => void
}

export default function BalanceInput({ balance, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700 w-48 shrink-0">
        Chase Ultimate Rewards
      </span>
      <input
        type="number"
        placeholder="e.g. 75000"
        value={balance || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-48 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        min={0}
      />
      <span className="text-sm text-gray-400">points</span>
    </div>
  )
}

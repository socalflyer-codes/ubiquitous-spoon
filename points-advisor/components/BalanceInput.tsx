'use client'

import type { Balance } from '@/types'

interface Props {
  balances: Balance[]
  onChange: (balances: Balance[]) => void
}

export default function BalanceInput({ balances, onChange }: Props) {
  function update(index: number, field: keyof Balance, value: string) {
    const updated = balances.map((b, i) => {
      if (i !== index) return b
      return { ...b, [field]: field === 'amount' ? Number(value) : value }
    })
    onChange(updated)
  }

  function addRow() {
    onChange([...balances, { program: '', amount: 0 }])
  }

  function removeRow(index: number) {
    onChange(balances.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      {balances.map((balance, i) => (
        <div key={i} className="flex gap-3 items-center">
          <input
            type="text"
            placeholder="Program (e.g. Aeroplan)"
            value={balance.program}
            onChange={(e) => update(i, 'program', e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Points balance"
            value={balance.amount || ''}
            onChange={(e) => update(i, 'amount', e.target.value)}
            className="w-40 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {balances.length > 1 && (
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="text-gray-400 hover:text-red-500 text-lg leading-none"
              aria-label="Remove"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="text-sm text-blue-600 hover:underline"
      >
        + Add another program
      </button>
    </div>
  )
}

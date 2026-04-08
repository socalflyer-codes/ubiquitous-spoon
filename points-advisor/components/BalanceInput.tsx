'use client'

import { useRef } from 'react'
import type { Balance } from '@/types'

const PROGRAMS = [
  'Aeroplan',
  'Alaska Mileage Plan',
  'American AAdvantage',
  'Amex Membership Rewards',
  'British Airways Avios',
  'Capital One Miles',
  'Chase Ultimate Rewards',
  'Citi ThankYou Points',
  'Delta SkyMiles',
  'Flying Blue',
  'Hilton Honors',
  'IHG One Rewards',
  'Marriott Bonvoy',
  'Qantas Points',
  'Singapore KrisFlyer',
  'Southwest Rapid Rewards',
  'Turkish Miles&Smiles',
  'United MileagePlus',
  'Virgin Atlantic Flying Club',
  'World of Hyatt',
]

interface Props {
  balances: Balance[]
  onChange: (balances: Balance[]) => void
}

function getSuggestion(value: string): string | null {
  if (!value) return null
  const lower = value.toLowerCase()
  const match = PROGRAMS.find((p) => p.toLowerCase().startsWith(lower))
  return match && match.toLowerCase() !== lower ? match : null
}

function ProgramInput({
  value,
  onUpdate,
}: {
  value: string
  onUpdate: (val: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestion = getSuggestion(value)
  // Ghost text is only the completion suffix, not the full string
  const ghost = suggestion ? suggestion.slice(value.length) : ''

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault()
      onUpdate(suggestion)
    }
  }

  return (
    <div className="relative flex-1">
      {/* Ghost text layer — sits behind the input */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center px-4 text-sm"
      >
        <span className="invisible">{value}</span>
        <span className="text-gray-400">{ghost}</span>
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Program (e.g. Aeroplan)"
        value={value}
        onChange={(e) => onUpdate(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
        autoComplete="off"
      />
    </div>
  )
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
          <ProgramInput
            value={balance.program}
            onUpdate={(val) => update(i, 'program', val)}
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

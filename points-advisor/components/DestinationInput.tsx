'use client'

import { useState } from 'react'

// Keep in sync with data/seed.json destinations.
// "US to X" route labels are excluded — Claude matches them via partial destination name.
const CATEGORIES = [
  {
    label: 'Regions',
    destinations: [
      'Africa', 'Asia', 'Caribbean', 'Central America', 'Europe',
      'Hawaii', 'Middle East', 'South America', 'Southeast Asia', 'West Africa',
    ],
  },
  {
    label: 'Countries',
    destinations: [
      'Australia', 'Canada', 'Costa Rica', 'India', 'Israel',
      'Japan', 'Maldives', 'Mexico', 'Nepal', 'New Zealand', 'South Africa',
    ],
  },
  {
    label: 'Cities',
    destinations: [
      'Bali', 'Cancun', 'Chicago', 'Dubai', 'Hong Kong', 'Iceland',
      'Las Vegas', 'Los Angeles', 'Miami', 'New York', 'Paris',
      'Philadelphia', 'San Diego', 'Seattle', 'Washington DC',
    ],
  },
]

interface Props {
  value: string[]
  onChange: (value: string[]) => void
}

export default function DestinationInput({ value, onChange }: Props) {
  const [open, setOpen] = useState<string | null>(null)

  function toggle(destination: string) {
    if (value.includes(destination)) {
      onChange(value.filter((d) => d !== destination))
    } else {
      onChange([...value, destination])
    }
  }

  return (
    <div className="space-y-2">
      {CATEGORIES.map((cat) => {
        const isOpen = open === cat.label
        const selectedInCategory = cat.destinations.filter((d) => value.includes(d))

        return (
          <div key={cat.label} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : cat.label)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <span>{cat.label}</span>
              <div className="flex items-center gap-2">
                {selectedInCategory.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {selectedInCategory.length} selected
                  </span>
                )}
                <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
              </div>
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2 border-t border-gray-100">
                {cat.destinations.map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => toggle(dest)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      value.includes(dest)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {value.length > 0 && (
        <p className="text-xs text-gray-400">
          {value.length} destination{value.length > 1 ? 's' : ''} selected: {value.join(', ')}
        </p>
      )}
    </div>
  )
}

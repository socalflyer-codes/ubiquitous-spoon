'use client'

import { useState } from 'react'

// Keep in sync with data/seed.json destinations.
// "US to X" route labels are excluded — Claude matches them via partial destination name.
const CATEGORIES: { label: string; destinations: string[]; comingSoon?: boolean }[] = [
  {
    label: 'Cities',
    destinations: [
      'Chicago', 'Las Vegas', 'Los Angeles', 'Miami',
      'New York', 'Philadelphia', 'San Diego', 'Seattle', 'Washington DC',
    ],
  },
  {
    label: 'International',
    destinations: [],
    comingSoon: true,
  },
]

interface Props {
  value: string[]
  onChange: (value: string[]) => void
  excludeCity?: string
}

export default function DestinationInput({ value, onChange, excludeCity }: Props) {
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
        const visibleDestinations = cat.destinations.filter(
          (d) => !excludeCity || d.toLowerCase() !== excludeCity.toLowerCase()
        )
        const selectedInCategory = visibleDestinations.filter((d) => value.includes(d))

        return (
          <div key={cat.label} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => !cat.comingSoon && setOpen(isOpen ? null : cat.label)}
              disabled={cat.comingSoon}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                cat.comingSoon
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{cat.label}</span>
              <div className="flex items-center gap-2">
                {cat.comingSoon && (
                  <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">
                    coming soon
                  </span>
                )}
                {!cat.comingSoon && selectedInCategory.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {selectedInCategory.length} selected
                  </span>
                )}
                {!cat.comingSoon && (
                  <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
                )}
              </div>
            </button>

            {isOpen && !cat.comingSoon && (
              <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2 border-t border-gray-100">
                {visibleDestinations.map((dest) => (
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

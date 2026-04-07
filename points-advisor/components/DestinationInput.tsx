'use client'

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function DestinationInput({ value, onChange }: Props) {
  return (
    <div className="space-y-1">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Japan, Maldives, Southeast Asia"
        rows={3}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
      <p className="text-xs text-gray-400">
        Separate multiple destinations with commas
      </p>
    </div>
  )
}

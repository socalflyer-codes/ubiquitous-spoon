import type { RedemptionEntry } from '@/types'

interface Props {
  entry: RedemptionEntry
  matchedProgram: string
  userBalance: number
  gap?: number | null
  // false when the user doesn't own matchedProgram — shown as "need" hint rather than active program
  hasProgram?: boolean
}

export default function ResultCard({ entry, matchedProgram, userBalance, gap, hasProgram = true }: Props) {
  const pointsDisplay =
    entry.pricing_type === 'dynamic' && entry.points_range
      ? `${entry.points_range[0].toLocaleString()}–${entry.points_range[1].toLocaleString()} pts`
      : `${entry.points_required.toLocaleString()} pts`

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{entry.destination}</h3>
          {entry.region && (
            <p className="text-xs text-gray-400 uppercase tracking-wide">{entry.region}</p>
          )}
        </div>
        {gap != null && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
            {gap.toLocaleString()} pts short
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <span className={`px-3 py-1 rounded-full ${hasProgram ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
          {hasProgram ? matchedProgram : `Need: ${matchedProgram}`}
        </span>
        {entry.cabin && (
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{entry.cabin}</span>
        )}
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
          {pointsDisplay}
        </span>
        {entry.pricing_type === 'dynamic' && (
          <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs">
            Dynamic pricing
          </span>
        )}
      </div>

      {entry.notes && (
        <p className="text-sm text-gray-500 leading-relaxed">{entry.notes}</p>
      )}

      <div className="pt-1">
        <span className="text-xs text-gray-400">
          via {entry.source_site} · {entry.published_date}
        </span>
      </div>
    </div>
  )
}

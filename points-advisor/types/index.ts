export interface Balance {
  program: string
  amount: number
}

export interface RedemptionEntry {
  program: string
  destination: string
  region: string
  cabin: string | null
  points_required: number
  pricing_type: 'fixed' | 'dynamic'
  points_range: [number, number] | null
  source_url: string
  source_site: string
  source_geo: 'US' | 'CA' | 'AU' | 'UK'
  published_date: string
  notes: string
}

export interface RedeemableResult {
  entry: RedemptionEntry
  matched_program: string
  user_balance: number
  surplus: number  // how many points left over after redemption
}

export interface DreamResult {
  destination: string
  reachable: boolean
  best_entry: RedemptionEntry | null
  matched_program: string | null
  user_balance: number | null
  gap: number | null  // null if reachable or no match found
}

export interface RecommendRequest {
  balances: Balance[]
  destinations: string[]
}

export interface RecommendResponse {
  reachable: RedeemableResult[]
  dream_destinations: DreamResult[]
  explanation: string  // Claude's overall summary paragraph
}

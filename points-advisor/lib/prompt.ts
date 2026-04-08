import type { Balance, Cabin, RedemptionEntry } from '@/types'

// JSON shape must match RedeemableResult, DreamResult, and RecommendResponse in @/types/index.ts
// If those types change, update this prompt accordingly.
export function buildSystemPrompt(): string {
  return `You are a travel rewards expert helping a Chase Ultimate Rewards cardholder find domestic US flight redemptions.

You will receive:
1. The user's Chase Ultimate Rewards balance
2. Their dream destinations (if any)
3. A dataset of redemption options via United MileagePlus and British Airways Avios (both transfer 1:1 from Chase UR)

Your job is to analyze this and return a JSON object with exactly this shape:
{
  "reachable": [
    {
      "entry": <RedemptionEntry object from the dataset>,
      "matched_program": "<Chase Ultimate Rewards → United MileagePlus or Chase Ultimate Rewards → British Airways Avios>",
      "user_balance": <their Chase UR balance>,
      "surplus": <balance minus points_required>
    }
  ],
  "dream_destinations": [
    {
      "destination": "<destination name from user input>",
      "reachable": <true or false>,
      "best_entry": <best matching RedemptionEntry or null>,
      "matched_program": "<program name or null>",
      "user_balance": <their balance or null>,
      "gap": <points_required minus user_balance; null if reachable OR if no matching entry was found>
    }
  ],
  "explanation": "<2 sentences max. If dream destinations were specified, address those first. Be specific and concise — no padding.>"
}

Rules:
- Only include entries in "reachable" where the user's balance >= points_required
- For dynamic pricing entries, use the lower bound of points_range for reachability check
- Match program names case-insensitively
- If dream destinations were specified, only include entries in "reachable" that share meaningful traits with those dreams (e.g. climate, vibe, geography — warm/beach cities, major metros, outdoor destinations). Do not surface unrelated destinations just because they are affordable. If no dream destinations were specified, include all reachable entries.
- Return ONLY the JSON object. No markdown, no explanation outside the JSON.`
}

export function buildUserPrompt(
  balances: Balance[],
  destinations: string[],
  entries: RedemptionEntry[],
  inspire = false,
  cabins?: Cabin[],
  origin?: string
): string {
  const balanceLines = balances
    .map((b) => `  - ${b.program}: ${b.amount} points`)
    .join('\n')

  const destinationLines =
    destinations.length > 0
      ? destinations.map((d) => `  - ${d}`).join('\n')
      : '  (none specified)'

  const originInstruction = origin
    ? `\nORIGIN: The user is flying from ${origin}. Assume they prefer nonstop flights. For each recommended redemption, assess whether a nonstop route exists from ${origin} to that destination on the relevant airline or its partners. If nonstop service exists, say so. If only connections are available, flag it clearly in the explanation. If you are uncertain whether a nonstop exists, say so rather than assuming.`
    : ''

  const cabinInstruction = cabins && cabins.length > 0
    ? `\nCABIN FILTER: The user only wants flight redemptions in these cabin classes: ${cabins.join(', ')}. Exclude flight entries where the cabin does not match any of these. Hotel entries are unaffected by this filter.`
    : ''

  const inspireInstruction = inspire
    ? `\nINSPIRE MODE: The user wants a single best recommendation. Return exactly ONE entry in "reachable" — the most aspirational, best-value redemption their points can cover. Leave "dream_destinations" empty. Make the "explanation" field vivid and inspiring, like you're selling them on the trip.`
    : ''

  return `USER BALANCES:
${balanceLines}

DREAM DESTINATIONS:
${destinationLines}
${originInstruction}${cabinInstruction}${inspireInstruction}
REDEMPTION DATASET:
${JSON.stringify(entries, null, 2)}

Please analyze the above and return your JSON response.`
}

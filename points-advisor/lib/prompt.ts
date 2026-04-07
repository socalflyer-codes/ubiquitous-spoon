import type { Balance, RedemptionEntry } from '@/types'

export function buildSystemPrompt(): string {
  return `You are a travel rewards expert helping users maximize their loyalty points.

You will receive:
1. The user's current point balances by program
2. Their dream destinations (if any)
3. A dataset of known redemption sweet spots

Your job is to analyze this and return a JSON object with exactly this shape:
{
  "reachable": [
    {
      "entry": <RedemptionEntry object from the dataset>,
      "matched_program": "<which of the user's programs covers this>",
      "user_balance": <their balance in that program>,
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
      "gap": <points_required minus user_balance, or null if reachable>
    }
  ],
  "explanation": "<2-3 sentence plain-English summary of the key findings>"
}

Rules:
- Only include entries in "reachable" where the user's balance >= points_required for a matching program
- For dynamic pricing entries, use the lower bound of points_range for reachability check
- Match programs case-insensitively and handle common aliases (e.g. "Chase UR" matches "Chase Ultimate Rewards")
- For dream destinations, search the dataset by destination name and region — partial matches are fine
- Rank "reachable" entries by value: fixed pricing first, then by surplus (ascending — closest to exact value)
- Return ONLY the JSON object. No markdown, no explanation outside the JSON.`
}

export function buildUserPrompt(
  balances: Balance[],
  destinations: string[],
  entries: RedemptionEntry[]
): string {
  const balanceLines = balances
    .map((b) => `  - ${b.program}: ${b.amount} points`)
    .join('\n')

  const destinationLines =
    destinations.length > 0
      ? destinations.map((d) => `  - ${d}`).join('\n')
      : '  (none specified)'

  return `USER BALANCES:
${balanceLines}

DREAM DESTINATIONS:
${destinationLines}

REDEMPTION DATASET:
${JSON.stringify(entries, null, 2)}

Please analyze the above and return your JSON response.`
}

import { NextResponse } from 'next/server'
import { anthropic } from '@/lib/claude'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompt'
import { filterByPrograms } from '@/lib/filter'
import seedData from '@/data/seed.json'
import type { RecommendRequest, RecommendResponse, RedemptionEntry } from '@/types'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  if (!body || !Array.isArray(body.balances) || body.balances.length === 0) {
    return NextResponse.json(
      { error: 'balances is required and must be a non-empty array' },
      { status: 400 }
    )
  }

  const { balances, destinations = [], inspire = false, cabins, origin }: RecommendRequest = body

  // Pre-filter: only send entries relevant to the user's programs to Claude.
  // This keeps token usage proportional to the user's portfolio, not the total DB size.
  const relevantEntries = filterByPrograms(balances, seedData as RedemptionEntry[])
  console.log(`Pre-filter: ${seedData.length} total → ${relevantEntries.length} relevant entries`)

  let message
  try {
    message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: buildSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(balances, destinations, relevantEntries, inspire, cabins, origin),
        },
      ],
    })
  } catch (err) {
    console.error('Claude API error:', err)
    return NextResponse.json({ error: 'Failed to reach Claude API' }, { status: 502 })
  }

  const textBlock = message.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    return NextResponse.json({ error: 'Unexpected response format from Claude' }, { status: 502 })
  }

  // Strip markdown code fences if Claude wrapped the response (e.g. ```json ... ```)
  const rawText = textBlock.text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()

  let result: RecommendResponse
  try {
    result = JSON.parse(rawText)
  } catch {
    console.error('Failed to parse Claude response:', textBlock.text)
    return NextResponse.json({ error: 'Claude returned malformed JSON' }, { status: 502 })
  }

  return NextResponse.json(result)
}

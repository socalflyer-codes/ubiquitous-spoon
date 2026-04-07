import { NextResponse } from 'next/server'
import { anthropic } from '@/lib/claude'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompt'
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

  const { balances, destinations = [] }: RecommendRequest = body

  let message
  try {
    message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: buildSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(balances, destinations, seedData as RedemptionEntry[]),
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

  let result: RecommendResponse
  try {
    result = JSON.parse(textBlock.text)
  } catch {
    console.error('Failed to parse Claude response:', textBlock.text)
    return NextResponse.json({ error: 'Claude returned malformed JSON' }, { status: 502 })
  }

  return NextResponse.json(result)
}

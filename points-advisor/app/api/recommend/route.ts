import { NextResponse } from 'next/server'
import { anthropic } from '@/lib/claude'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompt'
import seedData from '@/data/seed.json'
import type { RecommendRequest, RecommendResponse } from '@/types'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  if (!body || !Array.isArray(body.balances) || body.balances.length === 0) {
    return NextResponse.json(
      { error: 'balances is required and must be a non-empty array' },
      { status: 400 }
    )
  }

  const { balances, destinations = [] }: RecommendRequest = body

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: buildSystemPrompt(),
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(balances, destinations, seedData as any),
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const result: RecommendResponse = JSON.parse(text)

  return NextResponse.json(result)
}

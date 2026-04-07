import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/recommend/route'

// Mock the Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(function () {return {
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              reachable: [
                {
                  entry: {
                    program: 'Aeroplan',
                    destination: 'Japan',
                    region: 'Asia',
                    cabin: 'Business',
                    points_required: 65000,
                    pricing_type: 'fixed',
                    points_range: null,
                    source_url: 'https://example.com',
                    source_site: 'OMAAT',
                    source_geo: 'US',
                    published_date: '2025-11-01',
                    notes: 'No fuel surcharges',
                  },
                  matched_program: 'Aeroplan',
                  user_balance: 70000,
                  surplus: 5000,
                },
              ],
              dream_destinations: [],
              explanation: 'You can fly business to Japan with your Aeroplan points.',
            }),
          },
        ],
      }),
    },
  }}),
}))

describe('POST /api/recommend', () => {
  it('returns 400 if balances is missing', async () => {
    const req = new Request('http://localhost/api/recommend', {
      method: 'POST',
      body: JSON.stringify({ destinations: [] }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 if balances is empty', async () => {
    const req = new Request('http://localhost/api/recommend', {
      method: 'POST',
      body: JSON.stringify({ balances: [], destinations: [] }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 with reachable and dream_destinations on valid input', async () => {
    const req = new Request('http://localhost/api/recommend', {
      method: 'POST',
      body: JSON.stringify({
        balances: [{ program: 'Aeroplan', amount: 70000 }],
        destinations: ['Japan'],
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('reachable')
    expect(data).toHaveProperty('dream_destinations')
    expect(data).toHaveProperty('explanation')
  })

  it('returns 200 with empty destinations array', async () => {
    const req = new Request('http://localhost/api/recommend', {
      method: 'POST',
      body: JSON.stringify({
        balances: [{ program: 'Aeroplan', amount: 70000 }],
        destinations: [],
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})

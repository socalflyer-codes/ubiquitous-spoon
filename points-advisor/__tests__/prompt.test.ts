import { describe, it, expect } from 'vitest'
import { buildUserPrompt, buildSystemPrompt } from '@/lib/prompt'
import type { Balance, RedemptionEntry } from '@/types'

const mockEntries: RedemptionEntry[] = [
  {
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
  {
    program: 'World of Hyatt',
    destination: 'Costa Rica',
    region: 'Central America',
    cabin: null,
    points_required: 17000,
    pricing_type: 'fixed',
    points_range: null,
    source_url: 'https://example.com',
    source_site: 'TPG',
    source_geo: 'US',
    published_date: '2025-09-20',
    notes: 'Category 4',
  },
]

const mockBalances: Balance[] = [
  { program: 'Aeroplan', amount: 70000 },
  { program: 'World of Hyatt', amount: 10000 },
]

describe('buildSystemPrompt', () => {
  it('returns a non-empty string', () => {
    expect(buildSystemPrompt().length).toBeGreaterThan(0)
  })

  it('instructs Claude to return JSON', () => {
    expect(buildSystemPrompt()).toContain('JSON')
  })
})

describe('buildUserPrompt', () => {
  it('includes all balance programs', () => {
    const prompt = buildUserPrompt(mockBalances, ['Japan'], mockEntries)
    expect(prompt).toContain('Aeroplan')
    expect(prompt).toContain('70000')
    expect(prompt).toContain('World of Hyatt')
    expect(prompt).toContain('10000')
  })

  it('includes dream destinations', () => {
    const prompt = buildUserPrompt(mockBalances, ['Japan', 'Maldives'], mockEntries)
    expect(prompt).toContain('Japan')
    expect(prompt).toContain('Maldives')
  })

  it('includes redemption entries', () => {
    const prompt = buildUserPrompt(mockBalances, [], mockEntries)
    expect(prompt).toContain('65000')
    expect(prompt).toContain('17000')
  })

  it('handles empty destinations', () => {
    const prompt = buildUserPrompt(mockBalances, [], mockEntries)
    expect(typeof prompt).toBe('string')
    expect(prompt.length).toBeGreaterThan(0)
  })
})

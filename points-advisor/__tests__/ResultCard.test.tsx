import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ResultCard from '@/components/ResultCard'
import type { RedemptionEntry } from '@/types'

const fixedEntry: RedemptionEntry = {
  program: 'United MileagePlus',
  destination: 'Miami',
  region: 'North America',
  cabin: 'Economy',
  points_required: 10000,
  pricing_type: 'fixed',
  points_range: null,
  source_url: 'https://example.com',
  source_site: 'Upgraded Points',
  source_geo: 'US',
  published_date: '2026-04-07',
  notes: 'Saver economy one-way.',
  transferable_from: ['Chase Ultimate Rewards'],
  verified: true,
}

const dynamicEntry: RedemptionEntry = {
  ...fixedEntry,
  destination: 'Los Angeles',
  pricing_type: 'dynamic',
  points_range: [7500, 15000],
}

describe('ResultCard', () => {
  it('renders destination name', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Chase Ultimate Rewards → United MileagePlus" userBalance={70000} />)
    expect(screen.getByText('Miami')).toBeTruthy()
  })

  it('shows starting points for dynamic entry', () => {
    render(<ResultCard entry={dynamicEntry} matchedProgram="Chase Ultimate Rewards → United MileagePlus" userBalance={70000} />)
    expect(screen.getByText(/7,500/)).toBeTruthy()
  })

  it('shows fixed points for fixed entry', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Chase Ultimate Rewards → United MileagePlus" userBalance={70000} />)
    expect(screen.getByText(/10,000/)).toBeTruthy()
  })

  it('shows Bookable badge when reachable', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Chase Ultimate Rewards → United MileagePlus" userBalance={70000} />)
    expect(screen.getByText('Bookable')).toBeTruthy()
  })

  it('shows gap badge when points short', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Chase Ultimate Rewards → United MileagePlus" userBalance={70000} gap={3000} />)
    expect(screen.getByText(/3,000 pts short/)).toBeTruthy()
  })

  it('shows search availability link when bookable and origin provided', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Chase Ultimate Rewards → United MileagePlus" userBalance={70000} originCode="Chicago" />)
    const link = screen.getByText(/Search availability/)
    expect(link).toBeTruthy()
    expect(link.closest('a')?.href).toContain('f=ORD&t=MIA')
  })

  it('hides search availability link when points short', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Chase Ultimate Rewards → United MileagePlus" userBalance={70000} gap={3000} originCode="Chicago" />)
    expect(screen.queryByText(/Search availability/)).toBeNull()
  })

  it('hides search availability link when no origin provided', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Chase Ultimate Rewards → United MileagePlus" userBalance={70000} />)
    expect(screen.queryByText(/Search availability/)).toBeNull()
  })

  it('shows details on toggle', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Chase Ultimate Rewards → United MileagePlus" userBalance={70000} />)
    fireEvent.click(screen.getByText('Show details'))
    expect(screen.getByText(/Saver economy one-way/)).toBeTruthy()
  })

  it('shows cabin class', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Chase Ultimate Rewards → United MileagePlus" userBalance={70000} />)
    expect(screen.getByText(/Economy/)).toBeTruthy()
  })
})

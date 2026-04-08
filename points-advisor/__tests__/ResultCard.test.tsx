import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResultCard from '@/components/ResultCard'
import type { RedemptionEntry } from '@/types'

const fixedEntry: RedemptionEntry = {
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
  transferable_from: ['Chase Ultimate Rewards', 'Amex Membership Rewards'],
  verified: true,
}

const dynamicEntry: RedemptionEntry = {
  ...fixedEntry,
  program: 'United MileagePlus',
  pricing_type: 'dynamic',
  points_range: [60000, 110000],
}

describe('ResultCard', () => {
  it('renders destination name', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Aeroplan" userBalance={70000} />)
    expect(screen.getByText('Japan')).toBeTruthy()
  })

  it('renders program name', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Aeroplan" userBalance={70000} />)
    expect(screen.getByText(/aeroplan/i)).toBeTruthy()
  })

  it('renders fixed points required', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Aeroplan" userBalance={70000} />)
    expect(screen.getByText(/65,000/)).toBeTruthy()
  })

  it('shows dynamic disclaimer for dynamic entries', () => {
    render(<ResultCard entry={dynamicEntry} matchedProgram="United MileagePlus" userBalance={100000} />)
    expect(screen.getByText(/dynamic/i)).toBeTruthy()
  })

  it('renders cabin class when present', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Aeroplan" userBalance={70000} />)
    expect(screen.getByText(/business/i)).toBeTruthy()
  })

  it('renders notes', () => {
    render(<ResultCard entry={fixedEntry} matchedProgram="Aeroplan" userBalance={70000} />)
    expect(screen.getByText(/no fuel surcharges/i)).toBeTruthy()
  })
})

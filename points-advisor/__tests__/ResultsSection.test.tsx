import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResultsSection from '@/components/ResultsSection'

describe('ResultsSection', () => {
  it('renders the section heading', () => {
    render(<ResultsSection heading="You Can Go Here Now">{<p>content</p>}</ResultsSection>)
    expect(screen.getByText('You Can Go Here Now')).toBeTruthy()
  })

  it('renders children', () => {
    render(<ResultsSection heading="Test"><p>child content</p></ResultsSection>)
    expect(screen.getByText('child content')).toBeTruthy()
  })
})

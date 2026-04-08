import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DestinationInput from '@/components/DestinationInput'

describe('DestinationInput', () => {
  it('renders all three category headers', () => {
    render(<DestinationInput value={[]} onChange={vi.fn()} />)
    expect(screen.getByText('Cities')).toBeTruthy()
    expect(screen.getByText('Countries')).toBeTruthy()
    expect(screen.getByText('Regions')).toBeTruthy()
  })

  it('shows coming soon badge on Countries and Regions', () => {
    render(<DestinationInput value={[]} onChange={vi.fn()} />)
    const badges = screen.getAllByText('coming soon')
    expect(badges.length).toBe(2)
  })

  it('starts collapsed — no chips visible', () => {
    render(<DestinationInput value={[]} onChange={vi.fn()} />)
    expect(screen.queryByText('Paris')).toBeNull()
  })

  it('expands Cities on click and shows its chips', () => {
    render(<DestinationInput value={[]} onChange={vi.fn()} />)
    fireEvent.click(screen.getByText('Cities'))
    expect(screen.getByText('Paris')).toBeTruthy()
    expect(screen.getByText('Dubai')).toBeTruthy()
  })

  it('collapses Cities when clicked again', () => {
    render(<DestinationInput value={[]} onChange={vi.fn()} />)
    fireEvent.click(screen.getByText('Cities'))
    fireEvent.click(screen.getByText('Cities'))
    expect(screen.queryByText('Paris')).toBeNull()
  })

  it('coming soon categories cannot be opened', () => {
    render(<DestinationInput value={[]} onChange={vi.fn()} />)
    fireEvent.click(screen.getByText('Countries'))
    // chips area never renders for coming soon categories
    expect(screen.queryByText('Australia')).toBeNull()
  })

  it('calls onChange with destination added when chip clicked', () => {
    const onChange = vi.fn()
    render(<DestinationInput value={[]} onChange={onChange} />)
    fireEvent.click(screen.getByText('Cities'))
    fireEvent.click(screen.getByText('Paris'))
    expect(onChange).toHaveBeenCalledWith(['Paris'])
  })

  it('calls onChange with destination removed when selected chip clicked', () => {
    const onChange = vi.fn()
    render(<DestinationInput value={['Paris', 'Dubai']} onChange={onChange} />)
    fireEvent.click(screen.getByText('Cities'))
    fireEvent.click(screen.getByText('Paris'))
    expect(onChange).toHaveBeenCalledWith(['Dubai'])
  })

  it('shows selected count badge on Cities header', () => {
    render(<DestinationInput value={['Paris', 'Dubai']} onChange={vi.fn()} />)
    expect(screen.getByText('2 selected')).toBeTruthy()
  })

  it('shows total selected summary below categories', () => {
    render(<DestinationInput value={['Paris', 'Dubai']} onChange={vi.fn()} />)
    expect(screen.getByText(/2 destinations selected/)).toBeTruthy()
  })
})

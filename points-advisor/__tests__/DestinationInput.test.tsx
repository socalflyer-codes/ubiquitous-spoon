import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DestinationInput from '@/components/DestinationInput'

describe('DestinationInput', () => {
  it('renders Cities and International headers', () => {
    render(<DestinationInput value={[]} onChange={vi.fn()} />)
    expect(screen.getByText('Cities')).toBeTruthy()
    expect(screen.getByText('International')).toBeTruthy()
  })

  it('shows coming soon badge on International', () => {
    render(<DestinationInput value={[]} onChange={vi.fn()} />)
    expect(screen.getByText('coming soon')).toBeTruthy()
  })

  it('starts collapsed — no chips visible', () => {
    render(<DestinationInput value={[]} onChange={vi.fn()} />)
    expect(screen.queryByText('Chicago')).toBeNull()
  })

  it('expands Cities on click and shows US city chips', () => {
    render(<DestinationInput value={[]} onChange={vi.fn()} />)
    fireEvent.click(screen.getByText('Cities'))
    expect(screen.getByText('Chicago')).toBeTruthy()
    expect(screen.getByText('Miami')).toBeTruthy()
  })

  it('collapses Cities when clicked again', () => {
    render(<DestinationInput value={[]} onChange={vi.fn()} />)
    fireEvent.click(screen.getByText('Cities'))
    fireEvent.click(screen.getByText('Cities'))
    expect(screen.queryByText('Chicago')).toBeNull()
  })

  it('International cannot be opened', () => {
    render(<DestinationInput value={[]} onChange={vi.fn()} />)
    fireEvent.click(screen.getByText('International'))
    expect(screen.queryByText('Paris')).toBeNull()
  })

  it('calls onChange with destination added when chip clicked', () => {
    const onChange = vi.fn()
    render(<DestinationInput value={[]} onChange={onChange} />)
    fireEvent.click(screen.getByText('Cities'))
    fireEvent.click(screen.getByText('Chicago'))
    expect(onChange).toHaveBeenCalledWith(['Chicago'])
  })

  it('calls onChange with destination removed when selected chip clicked', () => {
    const onChange = vi.fn()
    render(<DestinationInput value={['Chicago', 'Miami']} onChange={onChange} />)
    fireEvent.click(screen.getByText('Cities'))
    fireEvent.click(screen.getByText('Chicago'))
    expect(onChange).toHaveBeenCalledWith(['Miami'])
  })

  it('shows selected count badge on Cities header', () => {
    render(<DestinationInput value={['Chicago', 'Miami']} onChange={vi.fn()} />)
    expect(screen.getByText('2 selected')).toBeTruthy()
  })

  it('shows total selected summary below categories', () => {
    render(<DestinationInput value={['Chicago', 'Miami']} onChange={vi.fn()} />)
    expect(screen.getByText(/2 destinations selected/)).toBeTruthy()
  })
})

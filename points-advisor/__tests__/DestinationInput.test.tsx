import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DestinationInput from '@/components/DestinationInput'

describe('DestinationInput', () => {
  it('renders all three category headers', () => {
    render(<DestinationInput value={[]} onChange={vi.fn()} />)
    expect(screen.getByText('Regions')).toBeTruthy()
    expect(screen.getByText('Countries')).toBeTruthy()
    expect(screen.getByText('Cities')).toBeTruthy()
  })

  it('starts collapsed — no chips visible', () => {
    render(<DestinationInput value={[]} onChange={vi.fn()} />)
    expect(screen.queryByText('Japan')).toBeNull()
    expect(screen.queryByText('Europe')).toBeNull()
  })

  it('expands a category on click and shows its chips', () => {
    render(<DestinationInput value={[]} onChange={vi.fn()} />)
    fireEvent.click(screen.getByText('Countries'))
    expect(screen.getByText('Japan')).toBeTruthy()
    expect(screen.getByText('Maldives')).toBeTruthy()
  })

  it('collapses an open category when clicked again', () => {
    render(<DestinationInput value={[]} onChange={vi.fn()} />)
    fireEvent.click(screen.getByText('Countries'))
    fireEvent.click(screen.getByText('Countries'))
    expect(screen.queryByText('Japan')).toBeNull()
  })

  it('only one category open at a time', () => {
    render(<DestinationInput value={[]} onChange={vi.fn()} />)
    fireEvent.click(screen.getByText('Countries'))
    fireEvent.click(screen.getByText('Regions'))
    expect(screen.queryByText('Japan')).toBeNull()
    expect(screen.getByText('Europe')).toBeTruthy()
  })

  it('calls onChange with destination added when chip clicked', () => {
    const onChange = vi.fn()
    render(<DestinationInput value={[]} onChange={onChange} />)
    fireEvent.click(screen.getByText('Countries'))
    fireEvent.click(screen.getByText('Japan'))
    expect(onChange).toHaveBeenCalledWith(['Japan'])
  })

  it('calls onChange with destination removed when selected chip clicked', () => {
    const onChange = vi.fn()
    render(<DestinationInput value={['Japan', 'Maldives']} onChange={onChange} />)
    fireEvent.click(screen.getByText('Countries'))
    fireEvent.click(screen.getByText('Japan'))
    expect(onChange).toHaveBeenCalledWith(['Maldives'])
  })

  it('shows selected count badge on category header', () => {
    render(<DestinationInput value={['Japan', 'Maldives']} onChange={vi.fn()} />)
    expect(screen.getByText('2 selected')).toBeTruthy()
  })

  it('shows total selected summary below categories', () => {
    render(<DestinationInput value={['Japan', 'Europe']} onChange={vi.fn()} />)
    expect(screen.getByText(/2 destinations selected/)).toBeTruthy()
    expect(screen.getByText(/Japan, Europe/)).toBeTruthy()
  })
})

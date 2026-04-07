import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DestinationInput from '@/components/DestinationInput'

describe('DestinationInput', () => {
  it('renders a textarea', () => {
    const onChange = vi.fn()
    render(<DestinationInput value="" onChange={onChange} />)
    expect(screen.getByRole('textbox')).toBeTruthy()
  })

  it('calls onChange when text changes', () => {
    const onChange = vi.fn()
    render(<DestinationInput value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Japan, Maldives' },
    })
    expect(onChange).toHaveBeenCalledWith('Japan, Maldives')
  })

  it('displays the current value', () => {
    const onChange = vi.fn()
    render(<DestinationInput value="Japan" onChange={onChange} />)
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('Japan')
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BalanceInput from '@/components/BalanceInput'

describe('BalanceInput', () => {
  it('renders Chase Ultimate Rewards label', () => {
    render(<BalanceInput balance={0} onChange={vi.fn()} />)
    expect(screen.getByText('Chase Ultimate Rewards')).toBeTruthy()
  })

  it('renders points balance input', () => {
    render(<BalanceInput balance={0} onChange={vi.fn()} />)
    expect(screen.getByPlaceholderText(/75000/i)).toBeTruthy()
  })

  it('displays current balance value', () => {
    render(<BalanceInput balance={75000} onChange={vi.fn()} />)
    const input = screen.getByPlaceholderText(/75000/i) as HTMLInputElement
    expect(input.value).toBe('75000')
  })

  it('calls onChange with numeric value when input changes', () => {
    const onChange = vi.fn()
    render(<BalanceInput balance={0} onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText(/75000/i), {
      target: { value: '50000' },
    })
    expect(onChange).toHaveBeenCalledWith(50000)
  })
})

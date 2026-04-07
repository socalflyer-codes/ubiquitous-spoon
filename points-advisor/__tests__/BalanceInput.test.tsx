import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import BalanceInput from '@/components/BalanceInput'
import type { Balance } from '@/types'

const defaultBalances: Balance[] = [{ program: '', amount: 0 }]

describe('BalanceInput', () => {
  it('renders at least one row', () => {
    const onChange = vi.fn()
    render(<BalanceInput balances={defaultBalances} onChange={onChange} />)
    expect(screen.getByPlaceholderText(/program/i)).toBeTruthy()
  })

  it('calls onChange when program name is updated', () => {
    const onChange = vi.fn()
    render(<BalanceInput balances={defaultBalances} onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText(/program/i), {
      target: { value: 'Aeroplan' },
    })
    expect(onChange).toHaveBeenCalled()
  })

  it('calls onChange when amount is updated', () => {
    const onChange = vi.fn()
    render(<BalanceInput balances={defaultBalances} onChange={onChange} />)
    fireEvent.change(screen.getByPlaceholderText(/points/i), {
      target: { value: '70000' },
    })
    expect(onChange).toHaveBeenCalled()
  })

  it('renders Add another button', () => {
    const onChange = vi.fn()
    render(<BalanceInput balances={defaultBalances} onChange={onChange} />)
    expect(screen.getByText(/add another/i)).toBeTruthy()
  })

  it('calls onChange with additional row when Add another is clicked', () => {
    const onChange = vi.fn()
    render(<BalanceInput balances={defaultBalances} onChange={onChange} />)
    fireEvent.click(screen.getByText(/add another/i))
    const newBalances = onChange.mock.calls[0][0] as Balance[]
    expect(newBalances.length).toBe(2)
  })
})

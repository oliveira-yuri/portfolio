import { describe, expect, it } from 'vitest'
import { formatMonth, formatPeriod, isValidMonth, sortByPeriodDesc } from '@/lib/date'

describe('formatMonth', () => {
  it('formata mês e ano em português', () => {
    expect(formatMonth('2024-02', 'pt')).toBe('fev 2024')
  })

  it('formata mês e ano em inglês', () => {
    expect(formatMonth('2024-02', 'en')).toBe('Feb 2024')
  })

  it('formata dezembro corretamente nos dois idiomas', () => {
    expect(formatMonth('2023-12', 'pt')).toBe('dez 2023')
    expect(formatMonth('2023-12', 'en')).toBe('Dec 2023')
  })
})

describe('formatPeriod', () => {
  it('formata período fechado', () => {
    expect(formatPeriod({ start: '2023-01', end: '2024-06' }, 'pt')).toBe('jan 2023 — jun 2024')
  })

  it('usa o rótulo de "atual" quando não há data final', () => {
    expect(formatPeriod({ start: '2024-03', end: null }, 'pt')).toBe('mar 2024 — atual')
    expect(formatPeriod({ start: '2024-03', end: null }, 'en')).toBe('Mar 2024 — present')
  })
})

describe('sortByPeriodDesc', () => {
  it('ordena do mais recente para o mais antigo', () => {
    const itens = [
      { id: 'antigo', period: { start: '2022-01', end: '2022-12' } },
      { id: 'novo', period: { start: '2025-02', end: null } },
      { id: 'meio', period: { start: '2023-08', end: '2024-01' } },
    ]
    expect(sortByPeriodDesc(itens).map((i) => i.id)).toEqual(['novo', 'meio', 'antigo'])
  })

  it('não muta o array original', () => {
    const itens = [
      { id: 'a', period: { start: '2022-01', end: null } },
      { id: 'b', period: { start: '2024-01', end: null } },
    ]
    sortByPeriodDesc(itens)
    expect(itens.map((i) => i.id)).toEqual(['a', 'b'])
  })
})

describe('isValidMonth', () => {
  it('aceita YYYY-MM', () => {
    expect(isValidMonth('2024-01')).toBe(true)
    expect(isValidMonth('2024-12')).toBe(true)
  })

  it('rejeita formatos inválidos', () => {
    expect(isValidMonth('2024-13')).toBe(false)
    expect(isValidMonth('2024-00')).toBe(false)
    expect(isValidMonth('2024')).toBe(false)
    expect(isValidMonth('01/2024')).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import { htmlLang, isLocale, locales, otherLocale, t } from '@/lib/i18n'

describe('i18n', () => {
  it('expõe exatamente os locales pt e en', () => {
    expect(locales).toEqual(['pt', 'en'])
  })

  it('reconhece locales válidos', () => {
    expect(isLocale('pt')).toBe(true)
    expect(isLocale('en')).toBe(true)
  })

  it('rejeita locale inválido', () => {
    expect(isLocale('es')).toBe(false)
    expect(isLocale('')).toBe(false)
    expect(isLocale('PT')).toBe(false)
  })

  it('escolhe o texto do locale pedido', () => {
    const valor = { pt: 'Olá', en: 'Hello' }
    expect(t(valor, 'pt')).toBe('Olá')
    expect(t(valor, 'en')).toBe('Hello')
  })

  it('devolve o outro locale', () => {
    expect(otherLocale('pt')).toBe('en')
    expect(otherLocale('en')).toBe('pt')
  })

  it('mapeia locale para o atributo lang do documento', () => {
    expect(htmlLang.pt).toBe('pt-BR')
    expect(htmlLang.en).toBe('en')
  })
})

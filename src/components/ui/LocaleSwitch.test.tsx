import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleSwitch } from '@/components/ui/LocaleSwitch'

vi.mock('next/navigation', () => ({ usePathname: () => '/pt' }))

describe('LocaleSwitch', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  it('aponta para a mesma página no outro idioma', () => {
    render(<LocaleSwitch locale="pt" />)

    const link = screen.getByRole('link', { name: 'Ver em inglês (EN)' })
    expect(link).toHaveAttribute('href', '/en')
    expect(link).toHaveAttribute('hreflang', 'en')
    expect(link).toHaveTextContent('EN')
  })

  it('tem nome acessível que contém o texto visível (WCAG 2.5.3)', () => {
    render(<LocaleSwitch locale="pt" />)

    const link = screen.getByRole('link', { name: 'Ver em inglês (EN)' })
    expect(link.textContent).toBeTruthy()
    expect(link).toHaveAccessibleName(new RegExp(link.textContent as string))
  })

  it('preserva a âncora atual ao trocar de idioma', () => {
    window.location.hash = '#projetos'
    render(<LocaleSwitch locale="pt" />)

    expect(screen.getByRole('link', { name: 'Ver em inglês (EN)' })).toHaveAttribute('href', '/en#projetos')
  })
})

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

    const link = screen.getByRole('link', { name: 'Ver em inglês' })
    expect(link).toHaveAttribute('href', '/en')
    expect(link).toHaveAttribute('hreflang', 'en')
    expect(link).toHaveTextContent('EN')
  })

  it('preserva a âncora atual ao trocar de idioma', () => {
    window.location.hash = '#projetos'
    render(<LocaleSwitch locale="pt" />)

    expect(screen.getByRole('link', { name: 'Ver em inglês' })).toHaveAttribute('href', '/en#projetos')
  })
})

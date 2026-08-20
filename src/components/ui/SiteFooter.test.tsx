import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SiteFooter } from '@/components/ui/SiteFooter'

describe('SiteFooter', () => {
  it('declara o vínculo com o instituto em todas as páginas', () => {
    render(<SiteFooter locale="pt" />)

    expect(screen.getByRole('link', { name: /ibe\.IA/ })).toHaveAttribute('href', 'https://ibe.ia.br/')
  })

  it('linka o RSS do idioma corrente', () => {
    render(<SiteFooter locale="en" />)

    expect(screen.getByRole('link', { name: 'RSS' })).toHaveAttribute('href', '/en/index.xml')
  })
})

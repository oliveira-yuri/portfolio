import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SkipLink } from '@/components/ui/SkipLink'

describe('SkipLink', () => {
  it('aponta para o conteúdo principal, no idioma da página', () => {
    render(<SkipLink locale="pt" />)
    const link = screen.getByRole('link', { name: 'Pular para o conteúdo' })
    expect(link).toHaveAttribute('href', '#main')
  })

  it('traduz para inglês', () => {
    render(<SkipLink locale="en" />)
    expect(screen.getByRole('link', { name: 'Skip to content' })).toBeInTheDocument()
  })
})

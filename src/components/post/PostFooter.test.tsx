import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PostFooter } from '@/components/post/PostFooter'
import { postFixture } from '@/test/fixtures'

const [comCta, semCta, deEnsino] = postFixture

describe('PostFooter', () => {
  it('NÃO mostra bloco do instituto quando o post não declara cta', () => {
    render(<PostFooter locale="pt" post={semCta} relacionados={[comCta]} />)

    expect(screen.queryByRole('link', { name: /Formação/ })).not.toBeInTheDocument()
    expect(screen.queryByText(/Divulgação/)).not.toBeInTheDocument()
  })

  it('mostra a formação e a divulgação do vínculo quando o post declara cta', () => {
    render(<PostFooter locale="pt" post={comCta} relacionados={[semCta]} />)

    expect(screen.getByRole('link', { name: /IA para Negócios/ })).toBeInTheDocument()
    expect(screen.getByText(/Divulgação: sou assistente de ensino no ibe\.IA/)).toBeInTheDocument()
  })

  it('marca a URL do instituto com origem, meio e campanha', () => {
    render(<PostFooter locale="pt" post={comCta} relacionados={[]} />)

    const href = screen.getByRole('link', { name: /IA para Negócios/ }).getAttribute('href') ?? ''
    const url = new URL(href)

    expect(url.searchParams.get('utm_source')).toBe('yurioliveira.dev')
    expect(url.searchParams.get('utm_campaign')).toBe('com-cta')
  })

  it('lista os posts relacionados com link', () => {
    render(<PostFooter locale="pt" post={comCta} relacionados={[semCta, deEnsino]} />)

    expect(screen.getByRole('link', { name: 'Post sem CTA' })).toHaveAttribute('href', '/pt/posts/sem-cta')
    expect(screen.getByRole('link', { name: 'Post de ensino' })).toBeInTheDocument()
  })

  it('omite a coluna de relacionados quando não há nenhum', () => {
    render(<PostFooter locale="pt" post={comCta} relacionados={[]} />)

    expect(screen.queryByText('No site')).not.toBeInTheDocument()
  })
})

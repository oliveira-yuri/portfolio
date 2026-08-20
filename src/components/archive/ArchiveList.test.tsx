import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ArchiveList } from '@/components/archive/ArchiveList'
import { postFixture } from '@/test/fixtures'

describe('ArchiveList', () => {
  it('agrupa por ano e mês, do mais recente para o mais antigo', () => {
    render(<ArchiveList locale="pt" posts={postFixture} />)

    const meses = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(meses).toEqual(['2026 — Agosto', '2026 — Julho', '2026 — Junho'])
  })

  it('usa o nome do mês no idioma corrente', () => {
    render(<ArchiveList locale="en" posts={postFixture} />)

    expect(screen.getByRole('heading', { level: 3, name: '2026 — August' })).toBeInTheDocument()
  })

  it('não renderiza nada sem posts', () => {
    const { container } = render(<ArchiveList locale="pt" posts={[]} />)

    expect(container).toBeEmptyDOMElement()
  })
})

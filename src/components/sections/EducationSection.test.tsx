import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EducationSection } from '@/components/sections/EducationSection'
import { educationFixture } from '@/test/fixtures'

describe('EducationSection', () => {
  it('mostra curso, instituição, período e status', () => {
    render(<EducationSection locale="pt" education={educationFixture} />)

    expect(screen.getByRole('region', { name: 'Formação' })).toBeInTheDocument()
    expect(screen.getByText('Sistemas de Informação')).toBeInTheDocument()
    expect(screen.getByText('Instituto Exemplo')).toBeInTheDocument()
    expect(screen.getByText('fev 2024 — dez 2027')).toBeInTheDocument()
    expect(screen.getByText('Em andamento')).toBeInTheDocument()
  })

  it('não trata mais de certificados', () => {
    render(<EducationSection locale="pt" education={educationFixture} />)

    expect(screen.queryByText('Certificados')).not.toBeInTheDocument()
  })

  it('traduz o conteúdo', () => {
    render(<EducationSection locale="en" education={educationFixture} />)

    expect(screen.getByRole('region', { name: 'Education' })).toBeInTheDocument()
    expect(screen.getByText('Information Systems')).toBeInTheDocument()
  })
})

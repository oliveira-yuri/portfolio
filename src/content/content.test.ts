import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { certificates, education } from '@/content/education'
import { experiences } from '@/content/experience'
import { profile } from '@/content/profile'
import { projects } from '@/content/projects'
import { skillGroups } from '@/content/skills'
import { ui } from '@/content/ui'
import { isValidMonth } from '@/lib/date'
import type { Localized } from '@/lib/i18n'

/** Percorre qualquer estrutura e devolve todo objeto Localized encontrado, com seu caminho. */
function collectLocalized(value: unknown, path = 'root'): Array<{ path: string; value: Localized }> {
  if (value === null || typeof value !== 'object') return []
  const record = value as Record<string, unknown>
  if (typeof record.pt === 'string' && typeof record.en === 'string' && Object.keys(record).length === 2) {
    return [{ path, value: record as Localized }]
  }
  return Object.entries(record).flatMap(([key, child]) => collectLocalized(child, `${path}.${key}`))
}

const allContent = { profile, experiences, projects, skillGroups, education, certificates, ui }
const localizedValues = collectLocalized(allContent)

const publicFile = (path: string) => join(process.cwd(), 'public', path.replace(/^\//, ''))

describe('textos bilíngues', () => {
  it('encontra textos bilíngues para verificar', () => {
    expect(localizedValues.length).toBeGreaterThan(20)
  })

  it('nenhum texto está vazio em nenhum idioma', () => {
    const vazios = localizedValues.filter((v) => v.value.pt.trim() === '' || v.value.en.trim() === '')
    expect(vazios.map((v) => v.path)).toEqual([])
  })
})

describe('projetos', () => {
  it('tem slugs únicos', () => {
    const slugs = projects.map((p) => p.slug)
    const duplicados = slugs.filter((valor, indice) => slugs.indexOf(valor) !== indice)
    expect(duplicados).toEqual([])
  })

  it('todo projeto tem ao menos um link', () => {
    const semLink = projects.filter((p) => !p.links.repo && !p.links.demo)
    expect(semLink.map((p) => p.slug)).toEqual([])
  })

  it('toda imagem de projeto existe em public/', () => {
    const faltando = projects.filter((p) => p.image && !existsSync(publicFile(p.image.src)))
    expect(faltando.map((p) => p.slug)).toEqual([])
  })
})

describe('períodos', () => {
  const comPeriodo = [
    ...experiences.map((e) => ({ id: e.id, period: e.period })),
    ...projects.map((p) => ({ id: p.slug, period: p.period })),
    { id: 'education', period: education.period },
  ]

  it('usa o formato YYYY-MM', () => {
    const invalidos = comPeriodo.filter(
      (i) => !isValidMonth(i.period.start) || (i.period.end !== null && !isValidMonth(i.period.end)),
    )
    expect(invalidos.map((i) => i.id)).toEqual([])
  })

  it('tem início anterior ao fim', () => {
    const incoerentes = comPeriodo.filter((i) => i.period.end !== null && i.period.start > i.period.end)
    expect(incoerentes.map((i) => i.id)).toEqual([])
  })

  it('usa YYYY-MM nas datas de certificado', () => {
    const invalidos = certificates.filter((c) => !isValidMonth(c.date))
    expect(invalidos.map((c) => c.id)).toEqual([])
  })
})

describe('certificados', () => {
  it('tem ids únicos', () => {
    const ids = certificates.map((c) => c.id)
    const duplicados = ids.filter((valor, indice) => ids.indexOf(valor) !== indice)
    expect(duplicados).toEqual([])
  })

  it('usa https ou caminho absoluto do site nos links de verificação', () => {
    const invalidos = certificates.filter(
      (c) => c.credentialUrl && !c.credentialUrl.startsWith('https://') && !c.credentialUrl.startsWith('/'),
    )
    expect(invalidos.map((c) => c.id)).toEqual([])
  })
})

describe('experiências', () => {
  it('tem ids únicos', () => {
    const ids = experiences.map((e) => e.id)
    const duplicados = ids.filter((valor, indice) => ids.indexOf(valor) !== indice)
    expect(duplicados).toEqual([])
  })

  it('tem de 1 a 3 bullets de impacto', () => {
    const foraDoLimite = experiences.filter((e) => e.highlights.length < 1 || e.highlights.length > 3)
    expect(foraDoLimite.map((e) => e.id)).toEqual([])
  })

  it('não repete a mesma tecnologia dentro de uma experiência', () => {
    const duplicados = experiences.flatMap((e) => {
      const tech = e.tech ?? []
      const repetidas = tech.filter((valor, indice) => tech.indexOf(valor) !== indice)
      return repetidas.map((tecnologia) => `${e.id}: ${tecnologia}`)
    })
    expect(duplicados).toEqual([])
  })
})

describe('perfil', () => {
  it('serve os dois currículos e os arquivos existem', () => {
    expect(existsSync(publicFile(profile.cv.pt))).toBe(true)
    expect(existsSync(publicFile(profile.cv.en))).toBe(true)
  })

  it('tem links externos absolutos', () => {
    expect(profile.links.github).toMatch(/^https:\/\//)
    expect(profile.links.linkedin).toMatch(/^(https:\/\/|PENDENTE)/)
  })

  it('tem ao menos dois parágrafos de bio', () => {
    expect(profile.bio.length).toBeGreaterThanOrEqual(2)
  })
})

describe('habilidades', () => {
  it('cobre os três níveis, sem repetir nível', () => {
    expect(skillGroups.map((g) => g.level)).toEqual(['core', 'used', 'learning'])
  })

  it('não repete a mesma tecnologia em dois níveis', () => {
    const todos = skillGroups.flatMap((g) => g.items)
    const duplicados = todos.filter((valor, indice) => todos.indexOf(valor) !== indice)
    expect(duplicados).toEqual([])
  })
})

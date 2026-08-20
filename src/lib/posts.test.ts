import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import matter from 'gray-matter'
import { describe, expect, it } from 'vitest'
import { agruparPorMes, lerPosts, parLinguistico, postsDoLocale } from '@/lib/posts'

const FIXTURES = 'src/test/posts-fixtures'

/** Escreve um único arquivo num diretório temporário, para testar rejeição. */
function comArquivo(nome: string, conteudo: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'posts-'))
  writeFileSync(join(dir, nome), conteudo)
  return dir
}

const FRONTMATTER_OK = `---
titulo: Título
resumo: Resumo curto.
pilar: ensino
tags: [ia]
---

Corpo.`

describe('lerPosts', () => {
  it('lê os posts da pasta e ordena por data decrescente', () => {
    const posts = lerPosts(FIXTURES)

    expect(posts.map((p) => p.data)).toEqual(['2026-04-02', '2026-03-10', '2026-02-20', '2026-01-15'])
  })

  it('extrai data, slug e idioma do nome do arquivo', () => {
    const post = lerPosts(FIXTURES).find((p) => p.slug === 'so-em-portugues')

    expect(post).toMatchObject({ data: '2026-02-20', slug: 'so-em-portugues', locale: 'pt' })
  })

  it('aplica os padrões de destaque e cta quando ausentes', () => {
    const post = lerPosts(FIXTURES).find((p) => p.slug === 'so-em-portugues')

    expect(post?.destaque).toBe(false)
    expect(post?.cta).toBeUndefined()
  })

  it('lê destaque e cta quando declarados', () => {
    const post = lerPosts(FIXTURES).find((p) => p.slug === 'exemplo-completo')

    expect(post?.destaque).toBe(true)
    expect(post?.cta).toBe('ia-para-negocios')
  })

  it('separa o corpo do frontmatter', () => {
    const post = lerPosts(FIXTURES).find((p) => p.slug === 'so-em-portugues')

    expect(post?.corpo.trim()).toBe('Corpo curto.')
    expect(post?.corpo).not.toContain('titulo:')
  })

  it('rejeita nome de arquivo fora do padrão', () => {
    const dir = comArquivo('sem-data.pt.mdx', FRONTMATTER_OK)

    expect(() => lerPosts(dir)).toThrow(/sem-data\.pt\.mdx/)
  })

  it('rejeita idioma desconhecido no nome do arquivo', () => {
    const dir = comArquivo('2026-01-01-texto.fr.mdx', FRONTMATTER_OK)

    expect(() => lerPosts(dir)).toThrow(/fr/)
  })

  it('rejeita slug com maiúscula ou acento', () => {
    const dir = comArquivo('2026-01-01-Título.pt.mdx', FRONTMATTER_OK)

    expect(() => lerPosts(dir)).toThrow(/slug/i)
  })

  it('rejeita pilar inexistente', () => {
    const dir = comArquivo('2026-01-01-texto.pt.mdx', FRONTMATTER_OK.replace('ensino', 'financas'))

    expect(() => lerPosts(dir)).toThrow(/financas/)
  })

  it('rejeita tag fora do padrão kebab-case', () => {
    const dir = comArquivo('2026-01-01-texto.pt.mdx', FRONTMATTER_OK.replace('[ia]', '[Machine Learning]'))

    expect(() => lerPosts(dir)).toThrow(/tag/i)
  })

  it('rejeita post sem nenhuma tag', () => {
    const dir = comArquivo('2026-01-01-texto.pt.mdx', FRONTMATTER_OK.replace('[ia]', '[]'))

    expect(() => lerPosts(dir)).toThrow(/tag/i)
  })

  it('rejeita resumo acima de 200 caracteres', () => {
    const longo = 'a'.repeat(201)
    const dir = comArquivo('2026-01-01-texto.pt.mdx', FRONTMATTER_OK.replace('Resumo curto.', longo))

    expect(() => lerPosts(dir)).toThrow(/resumo/i)
  })

  it('rejeita título vazio', () => {
    const dir = comArquivo('2026-01-01-texto.pt.mdx', FRONTMATTER_OK.replace('Título', ''))

    expect(() => lerPosts(dir)).toThrow(/titulo/i)
  })

  it('rejeita resumo com caractere de controle (inválido em XML, mesmo escapado)', () => {
    const dir = comArquivo('2026-01-01-texto.pt.mdx', FRONTMATTER_OK.replace('Resumo curto.', 'Resumo com \x01 controle.'))

    expect(() => lerPosts(dir)).toThrow(/resumo/i)
  })

  it('rejeita cta que não é uma formação conhecida', () => {
    const dir = comArquivo('2026-01-01-texto.pt.mdx', `${FRONTMATTER_OK.replace('tags: [ia]', 'tags: [ia]\ncta: curso-inexistente')}`)

    expect(() => lerPosts(dir)).toThrow(/curso-inexistente/)
  })

  describe('atualizado', () => {
    it('não define atualizado quando o frontmatter não declara', () => {
      const dir = comArquivo('2026-01-01-texto.pt.mdx', FRONTMATTER_OK)

      expect(lerPosts(dir)[0].atualizado).toBeUndefined()
    })

    it('aceita atualizado como string "YYYY-MM-DD" entre aspas', () => {
      const dir = comArquivo(
        '2026-01-01-texto.pt.mdx',
        FRONTMATTER_OK.replace('tags: [ia]', 'tags: [ia]\natualizado: "2026-08-19"'),
      )

      expect(lerPosts(dir)[0].atualizado).toBe('2026-08-19')
    })

    it('aceita atualizado como data YAML sem aspas — o exemplo da própria spec — e normaliza para "YYYY-MM-DD"', () => {
      const dir = comArquivo(
        '2026-01-01-texto.pt.mdx',
        FRONTMATTER_OK.replace('tags: [ia]', 'tags: [ia]\natualizado: 2026-08-19'),
      )

      // Confirma que o gray-matter de fato produz um objeto Date para uma
      // data YAML sem aspas (e não uma string) — se essa premissa mudasse
      // numa atualização do gray-matter, o teste acima falharia por um
      // motivo diferente do que ele diz testar.
      const bruto = matter(FRONTMATTER_OK.replace('tags: [ia]', 'tags: [ia]\natualizado: 2026-08-19'))
      expect(bruto.data.atualizado).toBeInstanceOf(Date)

      expect(lerPosts(dir)[0].atualizado).toBe('2026-08-19')
    })

    it('rejeita atualizado em formato inválido, com o arquivo nomeado no erro', () => {
      const dir = comArquivo(
        '2026-01-01-texto.pt.mdx',
        FRONTMATTER_OK.replace('tags: [ia]', 'tags: [ia]\natualizado: 19/08/2026'),
      )

      expect(() => lerPosts(dir)).toThrow(/2026-01-01-texto\.pt\.mdx/)
      expect(() => lerPosts(dir)).toThrow(/atualizado/)
    })
  })
})

describe('postsDoLocale', () => {
  it('devolve só os posts do idioma pedido', () => {
    const posts = lerPosts(FIXTURES)

    expect(postsDoLocale(posts, 'en').map((p) => p.slug)).toEqual(['texto-bilingue'])
  })

  it('não vaza post que existe só em português para a listagem em inglês', () => {
    const posts = lerPosts(FIXTURES)

    expect(postsDoLocale(posts, 'en').map((p) => p.slug)).not.toContain('so-em-portugues')
  })
})

describe('agruparPorMes', () => {
  it('agrupa por ano e mês, do mais recente para o mais antigo', () => {
    const grupos = agruparPorMes(postsDoLocale(lerPosts(FIXTURES), 'pt'))

    expect(grupos.map((g) => [g.ano, g.mes])).toEqual([
      [2026, 3],
      [2026, 2],
      [2026, 1],
    ])
  })

  it('mantém os posts de um mesmo mês juntos', () => {
    const posts = postsDoLocale(lerPosts(FIXTURES), 'pt')
    const total = agruparPorMes(posts).reduce((soma, g) => soma + g.posts.length, 0)

    expect(total).toBe(posts.length)
  })
})

describe('parLinguistico', () => {
  it('emparelha pt e en pelo slug, mesmo com datas diferentes', () => {
    const par = parLinguistico(lerPosts(FIXTURES), 'texto-bilingue')

    expect(par.pt?.data).toBe('2026-03-10')
    expect(par.en?.data).toBe('2026-04-02')
  })

  it('devolve só o idioma existente quando não há tradução', () => {
    const par = parLinguistico(lerPosts(FIXTURES), 'so-em-portugues')

    expect(par.pt).toBeDefined()
    expect(par.en).toBeUndefined()
  })
})

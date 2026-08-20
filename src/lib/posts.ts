import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'
import { type Locale, isLocale } from '@/lib/i18n'

export type Pilar = 'academico' | 'ensino' | 'projetos'
export const pilares = ['academico', 'ensino', 'projetos'] as const satisfies readonly Pilar[]

export type FormacaoId = 'vibe-coding' | 'agentes-ia' | 'ia-para-negocios'
const formacaoIds = ['vibe-coding', 'agentes-ia', 'ia-para-negocios'] as const satisfies readonly FormacaoId[]

export type Post = {
  slug: string
  locale: Locale
  /** 'YYYY-MM-DD', vindo do nome do arquivo. Fonte única de verdade. */
  data: string
  titulo: string
  resumo: string
  pilar: Pilar
  tags: string[]
  destaque: boolean
  cta?: FormacaoId
  /** 'YYYY-MM-DD', opcional. */
  atualizado?: string
  /** MDX cru, sem frontmatter. */
  corpo: string
}

const NOME = /^(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)\.([a-z]{2})\.mdx$/
const TAG = /^[a-z0-9-]+$/
const DIRETORIO_PADRAO = 'src/content/posts'
const LIMITE_RESUMO = 200
/** Controle fora de tab/LF/CR: ilegal em XML 1.0 mesmo como entidade numérica (ver src/lib/feed.ts). */
const CARACTERE_DE_CONTROLE = /[\x00-\x08\x0B\x0C\x0E-\x1F]/

function erro(arquivo: string, motivo: string): never {
  throw new Error(`Post inválido em "${arquivo}": ${motivo}`)
}

function texto(valor: unknown, campo: string, arquivo: string): string {
  if (typeof valor !== 'string' || valor.trim() === '') erro(arquivo, `${campo} é obrigatório e não pode ser vazio`)
  if (CARACTERE_DE_CONTROLE.test(valor)) {
    erro(arquivo, `${campo} contém caractere de controle inválido (não permitido em XML)`)
  }
  return valor.trim()
}

function nomeDoArquivo(arquivo: string): { data: string; slug: string; locale: Locale } {
  const casou = NOME.exec(arquivo)
  if (!casou) {
    erro(arquivo, 'o nome deve seguir "YYYY-MM-DD-<slug>.<locale>.mdx", com slug em minúsculas, dígitos e hífens')
  }
  const [, data, slug, locale] = casou
  if (!isLocale(locale)) erro(arquivo, `idioma "${locale}" não existe; use ${['pt', 'en'].join(' ou ')}`)
  return { data, slug, locale }
}

function frontmatter(dados: Record<string, unknown>, arquivo: string) {
  const titulo = texto(dados.titulo, 'titulo', arquivo)
  const resumo = texto(dados.resumo, 'resumo', arquivo)
  if (resumo.length > LIMITE_RESUMO) {
    erro(arquivo, `resumo tem ${resumo.length} caracteres e o limite é ${LIMITE_RESUMO}`)
  }

  const pilar = texto(dados.pilar, 'pilar', arquivo)
  if (!(pilares as readonly string[]).includes(pilar)) {
    erro(arquivo, `pilar "${pilar}" não existe; use ${pilares.join(', ')}`)
  }

  const tags = dados.tags
  if (!Array.isArray(tags) || tags.length === 0) erro(arquivo, 'é preciso ao menos uma tag')
  for (const tag of tags) {
    if (typeof tag !== 'string' || !TAG.test(tag)) {
      erro(arquivo, `tag ${JSON.stringify(tag)} deve ser kebab-case: minúsculas, dígitos e hífens`)
    }
  }

  const cta = dados.cta
  if (cta !== undefined && !(formacaoIds as readonly unknown[]).includes(cta)) {
    erro(arquivo, `cta "${String(cta)}" não é uma formação conhecida; use ${formacaoIds.join(', ')}`)
  }

  return {
    titulo,
    resumo,
    pilar: pilar as Pilar,
    tags: tags as string[],
    destaque: dados.destaque === true,
    cta: cta as FormacaoId | undefined,
    atualizado: typeof dados.atualizado === 'string' ? dados.atualizado : undefined,
  }
}

/** Lê, valida e ordena por data decrescente. Frontmatter inválido lança. */
export function lerPosts(dir: string = DIRETORIO_PADRAO): Post[] {
  return readdirSync(dir)
    .filter((arquivo) => arquivo.endsWith('.mdx'))
    .map((arquivo) => {
      const { data, slug, locale } = nomeDoArquivo(arquivo)
      const { data: dados, content } = matter(readFileSync(join(dir, arquivo), 'utf8'))
      return { slug, locale, data, corpo: content, ...frontmatter(dados, arquivo) }
    })
    .sort((a, b) => b.data.localeCompare(a.data))
}

export function postsDoLocale(posts: Post[], locale: Locale): Post[] {
  return posts.filter((post) => post.locale === locale)
}

export function agruparPorMes(posts: Post[]): { ano: number; mes: number; posts: Post[] }[] {
  const grupos: { ano: number; mes: number; posts: Post[] }[] = []

  for (const post of posts) {
    const ano = Number(post.data.slice(0, 4))
    const mes = Number(post.data.slice(5, 7))
    const ultimo = grupos.at(-1)
    if (ultimo?.ano === ano && ultimo.mes === mes) ultimo.posts.push(post)
    else grupos.push({ ano, mes, posts: [post] })
  }

  return grupos
}

export function parLinguistico(posts: Post[], slug: string): { pt?: Post; en?: Post } {
  const doSlug = posts.filter((post) => post.slug === slug)
  return {
    pt: doSlug.find((post) => post.locale === 'pt'),
    en: doSlug.find((post) => post.locale === 'en'),
  }
}

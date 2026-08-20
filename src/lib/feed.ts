import { profile } from '@/content/profile'
import { type Locale, htmlLang, t } from '@/lib/i18n'
import type { Post } from '@/lib/posts'
import { absoluteUrl } from '@/lib/site'

/**
 * Escapa o que quebra XML e converte não-ASCII em entidade numérica.
 *
 * `src/lib/posts.ts` já rejeita caractere de controle no frontmatter, mas
 * esta função não confia nisso: removê-los aqui de novo, antes de virarem
 * entidade numérica, garante que o feed nunca saia inválido mesmo que uma
 * validação futura deixe passar algo. Tab/LF/CR (\x09, \x0A, \x0D) são
 * preservados — são os únicos caracteres de controle legais em XML 1.0,
 * inclusive como referência numérica.
 */
function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/[^\x20-\x7E]/g, (caractere) => `&#${caractere.codePointAt(0)};`)
}

function item(post: Post, locale: Locale): string {
  const link = absoluteUrl(`/${locale}/posts/${post.slug}`)
  const data = new Date(`${post.data}T12:00:00Z`).toUTCString()

  return [
    '<item>',
    `<title>${escapar(post.titulo)}</title>`,
    `<link>${escapar(link)}</link>`,
    `<guid isPermaLink="true">${escapar(link)}</guid>`,
    `<pubDate>${data}</pubDate>`,
    `<description>${escapar(post.resumo)}</description>`,
    ...post.tags.map((tag) => `<category>${escapar(tag)}</category>`),
    '</item>',
  ].join('')
}

export function montarFeed(posts: Post[], locale: Locale): string {
  const titulo = `${profile.name} — Newsletter`

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    `<title>${escapar(titulo)}</title>`,
    `<link>${escapar(absoluteUrl(`/${locale}`))}</link>`,
    `<description>${escapar(t(profile.headline, locale))}</description>`,
    `<language>${htmlLang[locale]}</language>`,
    `<atom:link href="${escapar(absoluteUrl(`/${locale}/index.xml`))}" rel="self" type="application/rss+xml"/>`,
    ...posts.map((post) => item(post, locale)),
    '</channel>',
    '</rss>',
  ].join('')
}

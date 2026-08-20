import { type Formacao, formacoes } from '@/content/formacoes'
import type { Post } from '@/lib/posts'

const ORIGEM = 'yurioliveira.dev'
const MEIO = 'post'

export function urlComUtm(base: string, campanha: string): string {
  const url = new URL(base)
  url.searchParams.set('utm_source', ORIGEM)
  url.searchParams.set('utm_medium', MEIO)
  url.searchParams.set('utm_campaign', campanha)
  return url.toString()
}

/** Só devolve algo se o post declarou `cta`. Nunca é automático. */
export function ctaDoPost(post: Post): { formacao: Formacao; url: string } | null {
  if (!post.cta) return null
  const formacao = formacoes[post.cta]
  return { formacao, url: urlComUtm(formacao.url, post.slug) }
}

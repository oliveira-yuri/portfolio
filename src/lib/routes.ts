import type { Locale } from '@/lib/i18n'
import type { Pilar } from '@/lib/posts'

/**
 * Único segmento de rota que difere entre idiomas. `posts`, `tags` e
 * `portfolio` se escrevem igual em pt e en, então não entram aqui.
 * A pasta real no App Router é `pilares`; `/en/pillars/...` chega por rewrite.
 */
export const segmentoPilares: Record<Locale, string> = { pt: 'pilares', en: 'pillars' }

export function caminhoPilar(locale: Locale, pilar: Pilar): string {
  return `/${locale}/${segmentoPilares[locale]}/${pilar}`
}

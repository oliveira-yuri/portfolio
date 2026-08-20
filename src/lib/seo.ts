import type { Metadata } from 'next'
import { education } from '@/content/education'
import { profile } from '@/content/profile'
import { skillGroups } from '@/content/skills'
import { type Locale, htmlLang, t } from '@/lib/i18n'
import { absoluteUrl, siteUrl } from '@/lib/site'

export function personJsonLd(locale: Locale): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    description: t(profile.headline, locale),
    url: absoluteUrl(`/${locale}`),
    email: `mailto:${profile.links.email}`,
    sameAs: [profile.links.github, profile.links.linkedin],
    knowsAbout: skillGroups.flatMap((group) => group.items),
    alumniOf: { '@type': 'EducationalOrganization', name: education.institution },
  }
}

/**
 * `path` é o caminho completo (com locale) da página, ex.: `/pt/tags`.
 * Sem ele, o comportamento é o da home: canonical `/${locale}` e hreflang
 * ligando as duas homes, com x-default em pt — o mesmo de antes desta opção
 * existir (ver teste que fixa esse caso).
 *
 * `languages` é a saída completa de `alternates.languages`; quando omitido,
 * é derivado de `path` trocando o prefixo `/${locale}` por `/pt` e `/en` —
 * válido só quando o segmento da URL é igual nos dois idiomas (tags,
 * tags/[tag], portfolio). A rota de pilar NÃO pode usar essa derivação: o
 * segmento traduz (`pilares`/`pillars`, ver `src/lib/routes.ts`), então o
 * chamador passa `languages` explícito, calculado com `caminhoPilar`.
 */
export function metadataFor(locale: Locale, opts?: { path?: string; title?: string; languages?: Record<string, string> }): Metadata {
  const path = opts?.path ?? `/${locale}`
  const title = opts?.title ?? `${profile.name} — ${t(profile.headline, locale)}`
  const description = t(profile.headline, locale)
  const languages =
    opts?.languages ??
    {
      [htmlLang.pt]: path.replace(new RegExp(`^/${locale}`), '/pt'),
      [htmlLang.en]: path.replace(new RegExp(`^/${locale}`), '/en'),
      'x-default': path.replace(new RegExp(`^/${locale}`), '/pt'),
    }

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: { canonical: path, languages },
    openGraph: {
      type: 'profile',
      title,
      description,
      url: absoluteUrl(path),
      locale: locale === 'pt' ? 'pt_BR' : 'en_US',
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

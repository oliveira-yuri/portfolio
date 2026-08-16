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

export function metadataFor(locale: Locale): Metadata {
  const title = `${profile.name} — ${t(profile.headline, locale)}`

  return {
    metadataBase: new URL(siteUrl),
    title,
    description: t(profile.headline, locale),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        [htmlLang.pt]: '/pt',
        [htmlLang.en]: '/en',
        'x-default': '/pt',
      },
    },
    openGraph: {
      type: 'profile',
      title,
      description: t(profile.headline, locale),
      url: absoluteUrl(`/${locale}`),
      locale: locale === 'pt' ? 'pt_BR' : 'en_US',
    },
    twitter: { card: 'summary_large_image', title, description: t(profile.headline, locale) },
  }
}

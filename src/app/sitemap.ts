import type { MetadataRoute } from 'next'
import { htmlLang, locales } from '@/lib/i18n'
import { siteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    [htmlLang.pt]: `${siteUrl}/pt`,
    [htmlLang.en]: `${siteUrl}/en`,
  }

  return locales.map((locale) => ({
    url: `${siteUrl}/${locale}`,
    changeFrequency: 'monthly' as const,
    priority: locale === 'pt' ? 1 : 0.8,
    alternates: { languages },
  }))
}

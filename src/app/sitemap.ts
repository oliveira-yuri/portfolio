import type { MetadataRoute } from 'next'
import { htmlLang, locales } from '@/lib/i18n'
import { absoluteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    [htmlLang.pt]: absoluteUrl('/pt'),
    [htmlLang.en]: absoluteUrl('/en'),
  }

  return locales.map((locale) => ({
    url: absoluteUrl(`/${locale}`),
    changeFrequency: 'monthly' as const,
    priority: locale === 'pt' ? 1 : 0.8,
    alternates: { languages },
  }))
}

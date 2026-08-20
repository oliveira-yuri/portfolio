import type { MetadataRoute } from 'next'
import { htmlLang, locales } from '@/lib/i18n'
import { lerPosts, pilares, postsDoLocale } from '@/lib/posts'
import { caminhoPilar } from '@/lib/routes'
import { absoluteUrl } from '@/lib/site'
import { contarTags } from '@/lib/tags'

export default function sitemap(): MetadataRoute.Sitemap {
  const todos = lerPosts()

  const homes = locales.map((locale) => ({
    url: absoluteUrl(`/${locale}`),
    changeFrequency: 'weekly' as const,
    priority: locale === 'pt' ? 1 : 0.8,
    alternates: {
      languages: {
        [htmlLang.pt]: absoluteUrl('/pt'),
        [htmlLang.en]: absoluteUrl('/en'),
      },
    },
  }))

  const resto = locales.flatMap((locale) => {
    const doLocale = postsDoLocale(todos, locale)

    return [
      { url: absoluteUrl(`/${locale}/portfolio`), changeFrequency: 'monthly' as const, priority: 0.7 },
      { url: absoluteUrl(`/${locale}/tags`), changeFrequency: 'weekly' as const, priority: 0.4 },
      ...pilares.map((pilar) => ({
        url: absoluteUrl(caminhoPilar(locale, pilar)),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      })),
      ...contarTags(doLocale).map(({ tag }) => ({
        url: absoluteUrl(`/${locale}/tags/${tag}`),
        changeFrequency: 'weekly' as const,
        priority: 0.4,
      })),
      ...doLocale.map((post) => ({
        url: absoluteUrl(`/${locale}/posts/${post.slug}`),
        lastModified: post.atualizado ?? post.data,
        changeFrequency: 'yearly' as const,
        priority: 0.9,
      })),
    ]
  })

  return [...homes, ...resto]
}

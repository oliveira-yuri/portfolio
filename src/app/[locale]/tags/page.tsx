import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { TopBar } from '@/components/ui/TopBar'
import { ui } from '@/content/ui'
import { isLocale, locales, t } from '@/lib/i18n'
import { lerPosts, postsDoLocale } from '@/lib/posts'
import { contarTags } from '@/lib/tags'

export const dynamicParams = false

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function TagsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const tags = contarTags(postsDoLocale(lerPosts(), locale))

  return (
    <div className="mx-auto w-full max-w-[68rem] px-6 md:px-10">
      <TopBar locale={locale} />
      <main id="main" className="pb-16">
        <h1 className="font-serif text-3xl text-ink">{t(ui.newsletter.verTodas, locale)}</h1>
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-sm">
          {tags.map(({ tag, total }) => (
            <li key={tag}>
              <Link href={`/${locale}/tags/${tag}`} className="text-accent">
                #{tag}
              </Link>{' '}
              <span className="text-muted tabular-nums">{total}</span>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter locale={locale} />
    </div>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArchiveList } from '@/components/archive/ArchiveList'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { TopBar } from '@/components/ui/TopBar'
import { profile } from '@/content/profile'
import { ui } from '@/content/ui'
import { isLocale, locales, t } from '@/lib/i18n'
import { lerPosts, postsDoLocale } from '@/lib/posts'
import { metadataFor } from '@/lib/seo'
import { contarTags } from '@/lib/tags'

export const dynamicParams = false

export function generateStaticParams() {
  const posts = lerPosts()
  return locales.flatMap((locale) =>
    contarTags(postsDoLocale(posts, locale)).map(({ tag }) => ({ locale, tag })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tag: string }>
}): Promise<Metadata> {
  const { locale, tag } = await params
  if (!isLocale(locale)) return {}

  const existe = postsDoLocale(lerPosts(), locale).some((post) => post.tags.includes(tag))
  if (!existe) return {}

  return metadataFor(locale, { path: `/${locale}/tags/${tag}`, title: `#${tag} — ${profile.name}` })
}

export default async function TagPage({ params }: { params: Promise<{ locale: string; tag: string }> }) {
  const { locale, tag } = await params
  if (!isLocale(locale)) notFound()

  const posts = postsDoLocale(lerPosts(), locale).filter((post) => post.tags.includes(tag))
  if (posts.length === 0) notFound()

  return (
    <div className="mx-auto w-full max-w-[68rem] px-6 md:px-10">
      <TopBar locale={locale} />
      <main id="main" className="pb-16">
        <h1 className="font-dado text-2xl text-verde">#{tag}</h1>
        {/* ArchiveList emite <h3> por mês — precisa de uma seção com <h2> aqui
            embaixo do <h1>, senão pula um nível (WCAG 1.3.1). Mesmo padrão de
            src/app/[locale]/page.tsx. */}
        <section className="mt-8" aria-labelledby="arquivo">
          <h2 id="arquivo" className="font-dado text-xs uppercase tracking-widest text-suave">
            {t(ui.newsletter.arquivo, locale)}
          </h2>
          <ArchiveList locale={locale} posts={posts} />
        </section>
      </main>
      <SiteFooter locale={locale} />
    </div>
  )
}

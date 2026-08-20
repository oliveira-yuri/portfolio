import { notFound } from 'next/navigation'
import { ArchiveList } from '@/components/archive/ArchiveList'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { TopBar } from '@/components/ui/TopBar'
import { isLocale, locales } from '@/lib/i18n'
import { lerPosts, postsDoLocale } from '@/lib/posts'
import { contarTags } from '@/lib/tags'

export const dynamicParams = false

export function generateStaticParams() {
  const posts = lerPosts()
  return locales.flatMap((locale) =>
    contarTags(postsDoLocale(posts, locale)).map(({ tag }) => ({ locale, tag })),
  )
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
        <h1 className="font-dado text-2xl text-frio">#{tag}</h1>
        <ArchiveList locale={locale} posts={posts} />
      </main>
      <SiteFooter locale={locale} />
    </div>
  )
}

import { notFound } from 'next/navigation'
import { ArchiveList } from '@/components/archive/ArchiveList'
import { TopBar } from '@/components/ui/TopBar'
import { descricaoPilar } from '@/content/pilares'
import { isLocale, locales, t } from '@/lib/i18n'
import { lerPosts, pilares, postsDoLocale, type Pilar } from '@/lib/posts'

export const dynamicParams = false

export function generateStaticParams() {
  return locales.flatMap((locale) => pilares.map((pilar) => ({ locale, pilar })))
}

export default async function PilarPage({ params }: { params: Promise<{ locale: string; pilar: string }> }) {
  const { locale, pilar } = await params
  if (!isLocale(locale) || !(pilares as readonly string[]).includes(pilar)) notFound()

  const { nome, descricao } = descricaoPilar[pilar as Pilar]
  const posts = postsDoLocale(lerPosts(), locale).filter((post) => post.pilar === pilar)

  return (
    <div className="mx-auto w-full max-w-[68rem] px-6 md:px-10">
      <TopBar locale={locale} />
      <main id="main" className="pb-16">
        <h1 className="font-serif text-3xl text-ink">{t(nome, locale)}</h1>
        <p className="mt-2 max-w-2xl text-muted">{t(descricao, locale)}</p>
        <ArchiveList locale={locale} posts={posts} />
      </main>
    </div>
  )
}

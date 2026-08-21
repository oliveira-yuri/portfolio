import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArchiveList } from '@/components/archive/ArchiveList'
import { LegendaDaEscala } from '@/components/archive/LegendaDaEscala'
import { PostRow } from '@/components/archive/PostRow'
import { StatRail } from '@/components/archive/StatRail'
import { ContactLinks } from '@/components/sections/ContactLinks'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { TopBar } from '@/components/ui/TopBar'
import { profile } from '@/content/profile'
import { ui } from '@/content/ui'
import { isLocale, t } from '@/lib/i18n'
import { lerPosts, postsDoLocale } from '@/lib/posts'

export default async function NewsletterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const posts = postsDoLocale(lerPosts(), locale)
  const destaques = posts.filter((post) => post.destaque)

  return (
    <div className="mx-auto w-full max-w-[68rem] px-6 md:px-10">
      <TopBar locale={locale} />
      <main id="main" className="pb-16">
        <h1 className="font-display text-4xl text-tinta md:text-5xl">{profile.name}</h1>
        <p className="mt-3 max-w-2xl text-suave">{t(profile.headline, locale)}</p>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-dado text-xs text-verde">
          <ContactLinks locale={locale} profile={profile} order={['cv', 'github', 'linkedin']} />
          <li>
            <Link href={`/${locale}/portfolio`} className="border-b border-verde/40">
              {t(ui.nav.portfolio, locale)}
            </Link>
          </li>
        </ul>
        {/* EixoDoTempo (arquivo em src/components/archive/EixoDoTempo.tsx) foi
            retirado daqui de propósito: com só três textos publicados, o
            gráfico plota um traço solitário que anuncia "site novo" em vez
            de mostrar cadência real. O componente e seus testes continuam
            existindo — volta a aparecer aqui quando houver histórico
            suficiente para o gráfico valer a pena. */}
        <div className="mt-8">
          <LegendaDaEscala locale={locale} posts={posts} />
          <StatRail locale={locale} posts={posts} />
        </div>

        {destaques.length > 0 ? (
          <section className="mt-12 border-t border-fio pt-6" aria-labelledby="destaques">
            <h2 id="destaques" className="font-dado text-xs uppercase tracking-widest text-suave">
              {t(ui.newsletter.destaques, locale)}
            </h2>
            <ul className="mt-2">
              {destaques.map((post) => (
                <PostRow key={post.slug} locale={locale} post={post} comResumo />
              ))}
            </ul>
          </section>
        ) : null}

        {posts.length > 0 ? (
          <section className="mt-12 border-t border-fio pt-6" aria-labelledby="arquivo">
            <h2 id="arquivo" className="font-dado text-xs uppercase tracking-widest text-suave">
              {t(ui.newsletter.arquivo, locale)}
            </h2>
            <ArchiveList locale={locale} posts={posts} />
          </section>
        ) : null}
      </main>
      <SiteFooter locale={locale} />
    </div>
  )
}

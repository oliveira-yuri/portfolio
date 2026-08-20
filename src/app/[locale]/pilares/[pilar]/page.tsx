import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArchiveList } from '@/components/archive/ArchiveList'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { TopBar } from '@/components/ui/TopBar'
import { descricaoPilar } from '@/content/pilares'
import { profile } from '@/content/profile'
import { ui } from '@/content/ui'
import { htmlLang, isLocale, locales, t } from '@/lib/i18n'
import { lerPosts, pilares, postsDoLocale, type Pilar } from '@/lib/posts'
import { caminhoPilar } from '@/lib/routes'
import { metadataFor } from '@/lib/seo'

export const dynamicParams = false

export function generateStaticParams() {
  return locales.flatMap((locale) => pilares.map((pilar) => ({ locale, pilar })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; pilar: string }>
}): Promise<Metadata> {
  const { locale, pilar } = await params
  if (!isLocale(locale) || !(pilares as readonly string[]).includes(pilar)) return {}

  const tipado = pilar as Pilar
  const { nome } = descricaoPilar[tipado]

  // Segmento de URL traduz (pilares/pillars, ver src/lib/routes.ts), então
  // `languages` não pode ser derivado do path como nas outras 3 rotas — tem
  // que ser calculado nos dois idiomas via `caminhoPilar`.
  return metadataFor(locale, {
    path: caminhoPilar(locale, tipado),
    title: `${t(nome, locale)} — ${profile.name}`,
    languages: {
      [htmlLang.pt]: caminhoPilar('pt', tipado),
      [htmlLang.en]: caminhoPilar('en', tipado),
      'x-default': caminhoPilar('pt', tipado),
    },
  })
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
        <h1 className="font-display text-3xl text-tinta">{t(nome, locale)}</h1>
        <p className="mt-2 max-w-2xl text-suave">{t(descricao, locale)}</p>
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

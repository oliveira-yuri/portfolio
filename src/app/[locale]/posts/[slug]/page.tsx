import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostHeader } from '@/components/post/PostHeader'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { TopBar } from '@/components/ui/TopBar'
import { ui } from '@/content/ui'
import { htmlLang, isLocale, locales, otherLocale, t } from '@/lib/i18n'
import { renderizarMdx } from '@/lib/mdx'
import { lerPosts, parLinguistico } from '@/lib/posts'

export const dynamicParams = false

export function generateStaticParams() {
  const slugs = [...new Set(lerPosts().map((post) => post.slug))]
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export default async function PostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()

  const par = parLinguistico(lerPosts(), slug)
  const post = par[locale]
  const alternativo = par[otherLocale(locale)]

  if (!post && !alternativo) notFound()

  return (
    <div className="mx-auto w-full max-w-[68rem] px-6 md:px-10">
      <TopBar locale={locale} />
      <main id="main" className="pb-16">
        {post ? (
          <article>
            <PostHeader locale={locale} post={post} />
            <div className="corpo-post mt-8 max-w-[34em]">{await renderizarMdx(post.corpo)}</div>
          </article>
        ) : (
          // Não é 404: o texto existe, só não neste idioma.
          <div className="max-w-2xl">
            <h1 className="font-serif text-3xl text-ink">{alternativo!.titulo}</h1>
            <p className="mt-4 text-muted">
              {t(alternativo!.locale === 'pt' ? ui.post.soEmPortugues : ui.post.soEmIngles, locale)}
            </p>
            <p className="mt-4 font-mono text-xs">
              {/* O rótulo do link está no idioma do conteúdo alternativo, não no
                  idioma da página (ver `lerNoIdiomaDisponivel` em content/ui.ts),
                  então precisa de `lang` próprio — do contrário um leitor de
                  tela lê "Ler em português" com fonemas de inglês quando a
                  página está em lang="en" (WCAG 3.1.2). Mesmo padrão de
                  `LocaleSwitch.tsx`. */}
              <Link
                href={`/${alternativo!.locale}/posts/${slug}`}
                lang={htmlLang[alternativo!.locale]}
                className="text-accent"
              >
                {t(ui.post.lerNoIdiomaDisponivel, alternativo!.locale)}
              </Link>
            </p>
          </div>
        )}
      </main>
      <SiteFooter locale={locale} />
    </div>
  )
}

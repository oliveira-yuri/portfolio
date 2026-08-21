import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostFooter } from '@/components/post/PostFooter'
import { PostHeader } from '@/components/post/PostHeader'
import { PostToc } from '@/components/post/PostToc'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { TopBar } from '@/components/ui/TopBar'
import { ui } from '@/content/ui'
import { extrairSecoes } from '@/lib/headings'
import { htmlLang, isLocale, locales, otherLocale, t } from '@/lib/i18n'
import { renderizarMdx } from '@/lib/mdx'
import { lerPosts, parLinguistico, postsDoLocale } from '@/lib/posts'
import { relacionados } from '@/lib/relacionados'
import { absoluteUrl } from '@/lib/site'

export const dynamicParams = false

export function generateStaticParams() {
  const slugs = [...new Set(lerPosts().map((post) => post.slug))]
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!isLocale(locale)) return {}

  const par = parLinguistico(lerPosts(), slug)
  const post = par[locale] ?? par[otherLocale(locale)]
  if (!post) return {}

  // hreflang só declara idioma que existe de fato.
  const languages: Record<string, string> = {}
  if (par.pt) languages[htmlLang.pt] = absoluteUrl(`/pt/posts/${slug}`)
  if (par.en) languages[htmlLang.en] = absoluteUrl(`/en/posts/${slug}`)

  return {
    title: post.titulo,
    description: post.resumo,
    alternates: { canonical: `/${locale}/posts/${slug}`, languages },
    openGraph: { title: post.titulo, description: post.resumo, type: 'article' },
  }
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
          <article className="grid gap-8 md:grid-cols-[9.5rem_1fr]">
            {/* Ordem no DOM é título -> corpo -> índice (WCAG 1.3.2, Meaningful
                Sequence): um leitor de tela nunca encontra a lista de seções
                antes de saber do que o post trata. `md:order-first` só muda a
                ordem VISUAL a partir de md, reposicionando o índice na coluna
                esquerda sem tocar a ordem de leitura/DOM. */}
            <div>
              <PostHeader locale={locale} post={post} />
              <div className="corpo-post mt-8 max-w-[34em]">{await renderizarMdx(post.corpo)}</div>
              <PostFooter
                locale={locale}
                post={post}
                relacionados={relacionados(postsDoLocale(lerPosts(), locale), post)}
              />
            </div>
            <div className="md:order-first md:sticky md:top-6 md:self-start">
              <PostToc locale={locale} secoes={extrairSecoes(post.corpo)} />
            </div>
          </article>
        ) : (
          // Não é 404: o texto existe, só não neste idioma.
          <div className="max-w-2xl">
            <h1 className="font-display text-3xl text-tinta">{alternativo!.titulo}</h1>
            <p className="mt-4 text-suave">
              {t(alternativo!.locale === 'pt' ? ui.post.soEmPortugues : ui.post.soEmIngles, locale)}
            </p>
            <p className="mt-4 font-dado text-xs">
              {/* O rótulo do link está no idioma do conteúdo alternativo, não no
                  idioma da página (ver `lerNoIdiomaDisponivel` em content/ui.ts),
                  então precisa de `lang` próprio — do contrário um leitor de
                  tela lê "Ler em português" com fonemas de inglês quando a
                  página está em lang="en" (WCAG 3.1.2). Mesmo padrão de
                  `LocaleSwitch.tsx`. */}
              <Link
                href={`/${alternativo!.locale}/posts/${slug}`}
                lang={htmlLang[alternativo!.locale]}
                className="text-verde"
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

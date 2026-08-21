import { ImageResponse } from 'next/og'
import { descricaoPilar } from '@/content/pilares'
import { profile } from '@/content/profile'
import { defaultLocale, isLocale, locales, t } from '@/lib/i18n'
import { lerPosts, parLinguistico } from '@/lib/posts'

/**
 * Satori (o renderizador desta rota) não lê custom property CSS, só recebe
 * uma cor literal — mesma restrição documentada em src/lib/mdx.tsx sobre o
 * tema do bloco de código. Hex fixos abaixo espelham src/app/globals.css e
 * src/lib/escala.ts (modo claro): #fdfefd = --papel, #0e1210 = --tinta,
 * #165a38 = --verde. Se esses tokens mudarem, atualizar aqui também — não há
 * como um ler o outro nesta pilha.
 *
 * O rótulo do pilar aqui é TEXTO, então segue a mesma regra medida em
 * src/lib/escala.ts: não há trio de verdes que bata 4.5:1 de texto contra
 * --papel nos dois temas e continue visivelmente distinto — por isso os três
 * pilares usam a mesma cor de texto (--verde), nunca uma cor "de pilar"
 * própria. A cor por pilar só existe em marca não textual (selo/barra), que
 * esta imagem estática não desenha.
 */
const VERDE = '#165a38'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
// Next só permite um `alt` estático por rota; este texto vira og:image:alt.
export const alt = profile.name
export const dynamic = 'force-static'

export function generateStaticParams() {
  const slugs = [...new Set(lerPosts().map((post) => post.slug))]
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })))
}

export default async function PostOpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const activeLocale = isLocale(locale) ? locale : defaultLocale

  const par = parLinguistico(lerPosts(), slug)
  const post = par[activeLocale] ?? par.pt ?? par.en

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          backgroundColor: '#fdfefd',
          color: '#0e1210',
        }}
      >
        <div style={{ fontSize: 28, color: post ? VERDE : '#57605a' }}>
          {post ? t(descricaoPilar[post.pilar].nome, activeLocale) : profile.name}
        </div>
        <div style={{ fontSize: 64, lineHeight: 1.12 }}>{post?.titulo ?? profile.name}</div>
        <div style={{ fontSize: 28, color: VERDE }}>{profile.name}</div>
      </div>
    ),
    size,
  )
}

import { ImageResponse } from 'next/og'
import { descricaoPilar } from '@/content/pilares'
import { profile } from '@/content/profile'
import { defaultLocale, isLocale, locales, t } from '@/lib/i18n'
import { lerPosts, parLinguistico, type Pilar } from '@/lib/posts'

/**
 * Satori (o renderizador desta rota) não lê custom property CSS, só recebe
 * uma cor literal — mesma restrição documentada em src/lib/mdx.tsx sobre o
 * tema do bloco de código. Hex fixos abaixo espelham src/app/globals.css e
 * src/lib/escala.ts (modo claro): #2b6a86 = --frio (pilar acadêmico),
 * #5c6269 = --suave (pilar ensino, o polo neutro da escala), #9c4a6e =
 * --quente (pilar projetos). Se esses tokens mudarem, atualizar aqui também
 * — não há como um ler o outro nesta pilha.
 */
const COR_DO_PILAR: Record<Pilar, string> = {
  academico: '#2b6a86',
  ensino: '#5c6269',
  projetos: '#9c4a6e',
}

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
          backgroundColor: '#f1f2f0',
          color: '#15171a',
        }}
      >
        <div style={{ fontSize: 28, color: post ? COR_DO_PILAR[post.pilar] : '#5c6269' }}>
          {post ? t(descricaoPilar[post.pilar].nome, activeLocale) : profile.name}
        </div>
        <div style={{ fontSize: 64, lineHeight: 1.12 }}>{post?.titulo ?? profile.name}</div>
        <div style={{ fontSize: 28, color: '#2b6a86' }}>{profile.name}</div>
      </div>
    ),
    size,
  )
}

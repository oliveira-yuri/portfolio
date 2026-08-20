import { ImageResponse } from 'next/og'
import { descricaoPilar } from '@/content/pilares'
import { profile } from '@/content/profile'
import { defaultLocale, isLocale, locales, t } from '@/lib/i18n'
import { lerPosts, parLinguistico } from '@/lib/posts'

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
          backgroundColor: '#faf9f6',
          color: '#1a1a18',
        }}
      >
        <div style={{ fontSize: 28, color: '#5f5e55' }}>
          {post ? t(descricaoPilar[post.pilar].nome, activeLocale) : profile.name}
        </div>
        <div style={{ fontSize: 64, lineHeight: 1.12 }}>{post?.titulo ?? profile.name}</div>
        <div style={{ fontSize: 28, color: '#3d5a45' }}>{profile.name}</div>
      </div>
    ),
    size,
  )
}

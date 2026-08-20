import { ImageResponse } from 'next/og'
import { profile } from '@/content/profile'
import { defaultLocale, isLocale, locales, t } from '@/lib/i18n'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
// Next só permite um `alt` estático por rota (não pode variar por locale aqui),
// e este texto vira og:image:alt em produção — não pode ser um literal em inglês.
export const alt = profile.name
export const dynamic = 'force-static'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const activeLocale = isLocale(locale) ? locale : defaultLocale

  return new ImageResponse(
    (
      // Satori (o renderizador desta rota) não lê custom property CSS, só
      // recebe uma cor literal — mesma restrição documentada em
      // src/lib/mdx.tsx sobre o tema do bloco de código. Hex fixos abaixo
      // espelham src/app/globals.css: #f1f2f0 = --papel, #15171a = --tinta,
      // #2b6a86 = --frio (modo claro). Se esses tokens mudarem, atualizar
      // aqui também — não há como um ler o outro nesta pilha.
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#f1f2f0',
          color: '#15171a',
        }}
      >
        <div style={{ fontSize: 84, lineHeight: 1.1 }}>{profile.name}</div>
        <div style={{ marginTop: 24, fontSize: 40, color: '#2b6a86' }}>{t(profile.headline, activeLocale)}</div>
      </div>
    ),
    size,
  )
}

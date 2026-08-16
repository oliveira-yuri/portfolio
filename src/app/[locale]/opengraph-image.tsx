import { ImageResponse } from 'next/og'
import { profile } from '@/content/profile'
import { defaultLocale, isLocale, locales, t } from '@/lib/i18n'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Open Graph'
export const dynamic = 'force-static'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const activeLocale = isLocale(locale) ? locale : defaultLocale

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#faf9f6',
          color: '#1a1a18',
        }}
      >
        <div style={{ fontSize: 84, lineHeight: 1.1 }}>{profile.name}</div>
        <div style={{ marginTop: 24, fontSize: 40, color: '#3d5a45' }}>{t(profile.headline, activeLocale)}</div>
      </div>
    ),
    size,
  )
}

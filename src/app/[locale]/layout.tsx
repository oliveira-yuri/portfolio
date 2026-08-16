import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { htmlLang, isLocale, locales } from '@/lib/i18n'
import { fontClassName, themeScript } from '@/lib/fonts'
import '../globals.css'

export const dynamicParams = false

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <html lang={htmlLang[locale]} className={fontClassName} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-surface text-ink">{children}</body>
    </html>
  )
}

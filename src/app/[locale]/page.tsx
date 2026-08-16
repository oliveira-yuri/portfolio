import { notFound } from 'next/navigation'
import { profile } from '@/content/profile'
import { isLocale } from '@/lib/i18n'

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return <main id="main">{profile.name}</main>
}

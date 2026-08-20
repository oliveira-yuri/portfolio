import { notFound } from 'next/navigation'
import { montarFeed } from '@/lib/feed'
import { isLocale, locales } from '@/lib/i18n'
import { lerPosts, postsDoLocale } from '@/lib/posts'

export const dynamicParams = false

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return new Response(montarFeed(postsDoLocale(lerPosts(), locale), locale), {
    headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
  })
}

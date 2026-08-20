import Link from 'next/link'
import { formatarData } from '@/lib/date'
import { type Locale } from '@/lib/i18n'
import type { Post } from '@/lib/posts'

export function PostRow({
  locale,
  post,
  comResumo = false,
}: {
  locale: Locale
  post: Post
  comResumo?: boolean
}) {
  return (
    <li className="flex gap-4 border-b border-dotted border-line py-2 last:border-b-0">
      <span data-pilar={post.pilar} className="mt-1 w-0.5 shrink-0 self-stretch rounded bg-accent/40" />
      <time dateTime={post.data} className="mt-0.5 w-24 shrink-0 font-mono text-xs tabular-nums text-muted">
        {formatarData(post.data, locale)}
      </time>
      <div className="min-w-0">
        <Link href={`/${locale}/posts/${post.slug}`} className="font-serif text-lg text-ink hover:text-accent">
          {post.titulo}
        </Link>
        {comResumo ? <p className="text-sm text-muted">{post.resumo}</p> : null}
        <ul className="mt-0.5 flex flex-wrap gap-x-3 font-mono text-[0.7rem] text-accent/90">
          {post.tags.map((tag) => (
            <li key={tag}>
              <Link href={`/${locale}/tags/${tag}`}>#{tag}</Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

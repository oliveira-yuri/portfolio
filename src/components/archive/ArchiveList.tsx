import { PostRow } from '@/components/archive/PostRow'
import { formatarMesLongo } from '@/lib/date'
import type { Locale } from '@/lib/i18n'
import { agruparPorMes, type Post } from '@/lib/posts'

export function ArchiveList({ locale, posts }: { locale: Locale; posts: Post[] }) {
  if (posts.length === 0) return null

  return (
    <div>
      {agruparPorMes(posts).map((grupo) => (
        <section key={`${grupo.ano}-${grupo.mes}`} className="mt-6">
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted">
            {formatarMesLongo(grupo.ano, grupo.mes, locale)}
          </h3>
          <ul className="mt-2">
            {grupo.posts.map((post) => (
              <PostRow key={post.slug} locale={locale} post={post} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

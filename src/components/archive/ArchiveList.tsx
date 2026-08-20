import { PostRow } from '@/components/archive/PostRow'
import { formatarMesLongo } from '@/lib/date'
import type { Locale } from '@/lib/i18n'
import { agruparPorMes, type Post } from '@/lib/posts'

export function ArchiveList({ locale, posts }: { locale: Locale; posts: Post[] }) {
  if (posts.length === 0) return null

  return (
    <div>
      {agruparPorMes(posts).map((grupo) => (
        <section key={`${grupo.ano}-${grupo.mes}`} className="mt-10">
          <h3 className="border-b border-fio pb-1.5 font-dado text-[0.65rem] uppercase tracking-[0.16em] text-suave">
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

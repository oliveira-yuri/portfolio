import Link from 'next/link'
import { ui } from '@/content/ui'
import { ctaDoPost } from '@/lib/cta'
import { type Locale, t } from '@/lib/i18n'
import type { Post } from '@/lib/posts'

export function PostFooter({
  locale,
  post,
  relacionados,
}: {
  locale: Locale
  post: Post
  relacionados: Post[]
}) {
  const cta = ctaDoPost(post)

  return (
    <footer className="mt-12 border-t border-ink pt-4">
      <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
        {t(ui.post.daquiVocePodeIr, locale)}
      </p>
      <div className="mt-3 grid gap-6 sm:grid-cols-2">
        {relacionados.length > 0 ? (
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
              {t(ui.post.noSite, locale)}
            </p>
            <ul className="mt-2 space-y-2">
              {relacionados.map((outro) => (
                <li key={outro.slug}>
                  <Link href={`/${locale}/posts/${outro.slug}`} className="font-serif text-ink hover:text-accent">
                    {outro.titulo}
                  </Link>
                  <span className="block text-sm text-muted">{outro.resumo}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Só existe se o post declarou `cta`. Nunca automático. */}
        {cta ? (
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-widest text-muted">
              {t(ui.post.estudarAFundo, locale)}
            </p>
            <p className="mt-2 text-sm text-muted">
              <a href={cta.url} className="text-accent">
                {cta.formacao.nome}
              </a>{' '}
              — {t(cta.formacao.descricao, locale)}
            </p>
            <p className="mt-3 border-t border-dotted border-line pt-2 font-mono text-[0.65rem] text-muted">
              {t(ui.post.divulgacao, locale)}
            </p>
          </div>
        ) : null}
      </div>
    </footer>
  )
}

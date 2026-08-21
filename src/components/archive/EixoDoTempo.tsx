/**
 * DELIBERADAMENTE SEM CONSUMIDOR no momento: a home (src/app/[locale]/page.tsx)
 * removeu o uso deste componente na direção "Clorofila" (ver comentário lá).
 * Com só três textos publicados, o eixo do tempo plota um traço solitário
 * que anuncia "este site é novo" em vez de mostrar cadência — só passa a
 * significar algo com dezenas de posts espalhados no tempo. NÃO apague este
 * componente nem os testes abaixo: a intenção é religá-lo à home mais
 * adiante, quando houver histórico suficiente para o gráfico valer a pena.
 */
import { ui } from '@/content/ui'
import { formatarMesAno } from '@/lib/date'
import { corDoPilar } from '@/lib/escala'
import { type Locale, t } from '@/lib/i18n'
import type { Post } from '@/lib/posts'
import { tempoDeLeitura } from '@/lib/reading'

const ALTURA_MINIMA = 22
const ALTURA_MAXIMA = 100

function emDias(data: string): number {
  return Date.parse(`${data}T12:00:00Z`) / 86_400_000
}

export function EixoDoTempo({ locale, posts }: { locale: Locale; posts: Post[] }) {
  if (posts.length === 0) return null

  const dias = posts.map((post) => emDias(post.data))
  const inicio = Math.min(...dias)
  const fim = Math.max(...dias)
  const janela = fim - inicio

  const leituras = posts.map((post) => tempoDeLeitura(post.corpo))
  const maiorLeitura = Math.max(...leituras)

  // `posts` deve chegar ordenado por data DESCENDENTE (o que `lerPosts` já
  // garante): os traços em si usam Math.min/Math.max e ficam corretos em
  // qualquer ordem, mas estes dois extremos não recalculam nada — se a
  // ordem vier invertida, os rótulos "mais antigo"/"mais recente" trocam de
  // lugar silenciosamente, sem quebrar a posição das marcas.
  const maisAntigo = posts[posts.length - 1]
  const maisRecente = posts[0]

  const resumo = `${posts.length} ${t(ui.newsletter.textos, locale)} · ${formatarMesAno(maisAntigo.data)} — ${formatarMesAno(maisRecente.data)}`

  return (
    <section aria-labelledby="eixo-rotulo">
      <div className="flex items-baseline justify-between border-b border-tinta pb-1.5 font-dado text-[0.65rem] uppercase tracking-[0.16em] text-suave">
        <h2 id="eixo-rotulo" className="text-tinta">
          {t(ui.newsletter.eixoRotulo, locale)}
        </h2>
        <span className="tabular-nums">{resumo}</span>
      </div>

      {/* O gráfico é uma segunda projeção do mesmo dado da lista abaixo, que já
          é acessível. Aqui basta o resumo; os traços saem da árvore. */}
      <div role="img" aria-label={`${t(ui.newsletter.eixoDescricao, locale)} ${resumo}`}>
        <div className="relative h-11" aria-hidden="true">
          {posts.map((post, i) => (
            <span
              key={`${post.slug}-${post.locale}`}
              data-traco
              data-pilar={post.pilar}
              className="absolute bottom-0 block w-0.5"
              style={{
                left: janela === 0 ? '0%' : `${((dias[i] - inicio) / janela) * 100}%`,
                height: `${ALTURA_MINIMA + (leituras[i] / maiorLeitura) * (ALTURA_MAXIMA - ALTURA_MINIMA)}%`,
                backgroundColor: corDoPilar(post.pilar),
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between border-t border-fio pt-1 font-dado text-[0.65rem] tabular-nums text-suave">
        <span>{formatarMesAno(maisAntigo.data)}</span>
        <span>{formatarMesAno(maisRecente.data)}</span>
      </div>
    </section>
  )
}

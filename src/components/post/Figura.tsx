import type { ReactNode } from 'react'

export function Figura({
  numero,
  legenda,
  children,
}: {
  /**
   * Number | string: o pipeline de MDX descarta silenciosamente atributos
   * JSX escritos como expressão (`numero={1}`) — só sobrevive um literal
   * string (`numero="1"`). Um autor de post em MDX escreve `numero="1"`;
   * os testes em TSX continuam podendo passar `numero={1}` direto. Não
   * estreitar de volta para `number` — quebraria toda legenda numerada em
   * MDX sem erro nenhum no build.
   */
  numero: number | string
  legenda: string
  children: ReactNode
}) {
  return (
    <figure className="my-6">
      {children}
      <figcaption className="mt-2 border-t border-line pt-2 font-mono text-xs text-muted">
        <span className="text-ink">Fig. {Number(numero)}</span> — {legenda}
      </figcaption>
    </figure>
  )
}

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
  const numeroConvertido = Number(numero)
  // `Number('')` é 0 e `Number('  ')` também — Number.isFinite sozinho não
  // pegaria essas duas strings vazias/só espaço. Post em MDX com
  // `numero="dois"` (ou vazio) não pode virar "Fig. NaN" silenciosamente:
  // isto roda em build (SSG), então falhar aqui falha o build, apontando
  // pro autor exatamente qual legenda está errada.
  if (typeof numero === 'string' && numero.trim() === '') {
    throw new Error(`Figura: numero não pode ser vazio (legenda: ${JSON.stringify(legenda)})`)
  }
  if (!Number.isFinite(numeroConvertido)) {
    throw new Error(`Figura: numero deve ser numérico; recebido ${JSON.stringify(numero)} (legenda: ${JSON.stringify(legenda)})`)
  }

  return (
    <figure className="my-6">
      {children}
      <figcaption className="mt-2 border-t border-fio pt-2 font-dado text-xs text-suave">
        <span className="text-tinta">Fig. {numeroConvertido}</span> — {legenda}
      </figcaption>
    </figure>
  )
}

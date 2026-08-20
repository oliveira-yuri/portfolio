import type { ReactNode } from 'react'

export function Figura({
  numero,
  legenda,
  children,
}: {
  numero: number
  legenda: string
  children: ReactNode
}) {
  return (
    <figure className="my-6">
      {children}
      <figcaption className="mt-2 border-t border-line pt-2 font-mono text-xs text-muted">
        <span className="text-ink">Fig. {numero}</span> — {legenda}
      </figcaption>
    </figure>
  )
}

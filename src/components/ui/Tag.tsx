import type { ReactNode } from 'react'

/** Sempre usado dentro de <ul>. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <li className="rounded border border-line px-2 py-1 font-mono text-xs tracking-wide text-muted">{children}</li>
  )
}

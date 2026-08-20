import type { ReactNode } from 'react'

/** Sempre usado dentro de <ul>. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <li className="rounded border border-fio px-2 py-1 font-dado text-xs tracking-wide text-suave">{children}</li>
  )
}

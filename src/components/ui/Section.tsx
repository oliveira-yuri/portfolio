import type { ReactNode } from 'react'

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-line py-16 md:py-24">
      <h2 id={`${id}-title`} className="font-serif text-3xl text-ink md:text-4xl">
        {title}
      </h2>
      <div className="mt-8">{children}</div>
    </section>
  )
}

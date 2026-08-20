'use client'

// Único componente cliente ADICIONADO por este trabalho (LocaleSwitch,
// ThemeToggle e Reveal já eram client antes): marcar a seção atual exige
// observar o scroll, o que só é possível com um efeito no cliente.
import { useEffect, useState } from 'react'
import { ui } from '@/content/ui'
import { type Locale, t } from '@/lib/i18n'

export function PostToc({
  locale,
  secoes,
}: {
  locale: Locale
  secoes: { id: string; texto: string }[]
}) {
  const [atual, setAtual] = useState(secoes[0]?.id)

  useEffect(() => {
    // `jsdom` (ambiente dos testes) não implementa `IntersectionObserver` —
    // navegadores reais sempre têm. A guarda evita depender de um polyfill
    // só para o teste; o comportamento observável em produção não muda.
    if (secoes.length === 0 || typeof IntersectionObserver === 'undefined') return

    const observador = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas.find((entrada) => entrada.isIntersecting)
        if (visivel) setAtual(visivel.target.id)
      },
      { rootMargin: '-10% 0px -70% 0px' },
    )

    for (const secao of secoes) {
      const alvo = document.getElementById(secao.id)
      if (alvo) observador.observe(alvo)
    }

    return () => observador.disconnect()
  }, [secoes])

  if (secoes.length === 0) return null

  return (
    <nav aria-label={t(ui.post.nesteTexto, locale)} className="font-dado text-xs">
      <p className="uppercase tracking-widest text-suave">{t(ui.post.nesteTexto, locale)}</p>
      <ul className="mt-3 space-y-2 border-l border-fio pl-3">
        {secoes.map((secao) => (
          <li key={secao.id}>
            <a
              href={`#${secao.id}`}
              aria-current={secao.id === atual ? 'true' : undefined}
              className={secao.id === atual ? 'text-frio' : 'text-suave'}
            >
              {secao.texto}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

'use client'

import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'

// No servidor, useLayoutEffect não roda (e avisa no console); no cliente, roda antes
// da primeira pintura — é o que garante que esconder o elemento nunca gere um "flash".
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  // Visível por padrão: é o que o HTML renderizado no servidor mostra, e o que fica
  // valendo para sempre se o JS estiver desligado ou quebrar em qualquer ponto depois
  // daqui. Só o próprio efeito abaixo — depois de confirmar que vai poder reverter —
  // é que esconde o elemento para animar a entrada.
  const [hidden, setHidden] = useState(false)

  useIsomorphicLayoutEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') return

    setHidden(true)

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHidden(false)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-out ${
        hidden ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      {children}
    </div>
  )
}

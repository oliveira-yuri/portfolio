'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { ui } from '@/content/ui'
import { type Locale, otherLocale, t } from '@/lib/i18n'

// A âncora é uma fonte de verdade externa ao React (o navegador a atualiza ao
// rolar a página ou ao clicar num link interno). useSyncExternalStore lê esse
// estado sem disparar setState dentro de um efeito e mantém o href
// sincronizado enquanto o visitante navega pela página, em vez de congelar a
// âncora que existia no momento da montagem.
function subscribe(listener: () => void) {
  window.addEventListener('hashchange', listener)
  return () => window.removeEventListener('hashchange', listener)
}

function getSnapshot() {
  return window.location.hash
}

function getServerSnapshot() {
  return ''
}

export function LocaleSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const hash = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const target = otherLocale(locale)
  const href = `${pathname.replace(`/${locale}`, `/${target}`)}${hash}`
  const visibleText = target.toUpperCase()

  return (
    <Link
      href={href}
      hrefLang={target}
      // O nome acessível precisa conter o texto visível (WCAG 2.5.3 — Label in
      // Name): quem usa comando de voz diz o que vê ("clique em EN"), então a
      // sigla entra composta ao texto traduzido, em vez de substituí-lo.
      aria-label={`${t(ui.actions.switchLanguage, locale)} (${visibleText})`}
      className="rounded border border-line px-2 py-1 font-mono text-xs text-muted transition-colors hover:text-ink"
    >
      {visibleText}
    </Link>
  )
}

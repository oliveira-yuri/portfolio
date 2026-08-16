'use client'

import { useSyncExternalStore } from 'react'
import { ui } from '@/content/ui'
import { type Locale, t } from '@/lib/i18n'

// A classe 'dark' em <html> é uma fonte de verdade externa ao React (definida
// pelo script anti-flash antes da primeira pintura). useSyncExternalStore lê
// esse estado sem disparar setState dentro de um efeito e sem divergência
// entre a renderização do servidor (sempre "claro") e a do cliente.
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return document.documentElement.classList.contains('dark')
}

function getServerSnapshot() {
  return false
}

export function ThemeToggle({ locale }: { locale: Locale }) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  function toggle() {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      // Persistência é o lado opcional: se falhar (modo privado, política de
      // armazenamento, cota excedida), o tema ainda vale para esta sessão —
      // o que não pode falhar é o botão continuar dizendo a verdade sobre o
      // tema realmente aplicado em <html>, por isso o notify roda de qualquer forma.
    }
    for (const listener of listeners) listener()
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={t(ui.actions.toggleTheme, locale)}
      className="rounded border border-line px-2 py-1 font-mono text-xs text-muted transition-colors hover:text-ink"
    >
      {dark ? '☀' : '☾'}
    </button>
  )
}

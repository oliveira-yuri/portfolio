'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { ui } from '@/content/ui'
import { type Locale, htmlLang, otherLocale, t } from '@/lib/i18n'
import { topBarButtonClass } from '@/lib/styles'

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
      // ui.actions.switchLanguage é escrito em português nas duas chaves
      // (pt: 'Ver em inglês', en: 'Ver em português' — de propósito, ver
      // content/ui.ts), então o idioma real do nome acessível é sempre
      // pt-BR, independente do locale da página atual. Em /en, o documento
      // está em lang="en" mas este rótulo específico não está — sem marcar
      // isso, um leitor de tela liaria as palavras em português com voz de
      // inglês (WCAG 3.1.2 — Language of Parts). hrefLang, por outro lado,
      // descreve o destino do link, não o idioma do próprio conteúdo.
      lang={htmlLang.pt}
      className={topBarButtonClass}
    >
      {visibleText}
    </Link>
  )
}

import { ui } from '@/content/ui'
import type { Period } from '@/content/types'
import { type Locale, htmlLang, t } from '@/lib/i18n'

const MONTHS: Record<Locale, readonly string[]> = {
  pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

export function isValidMonth(value: string): boolean {
  return MONTH_PATTERN.test(value)
}

export function formatMonth(value: string, locale: Locale): string {
  const [year, month] = value.split('-')
  return `${MONTHS[locale][Number(month) - 1]} ${year}`
}

export function formatPeriod(period: Period, locale: Locale): string {
  const start = formatMonth(period.start, locale)
  const end = period.end ? formatMonth(period.end, locale) : t(ui.present, locale)
  return `${start} — ${end}`
}

export function sortByPeriodDesc<T extends { period: Period }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => b.period.start.localeCompare(a.period.start))
}

/** 'YYYY-MM-DD' → '12/08/2026' (pt) ou '08/12/2026' (en). */
export function formatarData(data: string, locale: Locale): string {
  return new Date(`${data}T12:00:00Z`).toLocaleDateString(htmlLang[locale], {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

/** 'YYYY-MM-DD' → '06/2026'. */
export function formatarMesAno(data: string): string {
  return `${data.slice(5, 7)}/${data.slice(0, 4)}`
}

/** 2026, 8 → '2026 — Agosto' / '2026 — August'. */
export function formatarMesLongo(ano: number, mes: number, locale: Locale): string {
  const nome = new Date(Date.UTC(ano, mes - 1, 1)).toLocaleDateString(htmlLang[locale], {
    month: 'long',
    timeZone: 'UTC',
  })
  return `${ano} — ${nome.charAt(0).toUpperCase()}${nome.slice(1)}`
}

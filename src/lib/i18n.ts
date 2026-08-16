export const locales = ['pt', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'pt'

/** Todo texto voltado ao usuário tem esta forma. Faltar uma chave quebra o build. */
export type Localized = { pt: string; en: string }

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

export function t(value: Localized, locale: Locale): string {
  return value[locale]
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'pt' ? 'en' : 'pt'
}

export const htmlLang: Record<Locale, string> = { pt: 'pt-BR', en: 'en' }

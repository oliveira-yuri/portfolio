import { Section } from '@/components/ui/Section'
import type { Certificate } from '@/content/types'
import { ui } from '@/content/ui'
import { formatMonth } from '@/lib/date'
import { type Locale, t } from '@/lib/i18n'
import { underlineLinkClass } from '@/lib/styles'

export function CertificatesSection({ locale, items }: { locale: Locale; items: Certificate[] }) {
  if (items.length === 0) return null

  const ordenados = [...items].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Section id="certificados" title={t(ui.sections.certificates, locale)}>
      <ul>
        {ordenados.map((certificate) => (
          <li key={certificate.id} className="py-5">
            <p className="font-dado text-[0.65rem] uppercase tracking-[0.14em] text-suave">{certificate.issuer}</p>
            <h3 className="mt-0.5 font-display text-xl text-tinta">{t(certificate.title, locale)}</h3>
            <p className="mt-1 font-dado text-xs text-suave">{formatMonth(certificate.date, locale)}</p>
            {certificate.credentialUrl && (
              <a
                href={certificate.credentialUrl}
                target="_blank"
                rel="noreferrer"
                className={`mt-3 inline-block text-sm ${underlineLinkClass}`}
              >
                {t(ui.actions.verifyCredential, locale)}
              </a>
            )}
          </li>
        ))}
      </ul>
    </Section>
  )
}

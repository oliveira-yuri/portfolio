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
      <ul className="grid gap-4 md:grid-cols-2">
        {ordenados.map((certificate) => (
          <li
            key={certificate.id}
            className="rounded-lg border border-line bg-raised p-5 transition-colors hover:border-accent"
          >
            <h3 className="font-serif text-xl text-ink">{t(certificate.title, locale)}</h3>
            <p className="mt-1 text-muted">{certificate.issuer}</p>
            <p className="mt-1 font-mono text-xs text-muted">{formatMonth(certificate.date, locale)}</p>
            {certificate.credentialUrl && (
              <a
                href={certificate.credentialUrl}
                target="_blank"
                rel="noreferrer"
                className={`mt-4 inline-block text-sm ${underlineLinkClass}`}
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

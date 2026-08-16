import { Section } from '@/components/ui/Section'
import type { Education } from '@/content/types'
import { ui } from '@/content/ui'
import { formatPeriod } from '@/lib/date'
import { type Locale, t } from '@/lib/i18n'

export function EducationSection({ locale, education }: { locale: Locale; education: Education }) {
  return (
    <Section id="formacao" title={t(ui.sections.education, locale)}>
      <div className="grid gap-2 md:grid-cols-[10rem_1fr] md:gap-8">
        <p className="font-mono text-xs text-muted md:pt-2">{formatPeriod(education.period, locale)}</p>
        <div>
          <h3 className="font-serif text-2xl text-ink">{t(education.degree, locale)}</h3>
          <p className="mt-1 text-muted">{education.institution}</p>
          <p className="mt-1 font-mono text-xs text-accent">{t(education.status, locale)}</p>
        </div>
      </div>
    </Section>
  )
}

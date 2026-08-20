import { Section } from '@/components/ui/Section'
import { Tag } from '@/components/ui/Tag'
import type { Experience } from '@/content/types'
import { ui } from '@/content/ui'
import { formatPeriod, sortByPeriodDesc } from '@/lib/date'
import { type Locale, t } from '@/lib/i18n'

export function ExperienceSection({ locale, items }: { locale: Locale; items: Experience[] }) {
  return (
    <Section id="experiencia" title={t(ui.sections.experience, locale)}>
      <ol className="space-y-12">
        {sortByPeriodDesc(items).map((item) => (
          <li key={item.id} className="grid gap-2 md:grid-cols-[10rem_1fr] md:gap-8">
            <p className="font-dado text-xs text-suave md:pt-2">{formatPeriod(item.period, locale)}</p>
            <div>
              <h3 className="font-display text-2xl text-tinta">{t(item.role, locale)}</h3>
              <p className="mt-1 text-suave">
                {item.organizationUrl ? (
                  <a
                    href={item.organizationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="border-b border-fio transition-colors hover:border-frio hover:text-frio"
                  >
                    {item.organization}
                  </a>
                ) : (
                  item.organization
                )}
              </p>
              <ul className="mt-4 max-w-[65ch] list-disc space-y-2 pl-5 marker:text-frio">
                {item.highlights.map((highlight, index) => (
                  <li key={index}>{t(highlight, locale)}</li>
                ))}
              </ul>
              {item.tech && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {item.tech.map((tech) => (
                    <Tag key={tech}>{tech}</Tag>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}

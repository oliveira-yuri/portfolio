import { Section } from '@/components/ui/Section'
import type { Profile } from '@/content/types'
import { ui } from '@/content/ui'
import { type Locale, t } from '@/lib/i18n'

const linkClass = 'border-b border-line pb-0.5 transition-colors hover:border-accent hover:text-accent'

export function ContactSection({ locale, profile }: { locale: Locale; profile: Profile }) {
  return (
    <Section id="contato" title={t(ui.sections.contact, locale)}>
      <p className="max-w-[65ch] text-lg text-muted">{t(profile.intent, locale)}</p>
      <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
        <li>
          <a className={linkClass} href={`mailto:${profile.links.email}`}>
            {profile.links.email}
          </a>
        </li>
        <li>
          <a className={linkClass} href={profile.links.linkedin} target="_blank" rel="me noreferrer">
            LinkedIn
          </a>
        </li>
        <li>
          <a className={linkClass} href={profile.links.github} target="_blank" rel="me noreferrer">
            GitHub
          </a>
        </li>
        <li>
          <a className={linkClass} href={profile.cv[locale]} download>
            {t(ui.actions.downloadCv, locale)}
          </a>
        </li>
      </ul>
    </Section>
  )
}

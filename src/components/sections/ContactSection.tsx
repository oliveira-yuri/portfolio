import { ContactLinks } from '@/components/sections/ContactLinks'
import { Section } from '@/components/ui/Section'
import type { Profile } from '@/content/types'
import { ui } from '@/content/ui'
import { type Locale, t } from '@/lib/i18n'

export function ContactSection({ locale, profile }: { locale: Locale; profile: Profile }) {
  return (
    <Section id="contato" title={t(ui.sections.contact, locale)}>
      <p className="max-w-[65ch] text-lg text-muted">{t(profile.intent, locale)}</p>
      <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
        <ContactLinks locale={locale} profile={profile} order={['email', 'linkedin', 'github', 'cv']} />
      </ul>
    </Section>
  )
}

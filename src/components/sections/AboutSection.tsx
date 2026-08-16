import { Section } from '@/components/ui/Section'
import type { Profile } from '@/content/types'
import { ui } from '@/content/ui'
import { type Locale, t } from '@/lib/i18n'

export function AboutSection({ locale, profile }: { locale: Locale; profile: Profile }) {
  return (
    <Section id="sobre" title={t(ui.sections.about, locale)}>
      <div className="max-w-[65ch] space-y-5 text-lg">
        {profile.bio.map((paragrafo, index) => (
          <p key={index}>{t(paragrafo, locale)}</p>
        ))}
        <p className="font-serif text-xl text-accent">{t(profile.intent, locale)}</p>
      </div>
    </Section>
  )
}

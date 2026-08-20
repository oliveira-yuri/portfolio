import { ContactLinks } from '@/components/sections/ContactLinks'
import type { Profile } from '@/content/types'
import { type Locale, t } from '@/lib/i18n'

export function HeroSection({ locale, profile }: { locale: Locale; profile: Profile }) {
  return (
    <section id="inicio" className="py-16 md:py-24">
      <p className="font-dado text-xs tracking-widest text-suave uppercase">{t(profile.location, locale)}</p>
      <h1 className="mt-4 font-display text-5xl leading-[1.05] text-tinta md:text-7xl">
        {profile.name}
      </h1>
      <p className="mt-5 max-w-2xl text-xl text-suave md:text-2xl">{t(profile.headline, locale)}</p>
      <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
        <ContactLinks locale={locale} profile={profile} order={['cv', 'github', 'linkedin', 'email']} />
      </ul>
    </section>
  )
}

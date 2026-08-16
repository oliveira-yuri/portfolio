import type { Profile } from '@/content/types'
import { ui } from '@/content/ui'
import { type Locale, t } from '@/lib/i18n'

const linkClass = 'border-b border-line pb-0.5 transition-colors hover:border-accent hover:text-accent'

export function HeroSection({ locale, profile }: { locale: Locale; profile: Profile }) {
  return (
    <section id="inicio" className="py-16 md:py-24">
      <p className="font-mono text-xs tracking-widest text-muted uppercase">{t(profile.location, locale)}</p>
      <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-ink md:text-7xl">
        {profile.name}
      </h1>
      <p className="mt-5 max-w-2xl text-xl text-muted md:text-2xl">{t(profile.headline, locale)}</p>
      <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
        <li>
          <a className={linkClass} href={profile.cv[locale]} download>
            {t(ui.actions.downloadCv, locale)}
          </a>
        </li>
        <li>
          <a className={linkClass} href={profile.links.github} rel="me noreferrer" target="_blank">
            GitHub
          </a>
        </li>
        <li>
          <a className={linkClass} href={profile.links.linkedin} rel="me noreferrer" target="_blank">
            LinkedIn
          </a>
        </li>
        <li>
          <a className={linkClass} href={`mailto:${profile.links.email}`}>
            {profile.links.email}
          </a>
        </li>
      </ul>
    </section>
  )
}

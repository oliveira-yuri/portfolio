import type { Profile } from '@/content/types'
import { ui } from '@/content/ui'
import { type Locale, t } from '@/lib/i18n'
import { underlineLinkClass } from '@/lib/styles'

export type ContactLinkKind = 'cv' | 'github' | 'linkedin' | 'email'

function ContactLink({ kind, locale, profile }: { kind: ContactLinkKind; locale: Locale; profile: Profile }) {
  switch (kind) {
    case 'cv':
      return (
        <a className={underlineLinkClass} href={profile.cv[locale]} download>
          {t(ui.actions.downloadCv, locale)}
        </a>
      )
    case 'github':
      return (
        <a className={underlineLinkClass} href={profile.links.github} rel="me noreferrer" target="_blank">
          GitHub
        </a>
      )
    case 'linkedin':
      return (
        <a className={underlineLinkClass} href={profile.links.linkedin} rel="me noreferrer" target="_blank">
          LinkedIn
        </a>
      )
    case 'email':
      return (
        <a className={underlineLinkClass} href={`mailto:${profile.links.email}`}>
          {profile.links.email}
        </a>
      )
  }
}

/**
 * Os quatro links de contato (CV, GitHub, LinkedIn, e-mail), compartilhados
 * entre HeroSection e ContactSection. Cada seção controla sua própria <ul> e
 * a ordem em que os links aparecem via `order` — a ordem já era diferente
 * entre as duas seções antes desta extração, e continua sendo por design.
 */
export function ContactLinks({
  locale,
  profile,
  order,
}: {
  locale: Locale
  profile: Profile
  order: readonly ContactLinkKind[]
}) {
  return (
    <>
      {order.map((kind) => (
        <li key={kind}>
          <ContactLink kind={kind} locale={locale} profile={profile} />
        </li>
      ))}
    </>
  )
}

import Image from 'next/image'
import { Section } from '@/components/ui/Section'
import { Tag } from '@/components/ui/Tag'
import type { Project } from '@/content/types'
import { ui } from '@/content/ui'
import { formatPeriod, sortByPeriodDesc } from '@/lib/date'
import { type Locale, t } from '@/lib/i18n'
import { underlineLinkClass } from '@/lib/styles'

const linkClass = `${underlineLinkClass} text-sm`

/**
 * Destaques primeiro (controle do dono sobre o que aparece primeiro conforme
 * a lista cresce), e dentro de cada grupo (destaque / não destaque), do mais
 * recente para o mais antigo.
 */
function sortForDisplay(items: readonly Project[]): Project[] {
  const featured = sortByPeriodDesc(items.filter((project) => project.featured))
  const rest = sortByPeriodDesc(items.filter((project) => !project.featured))
  return [...featured, ...rest]
}

export function ProjectsSection({ locale, items }: { locale: Locale; items: Project[] }) {
  if (items.length === 0) return null

  return (
    <Section id="projetos" title={t(ui.sections.projects, locale)}>
      <ul className="space-y-10">
        {sortForDisplay(items).map((project) => (
          <li
            key={project.slug}
            className="rounded-lg border border-line bg-raised p-6 transition-colors hover:border-accent md:p-8"
          >
            {project.image && (
              <Image
                src={project.image.src}
                alt={t(project.image.alt, locale)}
                width={project.image.width}
                height={project.image.height}
                className="mb-6 h-auto w-full rounded border border-line"
                sizes="(max-width: 768px) 100vw, 1000px"
              />
            )}
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-serif text-2xl text-ink">{project.title}</h3>
              <p className="font-mono text-xs text-muted">
                {t(project.role, locale)} · {formatPeriod(project.period, locale)}
              </p>
            </div>
            <p className="mt-2 text-lg text-muted">{t(project.summary, locale)}</p>
            <p className="mt-4 max-w-[65ch]">{t(project.description, locale)}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <Tag key={tech}>{tech}</Tag>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-6">
              {project.links.repo && (
                <a className={linkClass} href={project.links.repo} target="_blank" rel="noreferrer">
                  {t(ui.actions.viewRepo, locale)}
                </a>
              )}
              {project.links.demo && (
                <a className={linkClass} href={project.links.demo} target="_blank" rel="noreferrer">
                  {t(ui.actions.viewDemo, locale)}
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}

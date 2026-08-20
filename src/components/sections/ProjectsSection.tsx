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
      <ul>
        {sortForDisplay(items).map((project) => (
          <li key={project.slug} className="py-8">
            {project.image && (
              <Image
                src={project.image.src}
                alt={t(project.image.alt, locale)}
                width={project.image.width}
                height={project.image.height}
                className="mb-6 h-auto w-full rounded border border-fio"
                sizes="(max-width: 768px) 100vw, 1000px"
              />
            )}
            <p className="font-dado text-[0.65rem] uppercase tracking-[0.14em] text-suave">
              {t(project.role, locale)} · {formatPeriod(project.period, locale)}
            </p>
            <h3 className="mt-0.5 font-display text-2xl text-tinta">{project.title}</h3>
            <p className="mt-2 text-lg text-suave">{t(project.summary, locale)}</p>
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

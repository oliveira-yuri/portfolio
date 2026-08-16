import { Section } from '@/components/ui/Section'
import { Tag } from '@/components/ui/Tag'
import type { SkillGroup, SkillLevel } from '@/content/types'
import { ui } from '@/content/ui'
import { type Locale, t } from '@/lib/i18n'

const LEVEL_ORDER: SkillLevel[] = ['core', 'used', 'learning']

export function SkillsSection({ locale, groups }: { locale: Locale; groups: SkillGroup[] }) {
  const ordenados = LEVEL_ORDER.map((level) => groups.find((g) => g.level === level)).filter(
    (group): group is SkillGroup => group !== undefined && group.items.length > 0,
  )

  return (
    <Section id="habilidades" title={t(ui.sections.skills, locale)}>
      <div className="space-y-8">
        {ordenados.map((group) => (
          <div key={group.level} className="grid gap-3 md:grid-cols-[14rem_1fr] md:gap-8">
            <h3 className="font-mono text-xs tracking-widest text-muted uppercase md:pt-1">
              {t(ui.skillLevels[group.level], locale)}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}

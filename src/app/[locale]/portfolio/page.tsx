import { notFound } from 'next/navigation'
import { AboutSection } from '@/components/sections/AboutSection'
import { CertificatesSection } from '@/components/sections/CertificatesSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { EducationSection } from '@/components/sections/EducationSection'
import { ExperienceSection } from '@/components/sections/ExperienceSection'
import { HeroSection } from '@/components/sections/HeroSection'
import { ProjectsSection } from '@/components/sections/ProjectsSection'
import { SkillsSection } from '@/components/sections/SkillsSection'
import { Reveal } from '@/components/ui/Reveal'
import { SiteFooter } from '@/components/ui/SiteFooter'
import { TopBar } from '@/components/ui/TopBar'
import { certificates, education } from '@/content/education'
import { experiences } from '@/content/experience'
import { profile } from '@/content/profile'
import { projects } from '@/content/projects'
import { skillGroups } from '@/content/skills'
import { isLocale } from '@/lib/i18n'

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <div className="mx-auto w-full max-w-[68rem] px-6 md:px-10">
      <TopBar locale={locale} />
      <main id="main">
        <HeroSection locale={locale} profile={profile} />
        <Reveal>
          <AboutSection locale={locale} profile={profile} />
        </Reveal>
        <Reveal>
          <ExperienceSection locale={locale} items={experiences} />
        </Reveal>
        <Reveal>
          <ProjectsSection locale={locale} items={projects} />
        </Reveal>
        <Reveal>
          <SkillsSection locale={locale} groups={skillGroups} />
        </Reveal>
        <Reveal>
          <CertificatesSection locale={locale} items={certificates} />
        </Reveal>
        <Reveal>
          <EducationSection locale={locale} education={education} />
        </Reveal>
        <Reveal>
          <ContactSection locale={locale} profile={profile} />
        </Reveal>
      </main>
      <SiteFooter locale={locale} />
    </div>
  )
}

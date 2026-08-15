# Portfólio de estudante de tecnologia — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir um site de portfólio estático, bilíngue (PT/EN), de página única, que converta recrutador em contato e sirva de amostra de código.

**Architecture:** Next.js App Router gerando estaticamente duas rotas (`/pt` e `/en`) a partir de arquivos de conteúdo TypeScript tipados. Componentes não contêm texto: recebem dados de `src/content/` via props e decidem apenas apresentação. Bilinguismo resolvido por um tipo `Localized = { pt: string; en: string }` — tradução faltando quebra o build, não o site.

**Tech Stack:** Next.js (App Router) · TypeScript strict · Tailwind CSS v4 · Vitest + Testing Library · Playwright · Vercel

**Spec:** `docs/superpowers/specs/2026-08-15-portfolio-estudante-tech-design.md`

## Global Constraints

- **Sem backend, sem banco, sem formulário.** Nenhuma API route, nenhum segredo, nenhuma dependência de serviço externo em runtime.
- **Nenhum texto voltado ao usuário dentro de componente.** Todo texto vem de `src/content/` (conteúdo pessoal) ou `src/content/ui.ts` (rótulos de interface). Um literal de texto em componente é motivo de rejeição em review.
- **Todo texto é bilíngue.** Tipo `Localized = { pt: string; en: string }`, incluindo textos `alt` de imagem.
- **TypeScript strict.** Sem `any`, sem `@ts-ignore`.
- **Locales:** exatamente `['pt', 'en']`, padrão `pt`. `dynamicParams = false`.
- **Cor de destaque:** verde-musgo — `#3D5A45` no tema claro, `#9CBFA3` no tema escuro. É a única cor forte do site.
- **Tipografia:** Instrument Serif (títulos), Inter (corpo), JetBrains Mono (tags, períodos, números). Carregadas por `next/font/google` (self-hosted no build).
- **Contraste mínimo AA** em ambos os temas.
- **Movimento** sempre desativado sob `prefers-reduced-motion`.
- **Datas** armazenadas como `'YYYY-MM'`; formatação por idioma em `src/lib/date.ts`, sem depender de ICU.
- **Commits em português**, prefixo convencional (`feat:`, `test:`, `chore:`, `docs:`, `style:`).

## Mapa de arquivos

| Arquivo | Responsabilidade | Task |
|---|---|---|
| `src/lib/i18n.ts` | Locales, tipo `Localized`, `t()`, `isLocale()` | 1 |
| `src/content/types.ts` | Contratos de todo dado de conteúdo | 2 |
| `src/content/ui.ts` | Rótulos de interface traduzidos | 2 |
| `src/lib/date.ts` | Formatação e ordenação de períodos | 2 |
| `src/content/{profile,experience,projects,skills,education}.ts` | Dados pessoais | 3 |
| `src/content/content.test.ts` | Invariantes de conteúdo | 3 |
| `src/lib/fonts.ts` | Fontes e script anti-flash de tema | 5 |
| `next.config.ts` | Redirect `/` → `/pt` | 4 |
| `src/app/[locale]/layout.tsx` | Layout raiz: documento, `lang`, validação de locale | 4 |
| `src/app/[locale]/page.tsx` | Montagem das seções | 4, 11 |
| `src/app/globals.css` | Tokens de cor, temas, tipografia base | 5 |
| `src/components/ui/*` | `Section`, `Tag`, `SkipLink`, `ThemeToggle`, `LocaleSwitch`, `TopBar` | 5, 6 |
| `src/components/sections/*` | Uma seção da página por arquivo | 7–11 |
| `src/lib/site.ts`, `src/lib/seo.ts` | URL do site e JSON-LD | 12 |
| `src/app/sitemap.ts`, `src/app/robots.ts` | Descoberta por buscador | 12 |
| `tests/e2e/smoke.spec.ts` | Smoke bilíngue ponta a ponta | 13 |
| `.github/workflows/ci.yml` | typecheck + lint + test + build | 13 |
| `README.md` | Como manter o conteúdo | 14 |

---

### Task 1: Scaffold, ferramentas de teste e helper de i18n

**Files:**
- Create: projeto Next.js na raiz (`package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `src/app/*`)
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Create: `src/lib/i18n.ts`
- Test: `src/lib/i18n.test.ts`

**Interfaces:**
- Consumes: nada (primeira task).
- Produces: `src/lib/i18n.ts` exportando `locales`, `Locale`, `Localized`, `defaultLocale`, `isLocale(value: string): value is Locale`, `t(value: Localized, locale: Locale): string`, `otherLocale(locale: Locale): Locale`, `htmlLang: Record<Locale, string>`. **`Localized` é definido aqui**, não em `content/types.ts` — todas as outras tasks importam de `@/lib/i18n` ou do re-export em `@/content/types`.

- [ ] **Step 1: Criar o projeto Next.js na raiz**

O diretório já contém `docs/` e `.git` — isso não conflita com o scaffold.

```bash
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

- [ ] **Step 2: Verificar que o scaffold roda**

```bash
npm run build
```
Esperado: build conclui sem erro. Se o scaffold gerou `src/app/page.tsx` com a home padrão, tudo bem — ela é substituída na Task 4.

- [ ] **Step 3: Instalar as ferramentas de teste**

```bash
npm i -D vitest @vitejs/plugin-react jsdom vite-tsconfig-paths @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 4: Configurar o Vitest**

Criar `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
```

Criar `vitest.setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => cleanup())
```

Adicionar os scripts em `package.json` (mantendo os que o scaffold criou):

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 5: Escrever o teste que falha**

Criar `src/lib/i18n.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { htmlLang, isLocale, locales, otherLocale, t } from '@/lib/i18n'

describe('i18n', () => {
  it('expõe exatamente os locales pt e en', () => {
    expect(locales).toEqual(['pt', 'en'])
  })

  it('reconhece locales válidos', () => {
    expect(isLocale('pt')).toBe(true)
    expect(isLocale('en')).toBe(true)
  })

  it('rejeita locale inválido', () => {
    expect(isLocale('es')).toBe(false)
    expect(isLocale('')).toBe(false)
    expect(isLocale('PT')).toBe(false)
  })

  it('escolhe o texto do locale pedido', () => {
    const valor = { pt: 'Olá', en: 'Hello' }
    expect(t(valor, 'pt')).toBe('Olá')
    expect(t(valor, 'en')).toBe('Hello')
  })

  it('devolve o outro locale', () => {
    expect(otherLocale('pt')).toBe('en')
    expect(otherLocale('en')).toBe('pt')
  })

  it('mapeia locale para o atributo lang do documento', () => {
    expect(htmlLang.pt).toBe('pt-BR')
    expect(htmlLang.en).toBe('en')
  })
})
```

- [ ] **Step 6: Rodar o teste e confirmar que falha**

Run: `npm test`
Esperado: FAIL — `Failed to resolve import "@/lib/i18n"`.

- [ ] **Step 7: Implementar o helper**

Criar `src/lib/i18n.ts`:

```ts
export const locales = ['pt', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'pt'

/** Todo texto voltado ao usuário tem esta forma. Faltar uma chave quebra o build. */
export type Localized = { pt: string; en: string }

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

export function t(value: Localized, locale: Locale): string {
  return value[locale]
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'pt' ? 'en' : 'pt'
}

export const htmlLang: Record<Locale, string> = { pt: 'pt-BR', en: 'en' }
```

- [ ] **Step 8: Rodar os testes e confirmar que passam**

Run: `npm test && npm run typecheck`
Esperado: 6 testes passando, typecheck limpo.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold do projeto, Vitest e helper de i18n"
```

---

### Task 2: Contratos de conteúdo, rótulos de interface e formatação de datas

**Files:**
- Create: `src/content/types.ts`
- Create: `src/content/ui.ts`
- Create: `src/lib/date.ts`
- Test: `src/lib/date.test.ts`

**Interfaces:**
- Consumes: `Locale`, `Localized`, `t` de `@/lib/i18n`.
- Produces:
  - `@/content/types`: `Period`, `Profile`, `Experience`, `Project`, `SkillLevel`, `SkillGroup`, `Education`, `Certificate`, e re-export de `Localized`.
  - `@/content/ui`: constante `ui` (árvore de `Localized`).
  - `@/lib/date`: `formatMonth(value: string, locale: Locale): string`, `formatPeriod(period: Period, locale: Locale): string`, `sortByPeriodDesc<T extends { period: Period }>(items: readonly T[]): T[]`, `isValidMonth(value: string): boolean`.

- [ ] **Step 1: Definir os contratos de conteúdo**

Criar `src/content/types.ts`:

```ts
import type { Localized } from '@/lib/i18n'

export type { Localized }

/** Datas em 'YYYY-MM'. `end: null` significa "até hoje". */
export type Period = { start: string; end: string | null }

export type Profile = {
  name: string
  headline: Localized
  bio: Localized[]
  location: Localized
  intent: Localized
  links: {
    github: string
    linkedin: string
    email: string
    whatsapp?: string
  }
  /** Caminhos dos PDFs em /public, um por idioma. */
  cv: { pt: string; en: string }
}

export type Experience = {
  id: string
  role: Localized
  organization: string
  organizationUrl?: string
  period: Period
  /** 2 a 3 bullets de impacto: o que mudou, não que tarefa foi feita. */
  highlights: Localized[]
  tech?: string[]
}

export type Project = {
  slug: string
  title: string
  summary: Localized
  description: Localized
  tech: string[]
  role: Localized
  period: Period
  links: { repo?: string; demo?: string }
  image?: { src: string; alt: Localized; width: number; height: number }
  featured: boolean
  /** Não renderizado nesta versão; habilita páginas de detalhe no futuro. */
  caseStudy?: Localized
}

export type SkillLevel = 'core' | 'used' | 'learning'

export type SkillGroup = { level: SkillLevel; items: string[] }

export type Education = {
  institution: string
  degree: Localized
  period: Period
  status: Localized
}

export type Certificate = {
  title: Localized
  issuer: string
  /** 'YYYY-MM' */
  date: string
  credentialUrl?: string
}
```

- [ ] **Step 2: Escrever os rótulos de interface**

Criar `src/content/ui.ts`:

```ts
import type { Localized } from '@/lib/i18n'

type LocalizedTree = { [key: string]: Localized | LocalizedTree }

export const ui = {
  skipToContent: { pt: 'Pular para o conteúdo', en: 'Skip to content' },
  present: { pt: 'atual', en: 'present' },
  sections: {
    about: { pt: 'Sobre', en: 'About' },
    experience: { pt: 'Experiência', en: 'Experience' },
    projects: { pt: 'Projetos', en: 'Projects' },
    skills: { pt: 'Habilidades', en: 'Skills' },
    education: { pt: 'Formação', en: 'Education' },
    certificates: { pt: 'Certificados', en: 'Certificates' },
    contact: { pt: 'Contato', en: 'Contact' },
  },
  actions: {
    downloadCv: { pt: 'Baixar currículo', en: 'Download résumé' },
    viewRepo: { pt: 'Ver código', en: 'View code' },
    viewDemo: { pt: 'Ver demo', en: 'View demo' },
    verifyCredential: { pt: 'Verificar credencial', en: 'Verify credential' },
    switchLanguage: { pt: 'Ver em inglês', en: 'Ver em português' },
    toggleTheme: { pt: 'Alternar tema', en: 'Toggle theme' },
  },
  skillLevels: {
    core: { pt: 'Uso em projetos', en: 'Use in projects' },
    used: { pt: 'Já usei', en: 'Have used' },
    learning: { pt: 'Estudando agora', en: 'Currently learning' },
  },
} satisfies LocalizedTree
```

Nota sobre `switchLanguage`: o rótulo está invertido de propósito — quando a página está em `pt`, o botão leva ao inglês.

- [ ] **Step 3: Escrever o teste de datas que falha**

Criar `src/lib/date.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { formatMonth, formatPeriod, isValidMonth, sortByPeriodDesc } from '@/lib/date'

describe('formatMonth', () => {
  it('formata mês e ano em português', () => {
    expect(formatMonth('2024-02', 'pt')).toBe('fev 2024')
  })

  it('formata mês e ano em inglês', () => {
    expect(formatMonth('2024-02', 'en')).toBe('Feb 2024')
  })

  it('formata dezembro corretamente nos dois idiomas', () => {
    expect(formatMonth('2023-12', 'pt')).toBe('dez 2023')
    expect(formatMonth('2023-12', 'en')).toBe('Dec 2023')
  })
})

describe('formatPeriod', () => {
  it('formata período fechado', () => {
    expect(formatPeriod({ start: '2023-01', end: '2024-06' }, 'pt')).toBe('jan 2023 — jun 2024')
  })

  it('usa o rótulo de "atual" quando não há data final', () => {
    expect(formatPeriod({ start: '2024-03', end: null }, 'pt')).toBe('mar 2024 — atual')
    expect(formatPeriod({ start: '2024-03', end: null }, 'en')).toBe('Mar 2024 — present')
  })
})

describe('sortByPeriodDesc', () => {
  it('ordena do mais recente para o mais antigo', () => {
    const itens = [
      { id: 'antigo', period: { start: '2022-01', end: '2022-12' } },
      { id: 'novo', period: { start: '2025-02', end: null } },
      { id: 'meio', period: { start: '2023-08', end: '2024-01' } },
    ]
    expect(sortByPeriodDesc(itens).map((i) => i.id)).toEqual(['novo', 'meio', 'antigo'])
  })

  it('não muta o array original', () => {
    const itens = [
      { id: 'a', period: { start: '2022-01', end: null } },
      { id: 'b', period: { start: '2024-01', end: null } },
    ]
    sortByPeriodDesc(itens)
    expect(itens.map((i) => i.id)).toEqual(['a', 'b'])
  })
})

describe('isValidMonth', () => {
  it('aceita YYYY-MM', () => {
    expect(isValidMonth('2024-01')).toBe(true)
    expect(isValidMonth('2024-12')).toBe(true)
  })

  it('rejeita formatos inválidos', () => {
    expect(isValidMonth('2024-13')).toBe(false)
    expect(isValidMonth('2024-00')).toBe(false)
    expect(isValidMonth('2024')).toBe(false)
    expect(isValidMonth('01/2024')).toBe(false)
  })
})
```

- [ ] **Step 4: Rodar e confirmar que falha**

Run: `npm test src/lib/date.test.ts`
Esperado: FAIL — `Failed to resolve import "@/lib/date"`.

- [ ] **Step 5: Implementar a formatação de datas**

Criar `src/lib/date.ts`. Os nomes de mês são tabelados de propósito: não dependem da versão de ICU do Node, então o teste é determinístico em qualquer máquina.

```ts
import { ui } from '@/content/ui'
import type { Period } from '@/content/types'
import { type Locale, t } from '@/lib/i18n'

const MONTHS: Record<Locale, readonly string[]> = {
  pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

export function isValidMonth(value: string): boolean {
  return MONTH_PATTERN.test(value)
}

export function formatMonth(value: string, locale: Locale): string {
  const [year, month] = value.split('-')
  return `${MONTHS[locale][Number(month) - 1]} ${year}`
}

export function formatPeriod(period: Period, locale: Locale): string {
  const start = formatMonth(period.start, locale)
  const end = period.end ? formatMonth(period.end, locale) : t(ui.present, locale)
  return `${start} — ${end}`
}

export function sortByPeriodDesc<T extends { period: Period }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => b.period.start.localeCompare(a.period.start))
}
```

- [ ] **Step 6: Rodar os testes e o typecheck**

Run: `npm test && npm run typecheck`
Esperado: tudo passando.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: contratos de conteúdo, rótulos de interface e formatação de datas"
```

---

### Task 3: Arquivos de conteúdo e testes de invariante

**Files:**
- Create: `src/content/profile.ts`, `src/content/experience.ts`, `src/content/projects.ts`, `src/content/skills.ts`, `src/content/education.ts`
- Create: `public/cv/curriculo-pt.pdf`, `public/cv/resume-en.pdf` (arquivos reais fornecidos pela pessoa dona do portfólio)
- Test: `src/content/content.test.ts`

**Interfaces:**
- Consumes: tipos de `@/content/types`, `isValidMonth` de `@/lib/date`.
- Produces: `profile: Profile`, `experiences: Experience[]`, `projects: Project[]`, `skillGroups: SkillGroup[]`, `education: Education`, `certificates: Certificate[]`.

**Sobre o conteúdo real:** se a pessoa dona do portfólio já forneceu os dados (nome, curso, bullets de impacto, projetos, links), use-os. Onde um dado ainda não existir, escreva o valor com o prefixo `PENDENTE:` — o teste que proíbe `PENDENTE:` entra na Task 14, quando o conteúdo final estiver em pé. Tudo o mais (formato, links válidos, os dois idiomas) é cobrado já nesta task.

- [ ] **Step 1: Escrever os arquivos de conteúdo**

Criar `src/content/profile.ts`:

```ts
import type { Profile } from '@/content/types'

export const profile: Profile = {
  name: 'PENDENTE: nome completo',
  headline: {
    pt: 'PENDENTE: Estudante de <curso> · Foco em IA e desenvolvimento web',
    en: 'PENDENTE: <course> student · Focused on AI and web development',
  },
  bio: [
    { pt: 'PENDENTE: parágrafo 1 — de onde vem e o que puxou para tecnologia.', en: 'PENDENTE: paragraph 1.' },
    { pt: 'PENDENTE: parágrafo 2 — o que constrói hoje e como trabalha.', en: 'PENDENTE: paragraph 2.' },
  ],
  location: { pt: 'PENDENTE: Cidade, Estado', en: 'PENDENTE: City, State — Brazil' },
  intent: {
    pt: 'PENDENTE: buscando estágio em <área>.',
    en: 'PENDENTE: looking for an internship in <field>.',
  },
  links: {
    github: 'https://github.com/oliveira-yuri',
    linkedin: 'PENDENTE: https://www.linkedin.com/in/<perfil>',
    email: 'PENDENTE: email@exemplo.com',
  },
  cv: { pt: '/cv/curriculo-pt.pdf', en: '/cv/resume-en.pdf' },
}
```

Criar `src/content/experience.ts`:

```ts
import type { Experience } from '@/content/types'

export const experiences: Experience[] = [
  {
    id: 'assistente-ensino-ia',
    role: { pt: 'Assistente de ensino — IA', en: 'Teaching assistant — AI' },
    organization: 'PENDENTE: instituição',
    period: { start: '2025-01', end: null },
    highlights: [
      { pt: 'PENDENTE: impacto 1 (número de alunos, conteúdo lecionado).', en: 'PENDENTE: impact 1.' },
      { pt: 'PENDENTE: impacto 2 (material produzido, resultado).', en: 'PENDENTE: impact 2.' },
    ],
    tech: ['Python'],
  },
  {
    id: 'freelance',
    role: { pt: 'Desenvolvedor freelance', en: 'Freelance developer' },
    organization: 'PENDENTE: cliente ou "Autônomo"',
    period: { start: '2024-01', end: '2024-12' },
    highlights: [
      { pt: 'PENDENTE: problema do cliente e resultado entregue.', en: 'PENDENTE: client problem and delivered result.' },
    ],
  },
]
```

Criar `src/content/projects.ts`:

```ts
import type { Project } from '@/content/types'

export const projects: Project[] = [
  {
    slug: 'pendente-projeto-1',
    title: 'PENDENTE: nome do projeto',
    summary: { pt: 'PENDENTE: uma linha sobre o que resolve.', en: 'PENDENTE: one line.' },
    description: { pt: 'PENDENTE: parágrafo sobre o problema e a solução.', en: 'PENDENTE: paragraph.' },
    tech: ['TypeScript'],
    role: { pt: 'Projeto pessoal', en: 'Personal project' },
    period: { start: '2025-06', end: null },
    links: { repo: 'https://github.com/oliveira-yuri' },
    featured: true,
  },
]
```

Criar `src/content/skills.ts`:

```ts
import type { SkillGroup } from '@/content/types'

export const skillGroups: SkillGroup[] = [
  { level: 'core', items: ['Python', 'TypeScript', 'React'] },
  { level: 'used', items: ['Next.js', 'Git', 'SQL'] },
  { level: 'learning', items: ['LLMs', 'Docker'] },
]
```

Criar `src/content/education.ts`:

```ts
import type { Certificate, Education } from '@/content/types'

export const education: Education = {
  institution: 'PENDENTE: instituição',
  degree: { pt: 'PENDENTE: nome do curso', en: 'PENDENTE: course name' },
  period: { start: '2024-02', end: '2027-12' },
  status: { pt: 'Em andamento', en: 'In progress' },
}

export const certificates: Certificate[] = []
```

- [ ] **Step 2: Colocar os PDFs de currículo**

Salvar os dois arquivos em `public/cv/curriculo-pt.pdf` e `public/cv/resume-en.pdf`. Se ainda não existirem, criar arquivos PDF válidos de uma página com o texto "PENDENTE" — o teste do Step 3 exige que os caminhos existam, e o conteúdo definitivo entra na Task 14.

- [ ] **Step 3: Escrever os testes de invariante**

Este é o teste de maior valor do projeto: num site estático, o erro provável é conteúdo malformado, não lógica.

Criar `src/content/content.test.ts`:

```ts
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { certificates, education } from '@/content/education'
import { experiences } from '@/content/experience'
import { profile } from '@/content/profile'
import { projects } from '@/content/projects'
import { skillGroups } from '@/content/skills'
import { ui } from '@/content/ui'
import { isValidMonth } from '@/lib/date'
import type { Localized } from '@/lib/i18n'

/** Percorre qualquer estrutura e devolve todo objeto Localized encontrado, com seu caminho. */
function collectLocalized(value: unknown, path = 'root'): Array<{ path: string; value: Localized }> {
  if (value === null || typeof value !== 'object') return []
  const record = value as Record<string, unknown>
  if (typeof record.pt === 'string' && typeof record.en === 'string' && Object.keys(record).length === 2) {
    return [{ path, value: record as Localized }]
  }
  return Object.entries(record).flatMap(([key, child]) => collectLocalized(child, `${path}.${key}`))
}

const allContent = { profile, experiences, projects, skillGroups, education, certificates, ui }
const localizedValues = collectLocalized(allContent)

const publicFile = (path: string) => join(process.cwd(), 'public', path.replace(/^\//, ''))

describe('textos bilíngues', () => {
  it('encontra textos bilíngues para verificar', () => {
    expect(localizedValues.length).toBeGreaterThan(20)
  })

  it('nenhum texto está vazio em nenhum idioma', () => {
    const vazios = localizedValues.filter((v) => v.value.pt.trim() === '' || v.value.en.trim() === '')
    expect(vazios.map((v) => v.path)).toEqual([])
  })
})

describe('projetos', () => {
  it('tem slugs únicos', () => {
    const slugs = projects.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('todo projeto tem ao menos um link', () => {
    const semLink = projects.filter((p) => !p.links.repo && !p.links.demo)
    expect(semLink.map((p) => p.slug)).toEqual([])
  })

  it('toda imagem de projeto existe em public/', () => {
    const faltando = projects.filter((p) => p.image && !existsSync(publicFile(p.image.src)))
    expect(faltando.map((p) => p.slug)).toEqual([])
  })

  it('tem ao menos um projeto em destaque', () => {
    expect(projects.some((p) => p.featured)).toBe(true)
  })
})

describe('períodos', () => {
  const comPeriodo = [
    ...experiences.map((e) => ({ id: e.id, period: e.period })),
    ...projects.map((p) => ({ id: p.slug, period: p.period })),
    { id: 'education', period: education.period },
  ]

  it('usa o formato YYYY-MM', () => {
    const invalidos = comPeriodo.filter(
      (i) => !isValidMonth(i.period.start) || (i.period.end !== null && !isValidMonth(i.period.end)),
    )
    expect(invalidos.map((i) => i.id)).toEqual([])
  })

  it('tem início anterior ao fim', () => {
    const incoerentes = comPeriodo.filter((i) => i.period.end !== null && i.period.start > i.period.end)
    expect(incoerentes.map((i) => i.id)).toEqual([])
  })

  it('usa YYYY-MM nas datas de certificado', () => {
    const invalidos = certificates.filter((c) => !isValidMonth(c.date))
    expect(invalidos.map((c) => c.issuer)).toEqual([])
  })
})

describe('experiências', () => {
  it('tem ids únicos', () => {
    const ids = experiences.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('tem de 1 a 3 bullets de impacto', () => {
    const foraDoLimite = experiences.filter((e) => e.highlights.length < 1 || e.highlights.length > 3)
    expect(foraDoLimite.map((e) => e.id)).toEqual([])
  })
})

describe('perfil', () => {
  it('serve os dois currículos e os arquivos existem', () => {
    expect(existsSync(publicFile(profile.cv.pt))).toBe(true)
    expect(existsSync(publicFile(profile.cv.en))).toBe(true)
  })

  it('tem links externos absolutos', () => {
    expect(profile.links.github).toMatch(/^https:\/\//)
    expect(profile.links.linkedin).toMatch(/^(https:\/\/|PENDENTE)/)
  })

  it('tem ao menos dois parágrafos de bio', () => {
    expect(profile.bio.length).toBeGreaterThanOrEqual(2)
  })
})

describe('habilidades', () => {
  it('cobre os três níveis, sem repetir nível', () => {
    expect(skillGroups.map((g) => g.level)).toEqual(['core', 'used', 'learning'])
  })

  it('não repete a mesma tecnologia em dois níveis', () => {
    const todos = skillGroups.flatMap((g) => g.items)
    expect(new Set(todos).size).toBe(todos.length)
  })
})
```

- [ ] **Step 4: Rodar os testes**

Run: `npm test && npm run typecheck`
Esperado: tudo passando. Se algum teste falhar, corrija o **conteúdo** — não afrouxe o teste.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: arquivos de conteúdo e testes de invariante"
```

---

### Task 4: Rotas, geração estática e validação de locale

**Files:**
- Delete: `src/app/layout.tsx`, `src/app/page.tsx` (gerados pelo scaffold)
- Create: `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`
- Modify: `next.config.ts`
- Test: `src/app/[locale]/params.test.ts`

**Interfaces:**
- Consumes: `locales`, `isLocale`, `htmlLang`, `defaultLocale` de `@/lib/i18n`.
- Produces: `generateStaticParams()` em `src/app/[locale]/layout.tsx` retornando `[{ locale: 'pt' }, { locale: 'en' }]`; `export const dynamicParams = false`. A página em `src/app/[locale]/page.tsx` recebe `params: Promise<{ locale: string }>` (App Router assíncrono) e é substituída pela montagem completa na Task 11.

**Decisão estrutural:** o layout raiz mora em `src/app/[locale]/layout.tsx`, não em `src/app/layout.tsx`. O App Router permite que o layout raiz viva num segmento dinâmico exatamente para este caso — é o único jeito de o atributo `lang` do `<html>` refletir o idioma da página. Como consequência, `src/app/layout.tsx` e `src/app/page.tsx` deixam de existir e o redirect da raiz passa a ser configuração, não página.

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/app/[locale]/params.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { dynamicParams, generateStaticParams } from './layout'

describe('parâmetros estáticos da rota de locale', () => {
  it('gera exatamente pt e en', async () => {
    expect(await generateStaticParams()).toEqual([{ locale: 'pt' }, { locale: 'en' }])
  })

  it('não aceita parâmetros dinâmicos fora dessa lista', () => {
    expect(dynamicParams).toBe(false)
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test src/app`
Esperado: FAIL — arquivo `./layout` não existe.

- [ ] **Step 3: Remover as rotas do scaffold**

```bash
rm src/app/layout.tsx src/app/page.tsx
```

Mantenha `src/app/globals.css` — ele passa a ser importado pelo layout de locale.

- [ ] **Step 4: Configurar o redirect da raiz**

Substituir `next.config.ts`:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: '/', destination: '/pt', permanent: true }]
  },
}

export default nextConfig
```

- [ ] **Step 5: Criar o layout raiz de locale**

Criar `src/app/[locale]/layout.tsx`:

```tsx
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { htmlLang, isLocale, locales } from '@/lib/i18n'
import '../globals.css'

export const dynamicParams = false

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <html lang={htmlLang[locale]}>
      <body>{children}</body>
    </html>
  )
}
```

`generateStaticParams` é síncrona; o teste usa `await` sobre o retorno, o que funciona nos dois casos.

- [ ] **Step 6: Criar a página provisória**

Criar `src/app/[locale]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { profile } from '@/content/profile'
import { isLocale } from '@/lib/i18n'

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return <main id="main">{profile.name}</main>
}
```

- [ ] **Step 7: Rodar testes e build**

Run: `npm test && npm run typecheck && npm run build`
Esperado: testes passando e, na saída do build, as rotas `/pt` e `/en` marcadas como estáticas (`●` ou `○`).

Se o build reclamar de layout raiz ausente para a página de 404, criar `src/app/not-found.tsx` emitindo um documento mínimo próprio:

```tsx
export default function NotFound() {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: 'system-ui', padding: '4rem' }}>404</body>
    </html>
  )
}
```

- [ ] **Step 8: Verificar as rotas no navegador**

Run: `npm run dev`, abrir `http://localhost:3000` (deve redirecionar para `/pt`), `http://localhost:3000/en`, e `http://localhost:3000/es` (deve dar 404).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: rotas estáticas por idioma com validação de locale"
```

---

### Task 5: Tokens de design, tipografia e tema claro/escuro

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/lib/fonts.ts`
- Modify: `src/app/[locale]/layout.tsx`
- Create: `src/components/ui/SkipLink.tsx`
- Create: `src/components/ui/ThemeToggle.tsx`
- Test: `src/components/ui/ThemeToggle.test.tsx`, `src/components/ui/SkipLink.test.tsx`

**Interfaces:**
- Consumes: `ui` de `@/content/ui`, `t`/`Locale` de `@/lib/i18n`.
- Produces: `SkipLink({ locale }: { locale: Locale })`, `ThemeToggle({ locale }: { locale: Locale })` (componente cliente), e as classes utilitárias de tokens: `bg-surface`, `bg-raised`, `text-ink`, `text-muted`, `border-line`, `text-accent`, `bg-accent`, `font-serif`, `font-sans`, `font-mono`.

- [ ] **Step 1: Escrever os tokens e a base tipográfica**

Substituir `src/app/globals.css`:

```css
@import 'tailwindcss';

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --surface: #faf9f6;
  --raised: #ffffff;
  --ink: #1a1a18;
  --muted: #5f5e55;
  --line: #e2e0d8;
  --accent: #3d5a45;
}

.dark {
  --surface: #131512;
  --raised: #1b1e1a;
  --ink: #edebe3;
  --muted: #a3a198;
  --line: #2c302b;
  --accent: #9cbfa3;
}

@theme inline {
  --color-surface: var(--surface);
  --color-raised: var(--raised);
  --color-ink: var(--ink);
  --color-muted: var(--muted);
  --color-line: var(--line);
  --color-accent: var(--accent);

  --font-sans: var(--font-inter);
  --font-serif: var(--font-instrument-serif);
  --font-mono: var(--font-jetbrains-mono);
}

body {
  background-color: var(--surface);
  color: var(--ink);
  font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Carregar as fontes e o script anti-flash**

Criar `src/lib/fonts.ts`. Arquivos de rota do App Router só aceitam exports conhecidos — por isso as fontes moram numa lib, não no layout.

```ts
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-instrument-serif',
  display: 'swap',
})
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' })

export const fontClassName = `${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`

/** Aplica o tema antes da primeira pintura, para a página não piscar. */
export const themeScript = `try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}`
```

Atualizar `src/app/[locale]/layout.tsx` para usar os dois — trocar apenas o `return`:

```tsx
  return (
    <html lang={htmlLang[locale]} className={fontClassName} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-surface text-ink">{children}</body>
    </html>
  )
```

E adicionar o import: `import { fontClassName, themeScript } from '@/lib/fonts'`.

- [ ] **Step 3: Escrever os testes que falham**

Criar `src/components/ui/SkipLink.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SkipLink } from '@/components/ui/SkipLink'

describe('SkipLink', () => {
  it('aponta para o conteúdo principal, no idioma da página', () => {
    render(<SkipLink locale="pt" />)
    const link = screen.getByRole('link', { name: 'Pular para o conteúdo' })
    expect(link).toHaveAttribute('href', '#main')
  })

  it('traduz para inglês', () => {
    render(<SkipLink locale="en" />)
    expect(screen.getByRole('link', { name: 'Skip to content' })).toBeInTheDocument()
  })
})
```

Criar `src/components/ui/ThemeToggle.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark')
    localStorage.clear()
  })

  it('tem rótulo acessível traduzido', () => {
    render(<ThemeToggle locale="pt" />)
    expect(screen.getByRole('button', { name: 'Alternar tema' })).toBeInTheDocument()
  })

  it('liga o tema escuro e registra a escolha', async () => {
    render(<ThemeToggle locale="pt" />)
    await userEvent.click(screen.getByRole('button', { name: 'Alternar tema' }))

    expect(document.documentElement).toHaveClass('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
  })

  it('volta para o tema claro no segundo clique', async () => {
    render(<ThemeToggle locale="pt" />)
    const botao = screen.getByRole('button', { name: 'Alternar tema' })

    await userEvent.click(botao)
    await userEvent.click(botao)

    expect(document.documentElement).not.toHaveClass('dark')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('comunica o estado por aria-pressed', async () => {
    render(<ThemeToggle locale="pt" />)
    const botao = screen.getByRole('button', { name: 'Alternar tema' })

    expect(botao).toHaveAttribute('aria-pressed', 'false')
    await userEvent.click(botao)
    expect(botao).toHaveAttribute('aria-pressed', 'true')
  })
})
```

- [ ] **Step 4: Rodar e confirmar que falham**

Run: `npm test src/components`
Esperado: FAIL — módulos não encontrados.

- [ ] **Step 5: Implementar os dois componentes**

Criar `src/components/ui/SkipLink.tsx`:

```tsx
import { ui } from '@/content/ui'
import { type Locale, t } from '@/lib/i18n'

export function SkipLink({ locale }: { locale: Locale }) {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-raised focus:px-4 focus:py-2 focus:text-ink"
    >
      {t(ui.skipToContent, locale)}
    </a>
  )
}
```

Criar `src/components/ui/ThemeToggle.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { ui } from '@/content/ui'
import { type Locale, t } from '@/lib/i18n'

export function ThemeToggle({ locale }: { locale: Locale }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={t(ui.actions.toggleTheme, locale)}
      className="rounded border border-line px-2 py-1 font-mono text-xs text-muted transition-colors hover:text-ink"
    >
      {dark ? '☀' : '☾'}
    </button>
  )
}
```

- [ ] **Step 6: Rodar os testes**

Run: `npm test && npm run typecheck && npm run build`
Esperado: tudo passando.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: tokens de design, tipografia e tema claro/escuro"
```

---

### Task 6: Componentes de interface compartilhados

**Files:**
- Create: `src/components/ui/Section.tsx`, `src/components/ui/Tag.tsx`, `src/components/ui/LocaleSwitch.tsx`, `src/components/ui/TopBar.tsx`
- Test: `src/components/ui/Section.test.tsx`, `src/components/ui/LocaleSwitch.test.tsx`

**Interfaces:**
- Consumes: `SkipLink`, `ThemeToggle` (Task 5); `ui`; `t`, `Locale`, `otherLocale`.
- Produces:
  - `Section({ id, title, children }: { id: string; title: string; children: ReactNode })` — emite `<section>` com `<h2>` e `aria-labelledby`.
  - `Tag({ children }: { children: ReactNode })` — emite `<li>`; use sempre dentro de `<ul>`.
  - `LocaleSwitch({ locale }: { locale: Locale })` — componente cliente.
  - `TopBar({ locale }: { locale: Locale })`.

- [ ] **Step 1: Escrever os testes que falham**

Criar `src/components/ui/Section.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Section } from '@/components/ui/Section'

describe('Section', () => {
  it('expõe uma região nomeada pelo próprio título', () => {
    render(
      <Section id="projetos" title="Projetos">
        <p>conteúdo</p>
      </Section>,
    )

    const regiao = screen.getByRole('region', { name: 'Projetos' })
    expect(regiao).toHaveAttribute('id', 'projetos')
    expect(screen.getByRole('heading', { level: 2, name: 'Projetos' })).toBeInTheDocument()
    expect(screen.getByText('conteúdo')).toBeInTheDocument()
  })
})
```

Criar `src/components/ui/LocaleSwitch.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LocaleSwitch } from '@/components/ui/LocaleSwitch'

vi.mock('next/navigation', () => ({ usePathname: () => '/pt' }))

describe('LocaleSwitch', () => {
  beforeEach(() => {
    window.location.hash = ''
  })

  it('aponta para a mesma página no outro idioma', () => {
    render(<LocaleSwitch locale="pt" />)

    const link = screen.getByRole('link', { name: 'Ver em inglês' })
    expect(link).toHaveAttribute('href', '/en')
    expect(link).toHaveAttribute('hreflang', 'en')
    expect(link).toHaveTextContent('EN')
  })

  it('preserva a âncora atual ao trocar de idioma', () => {
    window.location.hash = '#projetos'
    render(<LocaleSwitch locale="pt" />)

    expect(screen.getByRole('link', { name: 'Ver em inglês' })).toHaveAttribute('href', '/en#projetos')
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `npm test src/components/ui/Section.test.tsx src/components/ui/LocaleSwitch.test.tsx`
Esperado: FAIL — módulos não encontrados.

- [ ] **Step 3: Implementar Section e Tag**

Criar `src/components/ui/Section.tsx`:

```tsx
import type { ReactNode } from 'react'

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-line py-16 md:py-24">
      <h2 id={`${id}-title`} className="font-serif text-3xl text-ink md:text-4xl">
        {title}
      </h2>
      <div className="mt-8">{children}</div>
    </section>
  )
}
```

Criar `src/components/ui/Tag.tsx`:

```tsx
import type { ReactNode } from 'react'

/** Sempre usado dentro de <ul>. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <li className="rounded border border-line px-2 py-1 font-mono text-xs tracking-wide text-muted">{children}</li>
  )
}
```

- [ ] **Step 4: Implementar LocaleSwitch**

Criar `src/components/ui/LocaleSwitch.tsx`. A âncora é lida depois da montagem porque não existe no servidor — assim trocar de idioma no meio da página não devolve o visitante ao topo.

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ui } from '@/content/ui'
import { type Locale, otherLocale, t } from '@/lib/i18n'

export function LocaleSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname()
  const [hash, setHash] = useState('')

  useEffect(() => {
    setHash(window.location.hash)
  }, [])

  const target = otherLocale(locale)
  const href = `${pathname.replace(`/${locale}`, `/${target}`)}${hash}`

  return (
    <Link
      href={href}
      hrefLang={target}
      aria-label={t(ui.actions.switchLanguage, locale)}
      className="rounded border border-line px-2 py-1 font-mono text-xs text-muted transition-colors hover:text-ink"
    >
      {target.toUpperCase()}
    </Link>
  )
}
```

- [ ] **Step 5: Implementar TopBar**

Criar `src/components/ui/TopBar.tsx`:

```tsx
import { LocaleSwitch } from '@/components/ui/LocaleSwitch'
import { SkipLink } from '@/components/ui/SkipLink'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import type { Locale } from '@/lib/i18n'

export function TopBar({ locale }: { locale: Locale }) {
  return (
    <header className="flex items-center justify-end gap-2 py-6">
      <SkipLink locale={locale} />
      <LocaleSwitch locale={locale} />
      <ThemeToggle locale={locale} />
    </header>
  )
}
```

- [ ] **Step 6: Rodar os testes**

Run: `npm test && npm run typecheck`
Esperado: tudo passando.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: componentes de interface compartilhados"
```

---

### Task 7: Seções Hero e Sobre

**Files:**
- Create: `src/components/sections/HeroSection.tsx`, `src/components/sections/AboutSection.tsx`
- Test: `src/components/sections/HeroSection.test.tsx`, `src/components/sections/AboutSection.test.tsx`
- Create: `src/test/fixtures.ts`

**Interfaces:**
- Consumes: `Profile` de `@/content/types`; `ui`; `t`, `Locale`.
- Produces:
  - `src/test/fixtures.ts`: `profileFixture: Profile`, `experienceFixture: Experience[]`, `projectFixture: Project[]`, `skillGroupsFixture: SkillGroup[]`, `educationFixture: Education`, `certificatesFixture: Certificate[]` — usados por todos os testes de seção das Tasks 7–11.
  - `HeroSection({ locale, profile }: { locale: Locale; profile: Profile })` — contém o **único** `<h1>` da página.
  - `AboutSection({ locale, profile }: { locale: Locale; profile: Profile })`.

- [ ] **Step 1: Criar as fixtures de teste**

Criar `src/test/fixtures.ts`. As fixtures são deliberadamente diferentes do conteúdo real, para que um teste nunca passe por acidente ao ler o conteúdo de produção.

```ts
import type { Certificate, Education, Experience, Profile, Project, SkillGroup } from '@/content/types'

export const profileFixture: Profile = {
  name: 'Fulano de Tal',
  headline: { pt: 'Estudante de Sistemas', en: 'Systems student' },
  bio: [
    { pt: 'Primeiro parágrafo da bio.', en: 'First bio paragraph.' },
    { pt: 'Segundo parágrafo da bio.', en: 'Second bio paragraph.' },
  ],
  location: { pt: 'São Paulo, SP', en: 'São Paulo, Brazil' },
  intent: { pt: 'Buscando estágio em dados.', en: 'Looking for a data internship.' },
  links: {
    github: 'https://github.com/fulano',
    linkedin: 'https://www.linkedin.com/in/fulano',
    email: 'fulano@exemplo.com',
  },
  cv: { pt: '/cv/curriculo-pt.pdf', en: '/cv/resume-en.pdf' },
}

export const experienceFixture: Experience[] = [
  {
    id: 'monitoria',
    role: { pt: 'Monitor de IA', en: 'AI teaching assistant' },
    organization: 'Instituto Exemplo',
    organizationUrl: 'https://exemplo.edu',
    period: { start: '2025-02', end: null },
    highlights: [
      { pt: 'Acompanhou 60 alunos.', en: 'Supported 60 students.' },
      { pt: 'Produziu 12 aulas práticas.', en: 'Produced 12 hands-on classes.' },
    ],
    tech: ['Python'],
  },
  {
    id: 'freela',
    role: { pt: 'Desenvolvedor freelance', en: 'Freelance developer' },
    organization: 'Autônomo',
    period: { start: '2023-05', end: '2024-03' },
    highlights: [{ pt: 'Entregou um site institucional.', en: 'Delivered a company website.' }],
  },
]

export const projectFixture: Project[] = [
  {
    slug: 'analisador',
    title: 'Analisador de Notas',
    summary: { pt: 'Resume boletins automaticamente.', en: 'Summarizes report cards automatically.' },
    description: { pt: 'Descrição longa do projeto.', en: 'Long project description.' },
    tech: ['Python', 'FastAPI'],
    role: { pt: 'Projeto pessoal', en: 'Personal project' },
    period: { start: '2025-01', end: '2025-04' },
    links: { repo: 'https://github.com/fulano/analisador', demo: 'https://analisador.exemplo.com' },
    image: { src: '/images/projects/analisador.png', alt: { pt: 'Tela do analisador', en: 'Analyzer screen' }, width: 1200, height: 750 },
    featured: true,
  },
  {
    slug: 'sem-demo',
    title: 'CLI de Estudos',
    summary: { pt: 'Organiza sessões de estudo.', en: 'Organizes study sessions.' },
    description: { pt: 'Outra descrição.', en: 'Another description.' },
    tech: ['TypeScript'],
    role: { pt: 'Projeto pessoal', en: 'Personal project' },
    period: { start: '2024-08', end: '2024-11' },
    links: { repo: 'https://github.com/fulano/cli' },
    featured: false,
  },
]

export const skillGroupsFixture: SkillGroup[] = [
  { level: 'core', items: ['Python', 'TypeScript'] },
  { level: 'used', items: ['SQL'] },
  { level: 'learning', items: ['Docker'] },
]

export const educationFixture: Education = {
  institution: 'Instituto Exemplo',
  degree: { pt: 'Sistemas de Informação', en: 'Information Systems' },
  period: { start: '2024-02', end: '2027-12' },
  status: { pt: 'Em andamento', en: 'In progress' },
}

export const certificatesFixture: Certificate[] = [
  {
    title: { pt: 'Fundamentos de IA', en: 'AI Foundations' },
    issuer: 'Exemplo Academy',
    date: '2025-03',
    credentialUrl: 'https://exemplo.com/credencial/1',
  },
  { title: { pt: 'SQL Aplicado', en: 'Applied SQL' }, issuer: 'Exemplo Academy', date: '2024-09' },
]
```

- [ ] **Step 2: Escrever os testes que falham**

Criar `src/components/sections/HeroSection.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HeroSection } from '@/components/sections/HeroSection'
import { profileFixture } from '@/test/fixtures'

describe('HeroSection', () => {
  it('mostra nome e headline com um único h1', () => {
    render(<HeroSection locale="pt" profile={profileFixture} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Fulano de Tal' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByText('Estudante de Sistemas')).toBeInTheDocument()
  })

  it('oferece currículo, GitHub, LinkedIn e e-mail', () => {
    render(<HeroSection locale="pt" profile={profileFixture} />)

    expect(screen.getByRole('link', { name: 'Baixar currículo' })).toHaveAttribute('href', '/cv/curriculo-pt.pdf')
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/fulano')
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/fulano')
    expect(screen.getByRole('link', { name: 'fulano@exemplo.com' })).toHaveAttribute(
      'href',
      'mailto:fulano@exemplo.com',
    )
  })

  it('serve o currículo em inglês quando a página está em inglês', () => {
    render(<HeroSection locale="en" profile={profileFixture} />)

    expect(screen.getByRole('link', { name: 'Download résumé' })).toHaveAttribute('href', '/cv/resume-en.pdf')
    expect(screen.getByText('Systems student')).toBeInTheDocument()
  })
})
```

Criar `src/components/sections/AboutSection.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AboutSection } from '@/components/sections/AboutSection'
import { profileFixture } from '@/test/fixtures'

describe('AboutSection', () => {
  it('renderiza todos os parágrafos da bio e a intenção', () => {
    render(<AboutSection locale="pt" profile={profileFixture} />)

    expect(screen.getByRole('region', { name: 'Sobre' })).toBeInTheDocument()
    expect(screen.getByText('Primeiro parágrafo da bio.')).toBeInTheDocument()
    expect(screen.getByText('Segundo parágrafo da bio.')).toBeInTheDocument()
    expect(screen.getByText('Buscando estágio em dados.')).toBeInTheDocument()
  })

  it('traduz o conteúdo', () => {
    render(<AboutSection locale="en" profile={profileFixture} />)

    expect(screen.getByRole('region', { name: 'About' })).toBeInTheDocument()
    expect(screen.getByText('First bio paragraph.')).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Rodar e confirmar que falham**

Run: `npm test src/components/sections`
Esperado: FAIL — módulos não encontrados.

- [ ] **Step 4: Implementar HeroSection**

Criar `src/components/sections/HeroSection.tsx`:

```tsx
import type { Profile } from '@/content/types'
import { ui } from '@/content/ui'
import { type Locale, t } from '@/lib/i18n'

const linkClass = 'border-b border-line pb-0.5 transition-colors hover:border-accent hover:text-accent'

export function HeroSection({ locale, profile }: { locale: Locale; profile: Profile }) {
  return (
    <section id="inicio" aria-labelledby="hero-title" className="py-16 md:py-24">
      <p className="font-mono text-xs tracking-widest text-muted uppercase">{t(profile.location, locale)}</p>
      <h1 id="hero-title" className="mt-4 font-serif text-5xl leading-[1.05] text-ink md:text-7xl">
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
```

- [ ] **Step 5: Implementar AboutSection**

Criar `src/components/sections/AboutSection.tsx`:

```tsx
import { Section } from '@/components/ui/Section'
import type { Profile } from '@/content/types'
import { ui } from '@/content/ui'
import { type Locale, t } from '@/lib/i18n'

export function AboutSection({ locale, profile }: { locale: Locale; profile: Profile }) {
  return (
    <Section id="sobre" title={t(ui.sections.about, locale)}>
      <div className="max-w-[65ch] space-y-5 text-lg">
        {profile.bio.map((paragrafo) => (
          <p key={paragrafo.pt}>{t(paragrafo, locale)}</p>
        ))}
        <p className="font-serif text-xl text-accent">{t(profile.intent, locale)}</p>
      </div>
    </Section>
  )
}
```

- [ ] **Step 6: Rodar os testes**

Run: `npm test && npm run typecheck`
Esperado: tudo passando.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: seções de abertura e sobre"
```

---

### Task 8: Seção de experiência

**Files:**
- Create: `src/components/sections/ExperienceSection.tsx`
- Test: `src/components/sections/ExperienceSection.test.tsx`

**Interfaces:**
- Consumes: `Experience` de `@/content/types`; `formatPeriod`, `sortByPeriodDesc` de `@/lib/date`; `Section`, `Tag`; `experienceFixture`.
- Produces: `ExperienceSection({ locale, items }: { locale: Locale; items: Experience[] })`.

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/components/sections/ExperienceSection.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ExperienceSection } from '@/components/sections/ExperienceSection'
import { experienceFixture } from '@/test/fixtures'

describe('ExperienceSection', () => {
  it('lista cargo, organização, período e bullets', () => {
    render(<ExperienceSection locale="pt" items={experienceFixture} />)

    expect(screen.getByRole('heading', { level: 3, name: 'Monitor de IA' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Instituto Exemplo' })).toHaveAttribute('href', 'https://exemplo.edu')
    expect(screen.getByText('fev 2025 — atual')).toBeInTheDocument()
    expect(screen.getByText('Acompanhou 60 alunos.')).toBeInTheDocument()
    expect(screen.getByText('Produziu 12 aulas práticas.')).toBeInTheDocument()
  })

  it('mostra a experiência mais recente primeiro', () => {
    render(<ExperienceSection locale="pt" items={[...experienceFixture].reverse()} />)

    const cargos = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(cargos).toEqual(['Monitor de IA', 'Desenvolvedor freelance'])
  })

  it('mostra organização sem link como texto simples', () => {
    render(<ExperienceSection locale="pt" items={experienceFixture} />)

    expect(screen.queryByRole('link', { name: 'Autônomo' })).not.toBeInTheDocument()
    expect(screen.getByText('Autônomo')).toBeInTheDocument()
  })

  it('traduz cargo e período', () => {
    render(<ExperienceSection locale="en" items={experienceFixture} />)

    expect(screen.getByRole('heading', { level: 3, name: 'AI teaching assistant' })).toBeInTheDocument()
    expect(screen.getByText('Feb 2025 — present')).toBeInTheDocument()
  })

  it('não quebra com lista vazia', () => {
    render(<ExperienceSection locale="pt" items={[]} />)

    expect(screen.getByRole('region', { name: 'Experiência' })).toBeInTheDocument()
    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test src/components/sections/ExperienceSection.test.tsx`
Esperado: FAIL — módulo não encontrado.

- [ ] **Step 3: Implementar a seção**

Criar `src/components/sections/ExperienceSection.tsx`:

```tsx
import { Section } from '@/components/ui/Section'
import { Tag } from '@/components/ui/Tag'
import type { Experience } from '@/content/types'
import { ui } from '@/content/ui'
import { formatPeriod, sortByPeriodDesc } from '@/lib/date'
import { type Locale, t } from '@/lib/i18n'

export function ExperienceSection({ locale, items }: { locale: Locale; items: Experience[] }) {
  return (
    <Section id="experiencia" title={t(ui.sections.experience, locale)}>
      <ol className="space-y-12">
        {sortByPeriodDesc(items).map((item) => (
          <li key={item.id} className="grid gap-2 md:grid-cols-[10rem_1fr] md:gap-8">
            <p className="font-mono text-xs text-muted md:pt-2">{formatPeriod(item.period, locale)}</p>
            <div>
              <h3 className="font-serif text-2xl text-ink">{t(item.role, locale)}</h3>
              <p className="mt-1 text-muted">
                {item.organizationUrl ? (
                  <a
                    href={item.organizationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="border-b border-line transition-colors hover:border-accent hover:text-accent"
                  >
                    {item.organization}
                  </a>
                ) : (
                  item.organization
                )}
              </p>
              <ul className="mt-4 max-w-[65ch] list-disc space-y-2 pl-5 marker:text-accent">
                {item.highlights.map((highlight) => (
                  <li key={highlight.pt}>{t(highlight, locale)}</li>
                ))}
              </ul>
              {item.tech && (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {item.tech.map((tech) => (
                    <Tag key={tech}>{tech}</Tag>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}
```

- [ ] **Step 4: Rodar os testes**

Run: `npm test && npm run typecheck`
Esperado: tudo passando.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: seção de experiência"
```

---

### Task 9: Seção de projetos

**Files:**
- Create: `src/components/sections/ProjectsSection.tsx`
- Test: `src/components/sections/ProjectsSection.test.tsx`

**Interfaces:**
- Consumes: `Project`; `formatPeriod`, `sortByPeriodDesc`; `Section`, `Tag`; `next/image`; `projectFixture`.
- Produces: `ProjectsSection({ locale, items }: { locale: Locale; items: Project[] })`.

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/components/sections/ProjectsSection.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProjectsSection } from '@/components/sections/ProjectsSection'
import { projectFixture } from '@/test/fixtures'

describe('ProjectsSection', () => {
  it('mostra título, resumo, descrição e tecnologias', () => {
    render(<ProjectsSection locale="pt" items={projectFixture} />)

    expect(screen.getByRole('heading', { level: 3, name: 'Analisador de Notas' })).toBeInTheDocument()
    expect(screen.getByText('Resume boletins automaticamente.')).toBeInTheDocument()
    expect(screen.getByText('Descrição longa do projeto.')).toBeInTheDocument()
    expect(screen.getByText('FastAPI')).toBeInTheDocument()
  })

  it('linka repositório e demo quando existem', () => {
    render(<ProjectsSection locale="pt" items={projectFixture} />)

    const repos = screen.getAllByRole('link', { name: 'Ver código' })
    expect(repos[0]).toHaveAttribute('href', 'https://github.com/fulano/analisador')
    expect(screen.getByRole('link', { name: 'Ver demo' })).toHaveAttribute('href', 'https://analisador.exemplo.com')
  })

  it('omite o link de demo do projeto que não tem demo', () => {
    render(<ProjectsSection locale="pt" items={projectFixture} />)

    expect(screen.getAllByRole('link', { name: 'Ver demo' })).toHaveLength(1)
    expect(screen.getAllByRole('link', { name: 'Ver código' })).toHaveLength(2)
  })

  it('usa alt traduzido na imagem e não exige imagem em todo projeto', () => {
    render(<ProjectsSection locale="en" items={projectFixture} />)

    expect(screen.getByRole('img', { name: 'Analyzer screen' })).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(1)
  })

  it('mostra o projeto mais recente primeiro', () => {
    render(<ProjectsSection locale="pt" items={[...projectFixture].reverse()} />)

    const titulos = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(titulos).toEqual(['Analisador de Notas', 'CLI de Estudos'])
  })

  it('não quebra com lista vazia', () => {
    render(<ProjectsSection locale="pt" items={[]} />)

    expect(screen.getByRole('region', { name: 'Projetos' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npm test src/components/sections/ProjectsSection.test.tsx`
Esperado: FAIL — módulo não encontrado.

- [ ] **Step 3: Implementar a seção**

Criar `src/components/sections/ProjectsSection.tsx`. Cards largos, um por linha: com poucos projetos, uma grade deixaria buracos.

```tsx
import Image from 'next/image'
import { Section } from '@/components/ui/Section'
import { Tag } from '@/components/ui/Tag'
import type { Project } from '@/content/types'
import { ui } from '@/content/ui'
import { formatPeriod, sortByPeriodDesc } from '@/lib/date'
import { type Locale, t } from '@/lib/i18n'

const linkClass = 'border-b border-line pb-0.5 text-sm transition-colors hover:border-accent hover:text-accent'

export function ProjectsSection({ locale, items }: { locale: Locale; items: Project[] }) {
  return (
    <Section id="projetos" title={t(ui.sections.projects, locale)}>
      <ul className="space-y-10">
        {sortByPeriodDesc(items).map((project) => (
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
              <p className="font-mono text-xs text-muted">{formatPeriod(project.period, locale)}</p>
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
```

- [ ] **Step 4: Rodar os testes**

Run: `npm test && npm run typecheck`
Esperado: tudo passando.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: seção de projetos"
```

---

### Task 10: Seções de habilidades e formação

**Files:**
- Create: `src/components/sections/SkillsSection.tsx`, `src/components/sections/EducationSection.tsx`
- Test: `src/components/sections/SkillsSection.test.tsx`, `src/components/sections/EducationSection.test.tsx`

**Interfaces:**
- Consumes: `SkillGroup`, `Education`, `Certificate`; `formatPeriod`, `formatMonth`; `Section`, `Tag`.
- Produces:
  - `SkillsSection({ locale, groups }: { locale: Locale; groups: SkillGroup[] })`.
  - `EducationSection({ locale, education, certificates }: { locale: Locale; education: Education; certificates: Certificate[] })`.

- [ ] **Step 1: Escrever os testes que falham**

Criar `src/components/sections/SkillsSection.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SkillsSection } from '@/components/sections/SkillsSection'
import { skillGroupsFixture } from '@/test/fixtures'

describe('SkillsSection', () => {
  it('agrupa por nível de uso, na ordem core → used → learning', () => {
    render(<SkillsSection locale="pt" groups={[...skillGroupsFixture].reverse()} />)

    const grupos = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(grupos).toEqual(['Uso em projetos', 'Já usei', 'Estudando agora'])
  })

  it('lista as tecnologias de cada grupo', () => {
    render(<SkillsSection locale="pt" groups={skillGroupsFixture} />)

    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('Docker')).toBeInTheDocument()
  })

  it('traduz os rótulos de nível', () => {
    render(<SkillsSection locale="en" groups={skillGroupsFixture} />)

    expect(screen.getByRole('heading', { level: 3, name: 'Currently learning' })).toBeInTheDocument()
  })

  it('omite grupo sem itens', () => {
    render(<SkillsSection locale="pt" groups={[{ level: 'core', items: ['Python'] }, { level: 'used', items: [] }]} />)

    expect(screen.queryByRole('heading', { level: 3, name: 'Já usei' })).not.toBeInTheDocument()
  })
})
```

Criar `src/components/sections/EducationSection.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EducationSection } from '@/components/sections/EducationSection'
import { certificatesFixture, educationFixture } from '@/test/fixtures'

describe('EducationSection', () => {
  it('mostra curso, instituição, período e status', () => {
    render(<EducationSection locale="pt" education={educationFixture} certificates={certificatesFixture} />)

    expect(screen.getByRole('region', { name: 'Formação' })).toBeInTheDocument()
    expect(screen.getByText('Sistemas de Informação')).toBeInTheDocument()
    expect(screen.getByText('Instituto Exemplo')).toBeInTheDocument()
    expect(screen.getByText('fev 2024 — dez 2027')).toBeInTheDocument()
    expect(screen.getByText('Em andamento')).toBeInTheDocument()
  })

  it('linka o certificado que tem credencial e mostra data', () => {
    render(<EducationSection locale="pt" education={educationFixture} certificates={certificatesFixture} />)

    expect(screen.getByRole('link', { name: 'Verificar credencial' })).toHaveAttribute(
      'href',
      'https://exemplo.com/credencial/1',
    )
    expect(screen.getAllByRole('link', { name: 'Verificar credencial' })).toHaveLength(1)
    expect(screen.getByText('mar 2025')).toBeInTheDocument()
  })

  it('omite o bloco de certificados quando não há nenhum', () => {
    render(<EducationSection locale="pt" education={educationFixture} certificates={[]} />)

    expect(screen.getByText('Sistemas de Informação')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3, name: 'Certificados' })).not.toBeInTheDocument()
  })

  it('traduz o conteúdo', () => {
    render(<EducationSection locale="en" education={educationFixture} certificates={certificatesFixture} />)

    expect(screen.getByRole('region', { name: 'Education' })).toBeInTheDocument()
    expect(screen.getByText('Information Systems')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `npm test src/components/sections/SkillsSection.test.tsx src/components/sections/EducationSection.test.tsx`
Esperado: FAIL — módulos não encontrados.

- [ ] **Step 3: Implementar SkillsSection**

Criar `src/components/sections/SkillsSection.tsx`. Sem porcentagem, barra ou estrela — a honestidade sobre o que está sendo aprendido pesa a favor.

```tsx
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
```

- [ ] **Step 4: Implementar EducationSection**

Criar `src/components/sections/EducationSection.tsx`:

```tsx
import { Section } from '@/components/ui/Section'
import type { Certificate, Education } from '@/content/types'
import { ui } from '@/content/ui'
import { formatMonth, formatPeriod } from '@/lib/date'
import { type Locale, t } from '@/lib/i18n'

export function EducationSection({
  locale,
  education,
  certificates,
}: {
  locale: Locale
  education: Education
  certificates: Certificate[]
}) {
  return (
    <Section id="formacao" title={t(ui.sections.education, locale)}>
      <div className="grid gap-2 md:grid-cols-[10rem_1fr] md:gap-8">
        <p className="font-mono text-xs text-muted md:pt-2">{formatPeriod(education.period, locale)}</p>
        <div>
          <h3 className="font-serif text-2xl text-ink">{t(education.degree, locale)}</h3>
          <p className="mt-1 text-muted">{education.institution}</p>
          <p className="mt-1 font-mono text-xs text-accent">{t(education.status, locale)}</p>
        </div>
      </div>

      {certificates.length > 0 && (
        <div className="mt-12 grid gap-3 md:grid-cols-[10rem_1fr] md:gap-8">
          <h3 className="font-mono text-xs tracking-widest text-muted uppercase md:pt-1">
            {t(ui.sections.certificates, locale)}
          </h3>
          <ul className="space-y-4">
            {certificates.map((certificate) => (
              <li key={`${certificate.issuer}-${certificate.date}`} className="flex flex-wrap items-baseline gap-x-4">
                <span className="text-ink">{t(certificate.title, locale)}</span>
                <span className="text-muted">{certificate.issuer}</span>
                <span className="font-mono text-xs text-muted">{formatMonth(certificate.date, locale)}</span>
                {certificate.credentialUrl && (
                  <a
                    href={certificate.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="border-b border-line pb-0.5 text-sm transition-colors hover:border-accent hover:text-accent"
                  >
                    {t(ui.actions.verifyCredential, locale)}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  )
}
```

- [ ] **Step 5: Rodar os testes**

Run: `npm test && npm run typecheck`
Esperado: tudo passando.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: seções de habilidades e formação"
```

---

### Task 11: Contato, montagem da página e animação de entrada

**Files:**
- Create: `src/components/sections/ContactSection.tsx`
- Create: `src/components/ui/Reveal.tsx`
- Modify: `src/app/[locale]/page.tsx`
- Test: `src/components/sections/ContactSection.test.tsx`, `src/app/[locale]/page.test.tsx`

**Interfaces:**
- Consumes: todas as seções das Tasks 7–10; `TopBar`; conteúdo real de `@/content/*`.
- Produces: `ContactSection({ locale, profile })`, `Reveal({ children })` (componente cliente), e a página completa em `src/app/[locale]/page.tsx`.

- [ ] **Step 1: Escrever os testes que falham**

Criar `src/components/sections/ContactSection.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ContactSection } from '@/components/sections/ContactSection'
import { profileFixture } from '@/test/fixtures'

describe('ContactSection', () => {
  it('repete os caminhos de contato no fim da página', () => {
    render(<ContactSection locale="pt" profile={profileFixture} />)

    expect(screen.getByRole('region', { name: 'Contato' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'fulano@exemplo.com' })).toHaveAttribute(
      'href',
      'mailto:fulano@exemplo.com',
    )
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Baixar currículo' })).toHaveAttribute('href', '/cv/curriculo-pt.pdf')
  })

  it('mostra o e-mail como texto selecionável, não só ícone', () => {
    render(<ContactSection locale="pt" profile={profileFixture} />)

    expect(screen.getByText('fulano@exemplo.com')).toBeInTheDocument()
  })

  it('serve o currículo em inglês na versão em inglês', () => {
    render(<ContactSection locale="en" profile={profileFixture} />)

    expect(screen.getByRole('link', { name: 'Download résumé' })).toHaveAttribute('href', '/cv/resume-en.pdf')
  })
})
```

Criar `src/app/[locale]/page.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PortfolioPage from './page'

describe('página do portfólio', () => {
  it('monta todas as seções na ordem definida', async () => {
    render(await PortfolioPage({ params: Promise.resolve({ locale: 'pt' }) }))

    const regioes = screen.getAllByRole('region').map((r) => r.getAttribute('id'))
    expect(regioes).toEqual(['sobre', 'experiencia', 'projetos', 'habilidades', 'formacao', 'contato'])
  })

  it('tem exatamente um h1 e um main', async () => {
    render(await PortfolioPage({ params: Promise.resolve({ locale: 'en' }) }))

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `npm test src/components/sections/ContactSection.test.tsx "src/app/[locale]/page.test.tsx"`
Esperado: FAIL — `ContactSection` não existe e a página ainda não monta as seções.

- [ ] **Step 3: Implementar ContactSection**

Criar `src/components/sections/ContactSection.tsx`:

```tsx
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
```

- [ ] **Step 4: Implementar a animação de entrada**

Criar `src/components/ui/Reveal.tsx`. Único movimento do site, uma vez por elemento, desligado sob `prefers-reduced-motion` — o CSS global já neutraliza a transição, e aqui o elemento também já nasce visível se o observer não rodar.

```tsx
'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 5: Montar a página**

Substituir `src/app/[locale]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { AboutSection } from '@/components/sections/AboutSection'
import { ContactSection } from '@/components/sections/ContactSection'
import { EducationSection } from '@/components/sections/EducationSection'
import { ExperienceSection } from '@/components/sections/ExperienceSection'
import { HeroSection } from '@/components/sections/HeroSection'
import { ProjectsSection } from '@/components/sections/ProjectsSection'
import { SkillsSection } from '@/components/sections/SkillsSection'
import { Reveal } from '@/components/ui/Reveal'
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
          <EducationSection locale={locale} education={education} certificates={certificates} />
        </Reveal>
        <Reveal>
          <ContactSection locale={locale} profile={profile} />
        </Reveal>
      </main>
      <footer className="border-t border-line py-8 font-mono text-xs text-muted">{profile.name}</footer>
    </div>
  )
}
```

- [ ] **Step 6: Rodar os testes**

Run: `npm test && npm run typecheck && npm run build`
Esperado: tudo passando.

- [ ] **Step 7: Olhar a página nos dois idiomas e nos dois temas**

Run: `npm run dev`, abrir `/pt` e `/en`, alternar o tema, navegar só com Tab conferindo que o foco fica visível e que o link "pular para o conteúdo" aparece no primeiro Tab.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: seção de contato e montagem da página completa"
```

---

### Task 12: SEO — metadata bilíngue, sitemap, robots e JSON-LD

**Files:**
- Create: `src/lib/site.ts`, `src/lib/seo.ts`
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`
- Create: `src/app/[locale]/opengraph-image.tsx`
- Modify: `src/app/[locale]/layout.tsx`
- Test: `src/lib/seo.test.ts`, `src/app/sitemap.test.ts`

**Interfaces:**
- Consumes: `profile`, `skillGroups`, `education`; `locales`, `htmlLang`, `t`.
- Produces:
  - `@/lib/site`: `siteUrl: string`, `absoluteUrl(path: string): string`.
  - `@/lib/seo`: `personJsonLd(locale: Locale): Record<string, unknown>`, `metadataFor(locale: Locale): Metadata`.
  - `generateMetadata` em `src/app/[locale]/layout.tsx`.

- [ ] **Step 1: Escrever os testes que falham**

Criar `src/lib/seo.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { profile } from '@/content/profile'
import { metadataFor, personJsonLd } from '@/lib/seo'

describe('personJsonLd', () => {
  it('descreve a pessoa dona do portfólio', () => {
    const json = personJsonLd('pt')

    expect(json['@type']).toBe('Person')
    expect(json.name).toBe(profile.name)
    expect(Array.isArray(json.sameAs)).toBe(true)
    expect(json.sameAs).toContain(profile.links.github)
    expect(json.sameAs).toContain(profile.links.linkedin)
  })

  it('lista habilidades e formação', () => {
    const json = personJsonLd('en')

    expect((json.knowsAbout as string[]).length).toBeGreaterThan(0)
    expect(json.alumniOf).toBeDefined()
  })
})

describe('metadataFor', () => {
  it('liga as duas versões de idioma com x-default apontando para pt', () => {
    const metadata = metadataFor('pt')

    expect(metadata.alternates?.languages).toMatchObject({
      'pt-BR': '/pt',
      en: '/en',
      'x-default': '/pt',
    })
    expect(metadata.alternates?.canonical).toBe('/pt')
  })

  it('usa título e descrição no idioma da página', () => {
    expect(metadataFor('en').description).toBe(profile.headline.en)
    expect(metadataFor('pt').description).toBe(profile.headline.pt)
  })
})
```

Criar `src/app/sitemap.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import robots from '@/app/robots'
import sitemap from '@/app/sitemap'
import { siteUrl } from '@/lib/site'

describe('sitemap', () => {
  it('lista as duas rotas de idioma com alternates', () => {
    const entradas = sitemap()

    expect(entradas.map((e) => e.url)).toEqual([`${siteUrl}/pt`, `${siteUrl}/en`])
    expect(entradas[0].alternates?.languages).toMatchObject({
      'pt-BR': `${siteUrl}/pt`,
      en: `${siteUrl}/en`,
    })
  })
})

describe('robots', () => {
  it('libera o rastreamento e aponta para o sitemap', () => {
    const regras = robots()

    expect(regras.sitemap).toBe(`${siteUrl}/sitemap.xml`)
    expect(regras.rules).toMatchObject({ userAgent: '*', allow: '/' })
  })
})
```

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `npm test src/lib/seo.test.ts src/app/sitemap.test.ts`
Esperado: FAIL — módulos não encontrados.

- [ ] **Step 3: Implementar a URL do site**

Criar `src/lib/site.ts`. A URL vem do ambiente da Vercel automaticamente; nenhum valor precisa ser editado à mão nem guardado como segredo.

```ts
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path}`
}
```

- [ ] **Step 4: Implementar metadata e JSON-LD**

Criar `src/lib/seo.ts`:

```ts
import type { Metadata } from 'next'
import { education } from '@/content/education'
import { profile } from '@/content/profile'
import { skillGroups } from '@/content/skills'
import { type Locale, htmlLang, t } from '@/lib/i18n'
import { siteUrl } from '@/lib/site'

export function personJsonLd(locale: Locale): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    description: t(profile.headline, locale),
    url: `${siteUrl}/${locale}`,
    email: `mailto:${profile.links.email}`,
    sameAs: [profile.links.github, profile.links.linkedin],
    knowsAbout: skillGroups.flatMap((group) => group.items),
    alumniOf: { '@type': 'EducationalOrganization', name: education.institution },
  }
}

export function metadataFor(locale: Locale): Metadata {
  const title = `${profile.name} — ${t(profile.headline, locale)}`

  return {
    metadataBase: new URL(siteUrl),
    title,
    description: t(profile.headline, locale),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        [htmlLang.pt]: '/pt',
        [htmlLang.en]: '/en',
        'x-default': '/pt',
      },
    },
    openGraph: {
      type: 'profile',
      title,
      description: t(profile.headline, locale),
      url: `${siteUrl}/${locale}`,
      locale: locale === 'pt' ? 'pt_BR' : 'en_US',
    },
    twitter: { card: 'summary_large_image', title, description: t(profile.headline, locale) },
  }
}
```

- [ ] **Step 5: Implementar sitemap e robots**

Criar `src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next'
import { htmlLang, locales } from '@/lib/i18n'
import { siteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    [htmlLang.pt]: `${siteUrl}/pt`,
    [htmlLang.en]: `${siteUrl}/en`,
  }

  return locales.map((locale) => ({
    url: `${siteUrl}/${locale}`,
    changeFrequency: 'monthly' as const,
    priority: locale === 'pt' ? 1 : 0.8,
    alternates: { languages },
  }))
}
```

Criar `src/app/robots.ts`:

```ts
import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
```

- [ ] **Step 6: Ligar metadata e JSON-LD ao layout**

Em `src/app/[locale]/layout.tsx`, adicionar `generateMetadata` e injetar o JSON-LD dentro do `<body>`:

```tsx
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return metadataFor(isLocale(locale) ? locale : defaultLocale)
}
```

E no `<body>`, antes de `{children}`:

```tsx
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(locale)) }}
        />
```

Imports a acrescentar: `import type { Metadata } from 'next'`, `import { metadataFor, personJsonLd } from '@/lib/seo'`, e `defaultLocale` no import de `@/lib/i18n`.

- [ ] **Step 7: Criar a imagem de Open Graph**

Criar `src/app/[locale]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import { profile } from '@/content/profile'
import { defaultLocale, isLocale, t } from '@/lib/i18n'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Open Graph'

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const activeLocale = isLocale(locale) ? locale : defaultLocale

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#faf9f6',
          color: '#1a1a18',
        }}
      >
        <div style={{ fontSize: 84, lineHeight: 1.1 }}>{profile.name}</div>
        <div style={{ marginTop: 24, fontSize: 40, color: '#3d5a45' }}>{t(profile.headline, activeLocale)}</div>
      </div>
    ),
    size,
  )
}
```

- [ ] **Step 8: Rodar testes e build**

Run: `npm test && npm run typecheck && npm run build`
Esperado: tudo passando; o build gera `/sitemap.xml`, `/robots.txt` e a imagem OG para cada locale.

- [ ] **Step 9: Conferir a saída no navegador**

Run: `npm run dev`, abrir `http://localhost:3000/sitemap.xml` e `http://localhost:3000/robots.txt`; no `/pt`, ver o código-fonte e confirmar as tags `hreflang` e o bloco `application/ld+json`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: metadata bilíngue, sitemap, robots e JSON-LD"
```

---

### Task 13: Smoke test ponta a ponta e integração contínua

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/smoke.spec.ts`
- Create: `.github/workflows/ci.yml`
- Modify: `package.json`, `eslint.config.mjs`, `.gitignore`

**Interfaces:**
- Consumes: o site completo (Tasks 1–12).
- Produces: script `npm run test:e2e`; pipeline de CI rodando `typecheck`, `lint`, `test` e `build`.

- [ ] **Step 1: Instalar o Playwright**

```bash
npm i -D @playwright/test
npx playwright install --with-deps chromium
```

- [ ] **Step 2: Configurar o Playwright**

Criar `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000/pt',
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
})
```

Adicionar em `package.json`: `"test:e2e": "playwright test"`.

Adicionar ao `.gitignore`: `/test-results`, `/playwright-report`, `/playwright/.cache`.

Adicionar `tests/` e `playwright.config.ts` ao que o ESLint ignora ou garantir que passam no lint — rodar `npm run lint` ao final do passo e resolver o que aparecer.

- [ ] **Step 3: Escrever o smoke test**

Criar `tests/e2e/smoke.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

const SECOES = ['sobre', 'experiencia', 'projetos', 'habilidades', 'formacao', 'contato']

test('a raiz redireciona para a versão em português', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/pt$/)
})

test('a página em português tem todas as seções', async ({ page }) => {
  await page.goto('/pt')

  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(page.locator('h1')).toHaveCount(1)
  for (const secao of SECOES) {
    await expect(page.locator(`#${secao}`)).toBeVisible()
  }
})

test('trocar de idioma muda o conteúdo e o currículo servido', async ({ page }) => {
  await page.goto('/pt')
  await expect(page.getByRole('link', { name: 'Baixar currículo' })).toHaveAttribute('href', '/cv/curriculo-pt.pdf')

  await page.getByRole('link', { name: 'Ver em inglês' }).click()

  await expect(page).toHaveURL(/\/en$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('link', { name: 'Download résumé' }).first()).toHaveAttribute(
    'href',
    '/cv/resume-en.pdf',
  )
})

test('locale inválido resulta em 404', async ({ page }) => {
  const resposta = await page.goto('/es')
  expect(resposta?.status()).toBe(404)
})

test('o currículo é servido de verdade nos dois idiomas', async ({ request }) => {
  for (const caminho of ['/cv/curriculo-pt.pdf', '/cv/resume-en.pdf']) {
    const resposta = await request.get(caminho)
    expect(resposta.status(), caminho).toBe(200)
  }
})

test('o tema escuro é alternado e persiste ao recarregar', async ({ page }) => {
  await page.goto('/pt')
  await page.getByRole('button', { name: 'Alternar tema' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)

  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
})
```

- [ ] **Step 4: Rodar o smoke test**

Run: `npm run test:e2e`
Esperado: 6 testes passando. Se o teste de tema falhar por corrida com a hidratação, aguarde o botão ficar habilitado antes do clique — não relaxe a asserção.

- [ ] **Step 5: Configurar a integração contínua**

Criar `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verificar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

- [ ] **Step 6: Rodar a verificação completa localmente**

Run: `npm run typecheck && npm run lint && npm test && npm run build && npm run test:e2e`
Esperado: tudo verde.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: smoke bilíngue ponta a ponta e pipeline de CI"
```

---

### Task 14: Conteúdo final, verificação de qualidade e README

**Files:**
- Modify: `src/content/*` (conteúdo real), `public/cv/*`, `public/images/projects/*`
- Modify: `src/content/content.test.ts`
- Create: `README.md`

**Interfaces:**
- Consumes: tudo que foi construído nas Tasks 1–13.
- Produces: teste `nenhum conteúdo pendente` em `src/content/content.test.ts`; `README.md` documentando como manter o conteúdo.

**Pré-requisito:** esta task depende de dados que só a pessoa dona do portfólio tem. Antes de começar, peça: nome completo, curso e instituição, cidade, links (GitHub, LinkedIn, e-mail), os dois parágrafos de bio, a frase de intenção, os bullets de impacto de cada experiência, os dados de cada projeto (título, resumo, descrição, stack, período, links, screenshot) e os certificados com link de verificação. Peça também os dois PDFs de currículo.

- [ ] **Step 1: Substituir todo o conteúdo pelos dados reais**

Editar cada arquivo em `src/content/` trocando os valores `PENDENTE:` pelos dados fornecidos, nos dois idiomas. Salvar os screenshots em `public/images/projects/` e preencher `image` (com `width` e `height` reais) nos projetos que tiverem imagem. Substituir os PDFs em `public/cv/`.

- [ ] **Step 2: Escrever o teste que proíbe conteúdo pendente**

Acrescentar ao final de `src/content/content.test.ts`:

```ts
describe('conteúdo final', () => {
  it('não tem nenhum texto marcado como pendente', () => {
    const pendentes = localizedValues.filter(
      (v) => v.value.pt.includes('PENDENTE') || v.value.en.includes('PENDENTE'),
    )
    expect(pendentes.map((v) => v.path)).toEqual([])
  })

  it('não tem nome, organização ou link pendente', () => {
    const camposSimples = [
      profile.name,
      profile.links.github,
      profile.links.linkedin,
      profile.links.email,
      education.institution,
      ...experiences.map((e) => e.organization),
      ...projects.map((p) => p.title),
    ]
    expect(camposSimples.filter((valor) => valor.includes('PENDENTE'))).toEqual([])
  })
})
```

- [ ] **Step 3: Rodar os testes e corrigir o que sobrou**

Run: `npm test`
Esperado: todos passando. Qualquer falha aponta um campo que ficou por preencher — preencha, não afrouxe o teste.

- [ ] **Step 4: Escrever o README**

Criar `README.md`:

```markdown
# Portfólio

Site de portfólio pessoal, estático e bilíngue (PT/EN), em Next.js.

## Rodar

    npm install
    npm run dev

## Verificar

    npm run typecheck   # tipos
    npm run lint        # padrão de código
    npm test            # unidade, componentes e invariantes de conteúdo
    npm run test:e2e    # smoke bilíngue no site construído

## Como atualizar o conteúdo

Todo texto do site mora em `src/content/`. Nenhum componente contém texto —
para mudar o que está escrito, edite um arquivo de conteúdo e dê push; a
Vercel publica sozinha.

| Quero mudar | Arquivo |
|---|---|
| Nome, bio, links, currículo | `src/content/profile.ts` |
| Experiências | `src/content/experience.ts` |
| Projetos | `src/content/projects.ts` |
| Habilidades | `src/content/skills.ts` |
| Formação e certificados | `src/content/education.ts` |
| Rótulos de botão e título de seção | `src/content/ui.ts` |

Todo texto é escrito nos dois idiomas: `{ pt: '...', en: '...' }`. Esquecer um
idioma quebra o build antes de chegar ao ar — é proposital.

Datas usam o formato `'YYYY-MM'`; `end: null` significa "até hoje".

Currículos ficam em `public/cv/`, screenshots em `public/images/projects/`.

## Deploy

Vercel conectada ao repositório: cada push gera um preview, `main` publica em
produção.
```

- [ ] **Step 5: Medir performance e acessibilidade**

```bash
npm run build && npm run start
```

Com o site rodando, rodar Lighthouse em modo mobile nas duas rotas:

```bash
npx lighthouse http://localhost:3000/pt --preset=desktop --quiet --chrome-flags="--headless"
npx lighthouse http://localhost:3000/en --quiet --chrome-flags="--headless"
```

Esperado: ≥ 95 em Performance, Acessibilidade, Boas Práticas e SEO. Abaixo disso, corrigir a causa apontada pelo relatório antes de seguir.

- [ ] **Step 6: Conferir acessibilidade à mão**

Com o site rodando, no tema claro e no escuro:
- Navegar a página inteira só com Tab: o link "pular para o conteúdo" aparece primeiro, e o foco fica visível em todos os elementos interativos.
- Conferir contraste do texto secundário (`--muted`) e dos links (`--accent`) sobre o fundo — mínimo 4,5:1 nos dois temas.
- Conferir que a hierarquia de headings não pula nível (um `h1`, seções em `h2`, itens em `h3`).

- [ ] **Step 7: Rodar a verificação completa**

Run: `npm run typecheck && npm run lint && npm test && npm run build && npm run test:e2e`
Esperado: tudo verde.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: conteúdo final, README e verificação de qualidade"
```

- [ ] **Step 9: Publicar**

Criar o repositório no GitHub, dar push e conectar o projeto na Vercel (framework detectado automaticamente, sem variável de ambiente para configurar). Depois do primeiro deploy, abrir a URL de produção e conferir `/`, `/pt`, `/en` e `/sitemap.xml`.

---

## Auto-revisão do plano

**Cobertura da spec:** cada requisito tem task correspondente — one-pager estático (4, 11), bilinguismo sem biblioteca (1, 4), conteúdo em arquivos TS (2, 3), as sete seções (7–11), tokens e tipografia (5), tema escuro (5), movimento com `prefers-reduced-motion` (5, 11), acessibilidade (5, 6, 14), SEO com `hreflang`/sitemap/robots/JSON-LD/OG (12), performance com meta Lighthouse (14), as quatro camadas de teste (2, 3, 7–11, 13), deploy e CI (13, 14).

**Correções encontradas na revisão:** duas restrições do App Router que o rascunho violava. O layout raiz precisa emitir `<html>` e `<body>`, então ele passou a morar em `src/app/[locale]/layout.tsx` (posição suportada justamente para i18n) e o redirect da raiz virou configuração em `next.config.ts`, em vez de uma página. E arquivos de rota só aceitam exports conhecidos, então as fontes e o script de tema foram para `src/lib/fonts.ts`.

**Sequenciamento do marcador `PENDENTE:`:** a spec exige que nenhum `PENDENTE:` sobreviva. A Task 3 cobra estrutura, formato e existência de arquivos; o teste que proíbe `PENDENTE:` entra na Task 14, quando o conteúdo real chega — a spec continua satisfeita ao fim do plano, e nenhuma task fica com teste falhando de propósito.

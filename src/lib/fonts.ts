/**
 * Docs consultadas (exigido por AGENTS.md antes de mexer aqui):
 * node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md
 * — seção `axes`: "Some variable fonts have extra axes that can be included.
 * By default, only the font weight is included to keep the file size down."
 * Conferido também node_modules/next/dist/compiled/@next/font/dist/google/font-data.json,
 * que lista os eixos reais de `Newsreader`: `opsz` (6–72, padrão 16) e `wght`
 * (200–800). Sem declarar `axes: ['opsz']`, o eixo óptico não entra no
 * arquivo de fonte baixado e fica preso no valor padrão — o que anularia o
 * motivo de escolher esta fonte (o mesmo arquivo se comportar diferente em
 * 34px e em 17px). O brief do Task 1 não incluía essa chave no bloco de
 * código do Step 2; adicionada aqui por exigência do próprio Step 1
 * ("confirmar como declarar `axes`... a documentação instalada ganha de
 * qualquer memória"). Divergência registrada no relatório da task.
 */
import { IBM_Plex_Mono, Newsreader } from 'next/font/google'

// Newsreader carrega display E texto: o eixo óptico faz a mesma família se
// comportar de forma diferente em 34px e em 17px. Não há fonte sem serifa
// neste projeto — dado é monoespaçado, prosa é serifada, não há terceira
// categoria.
const newsreader = Newsreader({
  subsets: ['latin'],
  axes: ['opsz'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
})

export const fontClassName = `${newsreader.variable} ${plexMono.variable}`

/** Aplica o tema antes da primeira pintura, para a página não piscar. */
export const themeScript = `try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}`

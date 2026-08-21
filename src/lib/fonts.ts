/**
 * Docs consultadas (exigido por AGENTS.md antes de mexer aqui):
 * node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md
 * — seção `axes`: "Some variable fonts have extra axes that can be included.
 * By default, only the font weight is included to keep the file size down."
 * Conferido também node_modules/next/dist/compiled/@next/font/dist/google/font-data.json,
 * que lista os eixos reais das duas fontes da direção "Clorofila":
 * - `Familjen Grotesk`: variável, único eixo `wght` (400–700) — sem eixo
 *   extra além do peso, então `axes` não se aplica aqui (o próprio peso já
 *   entra por padrão, como documentado acima). Sem `weight` explícito,
 *   porque é variável (mesmo padrão do Newsreader anterior).
 * - `DM Mono`: NÃO é variável (pesos fixos `300`/`400`/`500`, sem entrada
 *   `variable` na lista de pesos, e sem bloco `axes` no JSON) — `weight`
 *   precisa ser declarado explicitamente; `axes` simplesmente não existe
 *   para esta fonte.
 * Diferença em relação ao arquivo anterior: a chamada de Newsreader passava
 * `axes: ['opsz']` porque aquela família tinha um eixo óptico real além do
 * peso. Nenhuma das duas fontes atuais tem eixo extra — copiar aquele
 * `axes: ['opsz']` para cá adicionaria uma chave que a documentação instalada
 * diz não fazer nada para estas famílias.
 */
import { DM_Mono, Familjen_Grotesk } from 'next/font/google'

// Familjen Grotesk carrega display E texto: não há fonte serifada neste
// projeto — dado é monoespaçado, prosa é grotesca, não há terceira
// categoria. Uma família só (variável) faz o mesmo arquivo se comportar bem
// tanto em título grande quanto em corpo de texto, sem eixo óptico dedicado.
const familjenGrotesk = Familjen_Grotesk({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-familjen-grotesk',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

export const fontClassName = `${familjenGrotesk.variable} ${dmMono.variable}`

/** Aplica o tema antes da primeira pintura, para a página não piscar. */
export const themeScript = `try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}`

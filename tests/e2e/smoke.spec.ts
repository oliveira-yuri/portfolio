import { expect, test } from '@playwright/test'

const SECOES = ['sobre', 'experiencia', 'habilidades', 'certificados', 'formacao', 'contato']

test('a raiz redireciona para a versão em português', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/pt$/)
})

test('a página em português tem todas as seções', async ({ page }) => {
  // /pt agora serve a newsletter; o portfólio (dono destas seções) mudou
  // para /pt/portfolio.
  await page.goto('/pt/portfolio')

  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR')
  await expect(page.locator('h1')).toHaveCount(1)
  for (const secao of SECOES) {
    await expect(page.locator(`#${secao}`)).toBeVisible()
  }
})

test('trocar de idioma muda o conteúdo e o currículo servido', async ({ page }) => {
  // /pt agora serve a newsletter; o Hero e o Contato com o CV duplicado
  // (ver comentário abaixo) vivem em /pt/portfolio.
  await page.goto('/pt/portfolio')
  // O link de CV aparece tanto no Hero quanto no Contato (por design) — .first()
  // evita a violação de "strict mode" do Playwright, do mesmo jeito que a
  // asserção equivalente em inglês, logo abaixo, já fazia.
  await expect(page.getByRole('link', { name: 'Baixar currículo' }).first()).toHaveAttribute(
    'href',
    '/cv/curriculo-pt.pdf',
  )

  await page.getByRole('link', { name: 'Ver em inglês (EN)' }).click()

  await expect(page).toHaveURL(/\/en\/portfolio$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('link', { name: 'Download résumé' }).first()).toHaveAttribute(
    'href',
    '/cv/curriculo-pt.pdf',
  )
})

test('a âncora de certificados leva direto à seção', async ({ page }) => {
  // Seção de certificados agora fica em /pt/portfolio, não mais em /pt.
  await page.goto('/pt/portfolio#certificados')

  const secao = page.locator('#certificados')
  await expect(secao).toBeInViewport()
  await expect(secao.getByRole('heading', { level: 3 }).first()).toBeVisible()
})

test('locale inválido resulta em 404', async ({ page }) => {
  // Este teste faz o servidor de produção (npm run start, no webServer acima)
  // imprimir "Error: Internal: NoFallbackError" no stderr. É um log interno do
  // próprio Next 16 ao resolver "/es" contra o layout de "[locale]" — a rota
  // dinâmica no nível do layout raiz (sem um app/layout.tsx acima dela) torna
  // difícil compor um 404 consistente (ver docs de not-found.js/global-not-found.js
  // do Next sobre "root layout defined using top-level dynamic segments").
  // Confirmado experimentalmente: um app/not-found.tsx próprio com <html>/<body>
  // faz o 404 renderizar um corpo customizado (e o status continua correto,
  // 404), mas NÃO faz esse log desaparecer — então não vale mudar o código do
  // site só por causa do log. O status HTTP abaixo é o que importa e está correto;
  // este comentário existe para não deixar o ruído silencioso/inexplicado.
  const resposta = await page.goto('/es')
  expect(resposta?.status()).toBe(404)
})

test('o currículo é servido de verdade', async ({ request }) => {
  const resposta = await request.get('/cv/curriculo-pt.pdf')
  expect(resposta.status()).toBe(200)
})

test('o tema escuro é alternado e persiste ao recarregar', async ({ page }) => {
  await page.goto('/pt')
  const botao = page.getByRole('button', { name: 'Alternar tema' })
  const html = page.locator('html')

  // O clique pode chegar antes da hidratação terminar de anexar o onClick — o
  // botão nunca fica "disabled" enquanto isso, então a única forma de não
  // depender de sorte é repetir clique+asserção até a mudança realmente
  // acontecer, sem afrouxar o que está sendo verificado no final.
  await expect(async () => {
    await botao.click()
    await expect(html).toHaveClass(/dark/)
  }).toPass()

  await page.reload()
  await expect(html).toHaveClass(/dark/)
})

test('o conteúdo das seções continua visível com JavaScript desativado', async ({ browser }) => {
  // A Reveal (Task 11) só pode esconder uma seção depois que o próprio efeito
  // confirma que vai conseguir revelá-la de novo; sem JS esse efeito nunca
  // roda, então o HTML enviado pelo servidor tem que ser a versão final e
  // visível — nunca a de "escondido aguardando o JS". toBeVisible() sozinho
  // não pegaria uma regressão aqui: opacity:0 ainda conta como "visível" para
  // o Playwright (o elemento continua com bounding box e sem visibility:hidden).
  // Por isso a checagem real é o opacity computado do wrapper da Reveal.
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()

  try {
    // As seções verificadas aqui (e a Reveal que as envolve) vivem em
    // /pt/portfolio, não mais na newsletter que hoje ocupa /pt.
    await page.goto('/pt/portfolio')

    for (const secao of SECOES) {
      const elemento = page.locator(`#${secao}`)
      await expect(elemento).toBeVisible()

      const wrapper = elemento.locator('xpath=..')
      await expect(wrapper).toHaveCSS('opacity', '1')
    }
  } finally {
    await context.close()
  }
})

test('da newsletter até o post, com fórmula e índice', async ({ page }) => {
  await page.goto('/pt')

  await expect(page.getByRole('heading', { level: 1, name: 'Yuri Oliveira' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 2, name: 'Trilhas' })).toBeVisible()

  await page.getByRole('link', { name: 'Post de verificação' }).first().click()

  await expect(page.getByRole('heading', { level: 1, name: 'Post de verificação' })).toBeVisible()
  await expect(page.locator('.katex').first()).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Neste texto' })).toBeVisible()
  await expect(page.getByText(/Divulgação/)).toBeVisible()
})

test('trocar de idioma mantém o leitor no mesmo texto', async ({ page }) => {
  await page.goto('/pt/posts/post-de-verificacao')

  // O LocaleSwitch usa <a> comum (navegação de documento inteiro, não
  // client-side) de propósito — ver comentário em LocaleSwitch.tsx. As
  // asserções abaixo usam expect() com poll automático (toHaveURL,
  // toBeVisible), então esperam a navegação real terminar em vez de supor
  // uma transição instantânea de SPA.
  await page.getByRole('link', { name: /ingl[eê]s/i }).click()

  await expect(page).toHaveURL(/\/en\/posts\/post-de-verificacao/)
  // O aviso é deliberadamente escrito no idioma da PÁGINA atual (en), não no
  // idioma do texto alternativo — só o rótulo do link ("Ler em português")
  // fica no idioma de destino, de propósito (ver comentário em
  // src/app/[locale]/posts/[slug]/page.tsx e ui.post.soEmPortugues em
  // src/content/ui.ts). Em /en o leitor vê a frase em inglês.
  await expect(page.getByText('This text is only available in Portuguese.')).toBeVisible()
})

test('o portfólio continua acessível na rota nova', async ({ page }) => {
  await page.goto('/pt/portfolio')

  await expect(page.getByRole('heading', { level: 2, name: 'Experiência' })).toBeVisible()
})

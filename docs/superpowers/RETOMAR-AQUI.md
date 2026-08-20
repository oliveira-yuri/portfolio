# Retomar aqui

**Última atualização:** 2026-08-20

## Estado

- **Repositório:** `/home/yuri/Documentos/projetos/newsletter/portfolio` (clone de `github.com/oliveira-yuri/portfolio`)
- **Branch:** `newsletter`, 47 commits à frente de `master`. **Nada enviado ao remoto ainda.**
- **Testes:** 281 unitários e 11 de ponta a ponta, verdes. `typecheck`, `lint` e `build` limpos.
- **Código:** o site está construído e redesenhado. O que falta é conteúdo.
- **Próximo passo, e é seu:** escrever os três primeiros textos. Ver "O que só você pode fazer".

## O que foi feito, em duas fases

**Fase 1 — construção** (`docs/superpowers/plans/2026-08-20-newsletter.md`, 14 tasks).
A home passou a ser a Newsletter; o portfólio antigo foi para `/pt/portfolio`. Pipeline de MDX com fórmula, tabela, figura numerada e código com realce; validação de frontmatter que quebra o build; i18n com post podendo existir num idioma só; páginas de tag e de pilar; RSS por idioma; sitemap, metadados e imagem de compartilhamento por post.

**Fase 2 — redesenho** (`docs/superpowers/plans/2026-08-20-redesenho-intervalo.md`, 8 tasks).
A identidade original (papel creme, serifada de alto contraste, fios de jornal) era o visual genérico que ferramentas de IA produzem por padrão, independente do assunto. Foi substituída pela direção **"Intervalo"**, derivada de estatística.

## Para retomar numa sessão nova

Cole isto:

> Leia `docs/superpowers/specs/2026-08-20-newsletter-design.md` no repositório
> `/home/yuri/Documentos/projetos/newsletter/portfolio` (branch `newsletter`).
> O código está construído e os testes passam. Leia também
> `docs/superpowers/RETOMAR-AQUI.md` para o estado atual.

A spec é a autoridade vinculante. Os dois planos já foram executados; servem como histórico, não como instrução.

## O que só você pode fazer

**Escrever três textos, um por pilar** — um de `academico`, um de `ensino`, um de `projetos`. Nenhum agente pode escrever seus aprendizados.

O motivo de serem três, e não um: a home abre com o eixo do tempo, que plota a sua cadência de publicação. Com um texto só, ele é um traço solitário; com três distribuídos entre os pilares, a estrutura se sustenta e a legenda da escala passa a explicar alguma coisa.

Formato: `src/content/posts/YYYY-MM-DD-<slug>.pt.mdx`. Frontmatter obrigatório: `titulo`, `resumo` (até 200 caracteres), `pilar`, `tags`. Opcionais: `destaque`, `cta`, `atualizado`. Errar qualquer um **quebra o build com o nome do arquivo no erro** — é de propósito.

Existe um post de verificação em `src/content/posts/2026-01-01-post-de-verificacao.pt.mdx` que os testes de ponta a ponta usam. Quando escrever os seus, aponte o e2e para um texto real e apague o de verificação.

## Decisões que não são óbvias no código

Todas justificadas na spec, mas estas seis um agente novo tenderia a "consertar" errado:

1. **A data do post vem só do nome do arquivo.** Não há campo `data` no frontmatter. Fonte única de verdade.
2. **A barra de números mostra data absoluta**, nunca "há N dias". O site é estático: tempo relativo congela no build e passa a mentir no dia seguinte.
3. **O bloco do ibe.IA só existe se o post declarar `cta`.** Existe um teste cuja única função é falhar se alguém tornar isso automático.
4. **Título de post na listagem não é cabeçalho**, é link em item de lista. Marcar dezenas deles como cabeçalho infla o sumário da página com entradas que apontam para fora dela.
5. **Não há fonte sem serifa no projeto.** Newsreader carrega display e texto (tem eixo óptico real, por isso `axes: ['opsz']` é obrigatório), IBM Plex Mono carrega dado. Não existe terceira categoria.
6. **Cor de pilar vem só de `src/lib/escala.ts`.** A paleta é uma escala divergente e os três pilares ocupam seus três pontos, do abstrato ao aplicado. Componente que escolhe cor sozinho quebra a escala.

## Pendências fora do código

1. **Certificado TLS de `yurioliveira.dev`.** Durante o projeto, a conexão apresentou certificado emitido por um FortiGate, o que indica inspeção TLS na rede local. **Testar de fora dessa rede** (4G). Se o erro persistir, é falha real de produção e vem antes de tudo.
2. **Apontamento do domínio na Vercel** e a variável `NEXT_PUBLIC_SITE_URL`.
3. **URLs das formações** em `src/content/formacoes.ts` apontam para a home do instituto; trocar por links diretos quando forem confirmados.
4. **`hreflang` da página de tag** declara os dois idiomas sem verificar se a tag existe em ambos. Se uma tag só existir em português, a versão inglesa anuncia um alternativo que dá 404.
5. **`../portfolio-master/`** é um zip antigo sem git. Descartável.

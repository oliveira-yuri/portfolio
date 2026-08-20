# Retomar aqui

**Última atualização:** 2026-08-20

## Onde o trabalho está

- **Repositório:** `/home/yuri/Documentos/projetos/newsletter/portfolio` (clone de `github.com/oliveira-yuri/portfolio`)
- **Branch:** `newsletter` (criada a partir de `master`; nada enviado ao remoto ainda)
- **Spec aprovada:** `docs/superpowers/specs/2026-08-20-newsletter-design.md`
- **Plano de implementação:** `docs/superpowers/plans/2026-08-20-newsletter.md`
- **Código escrito até agora:** nenhum. Só spec e plano.
- **Próximo passo:** executar a Task 1 do plano.

## Para retomar numa sessão nova

Cole isto:

> Leia `docs/superpowers/specs/2026-08-20-newsletter-design.md` e
> `docs/superpowers/plans/2026-08-20-newsletter.md` no repositório
> `/home/yuri/Documentos/projetos/newsletter/portfolio` (branch `newsletter`).
> Execute o plano com a skill `superpowers:subagent-driven-development`,
> começando na Task 1. As tasks já executadas estão marcadas com `- [x]`.

O plano é autossuficiente: traz o código de cada teste e de cada
implementação, e cada task termina em commit. Não precisa desta conversa.

## O que o plano NÃO pode fazer sozinho

A **Task 15** é sua, não de um agente: são os três textos reais da Fase 0.
Ninguém além de você pode escrever seus aprendizados. O plano para ali e
devolve o controle.

## Decisões que não estão óbvias no código

Todas estão justificadas na spec, mas estas três são as que um agente novo
tenderia a "consertar" errado:

1. **A data do post vem só do nome do arquivo**, não do frontmatter. É fonte
   única de verdade de propósito.
2. **A barra de números da home mostra data absoluta**, nunca "há N dias" — o
   site é estático e tempo relativo congelaria no build.
3. **O bloco do ibe.IA só existe se o post declarar `cta`.** Existe um teste
   cuja função é falhar se alguém tornar isso automático. Não "melhorar" isso.

## Itens abertos, fora do código

1. Testar `https://yurioliveira.dev` **fora da rede local** (4G). No design, o
   certificado apresentado era emitido por um FortiGate — se falhar fora da
   rede também, é falha real de produção e vem antes de tudo.
2. Conferir o apontamento do domínio na Vercel e `NEXT_PUBLIC_SITE_URL`.
3. As URLs das três formações em `src/content/formacoes.ts` apontam para a home
   do instituto; trocar por URLs profundas quando forem confirmadas.
4. `../portfolio-master/` é um zip extraído antigo, sem git. Pode ser apagado.

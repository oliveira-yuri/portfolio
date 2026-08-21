# Newsletter de aprendizado em público

Transforma o portfólio de página única numa newsletter, e substitui a camada visual.

**Não deve ser mesclado ainda.** O único post que existe é `2026-01-01-post-de-verificacao.pt.mdx`, usado pelos testes de ponta a ponta. Antes de ir ao ar, ver "O que falta".

## O que muda

- **`/pt` e `/en` passam a ser a Newsletter.** O one-pager do portfólio foi para `/pt/portfolio`, com todas as oito seções preservadas. Nenhuma URL antiga deixou de responder.
- **Posts em MDX** com fórmula em KaTeX, tabela, figura numerada e código com realce feito no build.
- **Validação que quebra o build.** Frontmatter inválido, tag fora de kebab-case, resumo acima de 200 caracteres, pilar inexistente ou caractere de controle falham o build com o nome do arquivo no erro — em vez de publicar torto.
- **Bilíngue de verdade.** Um post pode existir em um idioma só: não dá 404, mostra aviso traduzido e link para a versão que existe. `hreflang` declara só os idiomas que realmente existem.
- **Páginas de tag e de pilar**, RSS por idioma, sitemap, metadados e imagem de compartilhamento por post.

## Direção visual: "Intervalo"

A primeira versão usava papel creme, serifada de alto contraste e fios de jornal. Revisada com critério de design, isso é o resultado genérico que ferramentas de IA produzem por padrão, independente do assunto — e o pedido era justamente não parecer com todo mundo.

A direção nova deriva de estatística, que é a área do autor:

- **A paleta é uma escala divergente** — frio, neutro, quente — e os três pilares ocupam seus três pontos na ordem do abstrato ao aplicado: `academico` → `ensino` → `projetos`. A cor codifica um eixo real em vez de decorar.
- **Duas famílias, nenhuma sem serifa.** Newsreader carrega display e texto corrido (eixo óptico real, daí `axes: ['opsz']`); IBM Plex Mono carrega todo dado e metadado. Não existe terceira categoria.
- **A assinatura é o eixo do tempo:** o arquivo plotado, um traço por texto, posição pela data, altura pelo tempo de leitura, cor pelo pilar. A densidade que se vê *é* a cadência de publicação — o mesmo dado da lista abaixo, em outra projeção.
- **Sem fio entre linhas do arquivo.** O ritmo vem do espaço. Régua existe sob o eixo e sob títulos de seção, e em nenhum outro lugar.

## Bugs pré-existentes que apareceram no caminho

- **Nenhum link do site jamais renderizou a cor que o código mandava.** A regra `a { color: inherit }` estava fora de qualquer camada de cascata, e regra sem camada vence toda utilitária com camada, independente de especificidade. Confirmado medindo estilo computado em cinco links de páginas diferentes.
- **Todas as páginas exceto post declaravam a home como URL canônica**, enquanto o sitemap submetia essas mesmas URLs — instrução para buscador descartá-las.
- **Contraste de comentário em código falhava a WCAG AA nos dois temas** (3,51:1 no escuro, 4,04:1 no claro). Agora 5,48:1 e 5,18:1, medidos no navegador contra o build de produção.
- **`atualizado: 2026-08-19`, o exemplo da própria spec, era descartado em silêncio** — o YAML converte data sem aspas num `Date` e o código só aceitava `string`.

## Verificação

281 testes unitários e 11 de ponta a ponta. `typecheck`, `lint` e `build` limpos. O site builda com `src/content/posts/` vazio, verificado explicitamente — precisa buildar antes do primeiro texto existir.

## O que falta, e é humano

Escrever três textos, um por pilar, antes de publicar. A home abre com o eixo do tempo: com um texto só ele é um traço solitário; com três distribuídos, a estrutura se sustenta. Depois disso, apontar o e2e para um texto real e apagar o post de verificação.

## Pendências fora do código

1. **Certificado TLS do `yurioliveira.dev`** — durante o projeto a conexão apresentou certificado emitido por um FortiGate, o que indica inspeção TLS na rede local. Testar de fora dela; se falhar lá também, é falha de produção.
2. **`hreflang` da página de tag** declara os dois idiomas sem checar se a tag existe em ambos.
3. **URLs das formações** em `src/content/formacoes.ts` apontam para a home do instituto.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

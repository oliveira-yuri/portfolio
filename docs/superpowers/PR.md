# Newsletter de aprendizado em público

Transforma o portfólio de página única numa newsletter, e substitui a camada visual.

**Não deve ser mesclado ainda.** O único post que existe é `2026-01-01-post-de-verificacao.pt.mdx`, usado pelos testes de ponta a ponta. Antes de ir ao ar, ver "O que falta".

## O que muda

- **`/pt` e `/en` passam a ser a Newsletter.** O one-pager do portfólio foi para `/pt/portfolio`, com todas as oito seções preservadas. Nenhuma URL antiga deixou de responder.
- **Posts em MDX** com fórmula em KaTeX, tabela, figura numerada e código com realce feito no build.
- **Validação que quebra o build.** Frontmatter inválido, tag fora de kebab-case, resumo acima de 200 caracteres, pilar inexistente ou caractere de controle falham o build com o nome do arquivo no erro — em vez de publicar torto.
- **Bilíngue de verdade.** Um post pode existir em um idioma só: não dá 404, mostra aviso traduzido e link para a versão que existe. `hreflang` declara só os idiomas que realmente existem.
- **Páginas de tag e de pilar**, RSS por idioma, sitemap, metadados e imagem de compartilhamento por post.

## Direção visual: "Clorofila"

Claro em branco, escuro em verde — a identidade que já era do autor, retomada depois de duas tentativas descartadas.

- **Verde é estrutura, não enfeite:** régua do topo, rótulos, marcas e links.
- **Duas famílias, nenhuma com serifa.** Familjen Grotesk em display e texto; DM Mono em todo dado e metadado.
- **Os três pilares numa escala sequencial** de verde, na ordem abstrato → aplicado. A medição mostrou que uma rampa de uma cor só não pode ser distinguível e legível como texto ao mesmo tempo, então a cor do pilar vive nas **marcas** (quadrado da legenda, barra de tempo de leitura) e o rótulo usa um verde único e acessível.
- **Sem fio entre linhas do arquivo.** O ritmo vem do espaço.

Contrastes medidos, todos acima do mínimo da WCAG: `suave` sobre `papel` 6,44:1 e 6,60:1; verde do rótulo 8,13:1 e 8,35:1; marcas de pilar 4,24 a 12,75 no claro e 3,98 a 9,53 no escuro; comentário de código 6,06:1 e 5,76:1.

O componente que planta o arquivo como eixo do tempo está **construído, testado e desligado** por decisão do autor: com poucos textos ele é um traço solitário. Volta com uma linha quando houver conteúdo — não apagar.

## Bugs pré-existentes que apareceram no caminho

- **Nenhum link do site jamais renderizou a cor que o código mandava.** A regra `a { color: inherit }` estava fora de qualquer camada de cascata, e regra sem camada vence toda utilitária com camada, independente de especificidade. Confirmado medindo estilo computado em cinco links de páginas diferentes.
- **Todas as páginas exceto post declaravam a home como URL canônica**, enquanto o sitemap submetia essas mesmas URLs — instrução para buscador descartá-las.
- **Contraste de comentário em código falhava a WCAG AA nos dois temas** (3,51:1 no escuro, 4,04:1 no claro). Agora 5,48:1 e 5,18:1, medidos no navegador contra o build de produção.
- **`atualizado: 2026-08-19`, o exemplo da própria spec, era descartado em silêncio** — o YAML converte data sem aspas num `Date` e o código só aceitava `string`.

## Verificação

282 testes unitários e 11 de ponta a ponta. `typecheck`, `lint` e `build` limpos. O site builda com `src/content/posts/` vazio, verificado explicitamente — precisa buildar antes do primeiro texto existir.

## O que falta, e é humano

Escrever três textos, um por pilar, antes de publicar. Com um texto só, a legenda da escala mostra `01`, `00`, `00` e o arquivo tem um mês; com três distribuídos entre os pilares, a estrutura se sustenta e a legenda passa a explicar alguma coisa. Depois disso, apontar o e2e para um texto real e apagar o post de verificação.

## Pendências fora do código

1. **Certificado TLS do `yurioliveira.dev`** — durante o projeto a conexão apresentou certificado emitido por um FortiGate, o que indica inspeção TLS na rede local. Testar de fora dela; se falhar lá também, é falha de produção.
2. **`hreflang` da página de tag** declara os dois idiomas sem checar se a tag existe em ambos.
3. **URLs das formações** em `src/content/formacoes.ts` apontam para a home do instituto.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

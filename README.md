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

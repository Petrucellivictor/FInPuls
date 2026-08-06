# RFC-015: Rebrand de Fin+/FinPlus para PolvIn

- **Status**: concluída
- **Prioridade**: alta (pedido direto do usuário — nome do produto)
- **Agentes envolvidos**: Product Owner, UX/UI Designer, AI Prompt Engineer, Frontend Engineer, Documentation Specialist, QA Engineer.

## Descrição
Pedido direto do usuário: "mude o nome FinPlus ou Fin+ para PolvIn, esse nome acaba ficando mais pegajoso na mente do usuário." O app passa a se chamar oficialmente **PolvIn** — o mesmo nome que o mascote já usa (hoje estilizado como "POLVIn" nas falas em 1ª pessoa) — unificando a identidade do produto com a do seu personagem mais memorável.

## Objetivo
Substituir "Fin+"/"FinPlus" por "PolvIn" em todo lugar onde o nome do produto aparece de forma "viva" (UI, documentação atual, comentários de código), com um novo wordmark que não depende do "+" (que não existe em "PolvIn"), sem quebrar compatibilidade de dados já salvos dos usuários.

## Motivação
Nome de produto e nome de mascote memorável e já estabelecido coincidirem é uma escolha de branding legítima e comum (o usuário já percebeu, corretamente, que "PolvIn" — ligado à imagem do polvo de 8 braços — fixa mais na memória do que a sigla genérica "Fin+").

## Benefícios
Um nome só para lembrar, decorar e divulgar; reforça a mascote como o rosto do produto (em vez de duas identidades concorrentes); resolve de vez a ambiguidade entre "o app" e "o assistente" na cabeça do usuário final.

## Impacto
- **Escopo do rename**: só arquivos/conteúdo "vivos" (documentação e código atuais). **Registros históricos ficam intocados por decisão consciente**: `CHANGELOG.md` (cada versão documenta o nome que o produto tinha *naquele momento* — reescrever isso seria revisionismo histórico) e as RFCs numeradas já concluídas antes desta (RFC-003, RFC-006, RFC-009, RFC-011, RFC-012), pelo mesmo motivo. `rfcs/README.md` (índice vivo, não uma RFC individual) foi atualizado.
- **Nome do repositório GitHub** (`FInPuls`) e a URL remota (`github.com/Petrucellivictor/FInPuls.git`) **não foram alterados** — é uma decisão de infraestrutura separada (renomear o repo quebraria a URL remota, qualquer link/bookmark existente e exigiria reconfigurar o `git remote` local), fora do pedido original de renomear "o nome do produto". Registrado aqui para uma decisão futura consciente, se o usuário quiser.
- **Wordmark do header** (`index.html`): `Fin<span class="brand-plus">+</span>` → `Polv<span class="brand-in">In</span>` — classe CSS renomeada de `.brand-plus` para `.brand-in`, mesma cor verde (`--green-light`) que o "+" antigo usava, agora aplicada ao "In".
- **`<title>`**, `README.md` (título + backronym + seção de identidade visual), `CLAUDE.md` (título + 1 menção), `ROADMAP.md`, `rfcs/README.md`, os 13 arquivos de `.claude/agents/*.md`, e o conteúdo em runtime (`js/data.js`, `js/onboarding.js`, `js/polvin.js`, `js/business.js`, `js/career.js`, `js/engagement.js`, `js/books.js`, `js/app.js`, `js/profile.js`, `js/progression.js`, `js/auth.js`, `js/leagues.js`, `js/privacy.js`, `js/cloud.js`, `js/supabase-config.js`, `css/style.css`, `supabase/schema.sql`, `assets/polvin.svg`) tiveram "Fin+"/"FinPlus" trocado por "PolvIn".
- **Backup manual** (`js/storage.js`, `exportAll()`): campo cosmético `_finplusBackup` → `_polvinBackup`, nome do arquivo baixado `finplus-backup-*.json` → `polvin-backup-*.json`. Nenhum dos dois é lido por `importAll()` para validação — troca 100% segura, backups antigos continuam importando normalmente.
- **Nenhuma chave de `localStorage`** (`STORAGE_KEYS`) usa o prefixo "fin+"/"finplus" — todas usam o prefixo interno `if_*`, não relacionado ao nome de marca. Confirmado via auditoria: zero risco de perda de dados salvos de usuários existentes.

## Dependências
Nenhuma.

## Critérios de aceite
- `grep -i "Fin+\|FinPlus"` no repositório só retorna `CHANGELOG.md` e as 5 RFCs numeradas encerradas antes desta (histórico intencional).
- Título da aba, header, footer e telas internas (Biblioteca, onboarding) mostram "PolvIn".
- Nenhuma fala do mascote em 1ª pessoa fica logicamente confusa (ex.: "meu conhecimento vem do conteúdo do próprio PolvIn" soando como o personagem falando de si mesmo em 3ª pessoa).
- Backup exportado antes desta RFC continua importável sem erro.
- Teste visual real (Playwright) confirma o wordmark novo, o título da aba, e zero erro de console.

## Etapas puladas e por quê
- **Software Architect/Gamification/Financial/Database/Backend/Security Specialist**: rename de texto/identidade visual, sem lógica nova, sem esquema de dado novo, sem superfície de ataque nova.
- **DevOps Engineer**: sem deploy nesta RFC (repositório GitHub deliberadamente não renomeado — ver "Impacto").

## Registro por etapa

### 1. Product Owner
Decisão: unificar nome do produto e do mascote é uma escolha de marca legítima (mesmo padrão de apps onde o personagem é a marca) — vale a pena mesmo com o esforço de rename em ~30 arquivos, porque memorabilidade de nome é um ativo de produto real. Escopo definido como "só o que é vivo" — não reescrever `CHANGELOG.md`/RFCs antigas, para não distorcer o registro histórico do projeto.

### 2. UX/UI Designer
Grafia oficial do produto: **"PolvIn"** (P e I maiúsculos) em todo lugar de nome de produto — distinto, por design, de "POLVIn" (POLV maiúsculo), que continua sendo a assinatura vocal do mascote em falas de 1ª pessoa. Novo wordmark do header mantém o padrão bicolor já estabelecido (marca + destaque verde), só troca o que fica destacado: `Polv` + `In` (verde) no lugar de `Fin` + `+` (verde) — sem perder a única marca gráfica textual que o app tinha. Favicon/apple-touch-icon não mudam (já usam a arte do mascote, que já era a fusão de identidade sendo formalizada agora).

### 3. AI Prompt Engineer
Auditoria de falas em 1ª pessoa do POLVIn: risco geral baixo (a maioria das menções a "Fin+" são referências de 3ª pessoa ao app, que funcionam normalmente com PolvIn — mesmo padrão de "Duolingo" coexistir com o mascote "Duo"). Dois casos concretos de autorreferência confusa identificados e reescritos manualmente em `js/data.js` (respostas do assistente que diziam "conteúdo do próprio Fin+" → "conteúdo do próprio site") e um caso de redundância visual corrigido em `js/polvin.js` (subtítulo do chat, que repetia o nome bem abaixo do título "POLVIn").

### 4. Frontend Engineer
Implementado: edições estruturais manuais (wordmark do header, título, README, backup em `storage.js`, SVG, falas reescritas) + substituição mecânica controlada (script Node, não Edit em massa) nos ~30 arquivos vivos restantes, com verificação de sintaxe (`node --check`) em todos os `.js` tocados. `CHANGELOG.md` e as 5 RFCs numeradas anteriores ficaram deliberadamente de fora do script.

### 5. QA Engineer
Testado via Playwright + Chromium real: `<title>` = "PolvIn — Aprenda, controle e invista"; `.brand-name` renderiza "PolvIn" com `.brand-in` na cor verde esperada (`rgb(111, 207, 95)`); h2 da Biblioteca = "Biblioteca PolvIn"; footer contém "PolvIn" e não contém mais "Fin+"; fluxo completo de onboarding + navegação de abas sem nenhum erro de console. Auditoria `grep -i` confirmou que as únicas ocorrências restantes de "Fin+"/"FinPlus" no repositório são as 6 esperadas (histórico).

### 6. Documentation Specialist
`README.md` (título, backronym, seção "Identidade visual", todas as menções de produto), `ROADMAP.md` e `CHANGELOG.md` (nova entrada, sem alterar entradas antigas) atualizados.

# RFC-021: Cidade Financeira — Fase 5 (fundação do motor de jogo 2D)

- **Status**: concluída
- **Prioridade**: máxima (reversão arquitetural pedida diretamente pelo usuário — a interface das Fases 1-4 estava errada, não incompleta)
- **Agentes envolvidos**: Product Owner, Software Architect, UX/UI Designer, Frontend Engineer, QA Engineer, Documentation Specialist.

## Descrição
O usuário deu um feedback direto: a Cidade Financeira (RFC-017 a RFC-020) foi construída como um **dashboard** (cards, barras, botões, listas) quando deveria ser um **jogo 2D de verdade** — o jogador controla o PolvIn andando livremente pela cidade, com câmera, e interage com construções por proximidade, não por cliques em cards. Referências citadas (conceitos, não cópia): Animal Crossing, Stardew Valley, Hay Day, Monopoly, Jogo da Vida, Pou.

**O que NÃO muda**: toda a lógica econômica das Fases 1-4 (`CityLife`: ciclo semanal, cenários, emprego, educação, investimentos, imóveis, negócios) — validada e testada em 4 RFCs — continua 100% intacta. **O que muda**: como o jogador aciona e vê essa lógica. Essa RFC entrega a **fundação** do motor de jogo (Fase 5) — não as 17 arquiteturas de sistema completas que o usuário listou como visão de longo prazo (Quest System, Weather System, Audio Manager, Character Customization, etc.), que ficam para fases seguintes, na mesma disciplina de todo o resto do projeto.

## Decisão técnica (CTO/Software Architect)
**Phaser.js 3, via CDN, sem build step** — não React, não PixiJS puro, não Godot-web:
- **Por que não React**: o app inteiro é JS puro em `<script>` tags globais, sem bundler, há 21 RFCs. Introduzir React forçaria um build step em todo o projeto (ou um "ilha" React isolada de tudo mais) — inconsistência arquitetural desnecessária.
- **Por que Phaser, não PixiJS puro**: Pixi é só o renderizador; Phaser já inclui, sobre o Pixi, tudo que o pedido do usuário precisa de fábrica — cena, câmera, física, input, tweening, sprites. Usar Pixi puro significaria reimplementar metade do Phaser.
- **Por que não Godot-web (ainda)**: outra toolchain e pipeline de export inteiros — investimento válido *se* o jogo crescer além do que Phaser aguenta, não uma decisão de dia 1.
- Phaser 3 tem um bundle UMD (`phaser.min.js`) que funciona como *qualquer outro* `<script src="...">` já usado no projeto — zero mudança de processo de build.

## Objetivo
Um mapa jogável mínimo: o jogador controla o token do PolvIn (clique/toque pra mover), a câmera acompanha o personagem, existe 1 construção (o Banco) que reage por proximidade (balão de fala ao aproximar) e abre, ao entrar, um painel de diálogo na parte inferior da tela — reaproveitando ali, sem nenhuma reescrita, o ciclo semanal já existente do `CityLife` (RFC-017).

## Motivação
Pedido direto do usuário, com justificativa clara: "o jogador deve sentir que está jogando, não estudando." O critério de aceite que ele mesmo deu — "isso parece um dashboard ou um jogo?" — é o teste que essa RFC precisa passar.

## Benefícios
Prova de conceito completa do padrão "proximidade → balão → câmera → diálogo → lógica existente" com 1 construção, antes de replicar pra Concessionária/Universidade/Imobiliária/Escritório (Fase 6+) — risco técnico (Phaser funciona bem dentro do app? a lógica do `CityLife` realmente é reutilizável sem reescrita?) resolvido numa fatia pequena, não nas 5 construções de uma vez.

## Impacto
- **`index.html`**: `<script src=".../phaser.min.js">` (CDN) antes de `js/citygame.js` (novo). Novo `<div id="cityGameCanvas">` dentro do card "Sua Vida Financeira" — substitui ali o painel de cards do ciclo semanal.
- **`js/citygame.js`** (novo): `CityGame` — boot do `Phaser.Game`, `preload`/`create`/`update` da cena única. Token do PolvIn = `Polvin-logo.png` como sprite, com squash-and-stretch (escala Y 1→0,92→1 a cada passo) + tilt na direção do movimento + rastro de bolhas ao andar (validado pelo UX/UI Designer: essa é a assinatura visual que distingue de "ícone deslizando"). Mapa = areia + mar com borda ondulada, tudo desenhado via `Phaser.Graphics` (sem tileset). Banco desenhado do mesmo jeito (parede/telhado/janela com glow pulsante). Câmera segue o jogador (mundo maior que o viewport, pra o acompanhamento ser real, não decorativo). Balão de proximidade e painel de diálogo são overlays HTML posicionados sobre o canvas (não desenhados no Phaser), reaproveitando `.polvin-bubble`/`Polvin.renderBubble`/`Polvin.typewrite` já existentes — sem reinventar a forma do balão em Graphics.
- **`js/citylife.js`**: `render()` para de desenhar o painel do ciclo semanal (KPIs/promoção/atributos/decisão) — isso passa a viver no painel de diálogo do `CityGame`, chamando os MESMOS métodos (`avancarSemana`, `resolverDecisao`, `getState`) sem nenhuma mudança de lógica. `render()` continua desenhando as seções "legado" (Educação, Patrimônio Físico, Seu Negócio) num `#cityLifeLegacyPanel`, abaixo do mapa — ainda em formato de card, explicitamente marcadas como temporárias até ganharem suas próprias construções no mapa (Fase 6+).
- **`css/style.css`**: estilos do balão de proximidade e do painel de diálogo inferior.

## Dependências
RFC-017 a RFC-020 (toda a lógica reaproveitada).

## Critérios de aceite
- Canvas do Phaser renderiza dentro da aba Cidade, sem erro de console.
- Clicar/tocar num ponto do mapa move o token do PolvIn até lá, com animação (não teleporte).
- Câmera acompanha o jogador visivelmente (mundo maior que o viewport).
- Aproximar do Banco mostra o balão; afastar o esconde.
- Entrar no Banco abre o painel de diálogo inferior com o ciclo semanal real (mesmos números/regras do RFC-017) — decisão resolvida atualiza o patrimônio de verdade.
- Educação/Patrimônio Físico/Negócio continuam 100% funcionais no painel legado, sem regressão.
- Teste real (Playwright): interação completa ponta a ponta, zero erro de console.

## Etapas puladas e por quê
- **Database Engineer/Cyber Security Specialist/DevOps Engineer**: sem mudança de dados persistidos (mesma `STORAGE_KEYS.CITY_LIFE`), sem superfície de ataque nova (Phaser é só renderização client-side), sem deploy.
- **Financial Specialist/Gamification Designer**: nenhuma regra econômica ou de recompensa muda nesta RFC — é 100% troca de apresentação sobre lógica já validada.

## Registro por etapa

### 1. Product Owner
Escopo explicitamente limitado à fundação (1 construção, movimento, câmera, diálogo) — as 17 arquiteturas de sistema listadas pelo usuário (Quest/Weather/Audio/Character Customization/etc.) são a visão de destino, não o próximo commit. Registradas no ROADMAP como fases futuras, na mesma disciplina usada em todo o projeto. Termo interno "jogo web" adotado nos RFCs/ROADMAP a partir de agora, para a Cidade Financeira especificamente (o nome público do produto continua PolvIn).

### 2. Software Architect
Decisão de stack registrada acima. Separação de responsabilidade: `CityLife` = estado/regras (sem nenhuma mudança de Fases 1-4), `CityGame` = apresentação nova (Phaser + overlays HTML). O painel de diálogo e o balão de proximidade são HTML, não Phaser Graphics — mais rápido de construir reaproveitando CSS/componentes já existentes, e mais fácil de manter texto rico (o `typewrite` de `Polvin.renderBubble` não teria equivalente direto em Phaser sem reescrever do zero).

### 3. UX/UI Designer
Direção de arte decidida (consultado antes de implementar): PolvIn como "token vivo" usando a arte 3D já existente (não pixel art falsa) com squash-and-stretch + rastro de bolhas ao andar — a assinatura que evita "isso é só um ícone deslizando". Mapa inicial é litoral (areia + mar ondulado), não grama genérica de fazenda — extensão direta da identidade visual já estabelecida no RFC-010, não um estilo novo. Balão de proximidade reaproveita a silhueta de `.polvin-bubble` (nunca um tooltip cinza de sistema). Diálogo abre como painel fixo inferior com o mapa ainda visível atrás (like um RPG clássico), não um modal central — reaproveitando a estrutura de fala/typewrite já existente.

### 4. Frontend Engineer
Implementado: `js/citygame.js` completo, ajuste de `js/citylife.js` (render dividido em ciclo semanal via `CityGame` + legado via `#cityLifeLegacyPanel`), script do Phaser + canvas novo em `index.html`, CSS do balão/painel.

### 5. QA Engineer
Testado via Playwright real: canvas presente e sem erro; clique no mapa move o token (posição muda ao longo de frames, não instantaneamente); aproximar do Banco mostra o balão de proximidade; clicar no balão abre o painel de diálogo; resolver a decisão dentro do painel atualiza o patrimônio real (mesmo `STORAGE_KEYS.CITY_LIFE`); seções de Educação/Patrimônio/Negócio continuam funcionando no painel legado. Zero erro de console.

**Bug real encontrado e corrigido nesta rodada**: após o primeiro movimento, o sprite do PolvIn "explodia" pro tamanho nativo da imagem (`Polvin-logo.png`), cobrindo o canvas inteiro — confirmado visualmente via screenshot, não só por asserção de teste. Causa: o squash-and-stretch em `update()` chamava `player.setScale(1, bounce)`/`setScale(1,1)` com escala absoluta, descartando a proporção definida por `setDisplaySize(58, 58)` em `create()`. Corrigido guardando `this.playerBaseScale` (a escala real gerada pelo `setDisplaySize`) e multiplicando por ela em toda chamada de `setScale` dentro de `update()`. Reverificado com screenshot após a correção — token permanece pequeno e consistente durante e depois do movimento.

### 6. Documentation Specialist
`ROADMAP.md`/`CHANGELOG.md` atualizados, com a mudança de rumo explicada (não é reversão de qualidade, é correção de direção) e as fases futuras do motor de jogo (mais construções, sistemas de quest/clima/áudio/personalização) registradas como visão de longo prazo.

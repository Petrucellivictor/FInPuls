# RFC-022: Cidade Financeira — Fase 6 (mais construções no mapa, fim do painel legado)

- **Status**: concluída
- **Prioridade**: alta (continuação direta do pivot arquitetural da Fase 5, pedida pelo próprio usuário: "isso, pode continuar")
- **Agentes envolvidos**: Product Owner, Software Architect, UX/UI Designer, Frontend Engineer, QA Engineer, Documentation Specialist.

## Descrição
A Fase 5 (RFC-021) provou o padrão proximidade → balão → câmera → diálogo → lógica existente com 1 construção (Banco), mas manteve Educação/Patrimônio Físico/Negócio num `#cityLifeLegacyPanel` — um card de dashboard "temporário" abaixo do mapa, explicitamente marcado como provisório. Esta fase termina o pivot: mais 4 construções jogáveis no mesmo mapa, cada uma hospedando uma fatia do que hoje só existe no painel legado — que deixa de existir.

## Objetivo
4 construções novas, cada uma com seu próprio balão de proximidade e painel de diálogo, reaproveitando 100% da lógica de `CityLife` já validada (Fases 1-4):
- **Universidade** → cursos (`CITY_LIFE_COURSES` / `comprarCurso`).
- **Concessionária** → veículos (`CITY_LIFE_ASSETS` categoria `"luxo"` — bicicleta/carro popular/carro de luxo — `comprarBem`).
- **Imobiliária** → imóveis (`CITY_LIFE_ASSETS` categoria `"imovel"` — terreno/casa própria/apartamento — `comprarBem`).
- **Escritório** → emprego/promoção + negócio (`promocaoDisponivel`/`aceitarPromocao`, `abrirNegocio`/`contratarFuncionario`/`demitirFuncionario`/`fecharNegocio`).

Ao final, `#cityLifeLegacyPanel` e o card que o envolve saem do HTML — não fica nenhum fallback em formato de card.

## Motivação
Resposta direta à confirmação do usuário para continuar depois da Fase 5. Fechar a Fase 6 elimina a última peça do dashboard antigo, cumprindo o critério de aceite original ("isso parece um dashboard ou um jogo?") para 100% da aba Cidade, não só para o ciclo semanal.

## Benefícios
- Consistência: todas as 5 construções (Banco + 4 novas) seguem exatamente o mesmo padrão de interação — menor superfície de manutenção do que ter 2 paradigmas de UI coexistindo.
- Sem painel "temporário" residual — a aba Cidade passa a ser 100% jogo, sem exceção.
- Reaproveita 100% da lógica de negócio das Fases 1-4, sem reescrever nenhuma regra.

## Impacto
- **`js/citygame.js`**: refatorado de "1 construção hardcoded" para uma lista de construções (`BUILDINGS`) — posição, rótulo, desenho (Graphics) e handler de abertura por item, com proximidade/balão/diálogo genéricos (um loop, não 4 cópias do código do Banco).
- **`js/citylife.js`**: `render()` (que desenhava só o painel legado) é removido. Em seu lugar, 4 novos pontos de entrada "Into" (mesmo padrão de `renderCicloInto`): `renderEducacaoInto`, `renderVeiculosInto`, `renderImoveisInto`, `renderTrabalhoInto`. Como só 1 diálogo fica aberto por vez, os métodos que mutam estado (`comprarCurso`, `comprarBem`, `aceitarPromocao`, `abrirNegocio` etc.) passam a re-renderizar só o container ativo (`this._activeContainer`/`this._activeRender`), não mais "os 2 painéis" da Fase 5.
- **`index.html`**: remove o card com `#cityLifeLegacyPanel`; mapa ganha mais 4 construções (mesmo `<div id="cityGameCanvas">`, sem novos elementos fixos — cada construção usa o mesmo par balão/diálogo compartilhado).
- **`css/style.css`**: nenhuma classe nova esperada (balão/diálogo já são genéricos desde a Fase 5); ajuste conforme achado do UX/UI Designer.

## Dependências
RFC-021 (padrão de interação e separação `CityLife`/`CityGame`).

## Critérios de aceite
- As 4 construções novas aparecem no mapa, cada uma com posição e desenho distintos (não repete a arte do Banco).
- Aproximar de cada uma mostra o balão certo; entrar abre o diálogo com o conteúdo certo (educação/veículos/imóveis/trabalho).
- Comprar um curso/bem, aceitar promoção, abrir/fechar negócio — tudo continua funcionando com os MESMOS números/regras das Fases 1-4 (nenhuma lógica reescrita).
- `#cityLifeLegacyPanel` não existe mais no HTML; nenhuma regressão visível nas 4 funcionalidades que ele hospedava.
- Teste real (Playwright): as 5 construções, ponta a ponta, zero erro de console.

## Etapas puladas e por quê
- **Database Engineer/Cyber Security Specialist/DevOps Engineer**: mesma justificativa da Fase 5 — nenhuma mudança de dados persistidos, nenhuma superfície de ataque nova, sem deploy.
- **Financial Specialist/Gamification Designer**: nenhuma regra econômica ou de recompensa muda — é relocação de UI sobre lógica já validada nas Fases 1-4.

## Registro por etapa

### 1. Product Owner
Escopo fechado nas 4 construções acima — mapeamento 1:1 do que já existia no painel legado, sem adicionar função nova. Fases seguintes (não escopadas aqui): NPCs com diálogo próprio, mais construções fora do que já existe hoje (ex.: Supermercado, se algum dia ganhar mecânica própria), sistemas mais amplos da visão de longo prazo do usuário.

### 2. Software Architect
`CityGame.BUILDINGS`: array `{id, x, y, promptText, borderColor, draw(scene,b), open(container)}` — `create()`/`update()` iteram a lista, sem nenhum caso especial por construção (o Banco virou só mais um item). Proximidade: a construção mais próxima dentro do raio "ganha" o balão (`nearBuilding`), evitando ambiguidade se 2 ficarem próximas. Diálogo: continua sendo 1 único `#cityGameDialogue` compartilhado, com o `id` do conteúdo interno generalizado para `#cityGameDialogueContent` — só 1 aberto por vez. `CityLife`: `render()` fixo (que desenhava todos os painéis) foi removido; cada `renderXInto(container)` grava `this._activeContainer`/`this._activeRenderer`, e todo método que muta estado chama só `this._refreshActive()` — redesenha o único painel aberto no momento, nunca "todos os possíveis". `CityGame.closeDialogue()` chama `CityLife.clearActiveContainer()` ao fechar, evitando re-render num container desmontado. Mundo cresceu de `WORLD_W=1200` para `1750` pra caber as 5 construções com ≥280px entre centros (Universidade 280, Concessionária 560, Banco 980 — inalterado, Imobiliária 1260, Escritório 1540).

### 3. UX/UI Designer
4 silhuetas desenhadas via Phaser.Graphics puro (sem asset novo, mesma técnica do Banco), cada uma reconhecível de longe por forma, não só por texto: Universidade = torre estreita com cúpula verde-petróleo + colunas douradas + emblema 🎓 balançando; Concessionária = construção baixa e larga com vitrine + holofote giratório; Imobiliária = casinha terracota com placa "à venda" balançando no vento; Escritório = torre alta e estreita com grade de janelas douradas que acendem/apagam em sequência. Balão e painel de diálogo continuam sendo o MESMO componente HTML pras 5 construções (não criou variante por construção) — a identidade vem do emoji+texto do balão e de uma borda superior de 4px no painel, cuja cor (`borderColor`) é setada inline por construção (roxo Banco/verde Universidade/laranja Concessionária/vermelho Imobiliária/azul Escritório), confirmando visualmente "onde você está" sem CSS novo por construção.

### 4. Frontend Engineer
Implementado exatamente conforme as decisões acima: `js/citygame.js` reescrito (lista `BUILDINGS`, `drawBanco`/`drawUniversidade`/`drawConcessionaria`/`drawImobiliaria`/`drawEscritorio`, proximidade/balão/diálogo genéricos, `openBuilding`/`closeDialogue` substituindo `openBanco`/`closeBanco`); `js/citylife.js` ganhou `renderEducacaoInto`/`renderVeiculosInto`/`renderImoveisInto`/`renderTrabalhoInto` (mesmo padrão de `renderCicloInto`), `renderPatrimonioFisicoHtml` ganhou filtro de categoria opcional (reaproveitado por Concessionária/Imobiliária sem duplicar a lista de bens), `render()`/`init()` (painel legado fixo) removidos; `js/app.js` teve a chamada `CityLife.init()` removida (não há mais nada pra desenhar no boot); `index.html` perdeu o card com `#cityLifeLegacyPanel`, com o texto de introdução do mapa atualizado pra citar as 5 construções; `css/style.css` ganhou `border-top: 4px solid var(--primary)` em `.city-game-dialogue` (cor trocada inline por construção via JS).

### 5. QA Engineer
Testado via Playwright real contra as 5 construções: `#cityLifeLegacyPanel` confirmado ausente do DOM; canvas do Phaser presente sem erro; pra cada construção (Banco/Universidade/Concessionária/Imobiliária/Escritório) — teletransportar o PolvIn pra perto mostra o balão com o texto certo, clicar abre o diálogo com o conteúdo certo (ciclo semanal/cursos/veículos filtrados por categoria "luxo"/imóveis filtrados por categoria "imovel"/negócio), fechar esconde o painel de volta. Comprar um curso de dentro do diálogo da Universidade debita o patrimônio real e persiste em `cursosComprados` — confirma que a mutação de estado funciona pelo novo caminho `_activeContainer`/`_activeRenderer`, não só a leitura. Zero erro de console/página. Confirmado visualmente por screenshot que as 5 construções têm silhuetas distintas, sem sobreposição, e a borda do painel de diálogo troca de cor corretamente por construção.

### 6. Documentation Specialist
`CHANGELOG.md`/`ROADMAP.md` atualizados registrando o fim do painel legado (5ª e última peça do dashboard original migrada para o mapa) e as fases futuras (NPCs com diálogo próprio, Quest/Weather/Audio/Character Customization — visão de longo prazo do usuário, ainda não escopada).

# RFC-011: Guarda-roupa do POLVIn (Fase 2B — customização estilo POU)

- **Status**: concluída
- **Prioridade**: alta (pedido direto do usuário, Fase 2B do plano registrado no RFC-010)
- **Agentes envolvidos**: Product Owner, Software Architect, UX/UI Designer, Gamification Designer, Backend Engineer, Frontend Engineer, Cyber Security Specialist, QA Engineer, Documentation Specialist.

## Descrição
"O PolvIn pode ter característica com o do jogo POU, podendo mudar a cor dele, vestir skins e acessórios e adquirir bens." O Fin+ já tem 80% disso — acessórios/bandeiras/molduras compráveis e equipáveis no POLVIn (`SHOP_ITEMS`/`Profile`/`Polvin.avatarHtml`) — só falta (1) mudar a COR do POLVIn e (2) uma tela dedicada de "guarda-roupa" com preview ao vivo, em vez da vitrine única que mistura tudo.

## Objetivo
Fechar a Fase 2B do plano de redesign registrado no RFC-010, reaproveitando ao máximo o sistema de equipar já existente e testado.

## Motivação
Pedido direto do usuário na mesma mensagem que definiu o plano de fases (RFC-010).

## Benefícios
Zero sistema novo de "equipar" — cor é só mais um `tipo` dentro do MESMO objeto `EQUIPPED` que já guarda acessório/bandeira/moldura, então toda a lógica de comprar/equipar/trocar já testada nesta sessão continua valendo sem duplicação. A cor em si usa um filtro CSS (`hue-rotate`) sobre a arte já existente do POLVIn — sem gerar nenhum asset novo, mesma restrição já em uso desde o RFC-008.

## Impacto
- `js/data.js`: `SHOP_ITEMS` ganha 6 entradas novas com `tipo: "cor"` (cada uma com um `filtro` CSS em vez de `cor` hexadecimal).
- `js/polvin.js`: `avatarHtml()` passa a aplicar o filtro da cor equipada (`equipped.cor`) na `<img>`, junto do que já existia (moldura/acessório/bandeira).
- `js/profile.js`: `renderShop()` reescrito — ganha um preview grande ao vivo do POLVIn no topo (atualiza a cada compra/troca de equipamento) e os itens passam a ser agrupados por categoria (Cor, Acessórios, Bandeiras, Molduras) em vez de uma vitrine única misturada.
- `index.html`: painel do Perfil ganha o container do preview.
- `css/style.css`: seção nova pro preview do guarda-roupa e os cabeçalhos de categoria.

## Dependências
Nenhuma. Reaproveita 100% do sistema de Loja/equipar já existente (nenhuma alteração de comportamento pros itens já comprados).

## Critérios de aceite
- As 6 cores novas são compráveis/equipáveis pelo MESMO fluxo de sempre (`buy`/`toggleEquip`), sem nenhum código novo de compra.
- Equipar uma cor muda visualmente o POLVIn em TODO lugar que usa `Polvin.avatarHtml()` (Início, Perfil, trilha, celebração de lição, etc.) — não só na tela do guarda-roupa.
- Trocar de cor nunca desequipa acessório/bandeira/moldura (categorias independentes, mesma garantia que já existe entre as 3 categorias atuais).
- Preview ao vivo do guarda-roupa reflete o estado real equipado, atualiza junto com o resto da Loja.
- `node --check` limpo; teste visual real (Playwright) confirma que cada cor aplicada não deixa a arte ilegível/quebrada.

## Etapas puladas e por quê
- **Database Engineer**: mesma chave `STORAGE_KEYS.EQUIPPED`/`SHOP_OWNED` já existente, nenhuma mudança de schema.
- **Financial Specialist**: sem conteúdo financeiro.
- **DevOps Engineer**: sem deploy nesta RFC.

## Registro por etapa

### 1. Product Owner
Escopo: só cor + guarda-roupa nesta RFC. "Adquirir bens" do pedido original já existe (Loja normal) e a Loja do Fundo do Mar (RFC-010) já cobre a parte de "bens" ligada à Cidade — não duplicar aqui. Próximo: Software Architect.

### 2. Software Architect
Decisão central: cor é só mais um `tipo` em `SHOP_ITEMS`/`EQUIPPED` — não um sistema separado. Isso significa que `Profile.buy()`/`Profile.toggleEquip()`/`Profile.equip()` não precisam de NENHUMA alteração; só `Polvin.avatarHtml()` (pra aplicar o filtro) e `Profile.renderShop()` (pra reorganizar a vitrine) mudam. Próximo: UX/UI Designer.

### 3. UX/UI Designer
Preview ao vivo grande no topo da Loja (reaproveita `Polvin.avatarHtml("lg")`, já existente) — é o "espelho do guarda-roupa", deixa claro o efeito de cada troca antes/depois de equipar, sem precisar sair da tela. Itens agrupados por categoria com um cabeçalho simples (emoji + nome da categoria), mesmo card `.shop-item` de sempre — não um componente novo, só reorganização.

### 4. Gamification Designer
Preços das cores na mesma faixa das molduras (60-100 moedas) — cor é a customização mais "visível" (afeta o POLVIn em todo o app), então fica no topo da faixa de preço dos cosméticos, sem overlap com a faixa de acessórios/bandeiras (25-150) que já existe.

### 5. Backend Engineer
Implementado: 6 `SHOP_ITEMS` novas (`tipo: "cor"`), cada uma com `filtro` (valor de `filter` CSS calibrado visualmente, não só calculado por fórmula de hue — ver QA).

### 6. Frontend Engineer
Implementado: `Polvin.avatarHtml()` aplica `filter` quando há cor equipada; `Profile.renderShop()` reescrito com preview + categorias; CSS novo.

### 7. Cyber Security Specialist
Sem superfície de risco nova — `filtro` é uma string estática de `data.js`, nunca vem de entrada do usuário.

### 8. QA Engineer
Testado via execução real do código (Node/vm, `Profile.buy`/`Profile.toggleEquip`/`Polvin.avatarHtml` reais, não reimplementações):
- 6 cores novas em `SHOP_ITEMS`, todas com `filtro` não vazio, nenhum `id` duplicado.
- Comprar uma cor (`Profile.buy`) debita o preço exato, adiciona a `SHOP_OWNED`, auto-equipa (mesmo comportamento de sempre pra qualquer item), e `Polvin.avatarHtml()` passa a incluir o filtro no `style` da imagem.
- Comprar/equipar uma moldura enquanto uma cor já está equipada mantém as DUAS equipadas ao mesmo tempo (`equipped.cor` e `equipped.moldura` independentes) — `avatarHtml()` aplica `border-color` E `filter` juntos, sem um sobrescrever o outro.
- Trocar de cor (`toggleEquip` com uma cor diferente já comprada) troca corretamente, sem duplicar entradas em `EQUIPPED`.
- `renderShop()` agrupa por categoria (Cor/Acessórios/Bandeiras/Molduras) e preenche o preview ao vivo com o estado equipado real.
- Comprar sem moedas falha exatamente como qualquer outro item da Loja (mesmo alerta, nenhuma alteração de estado).
- **Calibração visual real** (Playwright + Chromium, screenshot de cada cor): os primeiros valores de `hue-rotate` escritos (a partir de uma suposição de matiz-base, não medição) resultaram em cores erradas (ex.: "Verde Esmeralda" saiu vermelho, "Vermelho Fogo" saiu verde) — corrigido deduzindo a matiz-base real do POLVIn (~262°, roxo) a partir dos resultados observados, recalculando os 6 ângulos, e reconferindo cada um visualmente até bater com o nome (verde, azul, rosa-choque, vermelho, dourado-âmbar consistente com o `--gold` já usado no design system, e ciano). Sem essa verificação visual real, as 6 cores estariam erradas em produção apesar de todo o resto do código estar correto.
- Regressão: refeito o fluxo de celebração de lição (RFC-008) depois de todas as mudanças — zero erros de console, comportamento idêntico.
- `node --check` limpo em `js/data.js`, `js/polvin.js`, `js/profile.js`.

### 9. Documentation Specialist
`CHANGELOG.md`/`ROADMAP.md` atualizados (v1.30.0), marcando a Fase 2B como concluída.

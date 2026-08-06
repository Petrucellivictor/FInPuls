# RFC-020: Cidade Financeira — Fase 4 (empresas com fluxo de caixa e reputação)

- **Status**: concluída
- **Prioridade**: alta (continuação direta do RFC-017/018/019, pedida pelo usuário)
- **Agentes envolvidos**: Product Owner, Software Architect, Gamification Designer, Frontend Engineer, QA Engineer, Documentation Specialist.

## Descrição
Continuação do simulador de vida da Cidade Financeira. Fase 4 implementa "Empresas" e "Reputação" do spec original, unidos numa RFC porque o próprio spec já os conecta ("algumas oportunidades... dependem dessa reputação"). Só quem chegou ao emprego **Empresário(a)** (desbloqueado na Fase 2, via curso de Empreendedorismo) pode abrir um negócio — a Fase 4 é a primeira a dar uso real a esse emprego, que até aqui só pagava salário.

## Objetivo
3 tipos de negócio (Cafeteria, Loja de Roupas, Consultoria), cada um com receita e despesa próprias, reagindo ao cenário econômico da semana. O jogador contrata/demite funcionários (mais receita potencial, mais despesa), vê o lucro ou prejuízo de cada semana, e constrói (ou perde) Reputação conforme o negócio é lucrativo ou não — "o jogador aprende fluxo de caixa na prática."

## Motivação
Pedido do usuário, continuando o mesmo spec. Sem essa Fase, o emprego "Empresário(a)" da Fase 2 não tinha nenhum efeito prático alem do salário mais alto — a Fase 4 é o que dá sentido a existir esse cargo.

## Benefícios
Ensina, de forma concreta e sem jargão contábil, a diferença entre receita e lucro (contratar mais gente aumenta a receita potencial, mas também a despesa — nem sempre compensa), e que abrir um negócio é um risco real (fechar não devolve o investimento — diferente das decisões semanais de investimento, que nunca subtraem patrimônio já conquistado, abrir uma empresa é uma aposta real, igual na vida real).

## Impacto
- **`js/data.js`**: `CITY_LIFE_BUSINESSES` (3 tipos, cada um com `custoAbertura`, `receitaBase`, `despesaBase`, `custoPorFuncionario`). `WEEKLY_ECONOMIC_SCENARIOS` ganha `negocioReceitaPct` por cenário (receita de pequenos negócios reage à economia — mais forte no Boom, mais fraca na Crise). 1 conquista nova (`primeiro_negocio_cidade`).
- **`js/citylife.js`**: `abrirNegocio()` (exige `empregoId === "empresario"`, sem negócio já aberto, patrimônio suficiente), `contratarFuncionario()`/`demitirFuncionario()` (0-5 funcionários), cálculo semanal de lucro/prejuízo (dentro de `avancarSemana()`, junto da valorização de bens) somado direto ao patrimônio, Reputação subindo em semanas lucrativas e caindo levemente em semanas de prejuízo, `fecharNegocio()` (não devolve o investimento inicial — risco real, diferente das decisões semanais que nunca subtraem patrimônio conquistado).
- **`index.html`/render**: nova seção "🏢 Seu Negócio" (catálogo pra abrir, ou painel do negócio atual com funcionários/lucro/reputação) e uma 5ª barra de atributo (🤝 Reputação).

## Dependências
RFC-018 (Fase 2 — emprego "Empresário(a)" e seu requisito).

## Critérios de aceite
- Só é possível abrir negócio como Empresário(a); só 1 negócio por vez.
- Contratar funcionário aumenta receita potencial E despesa; lucro/prejuízo reais somam ao patrimônio toda semana.
- Reputação sobe em semana lucrativa, cai (pouco) em semana de prejuízo.
- Fechar o negócio não devolve o valor de abertura — risco real, documentado como decisão deliberada (diferente da regra "sem penalidade" das decisões semanais de investimento).
- Teste real (Node + Playwright): abrir negócio, contratar/demitir, várias semanas de operação com lucro/prejuízo variando por cenário, fechar negócio.

## Etapas puladas e por quê
- **Database Engineer/Cyber Security Specialist/DevOps Engineer**: mesmo motivo das fases anteriores.
- **Financial Specialist**: modelo de fluxo de caixa é ilustrativo/simplificado (não cita alíquota real nenhuma — isso já foi coberto em profundidade na trilha Empreender, Onda 8), e a direção "receita de pequeno negócio acompanha o ciclo econômico" é didaticamente óbvia, sem relação contraintuitiva que justifique consulta (diferente do caso de FIIs/Cripto na Fase 2).

## Registro por etapa

### 1. Product Owner
Só 1 negócio por vez, e fechar não devolve o investimento — decisão deliberada de manter o risco real de empreender, distinto da regra "decisões semanais nunca perdem patrimônio conquistado" (RFC-017): abrir empresa é uma aposta explícita, não uma alocação de sobra mensal.

### 2. Software Architect
`state.negocio` é um objeto único (não array/mapa) — só 1 negócio ativo por vez nesta fase, mais simples que o padrão de `bensComprados`. Cálculo de fluxo de caixa roda dentro do mesmo `avancarSemana()` que já aplica valorização de bens — um único ponto por semana que atualiza tudo "passivo" (bens + negócio), antes de apresentar a decisão do jogador.

### 3. Gamification Designer
Reputação usa o mesmo padrão visual de barra das Fases 1-3 (0-100, clamp). Consultado sobre "fechar negócio sem devolver o investimento parecer punição": confirmado que não é — é a consequência natural de um risco que o jogador assumiu conscientemente ao abrir (mesma lógica de "existem consequências, não Game Over" já usada pros cenários econômicos na Fase 1, agora aplicada ao próprio ato de empreender).

### 4. Frontend Engineer
Implementado: dados novos em `js/data.js`, lógica completa de negócio/reputação em `js/citylife.js`, seção "Seu Negócio" + barra de Reputação no render.

### 5. QA Engineer
Testado via Node (harness real) + Playwright: tentar abrir negócio sem ser Empresário(a) falha; abrir com sucesso deduz `custoAbertura`; contratar funcionário aumenta receita E despesa simuladas; várias semanas de operação alternam lucro/prejuízo conforme o cenário sorteado, sempre somando ao patrimônio; Reputação sobe/cai conforme o resultado da semana; fechar negócio remove o estado sem devolver valor; zero erro de console.

### 6. Documentation Specialist
`ROADMAP.md`/`CHANGELOG.md` atualizados; fases restantes (isométrico, linha do tempo, relatório de temporada) continuam registradas.

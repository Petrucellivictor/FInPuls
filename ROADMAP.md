# Roadmap de melhorias — gamificação e engajamento

Backlog priorizado (chapéu de Product Owner) a partir de uma lista de 13 ideias trazida pelo usuário em 2026-08-05. Cada item foi classificado por **status** (o que já existe vs. o que é do zero) e organizado em **etapas** — a ordem reflete risco arquitetural, dependências entre itens e esforço, não a ordem em que foram pedidos.

## Etapa 0 — decisões de arquitetura (antes de codar)

Dois itens do pedido original não podem ser implementados como descrito sem mudar a arquitetura 100% client-side do projeto (ver README, seção "Fora do escopo"). Registrados aqui para decisão consciente, não para bloquear o resto do roadmap.

- **IA financeira conversacional** ("Tenho R$300/mês, onde investir?"): exigiria uma chave de API de LLM guardada em servidor — nunca pode ficar exposta no client. Não implementado agora. Versão intermediária viável na Etapa 1: expandir a base de palavras-chave do POLVIn (`ASSISTANT_FAQ`) para cobrir perguntas desse tipo com respostas educativas genéricas (não personalizadas). IA real fica condicionada a uma futura função serverless (Vercel/Supabase Edge Function), a ser avaliada com o DevOps Engineer.
- **Notificações inteligentes** enquanto o app está fechado: exigem um push server (Web Push). Versão viável sem infraestrutura nova, na Etapa 1: avisos do POLVIn (toast/banner) baseados em eventos reais, mostrados enquanto o app está aberto — "faltam 20 XP para o próximo nível", "sua sequência está em risco hoje". Push de verdade fica registrado aqui como item futuro.

## Etapa 1 — melhorar o que já existe (maior impacto, menor risco)

| Item pedido | Status hoje | O que muda |
| --- | --- | --- |
| Sistema de níveis | Existe (`PLAYER_LEVEL_TITLES`, 6 títulos genéricos) | Trocar por progressão temática de investidor (Iniciante → Poupador → Investidor → Estrategista → Trader → Mestre das Finanças → Lenda Financeira) — **implementado nesta etapa**, ver `js/data.js` |
| Conquistas | Existe (19 conquistas) | Adicionar as citadas pelo usuário que ainda não existem: 50 simulações, "Amigo do POLVIn", Renda Fixa/Variável concluídas isoladamente, 10 livros lidos |
| Missões diárias "nunca iguais" | Existe (pool de 7 desafios, seleção determinística por dia) | Ampliar o pool e melhorar a seleção para reduzir a sensação de repetição |
| Mercado em tempo real | Existe (`js/market.js`, ticker de moedas/cripto) | Adicionar mais itens ao painel (ações específicas, Selic, IPCA) reaproveitando fontes já usadas em `BCB_SERIES` |
| Notificações do POLVIn (versão client-side) | Não existe | Toasts contextuais baseados em XP faltante / streak em risco, sem infraestrutura nova |

## Etapa 2 — novas mecânicas de conteúdo (esforço médio)

- **Histórias interativas dentro das aulas**: cenários de escolha ("João ganhou R$3.000...") intercalados na trilha financeira (não em toda lição — a cada ~3 lições), com desfecho que muda conforme a escolha. Depende do Financial Education Specialist para o conteúdo.
- **Simulador estilo jogo**: cenário "você recebeu R$50.000, o que faz?" com resultado revelado "10 anos depois" — nova experiência dentro da aba Simulador, complementar (não substitui) o simulador de juros compostos atual.
- **Estante de livros + certificados**: `js/books.js` vira uma estante visual; cada livro concluído ganha resumo + quiz + certificado. Certificados agrupados numa "parede" (Etapa 2 termina aqui; a parede en si pode crescer na Etapa 3 junto dos certificados de trilha).

## Etapa 3 — novas features maiores (mais esforço, mais risco de escopo)

- **Cidade Financeira**: meta-jogo visual onde marcos de progresso (primeira lição, 50/100 dias de streak, Renda Fixa concluída, primeira ação simulada) constroem uma cidade (casa → banco → empresa → bolsa → cofre). Precisa de uma aba/visualização nova e um mapeamento de marcos → construções.
- **Eventos temporários**: Semana Bitcoin, Natal, Black Friday, IR, Férias — com missões especiais, itens exclusivos, XP em dobro, e um ranking semanal (depende de decidir se ranking fica só local ou some dia sincronizado via Supabase — ver "Roadmap sugerido" do README).
- **Modo carreira**: usuário escolhe um objetivo (casa, carro, intercâmbio, aposentadoria, faculdade, independência financeira) e o app monta uma trilha personalizada — a peça mais complexa do pedido, pois exige compor uma sequência de lições/simuladores/metas já existentes sob um "objetivo" novo, sem duplicar conteúdo.
- **Gating de conteúdo por nível**: níveis desbloqueando aulas/simulações/roupas/temas específicos (não só o título) — depende do sistema de níveis da Etapa 1 já estar estável, e exige repensar `Trail.isUnlocked`/a Loja para considerar nível do jogador, não só progresso sequencial.

## Como este roadmap é usado

Cada etapa é implementada em turnos/sessões subsequentes, seguindo o mesmo processo de commit + tag SemVer + entrada no `CHANGELOG.md` já em uso no projeto. Ideias trazidas depois deste roadmap devem ser encaixadas em uma das etapas acima (ou abrir uma nova), não implementadas soltas.

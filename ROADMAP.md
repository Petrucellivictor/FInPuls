# Roadmap de melhorias — gamificação e engajamento

Backlog priorizado (chapéu de Product Owner) a partir de uma lista de 13 ideias trazida pelo usuário em 2026-08-05. Cada item foi classificado por **status** (o que já existe vs. o que é do zero) e organizado em **etapas** — a ordem reflete risco arquitetural, dependências entre itens e esforço, não a ordem em que foram pedidos.

## Etapa 0 — decisões de arquitetura (antes de codar)

Dois itens do pedido original não podem ser implementados como descrito sem mudar a arquitetura 100% client-side do projeto (ver README, seção "Fora do escopo"). Registrados aqui para decisão consciente, não para bloquear o resto do roadmap.

- **IA financeira conversacional** ("Tenho R$300/mês, onde investir?"): exigiria uma chave de API de LLM guardada em servidor — nunca pode ficar exposta no client. Não implementado agora. Versão intermediária viável na Etapa 1: expandir a base de palavras-chave do POLVIn (`ASSISTANT_FAQ`) para cobrir perguntas desse tipo com respostas educativas genéricas (não personalizadas). IA real fica condicionada a uma futura função serverless (Vercel/Supabase Edge Function), a ser avaliada com o DevOps Engineer.
- **Notificações inteligentes** enquanto o app está fechado: exigem um push server (Web Push). Versão viável sem infraestrutura nova, na Etapa 1: avisos do POLVIn (toast/banner) baseados em eventos reais, mostrados enquanto o app está aberto — "faltam 20 XP para o próximo nível", "sua sequência está em risco hoje". Push de verdade fica registrado aqui como item futuro.

## Etapa 1 — melhorar o que já existe (maior impacto, menor risco) — ✅ concluída (v1.18.0 + v1.20.0, RFC-001)

| Item pedido | Status hoje | O que mudou |
| --- | --- | --- |
| Sistema de níveis | ✅ Feito (v1.18.0) | `PLAYER_LEVEL_TITLES` trocado pela progressão temática de investidor (Iniciante → Poupador → Investidor → Estrategista → Trader → Mestre das Finanças → Lenda Financeira) |
| Conquistas | ✅ Feito (v1.18.0) | 4 conquistas novas: Renda Fixa completa, 50 simulações, 10 livros lidos, Amigo do POLVIn |
| Missões diárias "nunca iguais" | ✅ Feito (v1.20.0, RFC-001) | Pool de 7 → 12 desafios; seleção trocada por embaralhamento determinístico por dia (27 combinações distintas em 30 dias simulados, contra um padrão fixo antes) |
| Mercado em tempo real | ✅ Feito (v1.20.0, RFC-001) | Mais pares de moeda (GBP, ARS) e criptomoedas (BNB, XRP) — cotação de ações individuais continua fora do escopo (ver Etapa 0 do README, exige API paga) |
| Notificações do POLVIn (versão client-side) | ✅ Feito (v1.20.0, RFC-001) | Toast único por dia — "sentiu sua falta" (2+ dias sem atividade) > "streak em risco" (nada feito hoje) > "faltam X XP para o próximo nível" |

## Etapa 2 — novas mecânicas de conteúdo (esforço médio) — ✅ concluída (v1.21.0 + v1.22.0)

- ✅ **Simulador estilo jogo** (v1.21.0, RFC-002): "Simulador de Decisões" na aba Simulador — 4 cenários (bônus, herança, prêmio, 13º turbinado), cada um com 4 opções (2 de gasto, 1 investir, 1 poupança), revelando as 3 projeções "10 anos depois" para comparação, reaproveitando a Selic real já usada no comparador de investimentos.
- ✅ **Estante de livros + certificados** (v1.21.0, RFC-003): `js/books.js` virou uma estante — os 18 livros ganharam resumo (contado pelo POLVIn) + quiz de 2 perguntas; completar gera um certificado numa "parede de certificados" nova. A conquista `leu_10_livros` passou a exigir 10 livros *completados*, não só recomendados.
- ✅ **Histórias interativas dentro das aulas** (v1.22.0, RFC-004): a cada 3ª lição concluída na trilha financeira, uma história curta (5 no pool, cicladas sem repetir) com um personagem e um dilema financeiro — 2 escolhas, desfechos narrativos diferentes, sem XP direto.

## Etapa 3 — novas features maiores (mais esforço, mais risco de escopo)

- **Cidade Financeira**: meta-jogo visual onde marcos de progresso (primeira lição, 50/100 dias de streak, Renda Fixa concluída, primeira ação simulada) constroem uma cidade (casa → banco → empresa → bolsa → cofre). Precisa de uma aba/visualização nova e um mapeamento de marcos → construções.
- **Eventos temporários**: Semana Bitcoin, Natal, Black Friday, IR, Férias — com missões especiais, itens exclusivos, XP em dobro, e um ranking semanal (depende de decidir se ranking fica só local ou some dia sincronizado via Supabase — ver "Roadmap sugerido" do README).
- **Modo carreira**: usuário escolhe um objetivo (casa, carro, intercâmbio, aposentadoria, faculdade, independência financeira) e o app monta uma trilha personalizada — a peça mais complexa do pedido, pois exige compor uma sequência de lições/simuladores/metas já existentes sob um "objetivo" novo, sem duplicar conteúdo.
- **Gating de conteúdo por nível**: níveis desbloqueando aulas/simulações/roupas/temas específicos (não só o título) — depende do sistema de níveis da Etapa 1 já estar estável, e exige repensar `Trail.isUnlocked`/a Loja para considerar nível do jogador, não só progresso sequencial.

## Como este roadmap é usado

Cada etapa é implementada em turnos/sessões subsequentes, seguindo o mesmo processo de commit + tag SemVer + entrada no `CHANGELOG.md` já em uso no projeto. Ideias trazidas depois deste roadmap devem ser encaixadas em uma das etapas acima (ou abrir uma nova), não implementadas soltas.

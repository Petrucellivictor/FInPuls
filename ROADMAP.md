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

## Etapa 3 — novas features maiores (mais esforço, mais risco de escopo) — ✅ concluída (v1.23.0 + v1.24.0 + v1.25.0)

- ✅ **Cidade Financeira** (v1.23.0, RFC-005): nova aba "🏙️ Cidade" com uma grade de 13 terrenos, cada um mapeado 1:1 a uma conquista já existente (primeira lição → Casa, primeira meta → Parque, primeiro investimento → Garagem, streak 7/30/100 → Banco/Empresa/Prefeitura, Renda Fixa/Renda Variável completas → Cofre/Bolsa de Valores, primeiro certificado → Biblioteca, primeiro passo empreendedor → Escritório, primeiro conto → Museu Histórico, nível 1 completo → Escola, trilha unificada completa → Monumento da Lenda Financeira). Zero estado novo — deriva 100% de `Achievements.getUnlocked()`, atualiza em tempo real via hook em `Achievements.checkAll()`.
- ✅ **Eventos temporários** (v1.24.0, RFC-006): 5 janelas fixas no calendário, recorrentes todo ano (Semana do Bitcoin, Temporada de IR, Férias Fin+, Black Friday Fin+, Natal Fin+). Enquanto ativas: card com 2 missões especiais na Início, XP em dobro nas lições da trilha (financeira + Empreender), e uma moldura exclusiva na Loja. Ranking semanal sincronizado entre usuários fica de fora (mesma limitação de backend da Etapa 0) — quem quiser comparar XP ganho durante o evento com amigos já pode usar as Ligas locais/manuais existentes.
- ✅ **Modo carreira** (v1.25.0, RFC-007): reaproveita o objetivo de vida já escolhido no diagnóstico inicial (`LIFE_GOALS`/`profile.pessoal.objetivo`, 9 opções — cobrindo casa, carro, viagem/intercâmbio, investir, dívidas, reserva, renda passiva, aposentadoria e estudos/faculdade) em vez de duplicá-lo. Card novo na Início mostra as 4 lições de `COURSE` mais relevantes para aquele objetivo (`CAREER_PATHS`), o cofrinho já vinculado a ele, e uma dica de uso do Simulador — com opção de trocar de objetivo sem refazer o diagnóstico inteiro.

Com a Etapa 3 concluída, **as 13 ideias originais trazidas pelo usuário em 2026-08-05 estão todas endereçadas** — 11 implementadas de ponta a ponta, e 2 (IA financeira conversacional, notificações push de verdade) com uma versão client-side viável já entregue na Etapa 1 e a versão completa formalmente registrada na Etapa 0 como dependente de backend.

## Identidade visual e motion design (trilha separada, fora do backlog das 13 ideias)

- ✅ **Fase 1 — biblioteca de animações + celebração de lição + Início** (v1.27.0, RFC-008): primeira aplicação da nova filosofia de design (`.claude/agents/ux-ui-design-lead.md`). Biblioteca de animações reutilizável (`js/fx.js`/`css/style.css`), celebração de lição reconstruída (POLVIn comemorando, moedas voando, confete, brilho), botões elásticos em todo o app, e o card da Início virou uma cena com o POLVIn mergulhando trazendo uma moeda e uma fala dinâmica sobre o progresso real do jogador.
- **Fases futuras**: redesenho das demais ~19 abas do app, uma leva por vez — ainda não escopado em nenhuma RFC.

## Ideias futuras (fora do backlog original das 13 ideias)

- **Gating de conteúdo por nível**: níveis desbloqueando aulas/simulações/roupas/temas específicos (não só o título) — ideia adicionada pelo Product Owner durante a triagem, não fazia parte do pedido original. Depende de repensar `Trail.isUnlocked`/a Loja para considerar nível do jogador, não só progresso sequencial. Sem RFC aberta — só entra em uma próxima etapa se o usuário priorizar.

## Como este roadmap é usado

Cada etapa é implementada em turnos/sessões subsequentes, seguindo o mesmo processo de commit + tag SemVer + entrada no `CHANGELOG.md` já em uso no projeto. Ideias trazidas depois deste roadmap devem ser encaixadas em uma das etapas acima (ou abrir uma nova), não implementadas soltas.

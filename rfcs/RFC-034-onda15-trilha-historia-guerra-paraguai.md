# RFC-034: Onda 15 da expansão para 300 lições — Trilha História & Economia, "A Guerra do Paraguai: a guerra mais cara do Império, contada em dívida e inflação"

- **Status**: concluída
- **Prioridade**: média (expansão de conteúdo, sem risco de arquitetura)
- **Agentes envolvidos**: Product Owner, Financial Specialist, Backend/Frontend Engineer (integração em `data.js`), QA Engineer, Documentation Specialist

## Descrição
Quinta Onda de conteúdo genuinamente novo na trilha `HISTORY_COURSE` ("Brasil: História & Economia"), depois de duas Ondas em `HISTORY_COURSE` (9/RFC-028, 10/RFC-029) e de a trilha ter ficado pausada desde então (Ondas 11-14 foram para Empreender e Financeira). Diferente das Ondas 9/10, **não insere nível novo** — expande `hnivel_imperio` ("Independência, Corte e Império: um país que nasce endividado", hoje com 3 lições cobrindo 1808-1888) com 3 lições apendadas ao final, após `himp_3`, cobrindo a Guerra do Paraguai (1864-1870) e seu legado econômico.

## Objetivo
Fechar o padrão "termo citado sem contexto": "Guerra do Paraguai" aparece em `h2_2` como opção incorreta de uma pergunta sobre o financiamento da CSN na 2ª Guerra Mundial — a trilha já cita o nome do conflito para ser descartado como resposta errada, sem nunca tê-lo ensinado —, ao mesmo tempo em que avança a trilha proporcionalmente mais atrasada rumo à meta de ~300 lições, **sem tocar no tema 1964-1985**, que segue pausado desde as Ondas 9/10.

## Motivação (investigação feita antes de propor)

**1. Números reais das 3 trilhas, lidos diretamente em `js/data.js`:**

| Trilha | Níveis | Lições | Onda mais recente que a tocou |
|---|---|---|---|
| `COURSE` (Financeira) | 6 | 102 | Onda 14 (RFC-033) |
| `HISTORY_COURSE` (História) | 6 | **15** | Onda 10 (RFC-029) |
| `BUSINESS_COURSE` (Empreender) | 6 | 18 | Onda 11 (RFC-030) |

Financeira teve 3 Ondas seguidas (12, 13, 14). História, com 15 lições, é hoje a trilha proporcionalmente mais atrasada das 3 e está pausada desde a Onda 10.

**2. `HISTORY_COURSE` completo, confirmado por leitura direta de `js/data.js`:**

| Nível | Título | Lições | Período coberto |
|---|---|---|---|
| `hnivel1` | Colônia: ciclos econômicos e as primeiras moedas | 2 | ~1500-1780 |
| `hnivel_imperio` | Independência, Corte e Império: um país que nasce endividado | 3 | 1808-1888 |
| `hnivel2` | Café, imigração e a industrialização de Vargas | 2 | ~1888-1945 |
| `hnivel_jk` | Redemocratização, JK e a véspera de uma crise institucional | 3 | 1945-1963 |
| `hnivel3` | Ditadura, moedas em cascata e a década perdida | 2 | 1968-1994 |
| `hnivel4` | Plano Real, desigualdade e o papel do Estado | 3 | 1994-hoje |

**3. O gap 1964-1985 continua exatamente como descrito nas Ondas 9/10, e não é o alvo desta Onda.** `h3_1` ainda abre citando "o regime militar (1964–1985)" como fato já estabelecido, sem a trilha nunca ter narrado como ele começou. **Esse gap não foi escolhido para esta Onda** — mantida a mesma pausa registrada pelas Ondas 9, 10 e 11.

**4. Gap seguro encontrado, confirmado por grep em todo `js/data.js`:** "Guerra do Paraguai" tem uma única ocorrência em todo o arquivo — como opção incorreta numa pergunta de `h2_2`. O conflito (1864-1870) cabe dentro do próprio recorte 1808-1888 já anunciado pelo título de `hnivel_imperio`, e reforça um fio pedagógico que a trilha já repete de propósito — crescimento/guerra financiada por dívida externa seguida de inflação —, presente em `himp_2`, `hjk_2` e `h3_1`.

**5. Candidato alternativo considerado e não escolhido nesta Onda: Empreender.** `BUSINESS_COURSE` também tem gaps do mesmo padrão (tipos societários — LTDA/Sociedade Unipessoal/contrato social — citados repetidamente sem nunca ensinados como conteúdo dedicado; zero menção a propriedade intelectual/marca ou fontes de captação). Registrado no `ROADMAP.md` como próximo candidato — não escolhido agora porque História está numericamente mais atrasada e porque o gap da Guerra do Paraguai é um caso ainda mais literal de "distrator nunca ensinado".

## Benefícios
- Fecha a lacuna real de "termo citado sem contexto" (Guerra do Paraguai).
- Avança a trilha proporcionalmente mais atrasada das 3 (15→18 lições), sem reabrir o tema 1964-1985.
- Reforça, com mais um exemplo histórico, o padrão pedagógico recorrente da trilha ("crescimento/gasto financiado por dívida externa → inflação/crise").
- Demonstra que a pausa em História não é permanente nem depende só do tema sensível.

## Impacto
- **`js/data.js`**: 3 lições novas **apendadas ao final** de `HISTORY_COURSE[1].licoes` (`hnivel_imperio`, hoje terminando em `himp_3`) — mesma técnica de menor risco já comprovada nas Ondas 12-14. `hnivel1`, `hnivel2`, `hnivel_jk`, `hnivel3`, `hnivel4` e as 3 lições já existentes de `hnivel_imperio` permanecem 100% intactos.
- **`js/trail.js`**: nenhuma mudança de código esperada.
- **`README.md`/`CHANGELOG.md`/`ROADMAP.md`**: contagem da trilha História atualizada (15→18; `hnivel_imperio` 3→6).
- **`GLOSSARY`**: não se aplica — `HISTORY_COURSE` não referencia `GLOSSARY`.

## Dependências
Nenhuma — expansão de conteúdo dentro de uma estrutura de dados já existente.

## Nota sobre ordenação cronológica (transparência deliberada, não um problema escondido)
A Guerra do Paraguai (1864-1870) é cronologicamente **anterior** ao fim de `himp_3` (que fecha em 1888). Apendar as lições novas ao final de `hnivel_imperio` cria uma pequena sobreposição temporal deliberada, resolvida explicitamente em prosa na `aula` da primeira lição nova, sem fingir uma linha do tempo estritamente sequencial que a própria `himp_3` já não segue (ela cobre 38 anos, 1850-1888, numa lição só). Decisão consciente de menor risco técnico.

## Nível e lições propostas (títulos/temas — conteúdo final é do Financial Specialist)

Nível existente: `hnivel_imperio` — "Independência, Corte e Império: um país que nasce endividado" (cor `#6A1B9A`, inalterada). 3 lições novas, apendadas após `himp_3`:

1. **`himp_4` — "A Guerra do Paraguai (1864-1870): o conflito mais longo e caro da história sul-americana"** — causas (Tríplice Aliança x Paraguai), duração incomum para a época, escala humana e financeira.
2. **`himp_5` — "Como se paga a guerra mais cara do Império: empréstimos ingleses, apólices e a inflação da guerra"** — financiamento via títulos internos e empréstimos externos, emissão de papel-moeda sem lastro pleno e efeito inflacionário — conectando com `himp_2`/`hjk_2`/`h3_1`.
3. **`himp_6` — "O legado inesperado: soldados libertados, um Exército fortalecido e um Império que saiu mais frágil da vitória"** — libertação de escravizados que lutaram na guerra (referenciando, sem reensinar, a Lei do Ventre Livre já coberta por `himp_3`), fortalecimento político do Exército no pós-guerra, gancho estritamente factual e neutro para 1889 — sem entrar no mérito do fim da monarquia.

Padrão técnico: 3 lições, `conto` de ~5 parágrafos, 10 perguntas + `variante` cada (60 blocos), `xp: 25` (consistente com `himp_1`-`himp_3`).

## Riscos
| Risco | Mitigação |
|---|---|
| Confundir o leitor sobre por que a trilha "volta no tempo" após `himp_3` | Frase explícita de transição na `aula` de `himp_4` |
| Custo humano da guerra para o Paraguai é objeto de debate historiográfico real | Tom estritamente factual, estimativas com ressalva de que variam entre historiadores |
| `himp_6` menciona o Exército fortalecido e aponta para 1889 — risco de escorregar para território sensível | Gancho estritamente factual, parando em 1889; nenhuma menção direta/indireta a 1964 ou ao regime militar |
| Sobreposição com `himp_3` (Lei do Ventre Livre) | Referenciar só em prosa, nunca reensinar |
| Sobreposição com `h2_2` (único lugar onde "Guerra do Paraguai" hoje aparece) | `h2_2` não é alterada; confirmar que nenhuma pergunta nova duplica a pergunta existente |
| "Apendar ao final" cria pequena descontinuidade cronológica dentro do nível | Documentado explicitamente, não escondido |

## Critérios de aceite
- 3 lições novas (`himp_4`, `himp_5`, `himp_6`) apendadas ao final de `HISTORY_COURSE[1].licoes` (`hnivel_imperio`), após `himp_3`.
- Exatamente 3 lições, cada uma com `conto` (~5 parágrafos) e exatamente 10 perguntas + `variante` em 100% delas.
- `xp: 25` por lição.
- `himp_4` inclui frase explícita reconhecendo o retorno cronológico em relação a `himp_3`.
- Zero sobreposição literal com `himp_3` e `h2_2`.
- Tom factual e neutro quanto ao custo humano/motivações da guerra.
- `himp_6` para explicitamente em 1889, sem nenhuma menção direta/indireta a 1964/regime militar.
- `hnivel1`, `hnivel2`, `hnivel_jk`, `hnivel3`, `hnivel4` e `himp_1`-`himp_3` permanecem 100% inalterados.
- Toda data/valor/evento verificado via `WebSearch`.
- `node --check js/data.js` sem erro (ou revisão manual cuidadosa).
- QA confirma `Trail.isUnlocked()` sem regressão.
- `README.md`/`CHANGELOG.md`/`ROADMAP.md` refletem a nova contagem.
- `ROADMAP.md` registra que o gap 1964-1985 continua pausado, e o gap de Empreender (tipos societários) como próximo candidato considerado.

## Etapas puladas e por quê
- **Software Architect / Database Engineer / Cyber Security Specialist / DevOps Engineer**: expansão de conteúdo, mesmo risco técnico já validado nas Ondas 9-14.
- **UX/UI Designer**: nenhuma mudança de interface.
- **Gamification Designer**: XP segue padrão já estabelecido (`xp: 25`), sem mecânica nova.

## Registro por etapa

### 1. Product Owner
- **Resumo da etapa**: lido `HISTORY_COURSE` e `BUSINESS_COURSE` completos, confirmadas contagens reais (História 15, Empreender 18, Financeira 102). Confirmado por grep que "Guerra do Paraguai" tem uma única ocorrência, como distrator nunca ensinado em `h2_2`. Investigado (e registrado como próximo candidato) gap equivalente em Empreender.
- **Decisão sobre 1964**: mantido em pausa, mesma decisão das Ondas 9, 10 e 11.
- **Escopo proposto**: expandir `hnivel_imperio` com 3 lições apendadas ao final (`himp_4`/`himp_5`/`himp_6`), `xp: 25`.
- **Pendências**: registrar no ROADMAP a reafirmação da pausa de 1964-1985 e o gap de Empreender como próximo candidato.
- **Riscos**: sem sensibilidade equivalente a 1964; risco de debate historiográfico sobre custo humano mitigado por tom factual; risco de escorregar para 1964 mitigado por critério de aceite explícito.
- **Próximo agente responsável**: Financial Specialist

### 2. Financial Specialist

- **Resumo da etapa**: escritas e inseridas em `js/data.js` as 3 lições novas (`himp_4`, `himp_5`, `himp_6`), apendadas ao final de `HISTORY_COURSE[1].licoes` (`hnivel_imperio`), após `himp_3`. Cada lição tem `xp: 25`, `conto` com 6 parágrafos e `perguntas` com exatamente 10 itens, cada um com `variante` completa (4 `opcoes`, `correta` válida, `explicacao`) — 60 blocos de pergunta/variante ao todo, confirmados por contagem estrutural (30 `pergunta:` principais + 30 `pergunta:` de `variante`, 60 arrays `opcoes:` com espaçamento consistente entre si, indicando 4 opções em cada).
- **Antes de escrever, li integralmente**: `himp_1`, `himp_2`, `himp_3` (para replicar tom/formato e não sobrepor a Lei do Ventre Livre/Lei Áurea), `h2_2` (confirmado: único uso existente de "Guerra do Paraguai" é como distrator na variante da última pergunta, sobre o financiamento da CSN na 2ª Guerra — não alterada, sem duplicação de pergunta), e `hjk_2`/`h3_1` (para o fio pedagógico dívida→inflação, referenciado só em prosa em `himp_5`, citando "Plano de Metas de JK" e "milagre econômico" apenas pelo nome já ensinado, sem repetir a frase "regime militar (1964–1985)").
- **Fontes consultadas via `WebSearch`** (todas as datas/valores usados no conteúdo final vêm daqui, com ressalva explícita no texto de que valores agregados do século XIX são aproximados e variam por historiador):
  - Causas, Tratado da Tríplice Aliança (1º/mai/1865), estopim (apreensão do vapor Marquês de Olinda, invasão do Mato Grosso), desfecho (morte de Solano López em Cerro Corá, 1º/mar/1870): [História do Mundo](https://www.historiadomundo.com.br/idade-contemporanea/guerra-do-paraguai.htm), [Wikipédia — Guerra do Paraguai](https://pt.wikipedia.org/wiki/Guerra_do_Paraguai), [Toda Matéria](https://www.todamateria.com.br/guerra-do-paraguai/), [JM1](https://www.jm1.com.br/geral/hoje-na-historia-1864-paraguai-da-inicio-a-guerra-da-triplice-alianca.html).
  - Estimativas de baixas humanas, com divergência confirmada entre historiadores (usada no texto como ressalva explícita, sem adotar um número único): [História do Mundo](https://www.historiadomundo.com.br/idade-contemporanea/guerra-do-paraguai.htm), [Aventuras na História](https://aventurasnahistoria.com.br/noticias/reportagem/guerra-do-paraguai-os-156-anos-do-fim-do-conflito-armado-mais-brutal-da-america-latina.phtml), [Exame](https://exame.com/brasil/pandemia-ja-matou-no-brasil-tanto-quanto-a-guerra-do-paraguai/).
  - Custo da guerra (614 mil contos de réis, ~11 orçamentos anuais), apólices como principal fonte interna, 1866 (emissão transferida do Banco do Brasil ao Tesouro) e efeito inflacionário: [Instituto Liberal](https://www.institutoliberal.org.br/blog/5-fatos-sobre-guerra-paraguai-e-por-que-voce-ainda-paga-por-ela/), [Senado Notícias](https://www12.senado.leg.br/noticias/especiais/arquivo-s/criado-ha-170-anos-banco-do-brasil-era-privado-e-financiou-a-guerra-do-paraguai), [Poder360](https://www.poder360.com.br/historia/criado-em-1853-bb-era-privado-e-financiou-guerra-do-paraguai/).
  - Empréstimos ingleses (Casa Rothschild: ~£7 milhões em 1865, ~£14,3 milhões somados entre 1863-1871): [Jus.com.br](https://jus.com.br/artigos/85255/independencia-do-brasil-custou-2-milhoes-de-libras-esterlinas-emprestadas-pela-inglaterra) e fontes agregadas na mesma busca sobre relações Brasil-Rothschild.
  - Corpos de Voluntários da Pátria (decreto nº 3.371, 7/jan/1865) e Decreto nº 3.725-A (6/nov/1866, liberdade a escravizados do Estado aptos a servir, extensiva às esposas): [Câmara dos Deputados — íntegra do Decreto 3.725-A](https://www2.camara.leg.br/legin/fed/decret/1824-1899/decreto-3725-a-6-novembro-1866-554505-publicacaooriginal-73127-pe.html), [Café História — Voluntários da Pátria](https://www.cafehistoria.com.br/glossary/voluntarios-da-patria/).
  - Participação de pessoas libertadas entre os combatentes (7%-10%) e legado político-institucional sobre o Exército: [SciELO — participação dos negros escravos na guerra](https://www.scielo.br/j/ea/a/Zz5JrdgQR5hQMtMwj7dnfTd/?lang=pt), [Revista FT](https://revistaft.com.br/guerra-do-paraguai-da-senzala-aos-campos-de-batalha-e-a-libertacao/).
- **Decisões de conteúdo tomadas**:
  - `himp_4`: abre com frase explícita reconhecendo o recuo cronológico em relação a `himp_3` (que fecha em 1888), antes de tratar causas, Tratado da Tríplice Aliança, duração e custo humano.
  - `himp_5`: apresenta financiamento interno (apólices) e externo (empréstimos Rothschild) com a ressalva explícita de que historiadores divergem sobre a proporção exata entre as duas fontes; a mudança de 1866 (emissão do Banco do Brasil da época transferida ao Tesouro) é conectada a `himp_1` (privilégio de emissão do primeiro Banco do Brasil de 1808) sem contradizer o texto já existente, e ao fio dívida→inflação já estabelecido em `hjk_2`/`h3_1`, citado só pelo nome das lições ("Plano de Metas de JK", "milagre econômico"), nunca pela frase "regime militar" ou pelo intervalo 1964-1985.
  - `himp_6`: libertações de escravizados pelo serviço militar (decreto de 1866, Corpos de Voluntários da Pátria) tratadas como evento pontual e datado, referenciando a Lei do Ventre Livre (1871) e a Lei Áurea (1888) apenas por nome e data, sem reensinar seus mecanismos (já cobertos por `himp_3`). O fortalecimento institucional do Exército é descrito como fato historiográfico (coesão de oficiais, voz política mais assertiva "nas duas décadas seguintes" — sempre dentro do Império, nunca fora dele). A lição termina de forma factual e neutra na Proclamação da República (15/nov/1889), apresentando-a como resultado de "vários fatores, entre outros" (dívida, desgaste com a elite agrária já coberto em `himp_3`, peso político do Exército) sem apontar causa única, e fecha remetendo ao próximo nível já existente (`hnivel2`, que cobre a partir de 1888).
- **Confirmação explícita dos critérios de sensibilidade da RFC**:
  - **Tom neutro sobre custo humano/motivações**: confirmado. Toda menção a número de baixas/impacto populacional em `himp_4` vem com a ressalva "as estimativas variam muito, dependendo do historiador e da metodologia usada... este curso não toma partido nesse debate", sem citar um número único como fato definitivo, e sem qualquer juízo sobre a proporcionalidade ou legitimidade do conflito.
  - **`himp_6` para explicitamente em 1889**: confirmado. O último parágrafo do `conto` e a última pergunta/variante afirmam textualmente que a lição e o nível "se encerram" em 1889, e que o conteúdo posterior já está coberto por outro nível já existente da trilha (não promete conteúdo novo além de 1889).
  - **Zero menção, direta ou indireta, a 1964 ou "regime militar" em `himp_6`**: confirmado por leitura linha a linha do texto final de `himp_6` (`conto`, 10 perguntas e 10 variantes) — nenhuma ocorrência das strings "1964", "regime militar", "golpe" ou qualquer comparação entre o papel político do Exército no século XIX e no século XX. O único evento político mencionado após a guerra é a Proclamação da República (15/nov/1889), tratada como fato histórico isolado, com múltiplos fatores concorrentes e sem editorialização.
  - **Zero sobreposição com `himp_3` e `h2_2`**: confirmado — `himp_3` não foi editada (verificado por leitura antes e depois da inserção); `h2_2` não foi editada e sua pergunta/variante com o distrator "Guerra do Paraguai" permanece idêntica; nenhuma das 60 perguntas novas duplica o enunciado ou as opções dessa pergunta de `h2_2`.
  - **Estrutura técnica**: confirmado por leitura do diff — `hnivel1`, `hnivel2`, `hnivel_jk`, `hnivel3`, `hnivel4` e as lições `himp_1`/`himp_2`/`himp_3` permanecem com o mesmo conteúdo e posição no arquivo; as 3 lições novas foram inseridas apenas entre o fechamento de `himp_3` e a abertura de `hnivel2`, dentro de `hnivel_imperio.licoes`. Sem acesso a ferramenta de shell nesta sessão para rodar `node --check js/data.js`, a validação foi feita por leitura estrutural via grep (contagem de 60 blocos `opcoes: [` com espaçamento de linha consistente entre si, 30 `pergunta:` principais + 30 de `variante`, ids `himp_4`/`himp_5`/`himp_6` cada um ocorrendo exatamente uma vez no arquivo) — recomenda-se que o próximo agente (Backend/Frontend Engineer ou QA) rode `node --check js/data.js` antes de dar a etapa como concluída.
- **Pendências**: rodar `node --check js/data.js` (ou execução equivalente) para confirmar ausência de erro de sintaxe; QA confirmar `Trail.isUnlocked()` sem regressão com a trilha História agora em 18 lições; Documentation Specialist atualizar `README.md`/`CHANGELOG.md`/`ROADMAP.md` com a nova contagem (História 15→18; `hnivel_imperio` 3→6) e reafirmar a pausa do gap 1964-1985.
- **Riscos**: nenhum risco novo identificado além dos já mapeados pelo Product Owner; mitigações aplicadas conforme a tabela de riscos da RFC.
- **Próximo agente responsável**: Backend/Frontend Engineer (integração em `data.js`) — nesta sessão, a integração técnica (inserção no array) já foi feita diretamente pelo Financial Specialist, por não haver agente de integração isolado disponível; falta apenas a validação de sintaxe via `node --check`.

### 3. Backend/Frontend Engineer (integração em `data.js`)
Etapa consolidada com a do Financial Specialist (mesmo padrão já usado nas Ondas 9-14) — a inserção das 3 lições já foi feita diretamente pelo Financial Specialist, apendada corretamente ao final de `hnivel_imperio.licoes`, sem tocar nenhum outro nível. Balanceamento de chaves/colchetes/parênteses de `js/data.js` verificado pelo Orchestrator via checagem lexical — 2202 `{`/`}`, 2112 `[`/`]`, 15 `(`/`)`, todos batendo. Confirmação adicional feita pessoalmente antes de acionar o QA: leitura direta do `conto` final de `himp_6` e busca por "1964"/"regime militar"/"golpe"/"ditadura" nas 3 lições novas — zero ocorrências, parada factual confirmada em 1889. `git diff` confirmado como inserção pura (705 inserções, 0 remoções) pelo próprio QA Engineer na etapa seguinte.

**Próximo agente responsável**: QA Engineer.

### 4. QA Engineer

- **Metodologia**: Node.js e Python não estavam disponíveis por padrão neste ambiente (`node`/`python` não encontrados no PATH inicial). Confirmado por `where`/`node --version` que Node não existe na máquina — não há alternativa a instalar nesta sessão. Python 3.14 foi obtido automaticamente ao chamar `py` (App Execution Alias do Windows), o que permitiu (1) validação estrutural de `js/data.js` por script e (2) montar um driver de teste real no navegador.
  Como não há `node --check` disponível, a validação de sintaxe foi feita por um script Python que percorre `js/data.js` caractere a caractere (respeitando strings, escapes e comentários) contando o balanceamento de chaves, colchetes e parênteses — resultado: profundidade final 0/0/0, nenhuma string não terminada, sem erros. É um proxy razoável (não 100% equivalente a um parser JS completo); recomendo que uma sessão futura com Node disponível rode `node --check js/data.js` como confirmação final. O risco residual é baixo dado o resultado limpo e o padrão de edição consistente do arquivo.
  Para o teste em navegador real: Chrome está instalado; servidor estático subido com `py -m http.server 8791` na raiz do projeto; Chrome iniciado com as flags `--remote-debugging-port=9333 --remote-allow-origins=*`; driver CDP escrito em Python (biblioteca `websocket-client`) para navegar, avaliar JS (`Runtime.evaluate`), disparar cliques reais (`Input.dispatchMouseEvent` e `.click()` via DOM) e capturar screenshots (`Page.captureScreenshot`).
  Como o app agora exige login obrigatório via Supabase antes de qualquer tela (RFC-027, commit 8358d40) e criar uma conta real de teste exigiria confirmação de e-mail (sem acesso a caixa de e-mail neste ambiente, e sem intenção de poluir o projeto Supabase de produção com contas de teste), o gate de login foi contornado apenas para fins de teste chamando os módulos JS diretamente no console real do navegador (Trail.init(), Tabs.init(), Tabs.go). O restante da aplicação (dados, HTML, CSS, lógica de trilha/quiz/XP/energia) é o código de produção real, executado sem mock, no Chrome real. Isso testa o fluxo da trilha/quiz de ponta a ponta com fidelidade alta; não testa o próprio fluxo de autenticação/login, que está fora do escopo desta RFC e não foi tocado por ela.

- **Item 1 — 3 lições apendadas ao final de hnivel_imperio, depois de himp_3**: PASSOU. grep em js/data.js mostra a ordem exata himp_1 (linha 13093) -> himp_2 (13327) -> himp_3 (13561) -> himp_4 (13795) -> himp_5 (14030) -> himp_6 (14265) -> hnivel2 (14502, próximo nível). Trail.levels()[3].licoes (nível hnivel_imperio na sequência intercalada) confirmado com 6 lições no navegador real, via Runtime.evaluate.

- **Item 2 — exatamente 3 lições, cada uma com conto e exatamente 10 perguntas + variante em 100%**: PASSOU. Contagem estrutural sobre o bloco himp_4..himp_6 (antes de hnivel2): "conto: [" x3, "titulo:" x3, "pergunta:" x60 (30 principais + 30 de variante), "opcoes: [" x60 (cada uma com exatamente 4 linhas/opções, verificado individualmente — nenhum bloco fora de 4), "correta:" x60 (todos os valores no intervalo 0-3), "variante: {" x30 (10 por lição x 3 lições). No navegador real, o quiz de himp_4 renderizou exatamente 10 "dots" de progresso e a lição terminou com "10 de 10 perguntas".

- **Item 3 — xp: 25 por lição**: PASSOU. "xp: 25" confirmado nas 3 lições por grep, e confirmado no fluxo real: himp_4 creditou exatamente +25 XP na tela de conclusão ("Você acertou 10 de 10 perguntas (100%). +25 XP e +5 moedas adicionadas à sua conta."), e Learn.getXp() foi de 0 para 25 para 50 após completar himp_4 e depois himp_5, cada um somando exatamente 25.

- **Item 4 — himp_4 reconhece o retorno cronológico**: PASSOU. Primeiro parágrafo do conto de himp_4: "Até aqui, esta trilha andou de 1808 a 1888 [...]. Esta lição — e as duas seguintes — voltam no tempo, para 1864: um recuo deliberado, não um erro na ordem cronológica." Reforçado pela primeira pergunta da lição ("Por que esta lição sobre a Guerra do Paraguai 'volta no tempo' [...]?", resposta correta = a opção que reconhece o recuo proposital) e por sua variante. Testado ao vivo no navegador: a intro-overlay abriu com o título correto e o texto começou exibindo esse parágrafo (efeito de digitação).

- **Item 5 (CRÍTICO) — zero menção direta/indireta a "1964"/"regime militar"/"ditadura"/"golpe", e nenhuma ponte Exército-XIX ↔ Exército-XX**: PASSOU. Li integralmente, palavra por palavra, o conto (5 parágrafos) e as 10 perguntas + 10 variantes de himp_4, himp_5 e himp_6 (linhas 13795-14498 de js/data.js), e adicionalmente rodei uma busca por regex (1964, regime militar, ditadura, golpe) restrita a esse bloco exato — 0 ocorrências. Trechos relevantes lidos e confirmados:
  - himp_6, parágrafo 4 do conto: "A guerra também deixou um legado institucional dentro do próprio Exército. Oficiais que passaram anos lutando lado a lado [...] voltaram para casa com uma identidade de corpo e uma coesão institucional mais fortes do que antes da guerra. Historiadores apontam esse período como o início de uma geração de oficiais com voz política mais assertiva dentro do Império nas duas décadas seguintes." A frase se limita explicitamente "dentro do Império" e a um horizonte de "duas décadas" a partir de c.1870, ou seja, até cerca de 1890 — nunca alcançando 1964. Não há qualquer palavra de ligação para o século XX.
  - himp_6, parágrafo 5: "[...] setores do Exército, mais coesos e influentes desde a guerra, também ganharam peso político crescente. Historiadores apontam esses fatores, entre vários outros, como parte do cenário que precedeu a Proclamação da República, em 15 de novembro de 1889 — evento que encerrou o período imperial brasileiro." Trata explicitamente de causas múltiplas da Proclamação da República (1889), não de qualquer evento de 1964.
  - himp_6, parágrafo 6 (fechamento): "É exatamente aqui, em 1889, que esta lição — e este nível da trilha, dedicado ao Império — se encerram. A história econômica brasileira depois do fim da monarquia [...] já está coberta a partir do próximo nível desta trilha." Fechamento explícito em 1889, sem prometer ou insinuar conteúdo posterior sensível.
  - Pergunta 8 de himp_6 (e sua variante) pergunta e responde explicitamente que a Proclamação da República "não" tem causa única, listando dívida, desgaste com a elite agrária e peso político crescente de setores do Exército — sempre como fatores do século XIX, sem qualquer viés editorial sobre o mérito do fim da monarquia.
  - Pergunta 10 de himp_6 (e sua variante) confirma textualmente que a trilha "para" em 1889 e que o conteúdo seguinte (café, imigração, industrialização) já é de hnivel2, nível pré-existente.
  Testei também ao vivo: completei himp_6 (com respostas propositalmente erradas, ver item 9) e visualizei todas as 10 perguntas renderizadas na tela real do navegador — nenhum texto além do lido em data.js, ou seja, não há geração dinâmica/interpolação de conteúdo que pudesse introduzir algo não revisado.

- **Item 6 — tom factual e neutro sobre custo humano/motivações**: PASSOU. himp_4, parágrafo 5: "O custo humano do conflito é um dos temas mais debatidos da historiografia latino-americana, e as estimativas variam muito, dependendo do historiador e da metodologia usada — este curso não toma partido nesse debate." Segue com números descritos como faixas ("perdas [...] na casa de centenas de milhares", "dezenas de milhares"), não como valores únicos "oficiais", sem juízo de valor sobre legitimidade/proporcionalidade do conflito. himp_5 repete o mesmo padrão de ressalva para os números financeiros ("números aproximados, que variam conforme a fonte e a metodologia"). A pergunta 7 de himp_4 testa exatamente essa neutralidade, com a resposta correta sendo "que variam muito [...] e que o curso não toma partido".

- **Item 7 — zero sobreposição literal com himp_3 e h2_2**: PASSOU. himp_3 não foi alterada (confirmado por git diff — 0 remoções, ver item 8) e cobre a sequência das 4 leis abolicionistas (Eusébio de Queirós, Ventre Livre, Sexagenários, Lei Áurea) em profundidade. himp_6 referencia a Lei do Ventre Livre e a Lei Áurea apenas por nome/data, em frases como "leis que você já estudou nesta trilha" e observando que as libertações militares "não substituíram as leis abolicionistas mais amplas", sem repetir a explicação de "ingênuos"/tutela/indenização já ensinada em himp_3. Para h2_2: localizado o único uso pré-existente de "Guerra do Paraguai" (variante da pergunta sobre financiamento da CSN na 2ª Guerra Mundial, hoje na linha 14922, pós-inserção — mesmo texto, mesma posição relativa dentro de h2_2, deslocado só pelas 705 linhas inseridas antes dele). Nenhuma das 60 perguntas/variantes novas duplica esse enunciado ou usa a CSN/2ª Guerra Mundial como tema.

- **Item 8 — hnivel1, hnivel2, hnivel_jk, hnivel3, hnivel4 e himp_1-himp_3 100% inalterados**: PASSOU. "git diff --stat js/data.js" mostra 705 insertions(+), 0 deletions(-); "git diff -U3 js/data.js" filtrado pelas linhas de cabeçalho de hunk mostra um único hunk (posição original 13791, tamanho 6 linhas de contexto, para 711 linhas no novo arquivo), confirmando uma única inserção contígua, sem nenhuma linha removida ou modificada em qualquer outro ponto do arquivo. Isso garante que todo o conteúdo antes da linha 13791 e tudo que hoje está a partir de hnivel2 em diante é idêntico ao data.js anterior, apenas deslocado em número de linha.

- **Item 9 — teste real no navegador (Aprender -> história -> completar lição -> erro/variante -> XP/moedas -> zero erro de console)**: PASSOU, com a ressalva de metodologia de login descrita acima. Passos executados e evidenciados por screenshot:
  1. Naveguei para a aba Aprender (Tabs.go) — a trilha renderizou corretamente, sem tela em branco/opacity 0 (a regressão do bug de IntersectionObserver documentado no CHANGELOG v1.16.0 NÃO reapareceu — observeReveal() em js/trail.js segue com a guarda "container.getClientRects().length === 0" intacta).
  2. Simulei progresso prévio (himp_1 a himp_3 e lições financeiras anteriores marcadas como concluídas via Store) para destravar himp_4 — o nó exibiu classe "current", ícone de pergaminho, corretamente destravado; himp_5/himp_6 corretamente "locked" até então.
  3. Cliquei no nó real de himp_4 (clique de mouse real via CDP, não chamada direta de função) — abriu a intro-overlay com o conto (efeito de digitação) e o título correto.
  4. Cliquei em "Continuar para o quiz" — pergunta 1 renderizada com 4 opções e 10 "dots" de progresso.
  5. Respondi a pergunta 1 errada de propósito — feedback "Não foi essa" mais explicação, e o botão "Tentar de novo com outro exemplo" apareceu (confirma que himp_4.perguntas[0].variante existe e é reconhecido pelo motor de quiz).
  6. Cliquei nesse botão — a variante renderizou corretamente, com o aviso "Vamos reforçar esse mesmo conceito com outro exemplo" e uma pergunta/opções diferentes da original.
  7. Completei as 10 perguntas (a variante da 1ª pergunta mais as 9 seguintes, todas certas) — tela final "Capítulo concluído! Você acertou 10 de 10 perguntas (100%). +25 XP e +5 moedas adicionadas à sua conta." — confirmado por screenshot.
  8. Cliquei em "Continuar" — himp_4 passou para estado "done" e himp_5 passou a "current", destravado — nenhuma regressão no desbloqueio sequencial dentro do nível.
  9. Completei himp_5 inteira (10/10, sem erro) do mesmo jeito, e testei também o caminho de reprovação: iniciei himp_6 e respondi errado deliberadamente as 10 perguntas — tela "Quase lá! Você acertou 0 de 10 perguntas (0%). Você precisa de pelo menos 60% de acertos para concluir. Tente de novo!" — confirmado por screenshot; himp_6 corretamente NÃO foi marcada como concluída no Store (HISTORY_PROGRESS ficou só com himp_1 a himp_5, sem himp_6), ou seja, o guard de 60% funciona e não vaza progresso/XP indevido em caso de reprovação.
  10. Console do navegador monitorado do início ao fim via CDP (Runtime.consoleAPICalled e Runtime.exceptionThrown), mais um listener de window.error/unhandledrejection injetado: zero exceções e zero erros em toda a sessão — o único log registrado foi um aviso pré-existente e não relacionado (deprecação de build/three.js, usado por outra feature do app, sem relação com esta RFC).
  - Testei também os dois extremos do sistema de energia (js/energy.js), por ser área com histórico de bugs sensível: (a) com energia forçada a 0, Energy.tryStart() retornou false, exibiu corretamente o modal "Sem energia por hoje" e o valor não ficou negativo (permaneceu 0); (b) forçando a data do último reset para o passado, Energy.get() resetou corretamente para o máximo (3); (c) durante a lição completada com sucesso, o bônus de combo (ENERGY_COMBO = 3) foi concedido e corretamente limitado ao teto (nunca ultrapassou 3/3). Nenhuma regressão encontrada nessa área crítica.

- **Item 10 — Trail.isUnlocked() sem regressão / deslocamento na sequência intercalada**: PASSOU, e por um motivo estruturalmente mais simples que nas Ondas 9/10: as 3 lições novas foram apendadas dentro de um nível já existente (hnivel_imperio), não inseridas como um nível novo no meio de HISTORY_COURSE. Isso significa que Trail.levels() — que intercala COURSE/HISTORY_COURSE por índice de nível — não muda nenhum offset entre níveis; hnivel2 continua exatamente na mesma posição relativa (nível de história número 3) que tinha antes. O único efeito é sobre Trail.flatLessons(), que agora tem 3 lições a mais entre himp_3 e h2_1 (confirmado: flatLessons().length = 120, de fato 15+3=18 lições de história + 102 de financeira). Como isUnlocked() usa contagem total de lições concluídas (doneCount >= flatIdx) — o mesmo mecanismo documentado no próprio código como correção para o problema de inserção no meio, já validado nas Ondas 9/10 — o efeito é exatamente o descrito no comentário do código: usuários que já tinham progresso além do ponto de inserção precisam concluir 3 lições a mais (em qualquer trilha) para destravar o que vem depois, sem re-travar nada que já estava destravado por posição. Confirmado ao vivo: himp_4 apareceu com estado correto ("current") assim que o doneCount simulado alcançou seu flatIdx (60), e hnivel2/h2_1 manteve sua posição visual normal na trilha, renderizado sem erro.

- **Verificações adicionais de escopo do papel de QA (Segurança/Performance)**:
  - Segurança: js/supabase-config.js contém apenas a chave publicável/anon do Supabase (formato "sb_publishable_..."), segura para o navegador por design do Supabase, com comentário explícito alertando para nunca colar ali uma chave service_role/secret. Busca por "service_role"/"SERVICE_ROLE" em todo o repositório não encontrou nenhuma chave real, só documentação/avisos nos próprios comentários e em RFCs. Nada na Onda 15 introduziu novo código de rede ou credenciais.
  - Performance: a Onda 15 não altera js/trail.js (nenhuma mudança de código, só dados), então o padrão de renderização (innerHTML com o HTML de toda a trilha gerado de uma vez) é o mesmo já existente antes desta RFC — registro como observação de melhoria futura, não como regressão desta Onda: a trilha inteira (120 lições, 3 a mais que antes) é montada como uma string HTML grande e injetada de uma vez via innerHTML; no teste real isso não causou travamento perceptível nem erro, mas é um padrão a observar à medida que a trilha crescer em Ondas futuras.

- **Bugs encontrados**: nenhum. Todos os 10 critérios de aceite explicitamente listados para este teste PASSARAM, com evidência direta de leitura de código, validação estrutural por script e execução real no navegador (Chrome real, via CDP, sem mocks na lógica de trilha/quiz/XP/energia).

- **Pendência não bloqueante para outro agente**: "node --check js/data.js" não pôde ser executado literalmente (Node.js ausente neste ambiente, como já era o caso na etapa do Financial Specialist). Recomendo que, se/quando uma sessão tiver Node disponível, essa checagem puramente formal seja rodada como confirmação final; o proxy usado aqui (balanceamento de chaves/colchetes/parênteses percorrendo o arquivo inteiro, respeitando strings e comentários) não encontrou nenhuma anomalia. Também não foi testado o fluxo de login/cadastro em si (fora do escopo desta RFC).

- **Veredito final**: APROVADO. A Onda 15 (RFC-034) pode avançar para o Documentation Specialist. Conteúdo sensível (item 5, o mais crítico) foi lido integralmente e não contém nenhuma menção direta ou indireta a 1964/regime militar/ditadura/golpe, nem qualquer ponte entre o papel político do Exército no século XIX e no século XX; himp_6 para factualmente em 1889. Estrutura técnica (3 lições, 10 perguntas + variante cada, xp: 25, zero linha alterada fora da inserção) confirmada. Fluxo completo testado em navegador real (Chrome via CDP), incluindo caminho de erro/variante e caminho de reprovação, sem nenhum erro de console. Sistema de energia sem regressão (nunca negativo, nunca acima do máximo, reset por data funcionando). Trail.isUnlocked() sem regressão, com o deslocamento por inserção tratado pelo mesmo mecanismo de contagem total já validado nas Ondas 9/10.

### 5. Documentation Specialist
- **Resumo da etapa**: retomada depois de uma interrupção por limite de sessão da API que deixou só o `CHANGELOG.md` atualizado (entrada `[1.54.0]`, confirmada correta por leitura). Completado pelo Orchestrator: `README.md` (seção "Gamificação", trilha "Brasil: História & Economia" atualizada de 15 para 18 lições, com a Guerra do Paraguai citada ao lado da Onda 9 na lista de temas) e `ROADMAP.md` (entrada "✅ Onda 15" adicionada à seção "Expansão das trilhas de conteúdo", no mesmo padrão/nível de detalhe das entradas 9-14 — registrando explicitamente a reafirmação da pausa em 1964-1985 e o gap alternativo de Empreender, tipos societários, como próximo candidato considerado e não escolhido).
- **Versão confirmada**: `v1.54.0` (seguinte a `v1.53.0`, a última tag antes desta Onda).
- **Arquivos tocados**: `CHANGELOG.md`, `README.md`, `ROADMAP.md`, e esta própria RFC (`Status` alterado para "concluída").
- **Pendências**: nenhuma nova. `node --check js/data.js` literal segue como item não bloqueante para quando houver Node disponível (já registrado pelo QA Engineer).
- **Próximo passo**: commit + tag `v1.54.0` (Orchestrator/DevOps).

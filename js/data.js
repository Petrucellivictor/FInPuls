/* =========================================================================
   DATA.JS — Base de conteúdo do Fin+
   Todo o conteúdo educativo, perguntas e trilha gamificada vivem aqui.
   Separar os dados da lógica facilita adicionar novos investimentos,
   perguntas ou fases da trilha sem tocar no restante do sistema.
   ========================================================================= */

/* -------------------------------------------------------------------------
   1) TIPOS DE INVESTIMENTO
   ------------------------------------------------------------------------- */
const INVESTMENTS = [
  {
    id: "poupanca",
    nome: "Poupança",
    categoria: "Renda Fixa",
    risco: 1,
    liquidez: "Imediata",
    rentabilidade: "≈ 70% da Selic (quando Selic ≤ 8,5% a.a.) ou TR + 0,5% a.m.",
    tributacao: "Isenta de Imposto de Renda",
    garantia: "FGC até R$ 250.000",
    indicadoPara: "Reserva de emergência de curtíssimo prazo, iniciantes absolutos",
    descricao:
      "A porta de entrada clássica dos brasileiros. É simples e sem taxas, mas quase sempre perde para outras opções de renda fixa com o mesmo risco.",
    prosCons: {
      prós: ["Sem taxas", "Liquidez imediata", "Fácil de entender"],
      contras: ["Rentabilidade baixa", "Perde para CDBs e Tesouro na maioria dos cenários"],
    },
    nivel: "iniciante",
  },
  {
    id: "cdi",
    nome: "CDI (Certificado de Depósito Interbancário)",
    categoria: "Referência de Renda Fixa",
    risco: 1,
    liquidez: "Não é um investimento direto",
    rentabilidade: "Taxa entre bancos, usada como referência (≈ 100% da Selic)",
    tributacao: "Não se aplica diretamente",
    garantia: "Não se aplica",
    indicadoPara: "Entender como comparar a rentabilidade de outros produtos",
    descricao:
      "O CDI não é algo que você compra: é a taxa de juros que os bancos cobram entre si para empréstimos de curtíssimo prazo. Ela serve como termômetro do mercado — quando você vê 'rende 110% do CDI', é essa referência que está sendo usada.",
    prosCons: {
      prós: ["Ótimo indicador para comparar investimentos", "Acompanha a Selic de perto"],
      contras: ["Não é um produto que se investe diretamente"],
    },
    nivel: "iniciante",
  },
  {
    id: "cdb",
    nome: "CDB (Certificado de Depósito Bancário)",
    categoria: "Renda Fixa",
    risco: 2,
    liquidez: "Varia: de diária até vencimento (anos)",
    rentabilidade: "Pré-fixada, pós-fixada (% do CDI) ou híbrida (IPCA+)",
    tributacao: "IR regressivo: 22,5% a 15% conforme o prazo",
    garantia: "FGC até R$ 250.000 por CPF/instituição",
    indicadoPara: "Quem quer sair da poupança com segurança parecida e rentabilidade maior",
    descricao:
      "Você empresta dinheiro para o banco e recebe de volta com juros. É um dos investimentos mais indicados para quem está começando, pois combina segurança (garantia do FGC) com rentabilidade superior à poupança.",
    prosCons: {
      prós: ["Rentabilidade geralmente maior que a poupança", "Protegido pelo FGC", "Fácil de comprar em qualquer corretora"],
      contras: ["Pode ter carência (prazo mínimo para resgate)", "Paga Imposto de Renda"],
    },
    nivel: "iniciante",
  },
  {
    id: "lci",
    nome: "LCI (Letra de Crédito Imobiliário)",
    categoria: "Renda Fixa",
    risco: 2,
    liquidez: "Baixa (carência comum de 90 dias a alguns anos)",
    rentabilidade: "Geralmente um pouco menor que CDB, mas isenta de IR",
    tributacao: "Isenta de Imposto de Renda para pessoa física",
    garantia: "FGC até R$ 250.000 por CPF/instituição",
    indicadoPara: "Quem pode deixar o dinheiro parado por mais tempo e quer isenção de IR",
    descricao:
      "Funciona como um CDB, mas o dinheiro captado financia o setor imobiliário. Por incentivo do governo, é isenta de Imposto de Renda, o que pode compensar uma taxa nominal menor.",
    prosCons: {
      prós: ["Isenta de IR", "Protegida pelo FGC"],
      contras: ["Menor liquidez", "Rentabilidade líquida nem sempre supera um bom CDB"],
    },
    nivel: "intermediario",
  },
  {
    id: "lca",
    nome: "LCA (Letra de Crédito do Agronegócio)",
    categoria: "Renda Fixa",
    risco: 2,
    liquidez: "Baixa (carência comum de 90 dias a alguns anos)",
    rentabilidade: "Parecida com a LCI, isenta de IR",
    tributacao: "Isenta de Imposto de Renda para pessoa física",
    garantia: "FGC até R$ 250.000 por CPF/instituição",
    indicadoPara: "Mesmo perfil da LCI, com foco em financiar o agronegócio",
    descricao:
      "É praticamente irmã gêmea da LCI: mesma lógica, mesma isenção de IR, mas o dinheiro capta recursos para o agronegócio em vez do setor imobiliário.",
    prosCons: {
      prós: ["Isenta de IR", "Protegida pelo FGC"],
      contras: ["Baixa liquidez", "Valores mínimos de aplicação costumam ser mais altos"],
    },
    nivel: "intermediario",
  },
  {
    id: "tesouro",
    nome: "Tesouro Direto",
    categoria: "Renda Fixa",
    risco: 1,
    liquidez: "Alta (venda garantida pelo Tesouro em D+1, com possível oscilação de preço)",
    rentabilidade: "Selic (pós-fixado), IPCA+ (híbrido) ou Prefixado",
    tributacao: "IR regressivo: 22,5% a 15% conforme o prazo",
    garantia: "Garantido pelo Governo Federal — considerado o investimento mais seguro do país",
    indicadoPara: "Reserva de emergência (Tesouro Selic) e objetivos de longo prazo (IPCA+)",
    descricao:
      "Você empresta dinheiro para o governo federal. É a opção mais segura do mercado brasileiro. O Tesouro Selic é ideal para reserva de emergência; o Tesouro IPCA+ protege o poder de compra no longo prazo (aposentadoria, por exemplo).",
    prosCons: {
      prós: ["O investimento mais seguro do Brasil", "Aplicação a partir de poucos reais", "Boa liquidez"],
      contras: ["Prefixado e IPCA+ têm oscilação de preço se vendidos antes do vencimento", "Paga IR"],
    },
    nivel: "iniciante",
  },
  {
    id: "fii",
    nome: "FII (Fundo de Investimento Imobiliário)",
    categoria: "Renda Variável",
    risco: 3,
    liquidez: "Alta (negociado na bolsa, mas o preço da cota varia)",
    rentabilidade: "Dividendos mensais (isentos de IR) + valorização/desvalorização da cota",
    tributacao: "Dividendos isentos de IR para pessoa física; ganho de capital na venda é tributado em 20%",
    garantia: "Sem garantia — risco de mercado e de vacância dos imóveis",
    indicadoPara: "Quem quer renda passiva mensal e já tem uma reserva de emergência formada",
    descricao:
      "Fundos que reúnem o dinheiro de vários investidores para comprar imóveis (shoppings, galpões logísticos, prédios comerciais) ou papéis do setor imobiliário, distribuindo aluguel mensalmente na forma de dividendos.",
    prosCons: {
      prós: ["Renda mensal isenta de IR", "Acesso ao mercado imobiliário com pouco dinheiro", "Diversificação"],
      contras: ["Cota pode cair de valor", "Risco de vacância e inadimplência dos inquilinos"],
    },
    nivel: "intermediario",
  },
  {
    id: "acoes",
    nome: "Ações",
    categoria: "Renda Variável",
    risco: 4,
    liquidez: "Alta (venda em segundos na bolsa, mas o preço varia bastante)",
    rentabilidade: "Valorização da empresa + dividendos, sem teto e sem piso",
    tributacao: "20% sobre o ganho líquido em vendas acima de R$ 20.000/mês (day trade: 20% sempre)",
    garantia: "Sem garantia — você se torna sócio da empresa e assume o risco do negócio",
    indicadoPara: "Quem já tem reserva de emergência, tolera oscilação e pensa no longo prazo",
    descricao:
      "Comprar uma ação é comprar uma fatia de uma empresa real. O retorno pode ser muito maior que o da renda fixa no longo prazo, mas o preço oscila diariamente e pode cair de forma expressiva no curto prazo.",
    prosCons: {
      prós: ["Potencial de retorno elevado no longo prazo", "Você se torna sócio de empresas reais", "Alta liquidez"],
      contras: ["Alta volatilidade", "Exige estudo e paciência", "Sem qualquer garantia"],
    },
    nivel: "avancado",
  },
  {
    id: "cripto",
    nome: "Criptomoedas",
    categoria: "Ativo Digital",
    risco: 5,
    liquidez: "Alta, 24 horas por dia, 7 dias por semana",
    rentabilidade: "Extremamente variável — pode multiplicar ou perder a maior parte do valor",
    tributacao: "15% a 22,5% sobre o ganho na venda acima de R$ 35.000/mês",
    garantia: "Nenhuma garantia — sem FGC, sujeito a risco de custódia e regulatório",
    indicadoPara: "Investidores avançados dispostos a alocar uma pequena parte do patrimônio em ativos de altíssimo risco",
    descricao:
      "Ativos digitais descentralizados como Bitcoin e Ethereum. Podem gerar retornos expressivos, mas a volatilidade é altíssima e não há qualquer rede de proteção caso algo dê errado (corretora, carteira, golpe).",
    prosCons: {
      prós: ["Potencial de valorização elevado", "Mercado aberto 24/7", "Tecnologia inovadora"],
      contras: ["Volatilidade extrema", "Nenhuma garantia ou proteção", "Alto risco de golpes e perda total"],
    },
    nivel: "avancado",
  },
];

/* -------------------------------------------------------------------------
   2) PERGUNTAS DO ONBOARDING (até 5 perguntas de alternativa)
   Cada opção tem "pontos" (1 a 4) usados para calcular o nível do usuário
   e uma "tag" usada para identificar o objetivo principal.
   ------------------------------------------------------------------------- */
const ONBOARDING_QUESTIONS = [
  {
    id: "q1",
    pergunta: "Você já investiu antes?",
    opcoes: [
      { texto: "Nunca investi nada", pontos: 1, tag: "zero" },
      { texto: "Só tenho dinheiro na poupança", pontos: 2, tag: "poupanca" },
      { texto: "Já investi em CDB, Tesouro Direto ou fundos", pontos: 3, tag: "rendafixa" },
      { texto: "Já investi em ações, FIIs ou criptomoedas", pontos: 4, tag: "rendavariavel" },
    ],
  },
  {
    id: "q2",
    pergunta: "Qual é o seu principal motivo para querer investir agora?",
    opcoes: [
      { texto: "Quero controlar melhor meus gastos primeiro", pontos: 1, tag: "controle" },
      { texto: "Quero ter uma renda mensal mais saudável", pontos: 2, tag: "renda" },
      { texto: "Quero fazer meu dinheiro crescer no longo prazo", pontos: 3, tag: "crescimento" },
      { texto: "Quero entender profundamente o mercado financeiro", pontos: 4, tag: "aprendizado" },
    ],
  },
  {
    id: "q3",
    pergunta: "Qual sua meta de patrimônio ou renda em 10 anos?",
    opcoes: [
      { texto: "Sair do zero a zero e ter uma reserva de emergência", pontos: 1, tag: "reserva" },
      { texto: "Ter uma reserva sólida e alguns investimentos rendendo", pontos: 2, tag: "solida" },
      { texto: "Multiplicar meu patrimônio de forma significativa", pontos: 3, tag: "multiplicar" },
      { texto: "Viver de renda passiva dos meus investimentos", pontos: 4, tag: "rendapassiva" },
    ],
  },
  {
    id: "q4",
    pergunta: "Como você reage quando um investimento cai de valor?",
    opcoes: [
      { texto: "Fico muito ansioso e quero vender tudo na hora", pontos: 1, tag: "ansioso" },
      { texto: "Fico preocupado, mas espero para ver o que acontece", pontos: 2, tag: "cauteloso" },
      { texto: "Entendo que faz parte do processo e mantenho a estratégia", pontos: 3, tag: "estrategico" },
      { texto: "Vejo como oportunidade e considero comprar mais", pontos: 4, tag: "oportunista" },
    ],
  },
  {
    id: "q5",
    pergunta: "Quanto tempo por semana você dedica a aprender sobre finanças?",
    opcoes: [
      { texto: "Nenhum — estou começando agora, do zero", pontos: 1, tag: "zero_tempo" },
      { texto: "Menos de 1 hora por semana", pontos: 2, tag: "pouco_tempo" },
      { texto: "Algumas horas por semana, leio conteúdos e notícias", pontos: 3, tag: "medio_tempo" },
      { texto: "Acompanho o mercado quase todos os dias", pontos: 4, tag: "muito_tempo" },
    ],
  },
];

/* -------------------------------------------------------------------------
   3) TRILHA GAMIFICADA — "Do Zero ao Avançado"
   Estrutura: Níveis > Lições > Perguntas de múltipla escolha.
   Cada resposta correta concede XP. Lições concluídas destravam a próxima.
   ------------------------------------------------------------------------- */
const COURSE = [
  {
    id: "nivel1",
    titulo: "Nível 1 · Fundamentos",
    cor: "#1F8A73",
    licoes: [
      {
        id: "l1_1",
        titulo: "O que é dinheiro e inflação",
        xp: 20,
        perguntas: [
          {
            pergunta: "O que é inflação?",
            opcoes: [
              "O aumento generalizado e contínuo dos preços",
              "A queda do valor das ações na bolsa",
              "Um tipo de imposto cobrado pelo governo",
              "A taxa de juros que os bancos cobram entre si",
            ],
            correta: 0,
            explicacao:
              "Inflação é o aumento geral de preços ao longo do tempo. Ela reduz o poder de compra do seu dinheiro parado.",
          },
          {
            pergunta: "Se a inflação do ano foi de 5% e seu dinheiro ficou parado embaixo do colchão, o que aconteceu?",
            opcoes: [
              "Seu dinheiro rendeu 5%",
              "Seu dinheiro perdeu poder de compra",
              "Nada mudou",
              "Seu dinheiro dobrou de valor",
            ],
            correta: 1,
            explicacao: "Dinheiro parado perde valor real todo ano em que houver inflação — por isso investir é importante mesmo para preservar o que você já tem.",
          },
          {
            pergunta: "Qual destes é o principal motivo para investir mesmo pequenas quantias?",
            opcoes: [
              "Ficar rico da noite para o dia",
              "Proteger o dinheiro da inflação e fazê-lo crescer com o tempo",
              "Impressionar os amigos",
              "É obrigatório por lei",
            ],
            correta: 1,
            explicacao: "Investir, mesmo pouco, é sobre proteger e fazer crescer o valor do seu dinheiro ao longo do tempo — os juros compostos fazem o resto.",
          },
        ],
      },
      {
        id: "l1_2",
        titulo: "Reserva de emergência",
        xp: 20,
        perguntas: [
          {
            pergunta: "Para que serve a reserva de emergência?",
            opcoes: [
              "Para comprar ações na baixa",
              "Para cobrir imprevistos sem precisar se endividar",
              "Para pagar impostos",
              "Para investir em criptomoedas",
            ],
            correta: 1,
            explicacao: "A reserva de emergência é o alicerce da vida financeira: dinheiro disponível para imprevistos (perda de emprego, saúde, reparos) sem recorrer a dívidas caras.",
          },
          {
            pergunta: "Quantos meses de despesas costuma-se recomendar guardar na reserva de emergência?",
            opcoes: ["1 semana", "De 3 a 6 meses de despesas", "10 anos", "Não é necessário guardar nada"],
            correta: 1,
            explicacao: "O recomendado geralmente é entre 3 e 6 meses de despesas essenciais, podendo variar conforme a estabilidade da sua renda.",
          },
          {
            pergunta: "Onde a reserva de emergência deve ficar investida?",
            opcoes: [
              "Em ações de alto risco",
              "Em criptomoedas",
              "Em algo com liquidez imediata e baixo risco, como Tesouro Selic ou CDB com liquidez diária",
              "Embaixo do colchão",
            ],
            correta: 2,
            explicacao: "A reserva precisa de liquidez (acesso rápido) e segurança — por isso Tesouro Selic e CDBs com liquidez diária são as escolhas mais comuns.",
          },
        ],
      },
      {
        id: "l1_3",
        titulo: "Orçamento pessoal",
        xp: 20,
        perguntas: [
          {
            pergunta: "O que é um orçamento pessoal?",
            opcoes: [
              "Um relatório do governo",
              "Um planejamento de quanto você ganha e quanto pode gastar em cada categoria",
              "Um tipo de investimento",
              "Uma taxa bancária",
            ],
            correta: 1,
            explicacao: "Orçamento pessoal é organizar entradas e saídas de dinheiro para saber exatamente para onde ele está indo — o primeiro passo de qualquer vida financeira saudável.",
          },
          {
            pergunta: "Qual é uma regra simples e popular de orçamento?",
            opcoes: [
              "Regra 50-30-20 (necessidades, desejos, investimentos/dívidas)",
              "Gastar tudo que ganha",
              "Nunca anotar os gastos",
              "Investir 100% da renda",
            ],
            correta: 0,
            explicacao: "A regra 50-30-20 sugere 50% da renda para necessidades, 30% para desejos e 20% para investimentos ou pagamento de dívidas — um ponto de partida simples.",
          },
          {
            pergunta: "Por que registrar todos os gastos ajuda financeiramente?",
            opcoes: [
              "Não ajuda em nada",
              "Só serve para o imposto de renda",
              "Porque revela padrões e gastos invisíveis do dia a dia",
              "Porque é exigido pelo banco",
            ],
            correta: 2,
            explicacao: "Registrar gastos revela padrões — muita gente descobre que pequenos gastos recorrentes (delivery, assinaturas) somam muito mais do que imaginava.",
          },
        ],
      },
    ],
  },
  {
    id: "nivel2",
    titulo: "Nível 2 · Renda Fixa",
    cor: "#3B6E8F",
    licoes: [
      {
        id: "l2_1",
        titulo: "Selic, CDI e como comparar rendimentos",
        xp: 25,
        perguntas: [
          {
            pergunta: "O que é a taxa Selic?",
            opcoes: [
              "A taxa básica de juros da economia, definida pelo Banco Central",
              "Uma taxa cobrada só por corretoras",
              "O valor mínimo para abrir uma conta",
              "Uma taxa exclusiva de criptomoedas",
            ],
            correta: 0,
            explicacao: "A Selic é a taxa básica de juros do Brasil, definida pelo Copom (Banco Central). Ela influencia quase todos os investimentos de renda fixa do país.",
          },
          {
            pergunta: "Um CDB que rende '110% do CDI' é considerado, em geral:",
            opcoes: [
              "Uma rentabilidade abaixo da média",
              "Uma rentabilidade acima da média (supera o CDI)",
              "Isento de qualquer risco",
              "Igual à poupança",
            ],
            correta: 1,
            explicacao: "Como o CDI acompanha a Selic de perto, pagar mais que 100% do CDI significa uma rentabilidade acima da referência do mercado.",
          },
          {
            pergunta: "Quando a Selic sobe, o que geralmente acontece com a renda fixa pós-fixada?",
            opcoes: [
              "Ela rende menos",
              "Ela rende mais",
              "Não muda nada",
              "Ela desaparece do mercado",
            ],
            correta: 1,
            explicacao: "Investimentos pós-fixados (ligados ao CDI/Selic) rendem mais quando a Selic sobe, e menos quando ela cai.",
          },
        ],
      },
      {
        id: "l2_2",
        titulo: "CDB, LCI e LCA na prática",
        xp: 25,
        perguntas: [
          {
            pergunta: "Qual a principal vantagem da LCI e LCA sobre o CDB?",
            opcoes: [
              "Rendem sempre mais",
              "São isentas de Imposto de Renda para pessoa física",
              "Não têm nenhum risco",
              "Têm liquidez diária garantida",
            ],
            correta: 1,
            explicacao: "LCI e LCA são isentas de IR para pessoa física, o que pode compensar uma taxa nominal menor em comparação a um CDB equivalente.",
          },
          {
            pergunta: "O que garante a segurança de um CDB, LCI ou LCA até R$ 250.000 por instituição?",
            opcoes: [
              "O próprio banco emissor",
              "O Fundo Garantidor de Créditos (FGC)",
              "O Tesouro Nacional",
              "Nenhuma garantia existe",
            ],
            correta: 1,
            explicacao: "O FGC protege esses investimentos até R$ 250.000 por CPF e por instituição financeira, caso o banco emissor quebre.",
          },
          {
            pergunta: "Qual característica costuma limitar a LCI e a LCA?",
            opcoes: [
              "Rendimento negativo garantido",
              "Baixa liquidez, com carência para resgate",
              "Proibição para pessoa física",
              "Cobrança de taxa de administração alta",
            ],
            correta: 1,
            explicacao: "LCI e LCA geralmente têm prazos de carência mais longos, então são mais indicadas para dinheiro que você não vai precisar no curto prazo.",
          },
        ],
      },
      {
        id: "l2_3",
        titulo: "Tesouro Direto",
        xp: 25,
        perguntas: [
          {
            pergunta: "Qual título do Tesouro Direto é mais indicado para reserva de emergência?",
            opcoes: ["Tesouro Prefixado", "Tesouro IPCA+", "Tesouro Selic", "Nenhum deles"],
            correta: 2,
            explicacao: "O Tesouro Selic tem baixíssima oscilação de preço e alta liquidez, sendo o mais indicado para reserva de emergência.",
          },
          {
            pergunta: "O Tesouro IPCA+ é indicado principalmente para:",
            opcoes: [
              "Guardar dinheiro por poucos dias",
              "Objetivos de longo prazo, protegendo contra a inflação",
              "Especulação diária",
              "Substituir a conta corrente",
            ],
            correta: 1,
            explicacao: "O Tesouro IPCA+ paga a inflação (IPCA) mais uma taxa fixa, protegendo o poder de compra — ótimo para aposentadoria e metas de longo prazo.",
          },
          {
            pergunta: "O que pode acontecer se você vender um Tesouro Prefixado ou IPCA+ antes do vencimento?",
            opcoes: [
              "Nada, o valor é sempre fixo",
              "Você pode ter ganho ou perda, pois o preço oscila com as taxas de juros do mercado",
              "É proibido vender antes do vencimento",
              "O governo devolve o dobro do valor",
            ],
            correta: 1,
            explicacao: "Esses títulos têm marcação a mercado: o preço varia diariamente. Vender antes do vencimento pode gerar ganho ou perda, dependendo da taxa de juros vigente.",
          },
        ],
      },
    ],
  },
  {
    id: "nivel3",
    titulo: "Nível 3 · Renda Variável",
    cor: "#B9762F",
    licoes: [
      {
        id: "l3_1",
        titulo: "Ações: virando sócio de empresas",
        xp: 30,
        perguntas: [
          {
            pergunta: "O que você se torna ao comprar uma ação?",
            opcoes: ["Credor da empresa", "Sócio (acionista) da empresa", "Funcionário da empresa", "Fornecedor da empresa"],
            correta: 1,
            explicacao: "Ao comprar uma ação, você compra uma fração da empresa e passa a ser sócio, participando dos lucros (via dividendos) e riscos do negócio.",
          },
          {
            pergunta: "Por que ações costumam ter mais risco do que a renda fixa?",
            opcoes: [
              "Porque são proibidas por lei",
              "Porque o preço oscila conforme resultados da empresa e do mercado, sem garantia de retorno",
              "Porque não existe mercado para vendê-las",
              "Porque sempre dão prejuízo",
            ],
            correta: 1,
            explicacao: "O preço das ações reflete expectativas sobre o futuro da empresa e da economia, por isso pode subir ou cair de forma significativa e sem garantias.",
          },
          {
            pergunta: "O que são dividendos?",
            opcoes: [
              "Uma multa paga pela empresa",
              "Parte do lucro da empresa distribuída aos acionistas",
              "O valor pago para comprar a ação",
              "Um imposto sobre a compra de ações",
            ],
            correta: 1,
            explicacao: "Dividendos são a parcela do lucro que a empresa distribui aos seus acionistas, geralmente proporcional à quantidade de ações que cada um possui.",
          },
        ],
      },
      {
        id: "l3_2",
        titulo: "Fundos Imobiliários (FIIs)",
        xp: 30,
        perguntas: [
          {
            pergunta: "O que é um FII?",
            opcoes: [
              "Um fundo que compra imóveis ou papéis imobiliários e distribui a renda gerada",
              "Um tipo de criptomoeda",
              "Um seguro residencial",
              "Um financiamento imobiliário",
            ],
            correta: 0,
            explicacao: "FIIs reúnem o dinheiro de vários investidores para investir em imóveis (shoppings, galpões, escritórios) ou papéis do setor, repassando a renda gerada aos cotistas.",
          },
          {
            pergunta: "Como costumam ser tributados os dividendos (rendimentos) de FIIs para pessoa física?",
            opcoes: [
              "Isentos de Imposto de Renda",
              "Tributados em 27,5%",
              "Tributados em 6%",
              "Depende do CPF do investidor",
            ],
            correta: 0,
            explicacao: "Os rendimentos mensais distribuídos por FIIs são isentos de IR para pessoa física, desde que atendidos alguns requisitos (como negociação em bolsa).",
          },
          {
            pergunta: "Qual é um risco específico dos FIIs 'de tijolo' (que possuem imóveis físicos)?",
            opcoes: [
              "Risco de vacância (imóvel ficar sem inquilino)",
              "Risco de o Tesouro Nacional quebrar",
              "Risco de o FGC não cobrir",
              "Não existe risco algum",
            ],
            correta: 0,
            explicacao: "A vacância (imóvel desocupado) reduz a receita de aluguel do fundo, impactando diretamente os dividendos distribuídos.",
          },
        ],
      },
    ],
  },
  {
    id: "nivel4",
    titulo: "Nível 4 · Diversificação e Risco",
    cor: "#6C4FCF",
    licoes: [
      {
        id: "l4_1",
        titulo: "Perfil de investidor",
        xp: 35,
        perguntas: [
          {
            pergunta: "O que é o perfil de investidor (suitability)?",
            opcoes: [
              "Uma avaliação que identifica sua tolerância ao risco e objetivos",
              "Um tipo de imposto",
              "Uma corretora específica",
              "Um seguro obrigatório",
            ],
            correta: 0,
            explicacao: "O perfil de investidor mede sua tolerância ao risco, seus objetivos e seu horizonte de tempo, ajudando a escolher investimentos adequados a você.",
          },
          {
            pergunta: "Um investidor 'conservador' costuma priorizar:",
            opcoes: [
              "Máximo risco possível",
              "Segurança e previsibilidade, mesmo com retorno menor",
              "Apenas criptomoedas",
              "Especulação de curto prazo",
            ],
            correta: 1,
            explicacao: "Perfis conservadores priorizam segurança e previsibilidade — geralmente concentram a carteira em renda fixa de baixo risco.",
          },
        ],
      },
      {
        id: "l4_2",
        titulo: "Diversificação de carteira",
        xp: 35,
        perguntas: [
          {
            pergunta: "Por que diversificar investimentos é importante?",
            opcoes: [
              "Para reduzir o risco total da carteira, não dependendo de um único ativo",
              "Para pagar mais impostos",
              "Para complicar o controle financeiro sem motivo",
              "Não traz benefício real",
            ],
            correta: 0,
            explicacao: "Diversificar significa não colocar todos os recursos em um único ativo — assim, se um investimento vai mal, outros podem equilibrar o resultado da carteira.",
          },
          {
            pergunta: "O que significa 'não colocar todos os ovos na mesma cesta'?",
            opcoes: [
              "Investir tudo em um único ativo de alto risco",
              "Diversificar entre diferentes classes de ativos e riscos",
              "Gastar tudo o que se ganha",
              "Evitar investir",
            ],
            correta: 1,
            explicacao: "É uma metáfora clássica para diversificação: distribuir os recursos entre diferentes investimentos reduz o impacto de uma perda isolada.",
          },
        ],
      },
      {
        id: "l4_3",
        titulo: "Criptomoedas com responsabilidade",
        xp: 35,
        perguntas: [
          {
            pergunta: "Qual das afirmações sobre criptomoedas é verdadeira?",
            opcoes: [
              "São garantidas pelo FGC",
              "Têm volatilidade extremamente alta e nenhuma garantia oficial",
              "São isentas de qualquer risco",
              "São reguladas exatamente como a poupança",
            ],
            correta: 1,
            explicacao: "Criptomoedas não têm garantia como o FGC e podem oscilar de forma extrema em curtos períodos — qualquer alocação deve ser cautelosa.",
          },
          {
            pergunta: "Qual é uma prática comum recomendada para quem decide investir em criptomoedas?",
            opcoes: [
              "Investir todo o patrimônio de uma vez",
              "Alocar apenas uma pequena parte do patrimônio que se está disposto a perder",
              "Nunca guardar as senhas de acesso",
              "Comprar sem entender o que está comprando",
            ],
            correta: 1,
            explicacao: "Por causa do alto risco, a orientação comum é destinar apenas uma pequena fração do patrimônio total a criptoativos.",
          },
        ],
      },
    ],
  },
  {
    id: "nivel5",
    titulo: "Nível 5 · Avançado",
    cor: "#C0392B",
    licoes: [
      {
        id: "l5_1",
        titulo: "Juros compostos e o poder do tempo",
        xp: 40,
        perguntas: [
          {
            pergunta: "O que torna os juros compostos tão poderosos no longo prazo?",
            opcoes: [
              "Os juros incidem apenas sobre o valor inicial",
              "Os juros incidem sobre o valor inicial mais os juros já acumulados",
              "Eles só funcionam em criptomoedas",
              "Eles reduzem o valor investido com o tempo",
            ],
            correta: 1,
            explicacao: "Nos juros compostos, você ganha 'juros sobre juros' — por isso o crescimento acelera exponencialmente quanto mais tempo o dinheiro fica investido.",
          },
          {
            pergunta: "Começar a investir 5 anos mais tarde normalmente exige, para chegar ao mesmo resultado:",
            opcoes: [
              "O mesmo valor investido",
              "Um valor investido bem menor",
              "Um valor investido bem maior, para compensar o tempo perdido",
              "Não faz diferença",
            ],
            correta: 2,
            explicacao: "Como os juros compostos dependem fortemente do tempo, começar mais tarde exige aportes maiores para alcançar o mesmo patrimônio final.",
          },
        ],
      },
      {
        id: "l5_2",
        titulo: "Análise fundamentalista",
        xp: 40,
        perguntas: [
          {
            pergunta: "O que a análise fundamentalista busca avaliar?",
            opcoes: [
              "Apenas o gráfico de preços recente",
              "A saúde financeira e o valor real de uma empresa (lucros, dívidas, governança)",
              "O clima do dia",
              "Apenas o volume negociado hoje",
            ],
            correta: 1,
            explicacao: "A análise fundamentalista estuda balanços, lucros, dívidas e perspectivas de uma empresa para estimar se o preço da ação está caro ou barato.",
          },
          {
            pergunta: "Qual indicador é comumente usado na análise fundamentalista?",
            opcoes: ["P/L (Preço sobre Lucro)", "RSI de 9 períodos", "Número de seguidores nas redes sociais", "Cor do logotipo da empresa"],
            correta: 0,
            explicacao: "O P/L (Preço/Lucro) mostra quantos anos de lucro atual seriam necessários para 'pagar' o preço da ação — um dos indicadores mais usados na análise fundamentalista.",
          },
        ],
      },
      {
        id: "l5_3",
        titulo: "Estratégia de longo prazo e consciência financeira",
        xp: 40,
        perguntas: [
          {
            pergunta: "O que caracteriza um investidor de longo prazo (buy and hold)?",
            opcoes: [
              "Comprar e vender diariamente buscando pequenos lucros",
              "Manter bons ativos por longos períodos, ignorando ruídos de curto prazo",
              "Nunca estudar sobre os investimentos",
              "Investir apenas em um único ativo para sempre",
            ],
            correta: 1,
            explicacao: "Investidores de longo prazo focam na qualidade dos ativos e toleram oscilações de curto prazo, confiando no crescimento ao longo dos anos.",
          },
          {
            pergunta: "Por que a educação financeira é considerada uma ferramenta de mobilidade social?",
            opcoes: [
              "Porque garante ficar rico em um mês",
              "Porque dá autonomia para tomar decisões melhores sobre dinheiro, independente da renda",
              "Porque é exigida por lei para trabalhar",
              "Ela não tem relação com mobilidade social",
            ],
            correta: 1,
            explicacao: "Educação financeira amplia a autonomia de decisão sobre o próprio dinheiro, permitindo que pessoas de qualquer renda planejem, poupem e invistam de forma mais consciente — um fator real de mobilidade social ao longo de gerações.",
          },
        ],
      },
    ],
  },
  {
    id: "nivel6",
    titulo: "Nível 6 · Mercado Avançado (Pro)",
    cor: "#1F3A5F",
    licoes: [
      {
        id: "l6_1",
        titulo: "Alocação de ativos e teoria de portfólio",
        xp: 50,
        perguntas: [
          {
            pergunta: "Segundo a teoria moderna de portfólio, o que reduz o risco total de uma carteira sem necessariamente reduzir o retorno esperado?",
            opcoes: [
              "Concentrar tudo no ativo de maior retorno histórico",
              "Combinar ativos com baixa correlação entre si",
              "Investir apenas em um único setor da economia",
              "Aumentar o número de vezes que se opera por dia",
            ],
            correta: 1,
            explicacao: "Diversificação eficiente não é só 'ter vários ativos', é combinar ativos que não se movem sempre juntos (baixa correlação) — isso reduz a volatilidade da carteira como um todo.",
          },
          {
            pergunta: "O que o Índice de Sharpe mede?",
            opcoes: [
              "O retorno absoluto de um ativo, sem considerar risco",
              "O retorno obtido por unidade de risco (volatilidade) assumido, acima da taxa livre de risco",
              "A quantidade de ativos em uma carteira",
              "O imposto pago sobre o investimento",
            ],
            correta: 1,
            explicacao: "O Sharpe divide o retorno excedente (acima do CDI/Selic, por exemplo) pela volatilidade do ativo — quanto maior, melhor a relação risco-retorno.",
          },
          {
            pergunta: "Rebalancear uma carteira significa:",
            opcoes: [
              "Vender tudo sempre que o mercado cai",
              "Ajustar periodicamente os pesos dos ativos para voltar à alocação-alvo definida na estratégia",
              "Aumentar sempre a posição no ativo que mais subiu",
              "Um procedimento exigido por lei mensalmente",
            ],
            correta: 1,
            explicacao: "Com o tempo, ativos que sobem mais passam a pesar mais na carteira do que o planejado. Rebalancear é vender parte do que subiu e comprar o que ficou abaixo da meta, mantendo o perfil de risco pretendido.",
          },
        ],
      },
      {
        id: "l6_2",
        titulo: "Renda fixa avançada: marcação a mercado e curva de juros",
        xp: 50,
        perguntas: [
          {
            pergunta: "O que é 'marcação a mercado' em um título de renda fixa?",
            opcoes: [
              "O título nunca muda de preço até o vencimento",
              "A atualização diária do preço do título conforme as taxas de juros vigentes, gerando ganho ou perda se vendido antes do vencimento",
              "Uma taxa cobrada apenas por bancos públicos",
              "O nome do imposto sobre renda fixa",
            ],
            correta: 1,
            explicacao: "Títulos prefixados e IPCA+ têm o preço recalculado todos os dias com base nas taxas de juros do mercado. Se as taxas sobem, o preço desses títulos cai (e vice-versa) — por isso vender antes do vencimento pode gerar perda mesmo em um título 'seguro'.",
          },
          {
            pergunta: "O que é 'duration' de um título de renda fixa?",
            opcoes: [
              "O prazo de carência para resgate",
              "Uma medida de sensibilidade do preço do título a variações nas taxas de juros — quanto maior a duration, maior a oscilação",
              "A taxa de administração cobrada pela corretora",
              "O valor mínimo de aplicação",
            ],
            correta: 1,
            explicacao: "Duration mede o quanto o preço de um título reage a mudanças nos juros. Títulos mais longos e prefixados/IPCA+ têm duration maior e, portanto, mais volatilidade de preço no curto prazo.",
          },
          {
            pergunta: "Quando a curva de juros brasileira está 'invertida' ou muito íngreme no longo prazo, isso costuma refletir:",
            opcoes: [
              "Que não há nenhum risco no país",
              "Expectativas do mercado sobre inflação futura, risco fiscal e trajetória da Selic",
              "O preço do dólar de ontem",
              "Uma decisão exclusiva de uma corretora específica",
            ],
            correta: 1,
            explicacao: "A curva de juros (DI futuro) precifica as expectativas do mercado para Selic, inflação e risco fiscal nos próximos anos — é um dos termômetros mais observados por quem trabalha com renda fixa.",
          },
        ],
      },
      {
        id: "l6_3",
        titulo: "Indicadores fundamentalistas avançados",
        xp: 50,
        perguntas: [
          {
            pergunta: "O que o ROE (Retorno sobre o Patrimônio Líquido) indica?",
            opcoes: [
              "Quanto a empresa deve de dívida",
              "Quão eficiente a empresa é em gerar lucro a partir do capital próprio investido pelos sócios",
              "O preço da ação hoje",
              "O volume de ações negociadas",
            ],
            correta: 1,
            explicacao: "ROE = Lucro Líquido / Patrimônio Líquido. Mede a eficiência da empresa em transformar capital próprio em lucro — quanto maior (de forma sustentável), melhor.",
          },
          {
            pergunta: "Por que o indicador EV/EBITDA é considerado mais completo que o P/L para comparar empresas de setores intensivos em capital?",
            opcoes: [
              "Porque ignora completamente a dívida da empresa",
              "Porque considera o valor da empresa incluindo dívida (Enterprise Value) sobre a geração de caixa operacional (EBITDA), permitindo comparar empresas com estruturas de capital diferentes",
              "Porque é calculado pelo governo",
              "Porque não depende do lucro da empresa",
            ],
            correta: 1,
            explicacao: "O EV/EBITDA soma dívida e valor de mercado (EV) e compara com a geração de caixa operacional (EBITDA), tornando a comparação mais justa entre empresas com níveis de endividamento diferentes.",
          },
          {
            pergunta: "Um P/VP (Preço sobre Valor Patrimonial) bem abaixo de 1 pode indicar:",
            opcoes: [
              "Que a empresa certamente vai falir",
              "Que a ação pode estar sendo negociada por menos do que o patrimônio contábil da empresa — o que exige investigar o motivo antes de concluir se é uma barganha ou um sinal de problema",
              "Que a empresa não paga dividendos",
              "Que o P/VP não tem relação com o preço da ação",
            ],
            correta: 1,
            explicacao: "P/VP baixo pode ser uma oportunidade (mercado subprecificando) ou um sinal de problema estrutural (ativos sobrevalorizados no balanço, baixa rentabilidade futura). Nunca deve ser usado isoladamente.",
          },
        ],
      },
      {
        id: "l6_4",
        titulo: "Planejamento tributário e sucessório",
        xp: 50,
        perguntas: [
          {
            pergunta: "O que é 'come-cotas'?",
            opcoes: [
              "Uma taxa de corretagem",
              "A antecipação semestral do Imposto de Renda cobrada automaticamente em fundos de investimento (exceto fundos de ações)",
              "Um tipo de ação",
              "Uma multa por resgate antecipado",
            ],
            correta: 1,
            explicacao: "Todo maio e novembro, fundos de renda fixa e multimercado (entre outros) sofrem a retenção automática de IR sobre os rendimentos, mesmo sem resgate — o 'come-cotas' reduz o efeito dos juros compostos ao longo do tempo em comparação a produtos sem essa antecipação.",
          },
          {
            pergunta: "Qual a principal motivação prática para criar uma holding patrimonial familiar?",
            opcoes: [
              "Eliminar totalmente qualquer imposto",
              "Organizar a sucessão de patrimônio (imóveis, participações) e, em alguns casos, otimizar a carga tributária sobre aluguéis e herança, com planejamento jurídico adequado",
              "É obrigatório para comprar ações",
              "Serve apenas para pessoas jurídicas de grande porte no exterior",
            ],
            correta: 1,
            explicacao: "Holdings patrimoniais são usadas principalmente para planejamento sucessório e, dependendo do caso, para eficiência tributária sobre renda de aluguéis — sempre com orientação contábil e jurídica especializada, pois envolve custos e regras específicas.",
          },
          {
            pergunta: "Na declaração anual de Imposto de Renda, ações, FIIs e ETFs vendidos com lucro geralmente precisam ser:",
            opcoes: [
              "Ignorados, pois a corretora paga tudo automaticamente",
              "Apurados mês a mês pelo próprio investidor (via DARF), já que a maioria desses ganhos não tem retenção automática como o come-cotas",
              "Declarados apenas se o investidor quiser",
              "Isentos sempre, independente do valor",
            ],
            correta: 1,
            explicacao: "Diferente de fundos, o ganho de capital em ações/FIIs/ETFs (fora as isenções específicas, como a de R$ 20.000/mês em ações) exige apuração e recolhimento manual do imposto via DARF pelo próprio investidor.",
          },
        ],
      },
      {
        id: "l6_5",
        titulo: "Derivativos, hedge e finanças comportamentais",
        xp: 50,
        perguntas: [
          {
            pergunta: "O que significa 'fazer hedge' de uma posição?",
            opcoes: [
              "Dobrar a aposta em um ativo que já subiu muito",
              "Usar um instrumento (como opções ou contratos futuros) para reduzir o risco de uma posição já existente",
              "Vender toda a carteira em pânico",
              "Investir sem qualquer planejamento",
            ],
            correta: 1,
            explicacao: "Hedge é uma proteção: por exemplo, comprar uma opção de venda (put) sobre uma ação que você possui limita a perda máxima caso o preço caia, em troca do custo do prêmio da opção.",
          },
          {
            pergunta: "O que é 'aversão à perda' (loss aversion), um dos vieses mais estudados em finanças comportamentais?",
            opcoes: [
              "A tendência de sentir a dor de uma perda com mais intensidade do que o prazer de um ganho equivalente, levando a decisões irracionais (como vender no fundo do poço)",
              "O medo de investir em qualquer ativo",
              "Uma taxa cobrada por corretoras",
              "A preferência por sempre investir em renda fixa",
            ],
            correta: 0,
            explicacao: "Esse viés explica por que muitos investidores vendem justamente nos momentos de queda (realizando a perda) e demoram a vender ativos ganhadores — o oposto do que a estratégia racional recomendaria.",
          },
          {
            pergunta: "O 'efeito manada' em investimentos se refere a:",
            opcoes: [
              "Seguir decisões de investimento apenas porque a maioria está fazendo o mesmo, sem análise própria",
              "Uma estratégia de diversificação recomendada",
              "Um tipo de imposto sobre grandes carteiras",
              "A obrigação legal de seguir recomendações de analistas",
            ],
            correta: 0,
            explicacao: "O efeito manada leva investidores a comprar na euforia (preços já altos) e vender no pânico (preços já baixos) — exatamente o contrário do que maximiza retorno no longo prazo.",
          },
        ],
      },
      {
        id: "l6_6",
        titulo: "Independência financeira e aposentadoria",
        xp: 50,
        perguntas: [
          {
            pergunta: "O que propõe a 'regra dos 4%' (ou taxa de retirada segura) usada em planejamento de independência financeira?",
            opcoes: [
              "Investir apenas 4% da renda mensal",
              "Que é possível retirar cerca de 4% do patrimônio investido por ano, ajustado pela inflação, com baixa probabilidade de esgotar o capital ao longo de décadas",
              "Pagar 4% de imposto sobre qualquer investimento",
              "Uma taxa fixa cobrada por todos os fundos de previdência",
            ],
            correta: 1,
            explicacao: "A regra dos 4% (originada do 'Trinity Study') estima o percentual do patrimônio que pode ser retirado anualmente sem esgotar o capital ao longo de ~30 anos, considerando uma carteira diversificada. É uma referência, não uma garantia — depende da carteira e do cenário real de retornos.",
          },
          {
            pergunta: "Qual a diferença essencial entre PGBL e VGBL, os dois principais planos de previdência privada no Brasil?",
            opcoes: [
              "Não há diferença nenhuma",
              "O PGBL permite deduzir as contribuições (até 12% da renda bruta anual) no Imposto de Renda para quem declara no modelo completo; o VGBL não oferece essa dedução, mas tributa apenas os rendimentos no resgate",
              "O VGBL é exclusivo para empresas",
              "O PGBL é garantido pelo FGC",
            ],
            correta: 1,
            explicacao: "PGBL costuma ser vantajoso para quem faz a declaração completa do IR e já contribui para o INSS/regime próprio; VGBL tende a ser melhor para quem usa a declaração simplificada ou já esgotou o limite de dedução do PGBL. A escolha errada do regime tributário (progressivo x regressivo) também afeta bastante o resultado final.",
          },
          {
            pergunta: "Por que o horizonte de tempo é o fator mais importante para quem busca independência financeira via mercado de capitais?",
            opcoes: [
              "Não é importante, o que importa é o valor investido a cada mês",
              "Porque juros compostos e a recuperação de ciclos de mercado (bolsa, juros) exigem tempo — quanto antes se começa, menor o aporte mensal necessário para atingir a mesma meta",
              "Porque o tempo determina o valor do imposto de renda cobrado",
              "Porque só é possível se aposentar depois dos 60 anos",
            ],
            correta: 1,
            explicacao: "O tempo é o maior aliado dos juros compostos e o maior amortecedor de ciclos ruins de mercado. Começar 10 anos antes, mesmo com aportes menores, costuma superar quem começa tarde com aportes maiores — é a lição mais repetida (e mais ignorada) do mercado financeiro.",
          },
        ],
      },
    ],
  },
];

/* -------------------------------------------------------------------------
   4) DICAS DE CONTROLE DE GASTOS E GASTOS COMPULSIVOS
   ------------------------------------------------------------------------- */
const SPENDING_TIPS = [
  {
    titulo: "Regra das 24 horas",
    texto:
      "Antes de qualquer compra não planejada, espere 24 horas. Boa parte do desejo de compra por impulso desaparece depois desse período.",
  },
  {
    titulo: "Lista de espera de desejos",
    texto:
      "Em vez de comprar na hora, adicione o item à sua 'lista de espera' (disponível na aba Carteira). Só compre se, depois de 7 dias, ainda fizer sentido.",
  },
  {
    titulo: "Regra 50-30-20",
    texto:
      "Separe sua renda em 50% necessidades, 30% desejos e 20% investimentos ou dívidas. É um ponto de partida simples para organizar o orçamento.",
  },
  {
    titulo: "Delete o cartão salvo",
    texto:
      "Remova cartões salvos em apps de compras. O pequeno atrito de digitar os dados novamente já reduz compras por impulso.",
  },
  {
    titulo: "Identifique seus gatilhos",
    texto:
      "Compras compulsivas costumam ter gatilhos emocionais (estresse, tédio, tristeza). Anote o que você sentia antes de cada compra por impulso registrada na Carteira.",
  },
  {
    titulo: "Defina um limite mensal por categoria",
    texto:
      "Use os orçamentos por categoria na aba Carteira. Ver a barra de progresso perto do limite ajuda a frear antes de ultrapassar.",
  },
  {
    titulo: "Automatize o investimento, não o gasto",
    texto:
      "Configure para que uma parte do salário vá automaticamente para investimentos no dia do pagamento, antes que o dinheiro 'sobre' para gastos.",
  },
];

/* -------------------------------------------------------------------------
   5) SÉRIES DO BANCO CENTRAL (SGS) usadas nos indicadores em tempo real
   ------------------------------------------------------------------------- */
const BCB_SERIES = [
  { codigo: 432, nome: "Selic (meta) % a.a." },
  { codigo: 4390, nome: "CDI mensal %" },
  { codigo: 433, nome: "IPCA mensal %" },
  { codigo: 1, nome: "Dólar comercial (venda)" },
];

/* -------------------------------------------------------------------------
   6) TABELA DE IR REGRESSIVO — RENDA FIXA (CDB, Tesouro, fundos de RF)
   Usada no comparador de tributação (aba Avançado).
   ------------------------------------------------------------------------- */
const RF_TAX_TABLE = [
  { ateDias: 180, aliquota: 0.225, label: "até 180 dias" },
  { ateDias: 360, aliquota: 0.20, label: "de 181 a 360 dias" },
  { ateDias: 720, aliquota: 0.175, label: "de 361 a 720 dias" },
  { ateDias: Infinity, aliquota: 0.15, label: "acima de 720 dias" },
];

function irAliquotaPorPrazo(dias) {
  return RF_TAX_TABLE.find((faixa) => dias <= faixa.ateDias) || RF_TAX_TABLE[RF_TAX_TABLE.length - 1];
}

/* -------------------------------------------------------------------------
   7) CARTEIRAS-MODELO POR PERFIL DE RISCO
   Alocação sugerida (%) por classe de ativo — referência educativa para
   comparação com a carteira real do usuário (aba Carteira > Carteira de
   Investimentos e aba Avançado > Carteiras Modelo). Não é recomendação
   de investimento personalizada.
   ------------------------------------------------------------------------- */
const ASSET_CLASSES = [
  "Caixa/Reserva",
  "Renda Fixa Pós-fixada",
  "Renda Fixa IPCA+/Prefixada",
  "FIIs",
  "Ações Brasil",
  "Ações/ETFs Internacionais",
  "Criptomoedas",
];

const ASSET_CLASS_COLORS = {
  "Caixa/Reserva": "#3B6E8F",
  "Renda Fixa Pós-fixada": "#4FAE4A",
  "Renda Fixa IPCA+/Prefixada": "#2F8A2B",
  FIIs: "#E8A33D",
  "Ações Brasil": "#6C4FCF",
  "Ações/ETFs Internacionais": "#8A70E0",
  Criptomoedas: "#B5459A",
};

const MODEL_PORTFOLIOS = [
  {
    id: "conservador",
    nome: "Conservador",
    emoji: "🛡️",
    descricao: "Prioriza segurança e previsibilidade. Foco em preservar capital e superar a inflação com baixa oscilação.",
    alocacao: {
      "Caixa/Reserva": 15,
      "Renda Fixa Pós-fixada": 55,
      "Renda Fixa IPCA+/Prefixada": 20,
      FIIs: 5,
      "Ações Brasil": 3,
      "Ações/ETFs Internacionais": 2,
      Criptomoedas: 0,
    },
  },
  {
    id: "moderado",
    nome: "Moderado",
    emoji: "⚖️",
    descricao: "Equilíbrio entre segurança e crescimento. Aceita alguma oscilação em troca de mais retorno no longo prazo.",
    alocacao: {
      "Caixa/Reserva": 10,
      "Renda Fixa Pós-fixada": 30,
      "Renda Fixa IPCA+/Prefixada": 25,
      FIIs: 15,
      "Ações Brasil": 12,
      "Ações/ETFs Internacionais": 6,
      Criptomoedas: 2,
    },
  },
  {
    id: "arrojado",
    nome: "Arrojado",
    emoji: "📈",
    descricao: "Foco em crescimento de patrimônio no longo prazo, tolerando oscilações relevantes no caminho.",
    alocacao: {
      "Caixa/Reserva": 5,
      "Renda Fixa Pós-fixada": 15,
      "Renda Fixa IPCA+/Prefixada": 15,
      FIIs: 15,
      "Ações Brasil": 25,
      "Ações/ETFs Internacionais": 15,
      Criptomoedas: 10,
    },
  },
  {
    id: "agressivo",
    nome: "Agressivo",
    emoji: "🚀",
    descricao: "Máxima exposição a risco em busca de retorno, para investidores experientes com horizonte muito longo.",
    alocacao: {
      "Caixa/Reserva": 5,
      "Renda Fixa Pós-fixada": 5,
      "Renda Fixa IPCA+/Prefixada": 10,
      FIIs: 10,
      "Ações Brasil": 30,
      "Ações/ETFs Internacionais": 25,
      Criptomoedas: 15,
    },
  },
];

/* Mapeia a tag da resposta sobre reação a quedas (onboarding, q4) para um
   perfil de risco compatível com as carteiras-modelo acima. */
const RISK_PROFILE_FROM_REACTION = {
  ansioso: "conservador",
  cauteloso: "moderado",
  estrategico: "arrojado",
  oportunista: "agressivo",
};

function riskProfileFromUserProfile(profile) {
  if (!profile) return "moderado";
  const q4 = (profile.respostas || []).find((r) => r.questionId === "q4");
  return (q4 && RISK_PROFILE_FROM_REACTION[q4.tag]) || "moderado";
}

/* -------------------------------------------------------------------------
   8) DICIONÁRIO DO MERCADO — glossário de termos, do básico ao avançado
   ------------------------------------------------------------------------- */
const GLOSSARY = [
  { termo: "Selic", nivel: "iniciante", definicao: "Taxa básica de juros da economia brasileira, definida pelo Copom (Banco Central). Serve de referência para praticamente toda a renda fixa do país." },
  { termo: "CDI", nivel: "iniciante", definicao: "Certificado de Depósito Interbancário — taxa de empréstimos entre bancos no curtíssimo prazo, usada como referência de rentabilidade (acompanha a Selic de perto)." },
  { termo: "IPCA", nivel: "iniciante", definicao: "Índice de Preços ao Consumidor Amplo — o indicador oficial de inflação do Brasil, usado como referência em títulos 'IPCA+'." },
  { termo: "Liquidez", nivel: "iniciante", definicao: "Velocidade com que um investimento pode ser convertido em dinheiro disponível, sem perda relevante de valor." },
  { termo: "FGC", nivel: "iniciante", definicao: "Fundo Garantidor de Créditos — protege depósitos e investimentos (poupança, CDB, LCI, LCA) até R$ 250.000 por CPF e por instituição, em caso de quebra do banco." },
  { termo: "Diversificação", nivel: "iniciante", definicao: "Distribuir os investimentos entre diferentes ativos e classes para reduzir o impacto de uma perda isolada — 'não colocar todos os ovos na mesma cesta'." },
  { termo: "Taxa de administração", nivel: "iniciante", definicao: "Percentual anual cobrado por fundos de investimento para cobrir os custos de gestão, independente do resultado do fundo." },
  { termo: "Marcação a mercado", nivel: "intermediario", definicao: "Atualização diária do preço de um título conforme as taxas de juros vigentes. Faz com que títulos prefixados e IPCA+ oscilem de preço antes do vencimento." },
  { termo: "Come-cotas", nivel: "intermediario", definicao: "Antecipação semestral (maio e novembro) do Imposto de Renda sobre fundos de renda fixa e multimercado, cobrada automaticamente mesmo sem resgate." },
  { termo: "Rebalanceamento", nivel: "intermediario", definicao: "Ajuste periódico dos pesos de cada ativo na carteira para voltar à alocação-alvo definida na estratégia, vendendo parte do que subiu e comprando o que ficou abaixo da meta." },
  { termo: "P/L (Preço/Lucro)", nivel: "intermediario", definicao: "Quantos anos de lucro atual da empresa seriam necessários para 'pagar' o preço da ação. Um dos indicadores mais usados na análise fundamentalista." },
  { termo: "P/VP (Preço/Valor Patrimonial)", nivel: "intermediario", definicao: "Compara o preço de mercado da ação com o valor patrimonial contábil por ação. P/VP menor que 1 pode indicar desconto — ou um problema a ser investigado." },
  { termo: "ROE", nivel: "intermediario", definicao: "Retorno sobre o Patrimônio Líquido — mede a eficiência da empresa em gerar lucro a partir do capital próprio dos sócios." },
  { termo: "Dividend Yield", nivel: "intermediario", definicao: "Percentual de dividendos/rendimentos pagos por uma ação ou FII em relação ao seu preço, em um período (geralmente 12 meses)." },
  { termo: "BDR", nivel: "intermediario", definicao: "Brazilian Depositary Receipt — certificado negociado na B3 que representa ações de empresas estrangeiras, permitindo investir no exterior sem sair do Brasil." },
  { termo: "ETF", nivel: "intermediario", definicao: "Fundo negociado em bolsa (Exchange Traded Fund) que busca replicar um índice (ex.: Ibovespa, S&P 500), com boa diversificação e baixo custo em geral." },
  { termo: "PGBL", nivel: "intermediario", definicao: "Plano de previdência que permite deduzir as contribuições (até 12% da renda bruta anual) do Imposto de Renda para quem declara no modelo completo." },
  { termo: "VGBL", nivel: "intermediario", definicao: "Plano de previdência sem dedução no IR, mas que tributa apenas os rendimentos (não o valor total) no momento do resgate." },
  { termo: "Risco de crédito", nivel: "intermediario", definicao: "Risco de o emissor de um título (banco, empresa, governo) não conseguir honrar o pagamento — quanto maior o risco percebido, maior o retorno exigido pelo investidor." },
  { termo: "Volatilidade", nivel: "intermediario", definicao: "Medida estatística da intensidade das oscilações de preço de um ativo em determinado período. Maior volatilidade geralmente significa maior risco de curto prazo." },
  { termo: "Duration", nivel: "avancado", definicao: "Medida de sensibilidade do preço de um título de renda fixa a variações nas taxas de juros. Quanto maior a duration, maior a oscilação de preço para uma mesma variação de juros." },
  { termo: "Yield to Maturity (YTM)", nivel: "avancado", definicao: "Taxa de retorno total esperada de um título de renda fixa caso seja mantido até o vencimento, considerando seu preço atual e fluxos futuros." },
  { termo: "Spread de crédito", nivel: "avancado", definicao: "Diferença entre a taxa de um título com risco de crédito (ex.: debênture) e a taxa de um título livre de risco (ex.: Tesouro) de prazo semelhante — mede o 'prêmio' cobrado pelo risco." },
  { termo: "Curva de juros", nivel: "avancado", definicao: "Representação das taxas de juros futuras esperadas pelo mercado (DI futuro) para diferentes prazos. Reflete expectativas de inflação, Selic e risco fiscal." },
  { termo: "Beta", nivel: "avancado", definicao: "Mede a sensibilidade do retorno de um ativo em relação ao mercado como um todo. Beta > 1 indica maior volatilidade que o mercado; Beta < 1, menor." },
  { termo: "Alfa", nivel: "avancado", definicao: "Retorno de um investimento acima (ou abaixo) do que seria esperado dado o risco assumido (Beta) — usado para medir a capacidade de um gestor ou estratégia de 'bater o mercado'." },
  { termo: "Índice de Sharpe", nivel: "avancado", definicao: "Mede o retorno obtido por unidade de risco (volatilidade), acima da taxa livre de risco. Quanto maior, melhor a relação risco-retorno de um investimento." },
  { termo: "Drawdown", nivel: "avancado", definicao: "Queda percentual entre o pico e o menor ponto seguinte do valor de um investimento — mede o 'estrago máximo' que um investidor teria sofrido em determinado período." },
  { termo: "Value at Risk (VaR)", nivel: "avancado", definicao: "Estimativa estatística da perda máxima esperada de uma carteira, para um determinado horizonte de tempo e nível de confiança (ex.: 95%)." },
  { termo: "Correlação", nivel: "avancado", definicao: "Medida de quanto dois ativos se movem juntos (de -1 a +1). Diversificação eficiente busca ativos com correlação baixa ou negativa entre si." },
  { termo: "EV/EBITDA", nivel: "avancado", definicao: "Compara o valor da empresa incluindo dívida (Enterprise Value) com sua geração de caixa operacional (EBITDA), permitindo comparar empresas com estruturas de capital diferentes." },
  { termo: "Hedge", nivel: "avancado", definicao: "Estratégia (geralmente com derivativos, como opções e futuros) usada para reduzir ou neutralizar o risco de uma posição já existente." },
  { termo: "Derivativo", nivel: "avancado", definicao: "Instrumento financeiro cujo valor deriva de um ativo subjacente (ação, moeda, juros, commodity) — usado para especulação, hedge ou arbitragem." },
  { termo: "Opção (call/put)", nivel: "avancado", definicao: "Contrato que dá o direito (não a obrigação) de comprar (call) ou vender (put) um ativo por um preço definido até uma data futura, mediante o pagamento de um prêmio." },
  { termo: "Holding patrimonial", nivel: "avancado", definicao: "Empresa criada para centralizar a gestão de bens (imóveis, participações) de uma família, usada principalmente para planejamento sucessório e, em alguns casos, eficiência tributária." },
  { termo: "Efeito manada", nivel: "avancado", definicao: "Viés comportamental em que investidores seguem as decisões da maioria sem análise própria, comprando na euforia e vendendo no pânico — geralmente destrutivo para o retorno de longo prazo." },
  { termo: "Aversão à perda", nivel: "avancado", definicao: "Viés comportamental em que a dor de perder é sentida com mais intensidade do que o prazer de ganhar o equivalente, levando a decisões irracionais como vender ativos no fundo de uma queda." },
  { termo: "Regra dos 4%", nivel: "avancado", definicao: "Referência de planejamento de independência financeira que estima ser possível retirar cerca de 4% do patrimônio investido por ano, ajustado pela inflação, com baixo risco de esgotar o capital em décadas." },
  { termo: "FIRE (Financial Independence, Retire Early)", nivel: "avancado", definicao: "Movimento/estratégia focada em atingir independência financeira o mais rápido possível por meio de alta taxa de poupança e investimento consistente, permitindo parar de depender de um salário." },
];

/* -------------------------------------------------------------------------
   9) NÍVEIS NOMEADOS DO JOGADOR (baseados em XP acumulado)
   Cada faixa também define o "acessório" visual do POLVIn, mostrado como
   selo ao lado do mascote conforme o usuário evolui.
   ------------------------------------------------------------------------- */
const PLAYER_LEVEL_TITLES = [
  { min: 1, titulo: "Iniciante", emoji: "🌱" },
  { min: 5, titulo: "Aprendiz Financeiro", emoji: "📘" },
  { min: 10, titulo: "Planejador", emoji: "🗂️" },
  { min: 20, titulo: "Investidor", emoji: "📈" },
  { min: 35, titulo: "Construtor de Patrimônio", emoji: "🏗️" },
  { min: 50, titulo: "Mestre Fin+", emoji: "👑" },
];

function playerLevelTitle(level) {
  let atual = PLAYER_LEVEL_TITLES[0];
  for (const tier of PLAYER_LEVEL_TITLES) {
    if (level >= tier.min) atual = tier;
  }
  return atual;
}

/* -------------------------------------------------------------------------
   10) ONBOARDING ESTENDIDO — "Sobre você" (idade, situação, renda, objetivo)
   Coletado antes do diagnóstico de perfil de risco já existente. Usado
   para personalizar a saudação e sugerir o primeiro cofrinho (meta).
   ------------------------------------------------------------------------- */
const WORK_SITUATIONS = ["Estudante", "Empregado(a) CLT", "Autônomo(a) / PJ", "Empresário(a)", "Aposentado(a)", "Sem trabalho no momento"];

const INCOME_RANGES = ["Até R$ 1.500", "R$ 1.501 a R$ 3.000", "R$ 3.001 a R$ 6.000", "R$ 6.001 a R$ 12.000", "Acima de R$ 12.000"];

const LIFE_GOALS = [
  { id: "carro", emoji: "💰", label: "Comprar um carro" },
  { id: "casa", emoji: "🏠", label: "Comprar uma casa" },
  { id: "viajar", emoji: "✈️", label: "Viajar" },
  { id: "investir", emoji: "📈", label: "Investir" },
  { id: "dividas", emoji: "💳", label: "Sair das dívidas" },
  { id: "reserva", emoji: "🚨", label: "Criar reserva de emergência" },
  { id: "renda", emoji: "💼", label: "Viver de renda" },
];

/* Modelo de cofrinho sugerido automaticamente a partir do objetivo escolhido. */
const GOAL_TEMPLATES = {
  carro: { nome: "Meu carro novo", emoji: "🚗", metaSugerida: 30000 },
  casa: { nome: "Entrada da casa", emoji: "🏠", metaSugerida: 50000 },
  viajar: { nome: "Viagem dos sonhos", emoji: "✈️", metaSugerida: 6000 },
  investir: { nome: "Primeiro aporte", emoji: "📈", metaSugerida: 1000 },
  dividas: { nome: "Fundo para quitar dívidas", emoji: "💳", metaSugerida: 3000 },
  reserva: { nome: "Reserva de emergência", emoji: "🚨", metaSugerida: 10000 },
  renda: { nome: "Carteira de renda passiva", emoji: "💼", metaSugerida: 100000 },
};

/* -------------------------------------------------------------------------
   11) DESAFIOS DIÁRIOS E MISSÕES SEMANAIS
   "tipo: auto" é detectado automaticamente pelo app; "tipo: manual" depende
   do usuário marcar como concluído (autodeclarado, sem verificação).
   ------------------------------------------------------------------------- */
const DAILY_CHALLENGES = [
  { id: "log_expense", titulo: "Registre 1 transação", descricao: "Adicione uma entrada ou saída na sua Carteira hoje.", xp: 10, tipo: "auto" },
  { id: "complete_lesson", titulo: "Complete 1 lição", descricao: "Termine uma lição na Academia Fin+ hoje.", xp: 15, tipo: "auto" },
  { id: "save_goal", titulo: "Guarde um valor em um cofrinho", descricao: "Faça um aporte, mesmo pequeno, em uma das suas metas.", xp: 10, tipo: "auto" },
  { id: "no_impulse", titulo: "Não registre gasto por impulso hoje", descricao: "Passe o dia sem lançar nenhuma compra por impulso na Carteira.", xp: 15, tipo: "manual" },
  { id: "review_wishlist", titulo: "Revise sua lista de espera de desejos", descricao: "Abra a lista de espera na Carteira e decida sobre algum item.", xp: 10, tipo: "manual" },
  { id: "check_market", titulo: "Confira os indicadores do mercado", descricao: "Dê uma olhada na aba Mercado hoje.", xp: 5, tipo: "manual" },
  { id: "check_glossary", titulo: "Aprenda 1 termo novo", descricao: "Abra o Dicionário do Mercado na aba Avançado e leia um termo que não conhece.", xp: 5, tipo: "manual" },
];

const WEEKLY_MISSIONS = [
  { id: "week_lessons_3", titulo: "Complete 3 lições esta semana", descricao: "Avance na Academia Fin+.", xp: 40, meta: 3 },
  { id: "week_save_100", titulo: "Guarde R$ 100 em cofrinhos esta semana", descricao: "Some aportes em qualquer meta.", xp: 40, meta: 100 },
  { id: "week_log_5tx", titulo: "Registre 5 transações esta semana", descricao: "Mantenha sua Carteira atualizada.", xp: 30, meta: 5 },
];

/* -------------------------------------------------------------------------
   12) EVENTOS ALEATÓRIOS — cenários educativos com escolha, 1 por dia
   ------------------------------------------------------------------------- */
const RANDOM_EVENTS = [
  {
    id: "carro_quebrou",
    titulo: "🚗 Seu carro quebrou e o conserto custa R$ 1.200",
    situacao: "Você precisa pagar o conserto ainda essa semana. O que você faz?",
    opcoes: [
      { texto: "Pago com a reserva de emergência", ideal: true, xp: 20, feedback: "Ótimo! É exatamente para isso que a reserva existe — cobrir imprevistos sem entrar em uma dívida cara." },
      { texto: "Parcelo no cartão de crédito", ideal: false, xp: 5, feedback: "Funciona, mas o cartão cobra juros altos se a fatura não for paga inteira — um imprevisto pode virar uma dívida cara." },
      { texto: "Peço um empréstimo de crédito rápido", ideal: false, xp: 0, feedback: "Essa costuma ser a opção mais cara de todas. A ordem ideal é: reserva de emergência > empréstimo formal e barato > crédito emergencial como último recurso." },
    ],
  },
  {
    id: "perdeu_emprego",
    titulo: "💼 Você perdeu o emprego de forma inesperada",
    situacao: "Quanto tempo sua reserva de emergência sustentaria seus gastos essenciais?",
    opcoes: [
      { texto: "Minha reserva cobre de 3 a 6 meses de despesas", ideal: true, xp: 20, feedback: "Esse é o colchão recomendado para atravessar uma busca por recolocação sem desespero financeiro." },
      { texto: "Minha reserva cobre menos de 1 mês", ideal: false, xp: 10, feedback: "Sinal de alerta real: priorizar a reserva de emergência antes de qualquer investimento de risco é o passo mais importante agora." },
      { texto: "Não tenho nenhuma reserva formada", ideal: false, xp: 5, feedback: "Está no momento certo de começar: mesmo pequenos aportes em Tesouro Selic ou CDB com liquidez diária já criam esse colchão com o tempo." },
    ],
  },
  {
    id: "bonus_inesperado",
    titulo: "🎁 Você recebeu um bônus inesperado de R$ 2.000",
    situacao: "O que fazer com o dinheiro?",
    opcoes: [
      { texto: "Divido entre reserva/investimentos e uma recompensa pequena para mim", ideal: true, xp: 20, feedback: "Equilíbrio é a chave: parte constrói patrimônio, parte celebra a conquista sem culpa." },
      { texto: "Gasto tudo em compras não planejadas", ideal: false, xp: 5, feedback: "Sem julgamento, mas dinheiro extra é uma ótima oportunidade de acelerar uma meta — considere guardar pelo menos uma parte." },
      { texto: "Guardo 100% e não gasto nada", ideal: false, xp: 10, feedback: "Também é válido financeiramente, mas o dinheiro também tem a função de trazer qualidade de vida — pequenas recompensas ajudam a manter a motivação no longo prazo." },
    ],
  },
  {
    id: "acao_caiu",
    titulo: "📉 Uma ação da sua carteira caiu 15% em um dia",
    situacao: "Como você reage?",
    opcoes: [
      { texto: "Revejo os fundamentos da empresa antes de qualquer decisão", ideal: true, xp: 20, feedback: "Essa é a resposta de quem investe com estratégia: o preço caiu, mas o que mudou nos fundamentos da empresa? A decisão vem daí, não do medo." },
      { texto: "Vendo tudo imediatamente por medo de perder mais", ideal: false, xp: 5, feedback: "Vender no pânico realiza a perda — é um dos comportamentos mais estudados (e mais caros) em finanças comportamentais." },
      { texto: "Compro mais sem analisar nada, só porque caiu", ideal: false, xp: 8, feedback: "Comprar na baixa pode ser ótimo, mas sem entender o motivo da queda também é uma aposta às escuras." },
    ],
  },
  {
    id: "investimento_milagroso",
    titulo: "📱 Alguém te oferece um investimento que 'dobra o dinheiro em 30 dias'",
    situacao: "O que você faz?",
    opcoes: [
      { texto: "Não investir — retorno garantido e muito acima do mercado é sinal clássico de fraude", ideal: true, xp: 20, feedback: "Correto. Nenhum investimento legítimo garante retornos assim. Essa é a lição mais cara de aprender na prática — melhor aprender na teoria." },
      { texto: "Investir um valor pequeno só para testar", ideal: false, xp: 5, feedback: "Mesmo um valor pequeno em uma fraude comprovada é dinheiro perdido — esse tipo de esquema também costuma roubar dados pessoais." },
      { texto: "Investir tudo que tenho, a oportunidade parece boa demais para perder", ideal: false, xp: 0, feedback: "Esse é exatamente o padrão de esquemas de pirâmide/Ponzi: retorno absurdo e pressão para decidir rápido." },
    ],
  },
];

/* -------------------------------------------------------------------------
   13) CONQUISTAS — desbloqueadas conforme o uso real do app
   A lógica de verificação vive em js/achievements.js; aqui só a descrição.
   ------------------------------------------------------------------------- */
const ACHIEVEMENTS = [
  { id: "primeira_meta", emoji: "🥇", titulo: "Primeira meta criada", descricao: "Você criou seu primeiro cofrinho." },
  { id: "meta_concluida", emoji: "🎉", titulo: "Primeira meta concluída", descricao: "Você completou um cofrinho até o valor da meta." },
  { id: "primeiro_investimento", emoji: "📦", titulo: "Primeiro investimento registrado", descricao: "Você registrou sua primeira posição na Carteira de Investimentos." },
  { id: "primeira_acao", emoji: "📈", titulo: "Primeira ação/FII comprado", descricao: "Você registrou sua primeira compra na aba Ações & FIIs." },
  { id: "primeiro_dividendo", emoji: "💵", titulo: "Primeiro dividendo registrado", descricao: "Você registrou o recebimento do seu primeiro dividendo/rendimento." },
  { id: "streak_7", emoji: "🔥", titulo: "7 dias de ofensiva", descricao: "Você usou o Fin+ por 7 dias seguidos." },
  { id: "streak_30", emoji: "🔥", titulo: "30 dias de ofensiva", descricao: "Você usou o Fin+ por 30 dias seguidos." },
  { id: "streak_100", emoji: "🔥", titulo: "100 dias de ofensiva", descricao: "Você usou o Fin+ por 100 dias seguidos." },
  { id: "reserva_formada", emoji: "🚨", titulo: "Reserva de emergência formada", descricao: "Você registrou pelo menos R$ 1.000 em Caixa/Reserva na Carteira de Investimentos." },
  { id: "nivel1_completo", emoji: "✅", titulo: "Fundamentos concluídos", descricao: "Você completou todas as lições do Nível 1 da Academia Fin+." },
  { id: "trilha_completa", emoji: "🏆", titulo: "Trilha completa", descricao: "Você completou todas as lições da Academia Fin+." },
  { id: "primeiro_desafio", emoji: "🎯", titulo: "Primeiro desafio concluído", descricao: "Você completou seu primeiro desafio diário." },
  { id: "leitor", emoji: "📚", titulo: "Primeira leitura", descricao: "Você conferiu sua primeira recomendação na Biblioteca Fin+." },
  { id: "primeiro_conto", emoji: "📜", titulo: "Primeiro conto lido", descricao: "Você completou sua primeira lição da trilha Brasil: História & Economia." },
  { id: "historiador", emoji: "🇧🇷", titulo: "Historiador econômico", descricao: "Você completou toda a trilha Brasil: História & Economia." },
  { id: "primeira_compra_parcelada", emoji: "🧾", titulo: "Primeira compra parcelada", descricao: "Você registrou sua primeira compra parcelada na Carteira." },
];

/* -------------------------------------------------------------------------
   14) BIBLIOTECA FIN+ — recomendações reais de livros, do zero ao avançado
   ------------------------------------------------------------------------- */
const BOOKS = [
  { id: "babilonia", titulo: "O Homem Mais Rico da Babilônia", autor: "George S. Clason", nivel: "iniciante", tema: "Hábitos financeiros", pitch: "Parábolas atemporais sobre poupar, viver com menos do que se ganha e fazer o dinheiro trabalhar para você." },
  { id: "pairico", titulo: "Pai Rico, Pai Pobre", autor: "Robert T. Kiyosaki", nivel: "iniciante", tema: "Mentalidade financeira", pitch: "A diferença entre comprar ativos (que geram renda) e passivos (que geram despesa), explicada de forma simples." },
  { id: "penseenriqueca", titulo: "Pense e Enriqueça", autor: "Napoleon Hill", nivel: "iniciante", tema: "Mentalidade e disciplina", pitch: "Um clássico sobre objetivos claros, disciplina e persistência aplicados também às finanças pessoais." },
  { id: "mentemilionaria", titulo: "Os Segredos da Mente Milionária", autor: "T. Harv Eker", nivel: "iniciante", tema: "Comportamento com dinheiro", pitch: "Como crenças aprendidas na infância moldam — e muitas vezes sabotam — a relação de cada pessoa com o dinheiro." },
  { id: "mepoupe", titulo: "Me Poupe!", autor: "Nathalia Arcuri", nivel: "iniciante", tema: "Controle de gastos", pitch: "Guia direto ao ponto para organizar o orçamento e sair do vermelho, com linguagem bem acessível." },
  { id: "casaisinteligentes", titulo: "Casais Inteligentes Enriquecem Juntos", autor: "Gustavo Cerbasi", nivel: "iniciante", tema: "Planejamento familiar", pitch: "Como alinhar objetivos financeiros a dois (ou em família) sem transformar dinheiro em motivo de conflito." },
  { id: "domilaomilhao", titulo: "Do Mil ao Milhão", autor: "Thiago Nigro", nivel: "intermediario", tema: "Primeiros investimentos", pitch: "Passo a passo, no contexto brasileiro, para sair do zero e montar os primeiros investimentos com consistência." },
  { id: "umpassoadiante", titulo: "Um Passo Adiante em Wall Street", autor: "Peter Lynch", nivel: "intermediario", tema: "Ações no dia a dia", pitch: "Como usar observações do cotidiano para identificar empresas promissoras antes que o mercado perceba." },
  { id: "psicologiafinanceira", titulo: "A Psicologia Financeira", autor: "Morgan Housel", nivel: "intermediario", tema: "Comportamento e decisões", pitch: "Por que boas decisões financeiras dependem muito mais de comportamento do que de fórmulas matemáticas." },
  { id: "investidorinteligente", titulo: "O Investidor Inteligente", autor: "Benjamin Graham", nivel: "avancado", tema: "Value investing", pitch: "A base da análise fundamentalista moderna, escrito pelo mentor de Warren Buffett." },
  { id: "acoescomuns", titulo: "Ações Comuns, Lucros Extraordinários", autor: "Philip Fisher", nivel: "avancado", tema: "Análise de crescimento", pitch: "Como avaliar a qualidade e o potencial de crescimento de uma empresa além dos números do balanço." },
  { id: "pequenolivro", titulo: "O Pequeno Livro Que Ainda Bate o Mercado", autor: "Joel Greenblatt", nivel: "avancado", tema: "Estratégia sistemática", pitch: "Uma metodologia simples e sistemática para selecionar ações com bom potencial de retorno no longo prazo." },
  { id: "boladeneve", titulo: "A Bola de Neve: Warren Buffett e o Negócio da Vida", autor: "Alice Schroeder", nivel: "avancado", tema: "Biografia e estratégia", pitch: "A biografia definitiva de Warren Buffett, mostrando décadas de decisões reais de alocação de capital." },

  // Economia pública, distribuição de renda e pensamento econômico crítico —
  // para complementar a visão de mercado com a compreensão do papel do
  // Estado, da desigualdade e de correntes de pensamento além do liberalismo.
  { id: "formacaoeconomica", titulo: "Formação Econômica do Brasil", autor: "Celso Furtado", nivel: "avancado", tema: "Economia e história do Brasil", pitch: "O clássico que explica como a economia colonial exportadora moldou a desigualdade e a dependência externa do Brasil até hoje." },
  { id: "dependenciaedesenvolvimento", titulo: "Dependência e Desenvolvimento na América Latina", autor: "Fernando Henrique Cardoso e Enzo Faletto", nivel: "avancado", tema: "Teoria da dependência", pitch: "Um dos textos fundadores da teoria da dependência, sobre por que países latino-americanos permaneceram economicamente dependentes dos países ricos." },
  { id: "ocapital", titulo: "O Capital", autor: "Karl Marx", nivel: "avancado", tema: "Crítica ao capitalismo", pitch: "A obra fundamental do pensamento socialista, com a crítica de Marx à exploração do trabalho e à concentração de capital no sistema capitalista." },
  { id: "precodesigualdade", titulo: "O Preço da Desigualdade", autor: "Joseph Stiglitz", nivel: "avancado", tema: "Desigualdade e distribuição de renda", pitch: "O Nobel de Economia mostra, com dados, como a desigualdade extrema prejudica o crescimento econômico de um país como um todo — não só os mais pobres." },
  { id: "capitalseculoxxi", titulo: "O Capital no Século XXI", autor: "Thomas Piketty", nivel: "avancado", tema: "Desigualdade e distribuição de renda", pitch: "Um estudo histórico sobre como a riqueza se concentra ao longo do tempo e por que a tributação progressiva é debatida como ferramenta de redistribuição." },
];

/* -------------------------------------------------------------------------
   15) CRIPTOMOEDAS SUPORTADAS COM COTAÇÃO AUTOMÁTICA (fração via CoinGecko)
   Usado na aba Ações & FIIs: ao comprar por valor em R$, o sistema busca o
   preço atual e calcula a quantidade fracionária automaticamente.
   ------------------------------------------------------------------------- */
const CRYPTO_IDS = {
  BTC: { id: "bitcoin", nome: "Bitcoin (BTC)" },
  ETH: { id: "ethereum", nome: "Ethereum (ETH)" },
  SOL: { id: "solana", nome: "Solana (SOL)" },
  ADA: { id: "cardano", nome: "Cardano (ADA)" },
};

/* -------------------------------------------------------------------------
   16) TRILHA "BRASIL: HISTÓRIA & ECONOMIA" — pequenos contos + quiz
   Uma segunda trilha gamificada (sub-aba de Aprender), contando a história
   das moedas, dos ciclos econômicos, da desigualdade e do papel do Estado
   no Brasil, através de pequenas histórias antes de cada quiz. Todo o
   conteúdo é histórico/educativo, apresentado de forma factual e sem
   viés partidário — inclusive nos temas de distribuição de renda e do
   papel do setor público, tratados como debates econômicos legítimos.
   ------------------------------------------------------------------------- */
const HISTORY_COURSE = [
  {
    id: "hnivel1",
    titulo: "Colônia: ciclos econômicos e as primeiras moedas",
    cor: "#2E7D32",
    licoes: [
      {
        id: "h1_1",
        titulo: "Do pau-brasil ao açúcar: a primeira economia exportadora",
        xp: 25,
        conto: [
          "Antes de existir 'Brasil' como país, já existia uma lógica econômica: extrair uma riqueza natural e vender para a Europa. Primeiro foi o pau-brasil, madeira usada para tingir tecidos, que deu nome ao território. Depois vieram os engenhos de açúcar, no litoral do Nordeste, que transformaram a colônia na maior produtora mundial de açúcar do século XVI.",
          "Esse modelo tinha um nome que os economistas usam até hoje: economia primário-exportadora — produzir matéria-prima barata para vender fora, em vez de fabricar produtos mais elaborados dentro do próprio território. Esse modelo raramente enriquece quem produz: enriquece principalmente quem compra e revende o produto já processado.",
          "A mão de obra que sustentou os engenhos foi, por séculos, o trabalho escravizado de povos indígenas e, principalmente, de pessoas sequestradas do continente africano. Entender essa origem é entender por que a distribuição de renda e de terras no Brasil nasceu profundamente desigual — uma desigualdade que a economia brasileira ainda carrega hoje, séculos depois.",
        ],
        perguntas: [
          {
            pergunta: "O que caracteriza uma 'economia primário-exportadora'?",
            opcoes: ["Produzir matéria-prima para vender sem processamento, em vez de fabricar produtos elaborados", "Importar apenas produtos de luxo", "Uma economia sem nenhum tipo de comércio", "Um sistema baseado exclusivamente em criptomoedas"],
            correta: 0,
            explicacao: "É o modelo baseado em exportar matéria-prima barata (açúcar, ouro, café) sem agregar muito valor a ela — um padrão que marcou boa parte da história econômica brasileira.",
          },
          {
            pergunta: "Qual foi a principal base de mão de obra da economia açucareira colonial?",
            opcoes: ["Trabalho assalariado livre", "Trabalho escravizado de povos indígenas e, principalmente, de africanos", "Robôs e máquinas importadas", "Voluntários europeus"],
            correta: 1,
            explicacao: "A escravidão foi o alicerce da produção açucareira e, depois, de boa parte da economia colonial — um fator central para entender as raízes da desigualdade brasileira.",
          },
          {
            pergunta: "Por que uma economia baseada só em exportar matéria-prima tende a concentrar menos riqueza para quem produz?",
            opcoes: ["Porque matéria-prima nunca tem valor", "Porque o maior valor agregado costuma ficar com quem processa e revende o produto final", "Porque é proibido vender matéria-prima", "Não existe essa relação"],
            correta: 1,
            explicacao: "Quem só extrai e vende a matéria-prima bruta perde a parte mais valiosa da cadeia econômica: a industrialização e a distribuição, geralmente feitas por quem compra.",
          },
        ],
      },
      {
        id: "h1_2",
        titulo: "O ciclo do ouro e a moeda em Réis",
        xp: 25,
        conto: [
          "No fim do século XVII, garimpeiros encontraram ouro nas montanhas de Minas Gerais. Em poucas décadas, o interior do Brasil — até então quase esquecido pela Coroa portuguesa — se tornou o centro econômico da colônia. Vilas cresceram da noite para o dia, e Portugal criou um imposto pesado, o 'quinto', para garantir que 20% de todo o ouro extraído fosse enviado à metrópole.",
          "A moeda usada durante todo esse período — do Brasil Colônia ao Império — era o Réis (a unidade era o 'Real', no plural 'Réis'). Como a inflação corroía o valor da moeda com o tempo, era comum usar a abreviação 'mil-réis' para representar 1.000 réis — mostrando que, mesmo há séculos, o Brasil já lidava com moeda perdendo valor.",
          "Quando o ouro começou a se esgotar, no final do século XVIII, a economia mineira entrou em declínio, e o centro econômico do país foi se deslocando de novo, dessa vez para o café, no Sudeste. Esse padrão de 'boom e queda' de um único produto, sem diversificar a economia, se repetiria várias vezes na história brasileira.",
        ],
        perguntas: [
          {
            pergunta: "Qual era a moeda usada no Brasil Colônia e no Império?",
            opcoes: ["O Real (atual)", "O Réis / Mil-réis", "O Cruzeiro", "O Dólar colonial"],
            correta: 1,
            explicacao: "O Réis (e sua notação 'mil-réis') foi a moeda brasileira por séculos, até ser substituída pelo Cruzeiro em 1942.",
          },
          {
            pergunta: "O que era o 'quinto' cobrado por Portugal durante o ciclo do ouro?",
            opcoes: ["Um imposto de 20% sobre todo o ouro extraído", "Um tipo de moeda", "Um imposto sobre importações", "Uma taxa bancária"],
            correta: 0,
            explicacao: "O 'quinto' garantia que a Coroa portuguesa recebesse 20% de toda a produção de ouro da colônia — uma forma de extração de riqueza típica do período colonial.",
          },
          {
            pergunta: "Qual padrão econômico se repetiu várias vezes na história do Brasil, do ouro ao café?",
            opcoes: ["Diversificação constante da economia", "Ciclos de 'boom e queda' baseados em um único produto de exportação", "Estabilidade total de preços", "Ausência completa de exportações"],
            correta: 1,
            explicacao: "Açúcar, ouro, café: o Brasil repetiu por séculos o padrão de depender fortemente de um único produto por vez, trazendo crescimento rápido, mas também crises quando esse produto perdia valor ou se esgotava.",
          },
        ],
      },
    ],
  },
  {
    id: "hnivel2",
    titulo: "Café, imigração e a industrialização de Vargas",
    cor: "#F9A825",
    licoes: [
      {
        id: "h2_1",
        titulo: "O ciclo do café e a nova imigração",
        xp: 25,
        conto: [
          "No século XIX, o café virou o novo 'ouro verde' do Brasil, cultivado primeiro no Vale do Paraíba e depois no interior de São Paulo. A renda do café financiou ferrovias, portos e os primeiros bancos do país — e também, décadas mais tarde, boa parte da industrialização paulista.",
          "Mas havia um problema: em 1888, a escravidão foi abolida, e os fazendeiros de café precisavam de mão de obra. A solução veio de fora: o governo brasileiro subsidiou a vinda de milhões de imigrantes, principalmente italianos, além de espanhóis, portugueses e, mais tarde, japoneses, para trabalhar nas lavouras — muitas vezes em condições ainda muito duras no sistema de 'colonato'.",
          "O dinheiro do café também não ficou só na lavoura: parte dele foi reinvestida em fábricas, principalmente em São Paulo, plantando a semente da industrialização brasileira do século XX. É um exemplo real de como o capital acumulado em um setor pode (ou não) ser redirecionado para desenvolver outros setores da economia — uma decisão que tem tudo a ver com política econômica, não só com 'sorte'.",
        ],
        perguntas: [
          {
            pergunta: "Por que o Brasil incentivou a imigração europeia em massa após 1888?",
            opcoes: ["Para substituir a mão de obra escravizada nas lavouras de café após a abolição", "Porque não havia mais brasileiros no país", "Para fundar novas capitais", "Por exigência de organismos internacionais"],
            correta: 0,
            explicacao: "Com o fim da escravidão em 1888, os fazendeiros de café precisavam de mão de obra, e o governo passou a subsidiar a imigração, principalmente de italianos, para as lavouras paulistas.",
          },
          {
            pergunta: "O que aconteceu com parte da riqueza gerada pelo café?",
            opcoes: ["Foi toda destruída", "Parte foi reinvestida em fábricas, ajudando a iniciar a industrialização em São Paulo", "Foi usada só para pagar dívidas externas", "Nunca saiu da lavoura"],
            correta: 1,
            explicacao: "O capital do café ajudou a financiar a primeira onda de industrialização brasileira — um exemplo de como a riqueza de um setor pode impulsionar outros, quando reinvestida internamente.",
          },
        ],
      },
      {
        id: "h2_2",
        titulo: "Getúlio Vargas e a industrialização por substituição de importações",
        xp: 25,
        conto: [
          "Nos anos 1930, o mundo vivia a Grande Depressão, e o preço do café despencou. Getúlio Vargas, que chegou ao poder em 1930, apostou em uma estratégia diferente: em vez de depender de importar produtos industrializados, o Brasil passaria a produzi-los internamente. Essa estratégia tem nome: substituição de importações.",
          "O governo Vargas criou empresas estatais estratégicas — a Companhia Siderúrgica Nacional (aço, 1941) e, mais tarde, a Petrobras (petróleo, 1953, já no segundo governo Vargas) — e consolidou direitos trabalhistas em uma única lei, a CLT (Consolidação das Leis do Trabalho), em 1943, que ainda regula boa parte das relações de trabalho no Brasil hoje.",
          "Essa fase mostra um debate econômico que ainda existe: até que ponto o Estado deve criar e controlar empresas estratégicas (economia pública) em vez de deixar isso inteiramente para empresas privadas (economia privada)? Não existe resposta 'certa' universal — diferentes países, e diferentes momentos da história brasileira, escolheram caminhos diferentes, com resultados e críticas dos dois lados.",
        ],
        perguntas: [
          {
            pergunta: "O que significa 'substituição de importações' como estratégia econômica?",
            opcoes: ["Parar de vender produtos para outros países", "Produzir internamente o que antes era importado, para reduzir a dependência externa", "Aumentar as importações de qualquer forma", "Proibir a exportação de matéria-prima"],
            correta: 1,
            explicacao: "A ideia era desenvolver indústria própria para não depender de comprar produtos manufaturados de fora — uma estratégia usada por vários países em desenvolvimento no século XX, incluindo o Brasil.",
          },
          {
            pergunta: "Qual lei trabalhista criada no governo Vargas (1943) ainda influencia as relações de trabalho no Brasil?",
            opcoes: ["O Código Civil", "A CLT (Consolidação das Leis do Trabalho)", "A Lei de Diretrizes da Educação", "O Código Penal"],
            correta: 1,
            explicacao: "A CLT unificou direitos trabalhistas (férias, jornada, carteira de trabalho) e segue sendo a base da legislação trabalhista brasileira, com reformas ao longo do tempo.",
          },
          {
            pergunta: "Qual é o debate econômico de fundo por trás da criação de empresas estatais como a Petrobras?",
            opcoes: ["Não existe nenhum debate, é sempre consenso", "O papel do Estado na economia: quando ele deve atuar diretamente em setores estratégicos versus deixar para o setor privado", "Apenas uma questão de logotipo da empresa", "Uma disputa sobre qual moeda usar"],
            correta: 1,
            explicacao: "É um dos debates centrais da economia: o equilíbrio entre economia pública (Estado) e economia privada (mercado) em setores considerados estratégicos para o país.",
          },
        ],
      },
    ],
  },
  {
    id: "hnivel3",
    titulo: "Ditadura, moedas em cascata e a década perdida",
    cor: "#1565C0",
    licoes: [
      {
        id: "h3_1",
        titulo: "O 'milagre econômico' e o custo que ele escondia",
        xp: 30,
        conto: [
          "Entre 1968 e 1973, durante o regime militar (1964–1985), a economia brasileira cresceu a taxas de mais de 10% ao ano — um período apelidado de 'milagre econômico'. Rodovias, a indústria automobilística e grandes obras de infraestrutura avançaram rapidamente, financiadas em boa parte por empréstimos internacionais.",
          "Mas 'milagre' é uma palavra enganosa. O crescimento veio junto com forte concentração de renda — os mais ricos capturaram a maior parte dos ganhos —, com repressão política e censura que limitavam qualquer debate público sobre esse modelo, e com uma dívida externa que cresceu rapidamente, sem preocupação suficiente com o que aconteceria quando as taxas de juros internacionais mudassem.",
          "Quando a crise do petróleo de 1973 elevou os custos de energia no mundo todo e as taxas de juros internacionais subiram no final da década, a conta chegou: o Brasil entrou nos anos 1980 com uma dívida externa enorme e sem fôlego para continuar crescendo no mesmo ritmo. Esse período seguinte ficou conhecido como a 'década perdida'.",
        ],
        perguntas: [
          {
            pergunta: "O que caracterizou o 'milagre econômico' brasileiro (1968–1973)?",
            opcoes: ["Crescimento lento e distribuído igualmente", "Crescimento acelerado do PIB, mas com forte concentração de renda e aumento da dívida externa", "Queda do PIB por 5 anos seguidos", "Fim completo da pobreza no Brasil"],
            correta: 1,
            explicacao: "O período teve crescimento real e visível em infraestrutura, mas concentrou renda e represou uma dívida externa que se tornaria um problema grave na década seguinte.",
          },
          {
            pergunta: "O que ajudou a encerrar o ciclo de forte crescimento de 1968-1973?",
            opcoes: ["A queda do preço do petróleo", "A crise do petróleo de 1973 e a alta das taxas de juros internacionais, que encareceram a dívida externa", "A criação do Real", "Um excesso de exportação de tecnologia"],
            correta: 1,
            explicacao: "O choque do petróleo de 1973 e o aumento dos juros internacionais tornaram a dívida externa brasileira muito mais cara de pagar, contribuindo para a crise da década seguinte.",
          },
        ],
      },
      {
        id: "h3_2",
        titulo: "Do Cruzeiro ao Cruzado Novo: por que o Brasil trocou de moeda tantas vezes?",
        xp: 30,
        conto: [
          "Você sabia que o Brasil já teve pelo menos oito moedas diferentes desde 1942? Cruzeiro (1942), Cruzeiro Novo (1967), Cruzeiro de novo (1970), Cruzado (1986), Cruzado Novo (1989), Cruzeiro outra vez (1990), Cruzeiro Real (1993) e, finalmente, o Real (1994). Cada troca geralmente 'cortava zeros' da moeda anterior — 1.000 unidades da moeda antiga viravam 1 unidade da nova.",
          "Isso acontecia porque a inflação no Brasil, nas décadas de 1980 e começo de 1990, era descontrolada — em alguns meses, os preços chegavam a subir mais de 80% no mês. Vários planos econômicos (Cruzado em 1986, Bresser em 1987, Verão em 1989, Plano Collor em 1990) tentaram resolver o problema, geralmente combinando congelamento de preços com a criação de uma moeda nova, e quase todos fracassaram em poucos meses.",
          "A lição mais importante desse período: trocar o NOME da moeda não resolve inflação. Inflação é um problema de excesso de dinheiro circulando, de desconfiança generalizada nos preços futuros e, muitas vezes, de déficit público mal controlado — não de qual símbolo aparece na nota. Essa lição prepararia o terreno para a solução que finalmente funcionaria, alguns anos depois: o Plano Real.",
        ],
        perguntas: [
          {
            pergunta: "O que geralmente acontecia a cada troca de moeda no Brasil nesse período?",
            opcoes: ["A moeda dobrava de valor", "Zeros eram 'cortados' — geralmente 1.000 unidades da moeda antiga valiam 1 unidade da nova", "Nada mudava na prática", "O câmbio com o dólar era abolido"],
            correta: 1,
            explicacao: "Cada nova moeda geralmente reiniciava a contagem, cortando zeros acumulados pela hiperinflação da moeda anterior, mas sem resolver a causa raiz do problema.",
          },
          {
            pergunta: "Qual foi a principal lição econômica dos planos que fracassaram entre 1986 e 1991?",
            opcoes: ["Trocar o nome da moeda, por si só, não resolve a inflação", "Congelar preços sempre funciona por décadas", "O Brasil nunca teve inflação alta", "Moeda nova sempre garante estabilidade"],
            correta: 0,
            explicacao: "Vários planos tentaram 'resetar' a moeda sem atacar as causas estruturais da inflação (excesso de gastos públicos, indexação generalizada, desconfiança), e por isso fracassaram rapidamente.",
          },
          {
            pergunta: "Quantas moedas diferentes o Brasil teve, aproximadamente, entre 1942 e 1994?",
            opcoes: ["Duas", "Cerca de oito", "Vinte", "Nenhuma, foi sempre o Real"],
            correta: 1,
            explicacao: "Cruzeiro, Cruzeiro Novo, Cruzeiro (de novo), Cruzado, Cruzado Novo, Cruzeiro (de novo outra vez), Cruzeiro Real e Real: um recorde de trocas motivado pela hiperinflação crônica.",
          },
        ],
      },
    ],
  },
  {
    id: "hnivel4",
    titulo: "Plano Real, desigualdade e o papel do Estado",
    cor: "#00695C",
    licoes: [
      {
        id: "h4_1",
        titulo: "O Plano Real e o fim da hiperinflação",
        xp: 35,
        conto: [
          "Em 1994, uma equipe econômica liderada pelo então Ministro da Fazenda Fernando Henrique Cardoso lançou uma estratégia diferente de todas as anteriores: em vez de simplesmente criar uma moeda nova de uma vez, o plano criou primeiro uma unidade de referência, a URV (Unidade Real de Valor), que funcionava como uma 'moeda virtual' estável, usada para indexar preços e salários por alguns meses antes da moeda física mudar.",
          "Essa transição gradual ajudou a reconstruir a confiança nos preços — o problema psicológico e prático mais profundo da hiperinflação. Quando o Real finalmente entrou em circulação em julho de 1994, a inflação mensal, que passava de 40-50% em alguns meses, despencou para níveis de um dígito em poucos meses.",
          "O sucesso do Plano Real teve um efeito político direto: Fernando Henrique Cardoso foi eleito presidente ainda em 1994, muito por causa da estabilização. Décadas depois, o Real continua sendo a moeda brasileira — a mais duradoura desde o Réis colonial — mostrando que planos de estabilização bem desenhados, com transição gradual e credibilidade, funcionam melhor do que decretos abruptos.",
        ],
        perguntas: [
          {
            pergunta: "Qual foi a inovação principal do Plano Real em relação aos planos anteriores?",
            opcoes: ["Congelar preços por decreto, como antes", "Criar uma unidade de referência (URV) para uma transição gradual antes de lançar a nova moeda física", "Proibir qualquer tipo de comércio por 6 meses", "Adotar o dólar como moeda oficial"],
            correta: 1,
            explicacao: "A URV permitiu reindexar preços e salários gradualmente antes da troca física de moeda, reconstruindo a confiança de forma mais sólida do que os congelamentos abruptos dos planos anteriores.",
          },
          {
            pergunta: "O que aconteceu com a inflação mensal brasileira logo após a criação do Real em 1994?",
            opcoes: ["Continuou acima de 40% ao mês", "Caiu para níveis de um dígito em poucos meses", "Dobrou imediatamente", "Não mudou nada"],
            correta: 1,
            explicacao: "O Plano Real foi o primeiro a efetivamente controlar a hiperinflação crônica que assombrava o Brasil desde os anos 1980.",
          },
        ],
      },
      {
        id: "h4_2",
        titulo: "Desigualdade de renda e o papel do Estado na economia",
        xp: 35,
        conto: [
          "O Brasil é, historicamente, um dos países mais desiguais do mundo, medido pelo índice de Gini (uma escala de 0 a 1, em que 0 seria igualdade total de renda e 1 seria toda a renda concentrada em uma única pessoa). Essa desigualdade não é acidente: ela tem raízes na economia colonial escravista, na concentração de terras e no acesso desigual à educação ao longo de séculos.",
          "Existem, grosso modo, duas grandes visões econômicas sobre como lidar com isso. Uma defende que o crescimento econômico, com menos intervenção do Estado, eventualmente reduz a desigualdade por conta própria ('o bolo precisa crescer antes de ser dividido'). Outra defende que, sem políticas ativas de redistribuição — como impostos progressivos e transferência de renda —, a desigualdade tende a se manter ou aumentar, mesmo com crescimento ('o bolo pode crescer e ainda assim ser dividido de forma muito desigual'). Ambas têm economistas sérios defendendo-as, e ambas aparecem em diferentes momentos da política econômica brasileira.",
          "Um exemplo prático desse debate foi o Bolsa Família, criado em 2003: um programa de transferência direta de renda para famílias em situação de pobreza, condicionado a frequência escolar e vacinação das crianças. Defensores apontam a redução comprovada da pobreza extrema; críticos questionam o custo fiscal e o desenho de incentivos no longo prazo. Conhecer os dois lados do debate é parte de entender economia de verdade — não existe política econômica sem trade-offs.",
        ],
        perguntas: [
          {
            pergunta: "O que o índice de Gini mede?",
            opcoes: ["A taxa de juros de um país", "O grau de concentração/desigualdade de renda em uma população", "O valor de uma moeda em relação ao dólar", "A taxa de inflação"],
            correta: 1,
            explicacao: "O índice de Gini vai de 0 (igualdade perfeita) a 1 (concentração total), e o Brasil está historicamente entre os países com os índices mais altos do mundo.",
          },
          {
            pergunta: "Qual é a lógica central de programas de transferência de renda como o Bolsa Família?",
            opcoes: ["Aumentar impostos sobre os mais pobres", "Transferir renda diretamente para famílias em pobreza, geralmente com contrapartidas como frequência escolar", "Eliminar toda forma de mercado privado", "Substituir completamente o sistema bancário"],
            correta: 1,
            explicacao: "É uma política de redistribuição direta de renda, com condicionalidades sociais (educação, saúde), debatida tanto por seus resultados na redução da pobreza quanto por seu custo e desenho de longo prazo.",
          },
          {
            pergunta: "Por que entender os dois lados do debate sobre redistribuição de renda é importante, segundo o texto?",
            opcoes: ["Porque só existe um lado correto e definitivo", "Porque toda política econômica envolve trade-offs, e entender os argumentos dos dois lados é parte de pensar economia de forma madura", "Porque o assunto não tem nenhuma relevância prática", "Porque não há dados sobre o tema"],
            correta: 1,
            explicacao: "Economia raramente tem respostas de 'certo ou errado' absoluto — entender os argumentos e evidências dos diferentes lados é o que permite formar uma opinião mais sólida, em vez de repetir slogans.",
          },
        ],
      },
      {
        id: "h4_3",
        titulo: "Economia pública x economia privada: o que o Estado faz com o seu dinheiro",
        xp: 35,
        conto: [
          "Quando você paga imposto, parte desse dinheiro financia o que os economistas chamam de 'bens públicos': coisas como iluminação de ruas, segurança, justiça e defesa, que beneficiam todo mundo e são difíceis de cobrar individualmente por seu uso. Outra parte financia serviços como saúde e educação públicas, que no Brasil são direitos garantidos pela Constituição de 1988.",
          "'Economia pública' não é sinônimo de socialismo, e 'economia privada' não é sinônimo de capitalismo puro — praticamente todo país do mundo hoje tem uma economia mista, com parte de mercado privado e parte de atuação estatal, em proporções que variam bastante. O debate real geralmente não é 'Estado sim ou não', mas sim: em quais setores, com que intensidade, e financiado por qual tipo de imposto (sobre consumo, sobre renda, sobre patrimônio)?",
          "Entender esse espectro — do mais liberal (menos Estado, mais mercado) ao mais social-democrata ou socialista (mais Estado, mais redistribuição) — ajuda a interpretar notícias, eleições e propostas de reforma tributária com mais autonomia. Educação financeira não é só sobre o seu bolso individual: é também sobre entender como as escolhas coletivas de um país afetam o valor do seu dinheiro, seus impostos e suas oportunidades ao longo da vida.",
        ],
        perguntas: [
          {
            pergunta: "O que são 'bens públicos', no sentido econômico do termo?",
            opcoes: ["Produtos vendidos exclusivamente pelo governo", "Bens/serviços que beneficiam a coletividade e são difíceis de cobrar de forma individualizada, como segurança e iluminação pública", "Qualquer produto fabricado no Brasil", "Ações negociadas na bolsa de valores"],
            correta: 1,
            explicacao: "Bens públicos são caracterizados por beneficiar a todos de forma não exclusiva — por isso costumam ser financiados coletivamente, via impostos, em vez de vendidos individualmente.",
          },
          {
            pergunta: "Por que a maioria dos países hoje é considerada uma 'economia mista'?",
            opcoes: ["Porque combinam, em proporções variadas, mercado privado e atuação do Estado", "Porque usam duas moedas ao mesmo tempo", "Porque não têm impostos", "Porque proíbem qualquer empresa privada"],
            correta: 0,
            explicacao: "Quase nenhum país opera em um extremo puro: a maioria combina setor privado e atuação estatal (educação, saúde, infraestrutura, regulação) em graus diferentes.",
          },
          {
            pergunta: "Segundo o texto, qual é geralmente o debate econômico real sobre o tamanho do Estado?",
            opcoes: ["Se deve existir Estado ou não, de forma absoluta", "Em quais setores, com que intensidade e financiado por qual tipo de imposto o Estado deve atuar", "Apenas qual será a cor da moeda", "Não existe debate nenhum sobre o tema"],
            correta: 1,
            explicacao: "O debate raramente é binário: na prática, gira em torno de graus e formas específicas de atuação estatal e tributação, não de 'tudo ou nada'.",
          },
        ],
      },
    ],
  },
];

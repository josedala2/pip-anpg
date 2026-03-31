/** Dicionário centralizado de descrições para tooltips informativos */
export const tooltipDescriptions: Record<string, string> = {
  // ── Home Executiva — KPI Cards ──
  "Produção Nacional": "Produção média nacional certificada — Relatório Estado das Concessões 2026 (1.036.000 BOPD)",
  "Quota ANPG": "Quota de produção atribuída à ANPG como concessionária nacional — Relatório Estado das Concessões 2026",
  "Produção Gás": "Produção nacional de gás natural — 2.756 MMSCFD (Relatório Estado das Concessões 2026). Inclui gás associado e não-associado.",
  "Reservas Estimadas": "Soma das reservas provadas e prováveis (P1+P2) de todas as concessões, em milhões de barris",
  "Reservas Certificadas": "Reservas provadas de óleo e gás natural certificadas no Relatório Estado das Concessões 2026",
  "Recursos Prospectivos": "Recursos prospectivos nacionais estimados de óleo e gás — volumes ainda não descobertos com potencial exploratório",
  "Variação Produção": "Variação percentual anual da produção nacional em relação ao período anterior",
  "Concessões Activas": "Total de blocos petrolíferos com actividade operacional em curso — dados certificados do relatório oficial",
  "Blocos em Produção": "Número de blocos com produção activa de hidrocarbonetos",
  "Em Exploração": "Blocos em fase de exploração — pesquisa sísmica, perfuração de poços de pesquisa e avaliação",
  "Em Aprovação": "Blocos em fase de aprovação, licitação ou aguardando decisão final de investimento (FID)",
  "Sem Produção": "Blocos sem produção activa — inclui fases de exploração, desenvolvimento ou suspensão",
  "Risco Crítico": "Blocos com pontuação de risco agregado igual ou superior a 7 (escala 0-10)",
  "Instalações Críticas": "Instalações com eficiência operacional inferior a 70%",
  "Receita Estado": "Estimativa anual de receita fiscal petrolífera para o Estado angolano",
  "Contratos a Expirar": "Contratos de concessão com vencimento nos próximos 24 meses",
  "Total Homologado": "Soma dos montantes aprovados em processos de homologação de investimentos",
  "Taxa Aprovação": "Percentagem de processos de homologação que foram aprovados",

  // ── Exploração — BlockPage ──
  "Sísmica 2D": "Quilómetros lineares de levantamento sísmico bidimensional adquiridos no bloco",
  "Sísmica 3D": "Área total coberta por levantamento sísmico tridimensional, em km²",
  "Sísmica 4D": "Área coberta por levantamento sísmico 4D (repetição temporal de 3D para monitorização de reservatório)",
  "STOOIP": "Stock Tank Original Oil In Place — volume estimado de óleo originalmente in-situ, em milhões de barris",
  "Poços Perfurados": "Total de poços de pesquisa e avaliação perfurados no bloco",
  "Resultados": "Distribuição dos resultados de poços: descobertas comerciais, não comerciais e poços secos",
  "Taxa de Sucesso": "Rácio entre descobertas (comerciais + não comerciais) e o total de poços de pesquisa perfurados",

  // ── Concessão — ConcessionStatusTab ──
  "Tempo Restante": "Tempo restante até ao fim do contrato de concessão",
  "Investimento Executado": "Percentagem do investimento planeado que foi efectivamente executado",
  "Reservas Estimadas (Concessão)": "Reservas provadas e prováveis estimadas para este bloco, em milhões de barris",
  "Compliance": "Grau de cumprimento contratual e regulamentar do operador",
  "Variação Produção (Bloco)": "Variação percentual da produção entre os primeiros e últimos períodos registados",
  "Idade Máx. Instalação": "Idade da instalação mais antiga do bloco, indicador de risco de integridade",

  // ── HSE — Facility cards ──
  "Poços OP": "Poços produtores activos (Oil Producer)",
  "Poços WI": "Poços injectores de água (Water Injector) — suporte à pressão do reservatório",
  "Poços GI": "Poços injectores de gás (Gas Injector) — reinjecção ou armazenamento",
  "Eficiência": "Eficiência operacional global das instalações do bloco, em percentagem",
  "Capacidade": "Capacidade máxima de processamento de óleo das instalações, em barris por dia",
  "Prod. Acumulada": "Produção acumulada total desde o início da operação",
  "Início Produção": "Ano em que o bloco iniciou a produção comercial",
  "Vida Útil Até": "Ano estimado de fim de vida útil das instalações",
  "Produção 2025": "Volume total de produção previsto para o ano de 2025",
  "Perdas 2025": "Volume estimado de perdas de produção em 2025 por paragens e manutenção",

  // ── Facilidades — FacilitiesTab ──
  "Eficiência Global": "Eficiência operacional média ponderada de todas as instalações do bloco",
  "Poços Activos": "Total de poços activos (produtores + injectores de água + injectores de gás)",
  "Em Produção Desde": "Ano em que as instalações entraram em produção comercial",

  // ── Métricas Financeiras ──
  "CAPEX": "Capital Expenditure — despesa de capital em investimentos (exploração, desenvolvimento, equipamento)",
  "OPEX": "Operational Expenditure — custos operacionais correntes de produção e manutenção",
  "NPV": "Net Present Value — valor actual líquido dos fluxos de caixa futuros descontados a uma taxa de referência",
  "IRR": "Internal Rate of Return — taxa interna de retorno do investimento",
  "Breakeven": "Preço mínimo do barril de petróleo necessário para cobrir todos os custos operacionais e de capital",
  "OPEX/Barril": "Custo operacional por barril de petróleo produzido (USD/bbl)",
  "OPEX/BO 2025": "Custo técnico total por barril de óleo em 2025 (CAPEX/BO + OPEX/BO). Valores acima de $25/BO indicam pressão nos custos operacionais; acima de $35/BO sinalizam risco económico elevado.",
  "Cost Recovery": "Mecanismo contratual que permite ao operador recuperar custos de exploração e desenvolvimento antes da partilha de lucros",
  "Bónus de Assinatura": "Pagamento único ao Estado aquando da assinatura do contrato de concessão",
  "Bónus Social": "Contribuição obrigatória do operador para projectos de desenvolvimento social",
  "Bónus de Produção": "Pagamento ao Estado quando a produção atinge marcos definidos contratualmente",
  "Investimento Acum.": "Total de investimento efectivamente realizado no bloco até à data actual",
  "Taxa Execução": "Rácio entre o investimento realizado e o investimento planeado, em percentagem",
  "Receita Estado (Bloco)": "Estimativa de receita fiscal gerada pelo bloco para o Estado angolano",
  "Custo Técnico/bbl": "Soma de CAPEX e OPEX por barril — indicador de eficiência de custo total",
  "Fluxo de Caixa": "Diferença entre receitas e despesas num período — indica a liquidez gerada pela operação",
  "Partilha de Produção": "Distribuição contratual da produção entre o Estado (GE) e a concessionária",
  "Fundo Descomissionamento": "Reserva financeira destinada ao abandono e desmantelamento das instalações no fim de vida útil",

  // ── Impostos Fiscais ──
  "IRP": "Imposto sobre o Rendimento do Petróleo — incide sobre o lucro líquido da actividade petrolífera",
  "IPP": "Imposto sobre a Produção de Petróleo — royalty aplicado sobre o volume de produção bruta",
  "ITP": "Imposto sobre a Transacção do Petróleo — incide sobre a transferência de participações em concessões",

  // ── Indicadores Ambientais & HSE ──
  "TRIR": "Total Recordable Incident Rate — taxa total de incidentes registáveis por 200.000 horas-homem trabalhadas",
  "LTI": "Lost Time Injuries — número de acidentes de trabalho com tempo perdido",
  "LTIR": "Lost Time Injury Rate — taxa de acidentes com tempo perdido por 200.000 horas-homem",
  "Fatalidades": "Número de óbitos registados em operações petrolíferas no período",
  "Emissões CO₂": "Volume total de emissões de dióxido de carbono das operações, em toneladas (tCO₂)",
  "Flaring": "Volume de gás natural queimado em tocha (flare) nas instalações, contribuindo para emissões de CO₂ e desperdício energético",
  "Flaring (MMscf)": "Volume de gás queimado em tocha, em milhões de pés cúbicos standard (MMscf)",
  "Venting": "Libertação directa de gás natural para a atmosfera sem combustão — maior impacto ambiental que o flaring",
  "Derrames": "Número de incidentes de derrame de hidrocarbonetos registados no período",
  "Volume Derramado": "Volume total de hidrocarbonetos derramados, em barris",
  "Água Produzida": "Volume de água extraída juntamente com o petróleo — requer tratamento antes de descarga ou reinjecção",
  "Reinjecção de Água": "Volume de água produzida reintroduzida no reservatório para manutenção de pressão",
  "Reinjecção de Gás": "Volume de gás natural reinjectado no reservatório para manutenção de pressão ou armazenamento",

  // ── Produção — BlockPage ──
  "Produção Actual (Bloco)": "Volume diário actual de produção de óleo bruto do bloco, em barris por dia (BOPD)",
  "Actual vs Pico": "Rácio entre a produção actual e o pico histórico agregado de todos os campos",
  "Campos em Produção": "Número de campos com produção activa em relação ao total de campos do bloco",
  "Taxa de Declínio": "Variação percentual negativa da produção ao longo dos últimos 12 meses (método 3-vs-3: média dos 3 últimos meses vs 3 primeiros)",
  "Média por Campo": "Produção diária média por campo em produção activa (produção total ÷ nº de campos produtores)",
  

  // ── Projecções ──
  "Cenário Conservador": "Projecção pessimista — assume declínio natural sem novos investimentos significativos",
  "Cenário Base": "Projecção central — mantém o ritmo actual de investimento e operação",
  "Cenário Expansão": "Projecção optimista — inclui novos desenvolvimentos, FIDs e campanhas de infill drilling",

  // ── Gráficos (ChartWrapper titles) ──
  "Dados Sísmicos (km)": "Evolução anual dos levantamentos sísmicos (2D em km lineares, 3D e 4D em km²) realizados no bloco",
  "Poços Perfurados (Gráfico)": "Distribuição anual de poços por tipo: pesquisa, avaliação, descobertas comerciais/não comerciais e secos",
  "Tendência de Produção (12 meses)": "Evolução mensal da produção diária do bloco ao longo do último ano, com linha de média",
  "CAPEX: Planeado vs Real ($M)": "Comparação anual entre o investimento de capital planeado e efectivamente executado, em milhões de USD",
  "Produção por Campo": "Distribuição da produção de pico entre os campos activos do bloco",
  "Projecções de Produção (3 Cenários)": "Estimativas de produção futura (2025-2034) sob três cenários: conservador, base e expansão",
  "Projecções de Produção (2025–2034)": "Estimativas detalhadas de produção futura sob cenários conservador, base e expansão",
  "Evolução CAPEX — Planeado vs Real ($M)": "Comparação anual entre o CAPEX planeado e realizado, evidenciando desvios de investimento",
  "Plano de Investimentos Quinquenal (MMUSD)": "Previsão de investimentos por categoria (exploração, desenvolvimento, operação) para os próximos 5 anos",
  "Partilha de Produção GE (MMBO)": "Volume de produção anual atribuído ao Grupo Estado (GE) em milhões de barris",
  "Distribuição de Participações": "Repartição percentual das participações entre os membros do consórcio do bloco",
  "Produção Nacional por Bloco": "Produção histórica nacional decomposta por bloco, permitindo visualizar a contribuição de cada concessão",
  "Previsão de Produção Nacional": "Projecção da produção nacional a longo prazo, com cenários de base, com FID e sem FID",
  "Contribuição por Bloco (%)": "Percentagem de contribuição de cada bloco para a produção nacional total",

  // ── HSE Charts ──
  "Evolução TRIR & LTIR": "Tendência anual das taxas de incidentes registáveis (TRIR) e com tempo perdido (LTIR)",
  "Emissões CO₂ (ton CO₂eq)": "Volume anual de emissões de dióxido de carbono equivalente das operações do bloco",
  "Gás Queimado (MMSCFD)": "Volume diário médio de gás natural queimado em tocha (flaring) nas instalações",
  "Custos Incorridos e Previsão (MMUSD)": "Evolução dos custos CAPEX e OPEX incorridos e previstos por período",
  "Custos de Abandono (MMUSD)": "Detalhamento dos custos estimados para descomissionamento e abandono das instalações",
  "Custo Técnico (USD/BO)": "Custo técnico unitário por barril de óleo, decomposto em CAPEX e OPEX",
  "NPV por Período (MMUSD)": "Valor Actual Líquido calculado para diferentes períodos — GE, Concessionária e Impostos",
  "Fluxo de Caixa (MMUSD)": "Evolução temporal do fluxo de caixa decomposto entre GE, Concessionária e Impostos",
  "Repartição de Receitas (MMUSD & MMBO)": "Distribuição percentual das receitas entre o Estado (GE) e Impostos por período",
  "Indicadores de Segurança (HSE)": "Tabela consolidada de todos os indicadores de segurança operacional por ano",

  // ── Dashboard Nacional — Módulo Económico ──
  "Receita Estado (anual)": "Estimativa da receita fiscal petrolífera anual para o Estado angolano, agregada de todas as concessões",
  "NPV Total Concessões": "Soma do Valor Actual Líquido (Full-cycle + Point Forward) de todas as concessões activas",
  "OPEX Médio/Barril": "Média ponderada do custo operacional por barril, usando a produção de cada bloco como peso",
  "Break-even Médio": "Preço médio ponderado de breakeven — preço do barril abaixo do qual as operações se tornam deficitárias",
  "Produção Viável": "Volume de produção diária (BOPD) de blocos com breakeven abaixo de 80% do preço do Brent",
  "Produção em Risco": "Volume de produção diária (BOPD) de blocos com breakeven acima de 80% do preço do Brent",
  "Classificação Económica das Concessões": "Categorização das concessões em classes (Premium, Rentável, Marginal, Crítica, Inviável) com base num score económico multi-dimensional",
  "Ranking de Valor das Concessões": "Score económico de 0-100 calculado em 5 dimensões: Rentabilidade, Eficiência de Custos, Sustentabilidade, Contribuição Fiscal e Risco Económico",
  "Evolução da Receita Petrolífera": "Evolução histórica e projecção da receita fiscal petrolífera, decomposta entre GE e Impostos",
  "Receita por Bacia Petrolífera": "Distribuição da receita fiscal por bacia sedimentar (Congo, Kwanza, Namibe, etc.)",
  "Receita Estado por Operador": "Ranking da contribuição de cada operador para a receita fiscal do Estado",

  // ── Dashboard Nacional — Contratos & Compliance ──
  "Expiram em 12 meses": "Número de contratos de concessão com vencimento nos próximos 12 meses — prioridade máxima de renegociação",
  "Expiram em 24 meses": "Número de contratos de concessão com vencimento nos próximos 24 meses",
  "Expiram em 36 meses": "Número de contratos de concessão com vencimento nos próximos 36 meses",
  "Compliance < 80%": "Número de blocos com score de cumprimento contratual inferior a 80% — requerem atenção regulatória",
  "Com Dados Contratuais": "Número de blocos com informação contratual detalhada disponível na plataforma",
  "Expiração de Contratos por Ano": "Distribuição temporal dos contratos por ano de vencimento — permite antecipar picos de renegociação",
  "Compliance por Operador": "Semáforo de conformidade e execução financeira por operador, com código de cores (verde/amarelo/vermelho)",

  // ── Dashboard Nacional — Exploração ──
  "Sísmica Total Adquirida": "Soma total de todos os levantamentos sísmicos (2D, 3D e 4D) adquiridos em todos os blocos",
  "Total Poços Exploração": "Número total de poços de exploração (pesquisa + avaliação) perfurados em todos os blocos",
  "Pesquisa": "Poços de pesquisa (wildcats) — perfurados em áreas sem produção prévia para testar novas estruturas",
  "Avaliação": "Poços de avaliação (appraisal) — perfurados para delimitar e estimar o volume de uma descoberta",
  "Reservas Totais": "Soma das reservas provadas e prováveis de todos os blocos, em milhões de barris",
  "Desafios do Sector": "Principais constrangimentos estruturais da actividade exploratória em Angola",

  // ── Dashboard Nacional — Operadores ──
  "Operadores": "Número total de empresas operadoras activas nas concessões angolanas",
  "Produção Total": "Soma da produção diária de todos os operadores, em barris por dia (BOPD)",
  "Reservas Totais (Operadores)": "Soma das reservas estimadas de todos os operadores, em milhões de barris",
  "Investimento Acumulado": "Total de investimento realizado por todos os operadores em todas as concessões",
  "Produção por Operador (BOPD)": "Ranking dos operadores por volume de produção diária",

  // ── Visão Económica ──
  "NPV por Período": "Valor Actual Líquido calculado para diferentes horizontes temporais (GE, Concessionária e Impostos)",
  "Fluxo de Caixa Acumulado": "Evolução temporal do fluxo de caixa acumulado, mostrando o ponto de payback e retorno do investimento",
  "Repartição de Receitas": "Distribuição das receitas entre o Estado e a concessionária segundo os termos contratuais",
  "Custos Técnicos por Barril": "CAPEX e OPEX unitários (USD/bbl) — métrica chave de eficiência de custos da operação",
  "Custos de Abandono": "Estimativa detalhada dos custos de descomissionamento por categoria (poços, plataformas, subsea, etc.)",

  // ── Visão Geral — BlockPage Overview ──
  "Produção Diária": "Volume diário actual de produção de óleo bruto, em barris por dia (BOPD)",
  "Score de Risco": "Pontuação agregada de risco do bloco numa escala de 0 a 10, combinando riscos operacional, ambiental e contratual",

  // ── Módulo Económico Nacional ──
  "Score Económico": "Pontuação económica agregada do bloco (0-100) combinando NPV, custos, breakeven e receita fiscal",
  "Ranking Económico": "Posição relativa do bloco face aos demais em termos de performance económica",
  "Receita Fiscal Nacional": "Soma das receitas fiscais estimadas de todos os blocos para o Estado angolano",
  "CAPEX Nacional": "Total de despesa de capital agregada de todas as concessões nacionais",
  "OPEX Nacional": "Total de custos operacionais agregados de todas as concessões nacionais",
  "Breakeven Médio": "Preço médio ponderado de breakeven de todas as concessões activas",

  // ── Contratos & Compliance ──
  "Timeline Contratos": "Cronograma visual dos contratos de concessão, mostrando datas de vencimento e urgência",
  "Score Compliance": "Pontuação de cumprimento contratual e regulamentar do operador (0-100%)",
  "Meses Restantes": "Tempo restante, em meses, até ao termo do contrato de concessão",

  // ── Homologações ──
  "Processo Homologação": "Pedido formal de aprovação de investimentos ou actividades pelo regulador (ANPG)",
  "Montante Homologado": "Valor financeiro aprovado num processo de homologação de investimento",
  "Estado do Processo": "Situação actual do processo de homologação: Aprovado, Pendente, Rejeitado ou Em Análise",

  // ── Estrutura de Custos ──
  "CAPEX Total Acumulado": "Soma de todo o investimento de capital realizado em todas as concessões desde o início das operações",
  "OPEX Total Acumulado": "Soma de todos os custos operacionais incorridos em todas as concessões desde o início das operações",
  "Custos de Abandono (total)": "Estimativa total dos custos de descomissionamento e abandono de todas as instalações",
  "Fundo de Abandono": "Percentagem dos custos de abandono já depositados em fundo dedicado — valores baixos indicam risco financeiro",
  "Custo por Barril por Concessão": "Comparação do OPEX e custo técnico por barril entre concessões — identifica as mais e menos eficientes",
  "CAPEX vs OPEX por Operador": "Distribuição do investimento (CAPEX) e custos operacionais (OPEX) por empresa operadora",
  "Custos de Abandono — Gap de Financiamento": "Diferença entre o custo estimado de abandono e o valor já depositado em fundo — 'gap' indica exposição financeira",

  // ── Impacto Fiscal ──
  "Receita Fiscal Total": "Soma anual estimada de todas as receitas fiscais petrolíferas: royalties (IPP), impostos (IRP) e outras contribuições",
  "Royalties (IPP)": "Receita anual estimada do Imposto sobre a Produção de Petróleo — royalty aplicado sobre o volume bruto",
  "Impostos (IRP)": "Receita anual estimada do Imposto sobre o Rendimento do Petróleo — incide sobre o lucro líquido",
  "Outras Receitas": "Receitas fiscais adicionais: bónus, contribuições sociais e outras obrigações contratuais",
  "Repartição da Receita Fiscal": "Decomposição percentual da receita fiscal entre Royalties (IPP), Impostos (IRP) e Outras fontes",
  "Contribuição Fiscal por Concessão": "Ranking das concessões pela sua contribuição fiscal para o Estado, decomposta em royalties e impostos",
  "Repartição Estado vs Operador (%)": "Percentagem da receita atribuída ao Estado vs. ao operador, segundo os termos de partilha de cada contrato",
  "Condições Fiscais por Concessão": "Tabela detalhada das condições fiscais (IPP, IRP, Cost Recovery) de cada concessão activa",

  // ── Risco Económico ──
  "Activos Críticos": "Número de concessões classificadas como 'Alto Risco' ou 'Inviável' — requerem atenção imediata",
  "Próximos do Break-even": "Concessões com margem económica inferior a 30% — vulneráveis a quedas no preço do petróleo",
  "Produção em Risco (BOPD)": "Volume total de produção diária de concessões com margem económica inferior a 20%",
  "OPEX Elevado": "Número de concessões com custo operacional superior a $20/bbl — candidatas a optimização de custos",
  "Mapa de Risco Económico — Break-even vs Produção": "Dispersão das concessões por break-even e volume de produção — pontos acima da linha Brent indicam risco",
  "Concessões Próximas do Break-even": "Lista de concessões com margem económica reduzida, ordenadas por proximidade ao ponto de break-even",
  "Risco de Abandono Sub-financiado": "Concessões com gap significativo entre os custos estimados de abandono e o fundo já constituído",

  // ── Cenários Económicos ──
  "Cenários Económicos": "Simulação de 5 cenários macroeconómicos (Continuidade, Optimização, Revitalização, Declínio, Abandono) sobre a produção nacional",
  "Comparação de Indicadores por Cenário": "Tabela comparativa de NPV, IRR, Cash Flow, Receita Estado e Custo/bbl para cada cenário simulado",
  "Projecção de Cash Flow por Cenário": "Evolução temporal do fluxo de caixa líquido sob cada cenário, do ano actual até 2040",
  "Projecção de Produção (kBOPD)": "Evolução da produção nacional sob cada cenário, mostrando trajectórias de declínio ou crescimento",
  "Receita do Estado por Cenário": "Comparação da receita fiscal acumulada para o Estado em cada cenário simulado",
  "Impacto por Concessão (Cenário)": "Efeito de cada cenário sobre concessões individuais — identifica os blocos mais sensíveis",

  // ── Previsão Geral ──
  "Produção Actual": "Volume diário actual de produção de óleo bruto agregado, em barris por dia (BOPD)",
  "Proj. 2030 (Base)": "Projecção de produção para 2030 no cenário base (continuidade das operações actuais)",
  "Proj. 2035 (Base)": "Projecção de produção para 2035 no cenário base — indica a trajectória de declínio natural",
  "Receita Estado Acum.": "Receita fiscal acumulada estimada para o Estado ao longo de 15 anos no cenário base",
  "NPV Nacional (Base)": "Valor Actual Líquido nacional no cenário base, com taxa de desconto de 10%",
  "NPV Melhor Cenário": "Valor Actual Líquido nacional no cenário mais favorável entre os 5 simulados",
  "Alertas Activos": "Número total de alertas operacionais e de previsão activos em todas as concessões",
  "Blocos em Risco": "Número de concessões com pelo menos um alerta de severidade crítica",
  "Previsão Consolidada — Produção, Receita, Custos": "Projecção multi-métrica a 15 anos: produção, receita do Estado, OPEX e cash flow no cenário base",
  "Mapa Temporal — Evolução por Horizonte": "Mapa de calor temporal mostrando a evolução de métricas críticas em horizontes seleccionados (2026-2040)",
  "Top Riscos Activos": "Os 5 alertas de maior severidade activos — riscos críticos e altos que requerem atenção",
  "Top Oportunidades por NPV": "As 5 concessões com maior potencial de valor (NPV) entre os activos estratégicos e rentáveis",

  // ── Conselho de Administração ──
  "Acções Prioritárias": "Número de concessões com urgência 'Imediata' ou 'Elevada' que requerem decisão do Conselho",
  "Score Médio Nacional": "Média ponderada do score estratégico de todas as concessões (escala 0-100)",
  "A Revitalizar": "Concessões classificadas como 'Revitalizar' — com potencial de recuperação mediante investimento adicional",
  "A Renegociar": "Concessões classificadas como 'Renegociar' — termos contratuais desfavoráveis ou desactualizados",
  "Abandono/Relicitação": "Concessões a preparar para abandono ou relicitação — fim de vida útil ou inviabilidade económica",
  "Saúde Nacional — 6 Dimensões": "Radar com 6 dimensões: Score Estratégico, Económico, Viabilidade da Produção, Cenário Base, Receita Fiscal e Risco",
  "Classificação Económica": "Distribuição das concessões por classe económica: Estratégico, Rentável, Observação, Alto Risco, Inviável",
  "Classificação Estratégica": "Distribuição das concessões por acção estratégica: Revitalizar, Manter, Renegociar, Monitorar, Abandono, Relicitar",
  "Cenários — NPV vs Receita Estado": "Comparação do NPV e receita fiscal acumulada entre os 5 cenários macroeconómicos simulados",
  "Trajectória de Produção (Cenário Base)": "Evolução da produção e receita no cenário de continuidade, mostrando a curva de declínio natural",
  "Top 5 Concessões por Valor": "As 5 concessões com maior NPV — activos estratégicos e rentáveis que geram mais valor",
  "Top 5 Concessões de Risco": "As 5 concessões com pior classificação económica — alto risco ou inviáveis",
  "Alertas de Previsão": "Alertas gerados automaticamente pelo motor de previsão com base em tendências e limiares críticos",
  "Recomendações Prioritárias": "Lista priorizada de acções estratégicas recomendadas com base na análise integrada de todos os módulos",
  "Distribuição de Classificações Estratégicas": "Gráfico de barras com a contagem de concessões em cada classificação estratégica",
  "Radar de Saúde": "Análise multidimensional de uma concessão — avalia 6 dimensões de desempenho operacional e económico",
};

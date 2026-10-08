import articleImage from "../assets/brand/photography/Untitled-1.jpg";
import eventImage from "../assets/brand/photography/Untitled-6.jpg";
import insightImage from "../assets/brand/photography/about-people.jpg";
import energyImage from "../assets/brand/photography/cases-energy.jpg";
import scienceImage from "../assets/brand/photography/hero-science.jpg";
import agricultureImage from "../assets/brand/photography/cases-agriculture.jpg";

export interface ContentItem {
  id: string;
  slug: string;
  type: "Artigo" | "Evento" | "Insights";
  title: string;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  image: string;
  alt: string;
  summary: string;
  paragraphs: string[];
  tags: string[];
}

export const contentsData: ContentItem[] = [
  {
    id: "sbpmat-2026-encontro-anual",
    slug: "sbpmat-2026-fronteiras-ciencia-de-materiais-e-transicao-ecologica",
    type: "Evento",
    title: "SBPMat 2026: As Fronteiras da Ciência de Materiais e a Nova Indústria Sustentável",
    date: "05 out 2026",
    readTime: "Presencial • Foz do Iguaçu/PR",
    author: "Comitê SBPMat & Curadoria The Bridge",
    authorRole: "Sociedade Brasileira de Pesquisa em Materiais",
    image: energyImage,
    alt: "Pesquisa avançada em novos materiais e engenharia sustentável",
    summary:
      "O XXIV B-MRS Meeting (SBPMat 2026) congrega mais de 2.000 pesquisadores e corporações globais para discutir grafeno, semicondutores avançados, biomateriais e armazenamento de energia limpa.",
    paragraphs: [
      "O Encontro Anual da Sociedade Brasileira de Pesquisa em Materiais (SBPMat / B-MRS Meeting 2026) consolida-se como o epicentro da América Latina para a convergência entre investigação científica fundamental e demandas industriais de alta complexidade. Com mais de duas décadas de tradição, a edição de 2026 destaca a liderança do Brasil no desenvolvimento de materiais bidimensionais, compostos de carbono, polímeros de fontes renováveis e ligas metálicas de alto desempenho.",
      "Durante os simpósios temáticos, os debates concentram-se em três macrodesafios globais: a transição energética (com foco em baterias de estado sólido e células a combustível de hidrogênio verde), a independência tecnológica em semicondutores e fotônica, e o desenvolvimento de biomateriais inteligentes para medicina regenerativa e embalagens funcionais de degradação controlada.",
      "Para corporações e fundos de investimento, o evento representa uma janela ímpar de prospecção. A The Bridge participa ativamente mapeando sinergias entre laboratórios universitários de excelência e departamentos de P&D industriais, encurtando o tempo necessário para que protótipos em TRL 3 a 5 alcancem validação em escala de planta piloto.",
    ],
    tags: ["SBPMat 2026", "Ciência de Materiais", "Grafeno", "Semicondutores", "Transição Energética"],
  },
  {
    id: "sbpmat-2026-insights-negocios",
    slug: "sbpmat-2026-como-empresas-podem-acessar-a-vanguarda-dos-novos-materiais",
    type: "Insights",
    title: "SBPMat 2026 nos Negócios: Como a Indústria Pode Acessar a Produção Científica Avançada",
    date: "06 out 2026",
    readTime: "5 min de leitura",
    author: "Radar de Inteligência The Bridge",
    authorRole: "Especialistas em Transferência de Tecnologia",
    image: scienceImage,
    alt: "Laboratório moderno de engenharia de materiais",
    summary:
      "Guia estratégico para diretores de inovação e gerentes de P&D identificarem patentes e competências de ponta apresentadas na SBPMat 2026 para acelerar o desenvolvimento de produtos.",
    paragraphs: [
      "A ciência de materiais é a disciplina habilitadora de praticamente todas as tecnologias revolucionárias da década, desde veículos elétricos até chips quânticos. No entanto, muitas corporações ainda enfrentam dificuldades para navegar nos milhares de artigos e apresentações técnicas gerados por congressos de ponta como a SBPMat 2026.",
      "O segredo para transformar essa densidade científica em vantagem competitiva reside na capacidade de decodificar as pesquisas em competências tecnológicas específicas e verificar o alinhamento com a maturidade de mercado (TRL/CRL). Quando uma indústria automotiva ou aeroespacial consegue mapear exatamente qual grupo de pesquisa domina síntese em larga escala de nanocompósitos ou funcionalização de superfícies, o tempo de ciclo de P&D é reduzido em até 60%.",
      "Neste artigo, apresentamos um roteiro prático para estruturar convênios de cooperação com base nos trabalhos apresentados na SBPMat, aproveitando incentivos fiscais da Lei do Bem e modelos ágeis de licenciamento conjunto de propriedade intelectual.",
    ],
    tags: ["SBPMat 2026", "P&D Corporativo", "Transferência Tecnológica", "Inovação Aberta"],
  },
  {
    id: "nobel-medicina-2026",
    slug: "premio-nobel-de-medicina-2026-reprogramacao-epigenetica-e-terapias-celulares",
    type: "Artigo",
    title: "Prêmio Nobel de Medicina 2026: A Nova Fronteira da Reprogramação Epigenética e Terapias Celulares",
    date: "05 out 2026",
    readTime: "6 min de leitura",
    author: "Comitê de Biotecnologia The Bridge",
    authorRole: "Ciências da Vida & Saúde de Precisão",
    image: articleImage,
    alt: "Microscópio e pesquisa celular em biotecnologia",
    summary:
      "O Prêmio Nobel de Fisiologia ou Medicina de 2026 premia descobertas pioneiras na reprogramação epigenética controlada in vivo, transformando a oncologia e a medicina regenerativa.",
    paragraphs: [
      "O Instituto Karolinska anunciou a concessão do Prêmio Nobel de Fisiologia ou Medicina de 2026 aos cientistas responsáveis por desvendar os mecanismos moleculares da reversão epigenética direcionada in vivo, mantendo a identidade e integridade do tecido celular.",
      "A descoberta marca um divisor de águas na biomedicina contemporânea: pela primeira vez, demonstrou-se viável restaurar o vigor funcional de tecidos envelhecidos ou danificados por patologias crônicas sem induzir tumorigênese. As aplicações clínicas imediatas incluem o rejuvenescimento do sistema imunológico, a reversão de lesões do nervo óptico e o aumento radical da eficácia de imunoterapias com células CAR-T contra tumores sólidos.",
      "Para a indústria farmacêutica e startups deep tech em biotecnologia, o Nobel de 2026 valida uma nova classe terapêutica. A The Bridge já acompanha grupos de pesquisa nacionais integrados a essas redes globais, permitindo que hospitais de ponta e farmacêuticas identifiquem sinergias com pesquisadores especializados em vetores virais e edição de epigenoma.",
    ],
    tags: ["Prêmio Nobel 2026", "Medicina", "Biotecnologia", "Epigenética", "Oncologia"],
  },
  {
    id: "nobel-fisica-2026",
    slug: "premio-nobel-de-fisica-2026-estados-quanticos-topologicos-e-supercondutores",
    type: "Artigo",
    title: "Prêmio Nobel de Física 2026: Estados Quânticos Topológicos e a Viabilidade do Hardware Quântico",
    date: "06 out 2026",
    readTime: "7 min de leitura",
    author: "Prof. Dr. Marcelo S. Alencar",
    authorRole: "Física da Matéria Condensada & Computação Quântica",
    image: scienceImage,
    alt: "Equipamentos ópticos e lasers em laboratório de física quântica",
    summary:
      "A Academia Real das Ciências da Suécia reconheceu avanços teóricos e experimentais em quasipartículas topológicas que viabilizam qubits protegidos contra ruído e supercondutividade em nanoescala.",
    paragraphs: [
      "O Prêmio Nobel de Física de 2026 coroa décadas de investigação rigorosa sobre estados topológicos da matéria condensada e o isolamento de quasipartículas de Majorana em heteroestruturas de semicondutores e supercondutores.",
      "O maior obstáculo para a computação quântica prática sempre foi a decoerência — a extrema fragilidade dos estados quânticos frente a ruídos térmicos e eletromagnéticos do ambiente. As fases topológicas protegem a informação não em pontos locais, mas na estrutura geométrica global do sistema quântico (trança de anyons). Isso reduz drasticamente a taxa de erros e aproxima a humanidade de processadores quânticos verdadeiramente tolerantes a falhas.",
      "O impacto desse reconhecimento reverberará por toda a cadeia de semicondutores, criptografia pós-quântica e simulação de reações químicas complexas. Conectar as indústrias de telecomunicações e inteligência artificial a laboratórios de física de baixas temperaturas é essencial para garantir soberania nos novos paradigmas da computação.",
    ],
    tags: ["Prêmio Nobel 2026", "Física", "Computação Quântica", "Supercondutividade", "Semicondutores"],
  },
  {
    id: "nobel-quimica-2026",
    slug: "premio-nobel-de-quimica-2026-inteligencia-artificial-molecular-e-catalise-verde",
    type: "Artigo",
    title: "Prêmio Nobel de Química 2026: IA Molecular e a Síntese Revolucionária de Catálise Sustentável",
    date: "07 out 2026",
    readTime: "6 min de leitura",
    author: "Comitê de Química Sustentável The Bridge",
    authorRole: "Química Verde & Novos Processos Industriais",
    image: agricultureImage,
    alt: "Pesquisa em química verde e síntese molecular sustentável",
    summary:
      "A láurea laureou os pioneiros no desenvolvimento de modelos fundacionais de IA para design 'de novo' de enzimas artificiais e catalisadores para captura e conversão de CO2 em insumos químicos.",
    paragraphs: [
      "O Prêmio Nobel de Química de 2026 consagra a integração definitiva entre ciência da computação avançada e engenharia química. Os laureados desenvolveram arquiteturas computacionais capazes de desenhar catalisadores e biomoléculas do zero (de novo molecular design), prevendo afinidades cinéticas e mecanismos de reação com precisão atômica.",
      "A principal consequência dessa conquista é a descarbonização radical da indústria química. Processos que anteriormente exigiam pressões de centenas de atmosferas e temperaturas extremas agora podem ser operados em condições brandas, utilizando biocatalisadores sintéticos projetados por computador para transformar dióxido de carbono capturado da atmosfera em polímeros de alto valor comercial e combustíveis sintéticos limpos.",
      "Para os setores petroquímico, de agronegócio e cosméticos, a tecnologia abre caminho para substituir ingredientes fósseis por alternativas 100% biobaseadas com custo competitivo. Empresas cadastradas no The Bridge já encontram grupos universitários nacionais com expertise comprovada na adaptação desses catalisadores a matérias-primas tropicais.",
    ],
    tags: ["Prêmio Nobel 2026", "Química", "Inteligência Artificial", "Química Verde", "Descarbonização"],
  },
  {
    id: "nobel-economia-2026",
    slug: "premio-nobel-de-economia-2026-redes-de-inovacao-aberta-e-capital-cientifico",
    type: "Insights",
    title: "Prêmio Nobel de Economia 2026: A Dinâmica das Redes de Inovação Aberta e o Retorno do Capital Científico",
    date: "08 out 2026",
    readTime: "6 min de leitura",
    author: "Núcleo de Economia da Inovação The Bridge",
    authorRole: "Economia & Políticas Públicas de P&D",
    image: insightImage,
    alt: "Especialistas discutindo indicadores econômicos e estratégias de inovação",
    summary:
      "O Nobel de Economia 2026 demonstra através de dados empíricos que países e corporações com pontes desburocratizadas entre universidades e empresas alcançam crescimento sustentável superior.",
    paragraphs: [
      "O Prêmio de Ciências Econômicas em Memória de Alfred Nobel de 2026 premiou economistas que formularam a moderna teoria econométrica dos 'Spillovers Científicos Bidirecionais' e a governança de redes de inovação aberta.",
      "O cerne da pesquisa laureada comprova que investir em ciência básica só se converte em crescimento do PIB e produtividade total dos fatores (PTF) quando existem mecanismos institucionais e plataformas estruturadas para intermediar o fluxo de tecnologia entre universidades e empresas privadas. Sociedades que mantêm silos isolados sofrem com a perda de capital humano e baixa eficiência alocativa de subsídios de pesquisa.",
      "O estudo quantifica ainda o retorno do capital de risco em deep techs, revelando que a mitigação prévia de incertezas tecnológicas por meio de diagnósticos objetivos (como TRL) reduz em até 45% a taxa de mortalidade de spin-offs universitárias. A filosofia da The Bridge apoia-se diretamente nas conclusões consagradas pela Academia Sueca.",
    ],
    tags: ["Prêmio Nobel 2026", "Economia", "Inovação Aberta", "Produtividade", "Políticas Públicas"],
  },
  {
    id: "nobel-paz-2026",
    slug: "premio-nobel-da-paz-2026-diplomacia-cientifica-e-seguranca-climatica",
    type: "Insights",
    title: "Prêmio Nobel da Paz 2026: Diplomacia Científica e Cooperação Global Contra Riscos Ecológicos",
    date: "08 out 2026",
    readTime: "5 min de leitura",
    author: "Observatório Global The Bridge",
    authorRole: "Relações Internacionais & Governança ESG",
    image: eventImage,
    alt: "Cúpula internacional e diplomacia científica colaborativa",
    summary:
      "O Comitê Norueguês do Nobel homenageia alianças científicas transfronteiriças que garantiram o compartilhamento aberto de dados ecológicos e tecnologias de segurança hídrica e alimentar.",
    paragraphs: [
      "O Prêmio Nobel da Paz de 2026 foi concedido à coalizão global de pesquisadores e mediadores que viabilizou tratados históricos de compartilhamento aberto de tecnologias de monitoramento ambiental e mitigação de secas em regiões de alta tensão geopolítica.",
      "A premiação reforça que a paz no século XXI é indissociável da justiça climática e da soberania científica compartilhada. Quando dados de satélites, modelos hidrológicos e cultivares resistentes a extremos meteorológicos são tratados como patrimônio público da humanidade, conflitos por recursos vitais são prevenidos com base em evidências e solidariedade técnica.",
      "A The Bridge celebra este marco, reiterando que a ciência colaborativa e sem barreiras é a ferramenta mais poderosa para construir pontes de prosperidade e estabilidade entre nações e setores produtivos.",
    ],
    tags: ["Prêmio Nobel 2026", "Paz", "Diplomacia Científica", "Clima", "Sustentabilidade"],
  },
  {
    id: "nobel-literatura-2026",
    slug: "premio-nobel-de-literatura-2026-a-condicao-humana-na-era-da-inteligencia-artificial",
    type: "Insights",
    title: "Prêmio Nobel de Literatura 2026: Narrativas da Consciência Humana no Limiar Tecnológico",
    date: "08 out 2026",
    readTime: "4 min de leitura",
    author: "Curadoria Editorial The Bridge",
    authorRole: "Cultura, Ética & Pensamento Contemporâneo",
    image: insightImage,
    alt: "Reflexão sobre criatividade, artes e condição humana",
    summary:
      "A Academia Sueca condecora obras que investigam a profundidade da alma humana, a memória sensorial e a busca por sentido em uma era hipertecnológica e sintética.",
    paragraphs: [
      "O Prêmio Nobel de Literatura de 2026 contemplou uma literatura que recusa a superficialidade da era do consumo digital para indagar: o que resta de essencialmente humano quando algoritmos produzem textos, imagens e decisões com velocidade sobre-humana?",
      "As obras consagradas exploram os meandros da vulnerabilidade, da solidão, do luto e da capacidade intransferível de experimentar a empatia e o deslumbramento estético. Longe de ser um manifesto tecnofóbico, a literatura premiada convida cientistas, engenheiros e a sociedade civil a refletirem sobre os fins últimos do progresso material.",
      "Na The Bridge, entendemos que o progresso científico genuíno só encontra seu ápice quando enraizado em valores humanistas profundos. A ponte que construímos entre universidade e indústria deve sempre servir à dignidade, à liberdade e à plenitude da vida humana.",
    ],
    tags: ["Prêmio Nobel 2026", "Literatura", "Ética", "Humanidades", "Filosofia"],
  },
  {
    id: "1",
    slug: "papel-da-ciencia-na-construcao-de-solucoes-para-o-futuro",
    type: "Artigo",
    title: "O papel da ciência na construção de soluções para o futuro",
    date: "12 set 2026",
    readTime: "5 min de leitura",
    author: "Comitê Científico The Bridge",
    authorRole: "Pesquisa & Inovação",
    image: articleImage,
    alt: "Pesquisador trabalhando com microscópio em ambiente laboratorial",
    summary:
      "Como a aproximação entre os laboratórios universitários e as demandas reais da indústria está redefinindo a velocidade com que descobertas científicas chegam à sociedade.",
    paragraphs: [
      "Historicamente, grande parte do conhecimento científico mais avançado produzido nas universidades brasileiras e latino-americanas permaneceu confinado a teses, periódicos especializados e relatórios de bancas examinadoras. Embora o rigor metodológico e a qualidade dos pesquisadores sejam comparáveis aos principais polos globais, a ausência de canais estruturados de transferência tecnológica e comunicação com o mercado corporativo frequentemente transformava pesquisas promissoras em patentes ociosas ou descobertas sem aplicação prática.",
      "Para que a ciência exerça de fato seu papel transformador na resolução de crises climáticas, transição energética e soberania em saúde, torna-se imperativo construir pontes que traduzam a linguagem acadêmica para indicadores de maturidade tecnológica (TRL) e comercial (CRL). Quando pesquisadores compreendem os gargalos específicos das indústrias e as empresas enxergam a universidade como parceira estratégica de P&D (e não apenas como fornecedora de mão de obra), o ciclo de inovação se abrevia drasticamente.",
      "A plataforma The Bridge atua exatamente nesse ponto de inflexão: organizando a produção científica por competências concretas e disponibilizando um ambiente confiável onde desafios reais encontram projetos em estágios avançados de maturação. O futuro não será construído por cientistas isolados em laboratórios, tampouco por empresas focadas apenas em otimizações de curto prazo, mas sim pela confluência contínua entre o rigor da investigação científica e a capacidade de escala do mercado.",
    ],
    tags: ["Ciência", "Transferência Tecnológica", "P&D", "Inovação Aberta"],
  },
  {
    id: "2",
    slug: "inovacao-em-rede-conexoes-que-transformam-conhecimento-em-impacto",
    type: "Evento",
    title: "Inovação em rede: conexões que transformam conhecimento em impacto",
    date: "03 out 2026",
    readTime: "Presencial & Online • 09h às 18h",
    author: "Equipe The Bridge Fórum",
    authorRole: "Eventos & Parcerias Estratégicas",
    image: eventImage,
    alt: "Ambiente colaborativo e dinâmico representando inovação em rede",
    summary:
      "O encontro reúne pesquisadores líderes, diretores de tecnologia e investidores de venture capital para debater parcerias estratégicas e novos modelos de cooperação técnico-científica.",
    paragraphs: [
      "O paradigma da inovação isolada perdeu espaço definitivo no cenário contemporâneo. Hoje, as maiores conquistas tecnológicas globais decorrem de redes simbióticas que congregam universidades públicas e privadas, institutos de tecnologia, corporações maduras, startups deep-tech e agentes governamentais. O evento 'Inovação em Rede' foi idealizado pela The Bridge para materializar essas pontes em discussões práticas, mesas de ideação e rodadas de negócios de alto valor agregado.",
      "Ao longo de uma jornada intensa de painéis e sessões de matchmaking presencial, os participantes terão acesso a estudos de casos reais de cooperação universidade-empresa, marcos legais de fomento à pesquisa e instrumentos de proteção intelectual. Líderes de grandes indústrias compartilharão seus desafios tecnológicos prioritários para os próximos anos, enquanto cientistas de ponta apresentarão soluções em biotecnologia, novos materiais, inteligência artificial aplicada e transição descarbonizada.",
      "Mais do que um simpósio de palestras tradicionais, a conferência proporcionará um ambiente dinâmico de networking orientado por dados de compatibilidade da The Bridge, conectando previamente participantes com sinergias comprovadas. As inscrições já estão abertas com vagas limitadas para a experiência presencial e transmissão simultânea para todo o ecossistema nacional e internacional de inovação.",
    ],
    tags: ["Evento", "Networking", "Ecossistema", "Deep Tech"],
  },
  {
    id: "3",
    slug: "tendencias-que-estao-transformando-o-ecossistema-de-inovacao",
    type: "Insights",
    title: "Tendências que estão transformando o ecossistema de inovação",
    date: "28 ago 2026",
    readTime: "4 min de leitura",
    author: "Radar de Inteligência The Bridge",
    authorRole: "Análise de Dados & Tendências",
    image: insightImage,
    alt: "Profissional analisando tendências e planejamento em ambiente de inovação",
    summary:
      "Uma análise aprofundada sobre as macrotendências que ditam os investimentos em tecnologia, com destaque para deep techs, critérios de maturidade e rigor ESG.",
    paragraphs: [
      "O ecossistema global de tecnologia e inovação atravessa uma mudança de maturação decisiva. O período em que modelos de negócios puramente digitais e aplicativos de conveniência capturavam a maior parte do capital de risco deu lugar a um interesse renovado por 'deep techs' — soluções de base científica profunda que demandam pesquisa laboratorial complexa, patentes sólidas e resolução de gargalos estruturais nas áreas de manufatura, biotecnologia e energias limpas.",
      "Outro vetor em forte ascensão é a exigência de métricas claras de maturidade tecnológica. Investidores institucionais e corporações que buscam inovação aberta já não se contentam com protótipos de conceito; eles exigem o enquadramento objetivo nas escalas TRL (Technology Readiness Level) e CRL (Commercial Readiness Level). Projetos que demonstram clara validação em ambiente relevante e análise de viabilidade de custos assumem posição de liderança na captação de recursos e celebração de convênios.",
      "Por fim, a integração inegociável de critérios ESG (ambientais, sociais e de governança) estabelece que o impacto sustentável não é mais uma diretriz secundária, mas sim o próprio fundamento de validação de qualquer nova tecnologia. No The Bridge, monitoramos diariamente esses fluxos de demanda corporativa para orientar grupos de pesquisa acadêmicos a alinharem suas pesquisas aplicadas às reais janelas de oportunidade do mercado contemporâneo.",
    ],
    tags: ["Insights", "Deep Tech", "TRL/CRL", "ESG", "Maturidade"],
  },
];

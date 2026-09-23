import articleImage from "../assets/brand/photography/Untitled-1.jpg";
import eventImage from "../assets/brand/photography/Untitled-6.jpg";
import insightImage from "../assets/brand/photography/about-people.jpg";

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

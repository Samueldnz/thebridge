import { env } from "../config/env";

export interface CompetenceItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
}

export const defaultCompetences: CompetenceItem[] = [
  {
    id: "comp-ml-ai",
    name: "Inteligência Artificial & Machine Learning",
    slug: "inteligencia-artificial-machine-learning",
    category: "Ciência da Computação & Dados",
    description: "Algoritmos preditivos, redes neurais profundas, visão computacional e NLP.",
  },
  {
    id: "comp-biotech",
    name: "Biotecnologia & Engenharia Genética",
    slug: "biotecnologia-engenharia-genetica",
    category: "Ciências Biológicas & Saúde",
    description: "Edição gênica, culturas celulares, bioinsumos e fermentação industrial.",
  },
  {
    id: "comp-materials",
    name: "Nanotecnologia & Novos Materiais",
    slug: "nanotecnologia-novos-materiais",
    category: "Engenharia de Materiais",
    description: "Grafeno, nanocompósitos, polímeros biodegradáveis e revestimentos funcionais.",
  },
  {
    id: "comp-energy",
    name: "Energias Renováveis & Armazenamento",
    slug: "energias-renovaveis-armazenamento",
    category: "Energia & Sustentabilidade",
    description: "Células solares de perovskita, hidrogênio verde e baterias de lítio/sódio.",
  },
  {
    id: "comp-pharma",
    name: "Farmacologia & Formulação de Medicamentos",
    slug: "farmacologia-formulacao-medicamentos",
    category: "Ciências Biológicas & Saúde",
    description: "Sistemas de entrega de fármacos, síntese química e ensaios pré-clínicos.",
  },
  {
    id: "comp-agritech",
    name: "Agricultura de Precisão & Bioinsumos",
    slug: "agricultura-precisao-bioinsumos",
    category: "Ciências Agrárias",
    description: "Sensores de solo, controle biológico de pragas e monitoramento por satélite.",
  },
  {
    id: "comp-robotics",
    name: "Robótica Avançada & Automação Industrial",
    slug: "robotica-avancada-automacao-industrial",
    category: "Engenharia Mecatrônica",
    description: "Braços colaborativos, atuadores de alta precisão e controle em tempo real.",
  },
  {
    id: "comp-iot",
    name: "Internet das Coisas (IoT) & Sensores",
    slug: "internet-das-coisas-iot-sensores",
    category: "Ciência da Computação & Dados",
    description: "Redes industriais sem fio, sensoriamento remoto e sistemas embarcados.",
  },
  {
    id: "comp-cleantech",
    name: "Tratamento de Efluentes & Economia Circular",
    slug: "tratamento-efluentes-economia-circular",
    category: "Energia & Sustentabilidade",
    description: "Biorremediação, recuperação de metais nobres e filtragem por membranas.",
  },
];

export const competencesService = {
  async getCompetences(): Promise<CompetenceItem[]> {
    try {
      const res = await fetch(`${env.apiUrl}/competences`, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item: { id: string; name: string; slug?: string; category?: string; description?: string }) => ({
            id: item.id,
            name: item.name,
            slug: item.slug || item.id,
            category: item.category || "Inovação Tecnológica",
            description: item.description,
          }));
        }
      }
    } catch {
      // Fallback to local default catalog
    }
    return defaultCompetences;
  },
};

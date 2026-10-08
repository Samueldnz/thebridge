export interface BrasilApiCnpjData {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string;
  cnae_fiscal_descricao?: string;
  municipio?: string;
  uf?: string;
  descricao_situacao_cadastral?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cep?: string;
  ddd_telefone_1?: string;
}

export interface CnpjValidationResult {
  valid: boolean;
  data?: BrasilApiCnpjData;
  error?: string;
}

/**
 * Valida o formato numérico e os dígitos verificadores do CNPJ brasileiro
 */
export function isValidCnpjChecksum(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, "");
  if (clean.length !== 14) return false;
  if (/^(\d)\1+$/.test(clean)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum1 = 0;
  for (let i = 0; i < 12; i++) {
    sum1 += parseInt(clean[i]) * weights1[i];
  }
  const mod1 = sum1 % 11;
  const digit1 = mod1 < 2 ? 0 : 11 - mod1;

  if (digit1 !== parseInt(clean[12])) return false;

  let sum2 = 0;
  for (let i = 0; i < 13; i++) {
    sum2 += parseInt(clean[i]) * weights2[i];
  }
  const mod2 = sum2 % 11;
  const digit2 = mod2 < 2 ? 0 : 11 - mod2;

  return digit2 === parseInt(clean[13]);
}

/**
 * Consulta a BrasilAPI para validar o CNPJ junto à base da Receita Federal
 */
export async function validateCnpjWithBrasilApi(cnpjInput: string): Promise<CnpjValidationResult> {
  const clean = cnpjInput.replace(/\D/g, "");

  if (clean.length !== 14) {
    return {
      valid: false,
      error: "O CNPJ deve conter exatamente 14 dígitos.",
    };
  }

  if (!isValidCnpjChecksum(clean)) {
    return {
      valid: false,
      error: "Dígitos verificadores do CNPJ são inválidos.",
    };
  }

  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return {
          valid: false,
          error: "CNPJ não localizado na base pública da Receita Federal.",
        };
      }
      return {
        valid: false,
        error: `Serviço da Receita Federal retornou status ${res.status}. Tente novamente.`,
      };
    }

    const data: BrasilApiCnpjData = await res.json();
    return {
      valid: true,
      data,
    };
  } catch (err) {
    console.warn("Erro ao consultar BrasilAPI:", err);
    return {
      valid: false,
      error: "Falha na conexão com a BrasilAPI. Verifique sua conexão.",
    };
  }
}

/**
 * Extrai o domínio puro de uma URL (ex: "https://www.suzano.com.br/contato" -> "suzano.com.br")
 */
export function extractDomain(url: string): string {
  if (!url) return "";
  try {
    let clean = url.trim().toLowerCase();
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = "https://" + clean;
    }
    const parsed = new URL(clean);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0].trim();
  }
}

/**
 * Retorna a URL da logo corporativa com base no domínio do website
 */
export function getCompanyLogoUrl(website: string): string {
  const domain = extractDomain(website);
  if (!domain || !domain.includes(".")) return "";
  // Google's 128px high-resolution favicon service is globally reliable, fast and CORS-ready
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

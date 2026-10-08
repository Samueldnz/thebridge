/**
 * Serviço de Integração com Webhook do Discord para Notificações de Auditoria
 */

export const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1557660444892733450/ImsAEHpikmOlRinPL5ZN5_kpMIHRvzBG1mQmulGT_muKO7KxAjhmleOLC4Dr_N6UBgBO";

export interface ProfileAuditNotificationPayload {
  profileType: "COMPANY" | "RESEARCHER";
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  cnpjStatus?: string;
  razaoSocial?: string;
  industrySector?: string;
  university?: string;
  department?: string;
  roleTitle?: string;
  website?: string;
  lattes?: string;
  linkedin?: string;
  bio?: string;
  logoUrl?: string;
}

export const discordWebhookService = {
  /**
   * Envia notificação de perfil submetido para análise ao canal do Discord da equipe
   */
  async notifyProfileSubmitted(payload: ProfileAuditNotificationPayload): Promise<boolean> {
    const isCompany = payload.profileType === "COMPANY";
    const auditPanelUrl = typeof window !== "undefined"
      ? `${window.location.origin}/dashboard/admin/validacoes`
      : "https://thebridge-platform.com/dashboard/admin/validacoes";

    const fields = isCompany
      ? [
          {
            name: "🏢 Razão Social / Nome Fantasia",
            value: payload.razaoSocial || payload.name || "Não informado",
            inline: false,
          },
          {
            name: "📄 CNPJ",
            value: payload.cnpj
              ? `${payload.cnpj} ${payload.cnpjStatus ? `(${payload.cnpjStatus})` : ""}`
              : "Não informado",
            inline: true,
          },
          {
            name: "🏭 Setor de Atuação",
            value: payload.industrySector || "Não informado",
            inline: true,
          },
          {
            name: "👤 Responsável & Cargo",
            value: `${payload.name}${payload.roleTitle ? ` (${payload.roleTitle})` : ""}`,
            inline: true,
          },
          {
            name: "✉️ Contato",
            value: `${payload.email}${payload.phone ? ` • Tel: ${payload.phone}` : ""}`,
            inline: false,
          },
          {
            name: "🌐 Website Corporativo",
            value: payload.website ? `[Acessar Site](${payload.website})` : "Não informado",
            inline: true,
          },
          {
            name: "💼 LinkedIn",
            value: payload.linkedin ? `[Acessar Perfil](${payload.linkedin})` : "Não informado",
            inline: true,
          },
        ]
      : [
          {
            name: "🔬 Pesquisador(a)",
            value: payload.name || "Não informado",
            inline: true,
          },
          {
            name: "📄 CPF",
            value: payload.cpf || "Não informado",
            inline: true,
          },
          {
            name: "🎓 Titulação / Cargo",
            value: payload.roleTitle || "Não informado",
            inline: true,
          },
          {
            name: "🏛️ Universidade / Instituto",
            value: payload.university
              ? `${payload.university}${payload.department ? ` - ${payload.department}` : ""}`
              : "Não informado",
            inline: false,
          },
          {
            name: "✉️ Contato",
            value: `${payload.email}${payload.phone ? ` • Tel: ${payload.phone}` : ""}`,
            inline: false,
          },
          {
            name: "📜 Currículo Lattes",
            value: payload.lattes ? `[Visualizar Lattes CNPq](${payload.lattes})` : "Não informado",
            inline: true,
          },
          {
            name: "💼 LinkedIn",
            value: payload.linkedin ? `[Acessar LinkedIn](${payload.linkedin})` : "Não informado",
            inline: true,
          },
        ];

    if (payload.bio && payload.bio.trim().length > 0) {
      fields.push({
        name: isCompany ? "📝 Apresentação da Empresa" : "🔬 Resumo Científico & Linhas",
        value: payload.bio.length > 250 ? payload.bio.slice(0, 247) + "..." : payload.bio,
        inline: false,
      });
    }

    fields.push({
      name: "⚡ Ação para a Equipe de TI",
      value: `👉 [**Abrir Painel de Auditoria The Bridge**](${auditPanelUrl}) para aprovar ou solicitar ajustes.`,
      inline: false,
    });

    const body = {
      username: "The Bridge Auditoria",
      avatar_url: "https://thebridge-platform.com/favicon.ico",
      embeds: [
        {
          title: isCompany
            ? "🏢 Novo Perfil Corporativo Submetido para Verificação"
            : "🔬 Novo Perfil Acadêmico Submetido para Verificação",
          description: `Um novo perfil de **${isCompany ? "EMPRESA" : "PESQUISADOR"}** foi submetido na plataforma e está aguardando homologação do TI/Curadoria.`,
          color: isCompany ? 0x10b981 : 0x3b82f6, // Emerald or Blue
          fields,
          thumbnail: payload.logoUrl ? { url: payload.logoUrl } : undefined,
          footer: {
            text: "The Bridge • Sistema Integrado de Auditoria & Compliance",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      return response.ok;
    } catch (err) {
      console.warn("Falha ao enviar webhook do Discord:", err);
      return false;
    }
  },

  /**
   * Envia notificação de decisão da equipe (Aprovado ou Ajustes Solicitados)
   */
  async notifyAuditDecision(
    profileName: string,
    profileType: "COMPANY" | "RESEARCHER",
    decision: "APROVADO" | "RECUSADO",
    feedback?: string
  ): Promise<boolean> {
    const isApproved = decision === "APROVADO";
    const body = {
      username: "The Bridge Auditoria",
      avatar_url: "https://thebridge-platform.com/favicon.ico",
      embeds: [
        {
          title: isApproved
            ? `✅ Perfil Homologado e Certificado: ${profileName}`
            : `⚠️ Solicitação de Ajustes Enviada: ${profileName}`,
          description: isApproved
            ? `O perfil de **${profileName}** (${profileType}) foi validado e recebeu o selo de autenticidade oficial na plataforma.`
            : `Foram solicitados ajustes no perfil de **${profileName}** (${profileType}).\n\n**Motivo:** ${feedback || "Informações incompletas ou pendentes de confirmação."}`,
          color: isApproved ? 0x059669 : 0xd97706, // Green or Amber
          fields: [
            {
              name: "Data da Avaliação",
              value: new Date().toLocaleString("pt-BR"),
              inline: true,
            },
            {
              name: "Status do Perfil",
              value: isApproved ? "VERIFICADO (Ouro)" : "AJUSTES PENDENTES",
              inline: true,
            },
          ],
          footer: {
            text: "The Bridge • Auditoria Concluída",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      return response.ok;
    } catch (err) {
      console.warn("Falha ao enviar decisão para o Discord:", err);
      return false;
    }
  },

  /**
   * Envia notificação sobre decisão de solicitação de usuário (troca de email ou perfil)
   */
  async notifyUserRequestDecision(
    userName: string,
    requestType: string,
    decision: "ACEITA" | "RECUSADA",
    details?: string
  ): Promise<boolean> {
    const isAccepted = decision === "ACEITA";
    const body = {
      username: "The Bridge Auditoria",
      avatar_url: "https://thebridge-platform.com/favicon.ico",
      embeds: [
        {
          title: isAccepted
            ? `✅ Solicitação Aceita: ${userName}`
            : `❌ Solicitação Recusada: ${userName}`,
          description: `A solicitação de **${requestType}** do usuário **${userName}** foi ${isAccepted ? "atendida com sucesso" : "recusada"}.\n\n${details ? `**Parecer:** ${details}` : ""}`,
          color: isAccepted ? 0x059669 : 0xef4444, // Green or Red
          fields: [
            {
              name: "Tipo de Solicitação",
              value: requestType,
              inline: true,
            },
            {
              name: "Decisão",
              value: isAccepted ? "APROVADA" : "RECUSADA",
              inline: true,
            },
            {
              name: "Horário",
              value: new Date().toLocaleString("pt-BR"),
              inline: true,
            },
          ],
          footer: {
            text: "The Bridge • Gestão de Solicitações de Usuários",
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    try {
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      return response.ok;
    } catch (err) {
      console.warn("Falha ao enviar decisão de solicitação ao Discord:", err);
      return false;
    }
  },

  /**
   * Dispara um teste rápido do webhook
   */
  async sendTestMessage(): Promise<boolean> {
    try {
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "🔔 **The Bridge TI**: Teste de conexão do Webhook de Auditoria realizado com sucesso!",
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};

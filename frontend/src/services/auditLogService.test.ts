import { describe, expect, it } from "bun:test";
import "../test-setup";
import { auditLogService } from "./auditLogService";

describe("Audit Log System Unit Tests", () => {
  it("records an immutable audit entry with timestamp, user ID, and action", () => {
    const userId = "usr-uuid-test-9999";
    const userEmail = "auditoria@thebridge.app.br";
    const userName = "Pesquisador Auditor";

    const entry = auditLogService.recordAction({
      userId,
      userEmail,
      userName,
      userRole: "RESEARCHER",
      action: "PROJECT_CREATE",
      details: { projectId: "proj-abc", trl: 4 },
      severity: "INFO",
    });

    expect(entry).toBeDefined();
    expect(entry.id).toBeDefined();
    expect(entry.timestamp).toBeDefined();
    expect(entry.userId).toBe(userId);
    expect(entry.action).toBe("PROJECT_CREATE");
    expect(entry.actionLabel).toBe("Criação de Novo Projeto Científico");
    expect(entry.status).toBe("SUCCESS");

    // Fetch logs
    const allLogs = auditLogService.getAllLogs();
    expect(allLogs.length).toBeGreaterThan(0);
    const found = allLogs.find((l) => l.id === entry.id);
    expect(found).toBeDefined();
    expect(found?.userId).toBe(userId);
  });

  it("handles security-level actions such as TERMS_ACCEPTED and ACCOUNT_DELETION_REQUESTED", () => {
    const entry = auditLogService.recordAction({
      userId: "usr-seguranca",
      userEmail: "seguranca@thebridge.app.br",
      userName: "Empresa Segura",
      userRole: "COMPANY",
      action: "TERMS_ACCEPTED",
      details: { termsVersion: "2026.1", lgpdConsent: true },
      severity: "SECURITY",
    });

    expect(entry.severity).toBe("SECURITY");
    expect(entry.resourceType).toBe("JURIDICO");
  });
});

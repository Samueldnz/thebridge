import { describe, expect, it } from "bun:test";
import "../test-setup";
import { authService, calculateProfileTier, type User } from "./auth";

describe("Auth & Profile Service Unit Tests", () => {
  it("validates promotional coupon SBPMAT26 with 60 days trial and rejects invalid coupons", () => {
    const validResult = authService.validateCoupon("SBPMAT26");
    expect(validResult.valid).toBe(true);
    expect(validResult.trialMonths).toBe(2);
    expect(validResult.discountDescription).toContain("60 dias");

    const invalidResult = authService.validateCoupon("INVALID_CODE_999");
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.error).toBeDefined();

    const emptyResult = authService.validateCoupon("");
    expect(emptyResult.valid).toBe(false);
  });

  it("calculates profile tiers based on completion checklist score (Bronze, Prata, Ouro)", () => {
    const basicUser: User = {
      id: "usr-basic",
      name: "Pesquisador Básico",
      email: "basic@ufsc.br",
      profileType: "RESEARCHER",
    };

    const basicTier = calculateProfileTier(basicUser);
    expect(["BRONZE", "PRATA", "OURO"]).toContain(basicTier.tier);
    expect(basicTier.score).toBeGreaterThanOrEqual(0);

    const completeUser: User = {
      ...basicUser,
      university: "Universidade de São Paulo",
      department: "Química",
      lattes: "http://lattes.cnpq.br/1234567890123456",
      bio: "Pesquisador com 15 anos de experiência em nanomateriais e blendas poliméricas.",
      phone: "(11) 99999-9999",
      location: "São Paulo, SP",
      verificationStatus: "VERIFICADO",
    };

    const completeTier = calculateProfileTier(completeUser);
    expect(completeTier.score).toBeGreaterThan(basicTier.score);
  });
});

import { describe, expect, it } from "bun:test";
import "../test-setup";
import { router } from "./router";

describe("Application Router & Routes Audit", () => {
  it("defines the root layout with all mandatory user and dashboard routes", () => {
    expect(router.routes).toBeDefined();
    expect(router.routes.length).toBeGreaterThan(0);

    const rootRoute = router.routes[0];
    expect(rootRoute.children).toBeDefined();

    const childPaths = (rootRoute.children || []).map((r: any) => r.path);

    // Verify Public and Authentication routes
    expect(childPaths).toContain("/");
    expect(childPaths).toContain("/login");
    expect(childPaths).toContain("/cadastro");
    expect(childPaths).toContain("/matching");
    expect(childPaths).toContain("/conteudos");
    expect(childPaths).toContain("/solucoes");
    expect(childPaths).toContain("/nossa-historia");

    // Verify Dashboard routes
    expect(childPaths).toContain("/dashboard");
    expect(childPaths).toContain("/dashboard/projetos");
    expect(childPaths).toContain("/dashboard/projetos/novo");
    expect(childPaths).toContain("/dashboard/projetos/editar/:id");
    expect(childPaths).toContain("/dashboard/demandas");
    expect(childPaths).toContain("/dashboard/demandas/nova");
    expect(childPaths).toContain("/dashboard/demandas/editar/:id");
    expect(childPaths).toContain("/dashboard/matching");
    expect(childPaths).toContain("/dashboard/conexoes");
    expect(childPaths).toContain("/dashboard/notificacoes");
    expect(childPaths).toContain("/dashboard/perfil");
    expect(childPaths).toContain("/dashboard/admin/validacoes");

    // Catch-all 404 route
    expect(childPaths).toContain("*");
  });
});

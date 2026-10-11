import { useState, useEffect } from "react";
import { Cookie, ShieldCheck } from "lucide-react";
import { Button } from "./Button";
import { Icon } from "./Icon";

const COOKIE_CONSENT_STORAGE_KEY = "thebridge_cookie_consent_v1";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!saved) {
      setVisible(true);
    }

    const handleReopen = () => setVisible(true);
    window.addEventListener("thebridge:open-cookie-banner", handleReopen);
    return () => {
      window.removeEventListener("thebridge:open-cookie-banner", handleReopen);
    };
  }, []);

  const handleAccept = (mode: "ALL" | "ESSENTIAL_ONLY") => {
    const payload = {
      essential: true,
      functional: mode === "ALL",
      analytics: mode === "ALL",
      acceptedAt: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(payload));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de Privacidade e Uso de Cookies"
      className="fixed bottom-4 left-4 right-4 z-[450] mx-auto max-w-5xl rounded-3xl border border-border-subtle bg-surface-white p-5 md:p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-green-moss/15 text-brand-green-dark">
            <Icon icon={Cookie} size={22} />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-sm md:text-base font-bold text-text-primary">
                Privacidade, LGPD &amp; Uso de Cookies na The Bridge
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 font-heading text-[12px] font-bold text-emerald-900">
                <Icon icon={ShieldCheck} size={12} />
                Lei nº 13.709/2018
              </span>
            </div>
            <p className="font-body text-xs text-text-secondary leading-relaxed max-w-3xl">
              Utilizamos cookies estritamente necessários para segurança da sessão e autenticação, além de cookies funcionais e analíticos para aprimorar o algoritmo de compatibilidade tecnológica e sua experiência na plataforma. Você pode gerenciar suas preferências a qualquer momento na aba{" "}
              <strong className="text-text-primary">Jurídico</strong> do seu perfil ou consultar nossa{" "}
              <a href="/privacidade" className="font-semibold text-brand-green-moss hover:underline">
                Política de Privacidade
              </a>{" "}
              e{" "}
              <a href="/termos" className="font-semibold text-brand-green-moss hover:underline">
                Termos de Uso
              </a>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2.5 shrink-0">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => handleAccept("ESSENTIAL_ONLY")}
            className="text-xs font-bold cursor-pointer"
          >
            Apenas Essenciais
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => handleAccept("ALL")}
            className="bg-brand-green-dark text-brand-off-white text-xs font-bold cursor-pointer"
          >
            Aceitar Todos os Cookies
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";


import { ArrowRight, Menu, X } from "lucide-react";


import logo from "../../assets/brand/logo/TheBridge_Logo_Verde_2.svg";

import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { Icon } from "../ui/Icon";
import { authService } from "../../services/auth";

const navigationItems = [
  { label: "Soluções", href: "/solucoes" },
  { label: "Matching", href: "/matching" },
  { label: "Conteúdos", href: "/conteudos" },
  { label: "Nossa História", href: "/nossa-historia" },
  { label: "Contato", href: "/#contato" },
];



export function PublicHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    closeMenu();
    if (href.startsWith("/#") || href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace(/^\/?#/, "");
      if (location.pathname === "/") {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate(`/#${targetId}`);
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 150);
      }
    }
  };


  return (
    <header
      className={[
        "fixed inset-x-0 top-0",
        "z-[9999]",
        "isolate",
        "w-full",
        "border-b border-border-subtle",
        "bg-surface-primary",
      ].join(" ")}
    >
      <Container
        size="wide"
        className="relative flex min-h-[72px] items-center gap-6 lg:min-h-[76px]"
      >
        {/* Logo */}
        <Link
          to="/"
          aria-label="The Bridge — início"
          className="flex shrink-0 items-center"
          onClick={closeMenu}
        >
          <img
            src={logo}
            alt="The Bridge"
            className="h-auto w-[145px] lg:w-[158px]"
          />
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Navegação principal"
          className={[
            "hidden flex-1 items-center justify-center",
            "gap-5 xl:gap-7",
            "lg:flex",
          ].join(" ")}
        >
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={(e) => handleNavClick(item.href, e)}
              className={[
                "whitespace-nowrap",
                "font-heading text-sm font-medium",
                "text-text-primary",
                "transition-colors duration-200",
                "hover:text-brand-green-moss",
                "focus-visible:outline-2",
                "focus-visible:outline-offset-4",
                "focus-visible:outline-brand-green-moss",
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          {authService.isAuthenticated() ? (
            <Button
              size="sm"
              className="min-h-10 px-5 bg-brand-green-dark text-brand-off-white"
              onClick={() => navigate("/dashboard")}
            >
              Acessar Painel
              <Icon
                icon={ArrowRight}
                size={15}
                strokeWidth={1.75}
              />
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="px-4"
                onClick={() => navigate("/login")}
              >
                Entrar
              </Button>

              <Button
                size="sm"
                className="min-h-10 px-5"
                onClick={() => navigate("/cadastro")}
              >
                Criar conta
                <Icon
                  icon={ArrowRight}
                  size={15}
                  strokeWidth={1.75}
                />
              </Button>
            </>
          )}
        </div>


        {/* Mobile menu button */}
        <button
          type="button"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          className={[
            "relative ml-auto",
            "inline-flex h-11 w-11 items-center justify-center",
            "rounded-md",
            "text-text-primary",
            "transition-colors duration-200",
            "hover:bg-surface-secondary",
            "focus-visible:outline-2",
            "focus-visible:outline-offset-3",
            "focus-visible:outline-brand-green-moss",
            "lg:hidden",
          ].join(" ")}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <Icon
            icon={isMenuOpen ? X : Menu}
            size={24}
            strokeWidth={1.75}
          />
        </button>

        {/* Mobile navigation */}
        <div
          id="mobile-navigation"
          className={[
            "absolute inset-x-0 top-full",
            "z-[10000]",
            "border-b border-border-subtle",
            "bg-surface-primary",
            "shadow-md",
            "lg:hidden",
            isMenuOpen ? "block" : "hidden",
          ].join(" ")}
        >
          <nav
            aria-label="Navegação mobile"
            className="flex flex-col px-5 py-6 md:px-8"
          >
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={(e) => handleNavClick(item.href, e)}
                className={[
                  "border-b border-border-subtle",
                  "py-4",
                  "font-heading text-base font-medium",
                  "text-text-primary",
                  "transition-colors duration-200",
                  "first:pt-0",
                  "last:border-b-0",
                  "hover:text-brand-green-moss",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}

            <div className="flex flex-col gap-3 pt-6">
              {authService.isAuthenticated() ? (
                <Button
                  size="md"
                  className="w-full bg-brand-green-dark text-brand-off-white"
                  onClick={() => {
                    closeMenu();
                    navigate("/dashboard");
                  }}
                >
                  Acessar Painel
                  <Icon
                    icon={ArrowRight}
                    size={16}
                    strokeWidth={1.75}
                  />
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="md"
                    className="w-full"
                    onClick={() => {
                      closeMenu();
                      navigate("/login");
                    }}
                  >
                    Entrar
                  </Button>

                  <Button
                    size="md"
                    className="w-full"
                    onClick={() => {
                      closeMenu();
                      navigate("/cadastro");
                    }}
                  >
                    Criar conta

                    <Icon
                      icon={ArrowRight}
                      size={16}
                      strokeWidth={1.75}
                    />
                  </Button>
                </>
              )}
            </div>

          </nav>
        </div>
      </Container>
    </header>
  );
}
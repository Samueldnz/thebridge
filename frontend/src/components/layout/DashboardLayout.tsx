import { type ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FolderGit2,
  Home,
  LogOut,
  Menu,
  PlusCircle,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";

import logo from "../../assets/brand/logo/TheBridge_Logo_Horizontal.svg";
import { authService, calculateProfileTier } from "../../services/auth";
import { Container } from "../ui/Container";
import { Icon } from "../ui/Icon";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  actions,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(authService.getStoredUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const current = authService.getStoredUser();
    if (!current || !authService.isAuthenticated()) {
      navigate("/login");
    } else {
      setUser(current);
    }
  }, [navigate]);

  // Strict role guard: Researcher cannot access Company pages, Company cannot access Researcher pages
  useEffect(() => {
    if (!user) return;
    if (user.profileType === "RESEARCHER" && location.pathname.startsWith("/dashboard/demandas")) {
      navigate("/dashboard");
    } else if (user.profileType === "COMPANY" && location.pathname.startsWith("/dashboard/projetos")) {
      navigate("/dashboard");
    }
  }, [user, location.pathname, navigate]);

  const handleLogout = () => {
    authService.clearSession();
    navigate("/login");
  };

  const isResearcher = user?.profileType === "RESEARCHER";
  const userTier = user?.tier || calculateProfileTier(user).tier;

  // Dedicated navigation links separated strictly per profile
  const navLinks = isResearcher
    ? [
        {
          label: "Painel Geral",
          href: "/dashboard",
          icon: Home,
          active: location.pathname === "/dashboard",
        },
        {
          label: "Meus Projetos",
          href: "/dashboard/projetos",
          icon: FolderGit2,
          active: location.pathname === "/dashboard/projetos",
        },
        {
          label: "Meus Matches",
          href: "/dashboard/matching",
          icon: Sparkles,
          active: location.pathname === "/dashboard/matching",
        },
      ]
    : [
        {
          label: "Painel Geral",
          href: "/dashboard",
          icon: Home,
          active: location.pathname === "/dashboard",
        },
        {
          label: "Minhas Demandas",
          href: "/dashboard/demandas",
          icon: FolderGit2,
          active: location.pathname === "/dashboard/demandas",
        },
        {
          label: "Cadastrar Demanda",
          href: "/dashboard/demandas/nova",
          icon: PlusCircle,
          active: location.pathname === "/dashboard/demandas/nova",
        },
        {
          label: "Meus Matches",
          href: "/dashboard/matching",
          icon: Sparkles,
          active: location.pathname === "/dashboard/matching",
        },
      ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-text-primary flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface-primary/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
          {/* Logo & Public Site Link */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" aria-label="The Bridge Painel" className="flex items-center">
              <img src={logo} alt="The Bridge" className="h-8 w-auto md:h-9" />
            </Link>

            <span className="hidden md:inline-block h-4 w-px bg-border-subtle" />

            <Link
              to="/"
              className="hidden md:inline-flex items-center gap-1.5 font-body text-xs text-text-secondary hover:text-brand-green-moss transition-colors"
            >
              <Icon icon={ArrowLeft} size={13} />
              <span>Ver site público</span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((item) => {
              const IconComp = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  style={item.active ? { color: "#ffffff", backgroundColor: "#002025" } : undefined}
                  className={[
                    "relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2 font-heading text-xs font-semibold transition-all",
                    item.active
                      ? "bg-brand-green-dark !text-white shadow-xs font-bold"
                      : "text-text-secondary hover:bg-surface-secondary/70 hover:text-text-primary",
                  ].join(" ")}
                >
                  <Icon icon={IconComp} size={15} className={item.active ? "!text-white" : ""} />
                  <span className={item.active ? "!text-white font-bold" : ""}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile Info - CLICKABLE PROFILE CHIP WITH TIER BORDER */}
          <div className="flex items-center gap-3">
            {/* Active Coupon Badge */}
            {(user?.couponCode || user?.subscriptionStatus === "FREE_TRIAL") && (
              <div
                title="Acesso 100% gratuito por 2 meses liberado nesta conta"
                className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-purple-300 bg-purple-50 px-2.5 py-1 font-heading text-xs font-semibold text-purple-900 shadow-2xs select-none"
              >
                <Icon icon={Ticket} size={13} className="text-purple-600" />
                <span>Cortesia • 2 Meses Grátis</span>
              </div>
            )}

            {/* User Identity Chip - Clickable to Profile with Tier Border Avatar */}
            <Link
              to="/dashboard/perfil"
              title="Clique para acessar seu perfil"
              className="hidden md:flex items-center gap-2.5 rounded-full border border-border-subtle bg-surface-white pl-1.5 pr-3.5 py-1 text-xs hover:border-brand-green-moss hover:shadow-xs transition-all cursor-pointer group"
            >
              {/* Circular Avatar with Qualification Tier Border */}
              <div
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full bg-brand-green-dark text-[11px] font-bold text-white transition-transform group-hover:scale-105",
                  userTier === "OURO"
                    ? "ring-2 ring-amber-400 border-2 border-amber-500 shadow-xs"
                    : userTier === "PRATA"
                    ? "ring-2 ring-slate-300 border-2 border-slate-400 shadow-xs"
                    : "ring-2 ring-[#cd7f32] border-2 border-[#b87333] shadow-xs", // Bronze
                ].join(" ")}
              >
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "TB"}
              </div>
              <span className="font-heading font-semibold text-text-primary max-w-[140px] truncate leading-tight group-hover:text-brand-green-moss transition-colors">
                {user?.name || "Usuário"}
              </span>
            </Link>

            {/* Logout button */}
            <button
              type="button"
              onClick={handleLogout}
              title="Encerrar sessão"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-surface-white text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Icon icon={LogOut} size={16} />
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-subtle bg-surface-white text-text-primary"
            >
              <Icon icon={mobileMenuOpen ? X : Menu} size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border-subtle bg-surface-primary px-4 py-4 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <Link
                to="/dashboard/perfil"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
              >
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full bg-brand-green-dark text-xs font-bold text-white",
                    userTier === "OURO"
                      ? "ring-2 ring-amber-400 border-2 border-amber-500"
                      : userTier === "PRATA"
                      ? "ring-2 ring-slate-300 border-2 border-slate-400"
                      : "ring-2 ring-[#cd7f32] border-2 border-[#b87333]",
                  ].join(" ")}
                >
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "TB"}
                </div>
                <div>
                  <span className="font-heading text-xs font-bold text-text-primary block">
                    {user?.name || "Usuário"}
                  </span>
                </div>
              </Link>
            </div>

            <div className="flex flex-col gap-1">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={item.active ? { color: "#ffffff", backgroundColor: "#002025" } : undefined}
                  className={[
                    "flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all",
                    item.active
                      ? "bg-brand-green-dark !text-white font-bold"
                      : "text-text-primary hover:bg-surface-secondary",
                  ].join(" ")}
                >
                  <Icon icon={item.icon} size={15} className={item.active ? "!text-white" : ""} />
                  <span className={item.active ? "!text-white font-bold" : ""}>{item.label}</span>
                </Link>
              ))}
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-text-secondary hover:bg-surface-secondary"
              >
                <Icon icon={ArrowLeft} size={14} />
                <span>Voltar para o site público</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20">
        {(title || actions) && (
          <div className="border-b border-border-subtle bg-surface-white py-8">
            <Container size="wide">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {subtitle && (
                    <p className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-brand-green-moss">
                      {subtitle}
                    </p>
                  )}
                  {title && (
                    <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
                      {title}
                    </h1>
                  )}
                </div>
                {actions && <div className="shrink-0 flex items-center gap-3">{actions}</div>}
              </div>
            </Container>
          </div>
        )}

        <div className="mt-8">
          <Container size="wide">{children}</Container>
        </div>
      </main>

      {/* Authenticated Footer */}
      <footer className="border-t border-border-subtle bg-surface-white py-6">
        <Container size="wide">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-body text-text-secondary">
            <p>The Bridge © 2026 • Plataforma de Inovação Aberta e Matching Tecnológico</p>
            <div className="flex items-center gap-4">
              <Link to="/matching" className="hover:text-brand-green-moss">
                Sobre o Algoritmo
              </Link>
              <span>•</span>
              <Link to="/nossa-historia" className="hover:text-brand-green-moss">
                Nossa História
              </Link>
              <span>•</span>
              <Link to="/conteudos" className="hover:text-brand-green-moss">
                Conteúdos
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}

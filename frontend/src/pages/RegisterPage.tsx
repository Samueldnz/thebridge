import { useState, useId, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Mail,
  User as UserIcon,
} from "lucide-react";

import authHeroImage from "../assets/brand/photography/Untitled-6.jpg";
import logo from "../assets/brand/logo/TheBridge_Logo_Verde_2.svg";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { authService, type ProfileType } from "../services/auth";

export function RegisterPage() {
  const navigate = useNavigate();
  const [profileType, setProfileType] = useState<ProfileType>("RESEARCHER");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Accessible IDs
  const regNameId = useId();
  const regEmailId = useId();
  const regPasswordId = useId();
  const regConfirmPasswordId = useId();
  const agreeTermsId = useId();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage("Por favor, informe seu nome ou da sua instituição.");
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Por favor, informe um e-mail válido.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("As senhas informadas não coincidem.");
      return;
    }
    if (!agreeTerms) {
      setErrorMessage("É necessário aceitar os Termos de Uso e Política de Privacidade.");
      return;
    }

    try {
      setLoading(true);
      const res = await authService.register(
        {
          name: name.trim(),
          email: email.trim(),
          password,
          profileType,
        },
        true
      );
      setSuccessMessage(`Conta criada com sucesso! Seja bem-vindo(a), ${res.user.name}.`);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Erro inesperado ao criar conta.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-primary flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="border-b border-border-subtle bg-surface-primary px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-heading text-sm font-medium text-text-secondary transition-colors hover:text-brand-green-moss"
          >
            <Icon icon={ArrowLeft} size={18} />
            <span>Voltar para o site</span>
          </Link>

          <Link to="/" aria-label="The Bridge - Página inicial">
            <img src={logo} alt="The Bridge" className="h-7 w-auto md:h-8" />
          </Link>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 lg:p-12">
        <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-border-subtle bg-surface-primary shadow-xl lg:grid-cols-12">
          {/* Editorial Banner - Left Column */}
          <div className="relative hidden bg-brand-green-dark p-10 text-brand-off-white lg:col-span-5 lg:flex lg:flex-col lg:justify-between">
            {/* Background image with overlay */}
            <div className="absolute inset-0">
              <img
                src={authHeroImage}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover opacity-25"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-brand-green-dark via-brand-green-dark/80 to-brand-green-dark/60"
              />
            </div>

            {/* Top Logo replacing the old text badge */}
            <div className="relative z-10 flex items-center">
              <Link to="/" aria-label="The Bridge - Início">
                <img
                  src={logo}
                  alt="The Bridge"
                  className="h-10 w-auto brightness-0 invert drop-shadow"
                />
              </Link>
            </div>

            {/* Middle Quote */}
            <div className="relative z-10 my-auto py-12">
              <h2 className="font-display text-3xl font-bold leading-snug tracking-tight text-brand-off-white md:text-4xl">
                O elo que faltava entre pesquisa científica e mercado.
              </h2>
              <p className="mt-4 font-body text-sm leading-relaxed text-brand-off-white/80">
                Conecte-se com projetos acadêmicos, parcerias de P&amp;D e demandas de tecnologia através do nosso motor de inteligência de compatibilidade.
              </p>

              <div className="mt-8 space-y-3 font-body text-xs text-brand-off-white/90">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green-moss text-brand-off-white">
                    <Icon icon={CheckCircle2} size={13} />
                  </div>
                  <span>Taxonomia de competências com pesos inteligentes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green-moss text-brand-off-white">
                    <Icon icon={CheckCircle2} size={13} />
                  </div>
                  <span>Maturidade tecnológica calibrada em TRL e CRL</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green-moss text-brand-off-white">
                    <Icon icon={CheckCircle2} size={13} />
                  </div>
                  <span>Ecossistema com pesquisadores, empresas e laboratórios</span>
                </div>
              </div>
            </div>

            {/* Bottom info */}
            <div className="relative z-10 border-t border-brand-off-white/10 pt-4 font-body text-xs text-brand-off-white/60">
              The Bridge © 2026 • Transformando ciência em impacto real.
            </div>
          </div>

          {/* Form Area - Right Column */}
          <div className="flex flex-col justify-center p-6 md:p-10 lg:col-span-7 lg:p-12">
            {/* Feedback Alerts */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 font-body text-xs text-red-800"
              >
                <div className="flex items-center gap-2 font-semibold">
                  <span>Erro:</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="mb-6 rounded-xl border border-green-300 bg-green-50 p-4 font-body text-xs text-green-800"
              >
                <div className="flex items-center gap-2 font-semibold">
                  <Icon icon={CheckCircle2} size={16} />
                  <span>{successMessage}</span>
                </div>
              </div>
            )}

            {/* FORM: REGISTER */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
                  Crie sua conta
                </h1>
                <p className="mt-1 font-body text-xs text-text-secondary">
                  Escolha seu perfil e junte-se ao ecossistema The Bridge.
                </p>
              </div>

              {/* Profile Type Selector Cards */}
              <div className="space-y-1.5 pt-1">
                <label className="block font-heading text-xs font-semibold uppercase tracking-wider text-text-primary">
                  Selecione o seu perfil
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProfileType("RESEARCHER")}
                    className={[
                      "flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-all",
                      profileType === "RESEARCHER"
                        ? "border-brand-green-dark bg-brand-cream/30 ring-2 ring-brand-green-dark"
                        : "border-border-subtle bg-surface-primary hover:border-brand-green-moss/50",
                    ].join(" ")}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green-dark text-brand-off-white">
                      <Icon icon={GraduationCap} size={18} />
                    </div>
                    <span className="font-heading text-sm font-semibold text-text-primary">
                      Pesquisador
                    </span>
                    <span className="font-body text-[11px] leading-tight text-text-secondary">
                      Academia, cientistas e laboratórios
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileType("COMPANY")}
                    className={[
                      "flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-all",
                      profileType === "COMPANY"
                        ? "border-brand-green-dark bg-brand-cream/30 ring-2 ring-brand-green-dark"
                        : "border-border-subtle bg-surface-primary hover:border-brand-green-moss/50",
                    ].join(" ")}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green-dark text-brand-off-white">
                      <Icon icon={Building2} size={18} />
                    </div>
                    <span className="font-heading text-sm font-semibold text-text-primary">
                      Empresa
                    </span>
                    <span className="font-body text-[11px] leading-tight text-text-secondary">
                      Indústria, corporações e investidores
                    </span>
                  </button>
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label
                  htmlFor={regNameId}
                  className="block font-heading text-xs font-semibold uppercase tracking-wider text-text-primary mb-1"
                >
                  {profileType === "COMPANY" ? "Razão Social ou Nome da Empresa" : "Nome Completo"}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
                    <Icon icon={profileType === "COMPANY" ? Building2 : UserIcon} size={18} />
                  </span>
                  <input
                    id={regNameId}
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={profileType === "COMPANY" ? "Ex: BioTech Inovações S.A." : "Ex: Dra. Mariana Costa"}
                    className="w-full rounded-xl border border-border-subtle bg-surface-primary py-2.5 pl-11 pr-4 font-body text-sm text-text-primary placeholder:text-text-muted focus:border-brand-green-moss focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor={regEmailId}
                  className="block font-heading text-xs font-semibold uppercase tracking-wider text-text-primary mb-1"
                >
                  E-mail de contato
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
                    <Icon icon={Mail} size={18} />
                  </span>
                  <input
                    id={regEmailId}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={profileType === "COMPANY" ? "contato@empresa.com.br" : "pesquisador@instituto.edu.br"}
                    className="w-full rounded-xl border border-border-subtle bg-surface-primary py-2.5 pl-11 pr-4 font-body text-sm text-text-primary placeholder:text-text-muted focus:border-brand-green-moss focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                  />
                </div>
              </div>

              {/* Password Fields in Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={regPasswordId}
                    className="block font-heading text-xs font-semibold uppercase tracking-wider text-text-primary mb-1"
                  >
                    Senha (mín. 8 caracteres)
                  </label>
                  <div className="relative">
                    <input
                      id={regPasswordId}
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-border-subtle bg-surface-primary py-2.5 pl-3.5 pr-10 font-body text-sm text-text-primary placeholder:text-text-muted focus:border-brand-green-moss focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-primary"
                    >
                      <Icon icon={showPassword ? EyeOff : Eye} size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={regConfirmPasswordId}
                    className="block font-heading text-xs font-semibold uppercase tracking-wider text-text-primary mb-1"
                  >
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <input
                      id={regConfirmPasswordId}
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-border-subtle bg-surface-primary py-2.5 pl-3.5 pr-10 font-body text-sm text-text-primary placeholder:text-text-muted focus:border-brand-green-moss focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Ocultar senha" : "Exibir senha"}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-primary"
                    >
                      <Icon icon={showConfirmPassword ? EyeOff : Eye} size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms Acceptance */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  id={agreeTermsId}
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border-subtle text-brand-green-dark focus:ring-brand-green-moss"
                />
                <label htmlFor={agreeTermsId} className="font-body text-xs leading-snug text-text-secondary cursor-pointer">
                  Declaro que li e concordo com os{" "}
                  <button
                    type="button"
                    onClick={() => alert("Termos de Uso do The Bridge: plataforma de cooperação técnico-científica.")}
                    className="text-brand-green-moss underline hover:text-brand-green-dark"
                  >
                    Termos de Uso
                  </button>{" "}
                  e{" "}
                  <button
                    type="button"
                    onClick={() => alert("Política de Privacidade do The Bridge: conformidade com LGPD.")}
                    className="text-brand-green-moss underline hover:text-brand-green-dark"
                  >
                    Política de Privacidade
                  </button>
                  .
                </label>
              </div>

              {/* Submit Register */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full justify-center"
                  disabled={loading}
                >
                  {loading ? "Criando conta..." : "Criar minha conta"}
                  {!loading && <Icon icon={ArrowRight} size={16} />}
                </Button>
              </div>

              {/* Link to Login with the exact requested phrase */}
              <div className="pt-3 border-t border-border-subtle text-center">
                <p className="font-body text-xs text-text-secondary">
                  Já possui uma conta?{" "}
                  <Link
                    to="/login"
                    className="font-heading font-semibold text-brand-green-moss hover:underline"
                  >
                    Faça login aqui
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

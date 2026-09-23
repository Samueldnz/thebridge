import { useState, useId, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";

import authHeroImage from "../assets/brand/photography/Untitled-6.jpg";
import logo from "../assets/brand/logo/TheBridge_Logo_Verde_2.svg";
import { Button } from "../components/ui/Button";
import { Icon } from "../components/ui/Icon";
import { authService } from "../services/auth";

export function LoginPage() {
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Accessible IDs
  const emailId = useId();
  const passwordId = useId();
  const rememberMeId = useId();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage("Por favor, preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      const res = await authService.login(
        { email: email.trim(), password },
        rememberMe
      );
      setSuccessMessage(`Login realizado com sucesso! Bem-vindo(a), ${res.user.name}.`);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Erro inesperado ao realizar login.");
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

            {/* FORM: LOGIN */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
                  Acesse sua conta
                </h1>
                <p className="mt-1.5 font-body text-xs text-text-secondary">
                  Entre com seu e-mail e senha para acessar suas oportunidades e matches.
                </p>
              </div>

              <div className="space-y-4 pt-1">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor={emailId}
                    className="block font-heading text-xs font-semibold uppercase tracking-wider text-text-primary mb-1.5"
                  >
                    E-mail profissional ou acadêmico
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
                      <Icon icon={Mail} size={18} />
                    </span>
                    <input
                      id={emailId}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemplo@universidade.edu.br"
                      className="w-full rounded-xl border border-border-subtle bg-surface-primary py-3 pl-11 pr-4 font-body text-sm text-text-primary placeholder:text-text-muted focus:border-brand-green-moss focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor={passwordId}
                      className="block font-heading text-xs font-semibold uppercase tracking-wider text-text-primary"
                    >
                      Senha de acesso
                    </label>
                    <button
                      type="button"
                      onClick={() => alert("Recuperação de senha: entre em contato com o suporte ou aguarde a integração do serviço de e-mail.")}
                      className="font-body text-xs text-brand-green-moss hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-muted">
                      <Icon icon={Lock} size={18} />
                    </span>
                    <input
                      id={passwordId}
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-border-subtle bg-surface-primary py-3 pl-11 pr-11 font-body text-sm text-text-primary placeholder:text-text-muted focus:border-brand-green-moss focus:outline-none focus:ring-2 focus:ring-brand-green-moss/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-muted hover:text-text-primary"
                    >
                      <Icon icon={showPassword ? EyeOff : Eye} size={18} />
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    id={rememberMeId}
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-border-subtle text-brand-green-dark focus:ring-brand-green-moss"
                  />
                  <label htmlFor={rememberMeId} className="font-body text-xs text-text-secondary cursor-pointer">
                    Lembrar meu acesso neste dispositivo
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full justify-center"
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar na plataforma"}
                  {!loading && <Icon icon={ArrowRight} size={16} />}
                </Button>
              </div>

              {/* Link to Register */}
              <div className="pt-4 border-t border-border-subtle text-center">
                <p className="font-body text-xs text-text-secondary">
                  Ainda não possui uma conta?{" "}
                  <Link
                    to="/cadastro"
                    className="font-heading font-semibold text-brand-green-moss hover:underline"
                  >
                    Cadastre-se gratuitamente
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

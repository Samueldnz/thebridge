import { ArrowRight } from "lucide-react";
import {
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

import logo from "../../assets/brand/logo/TheBridge_Logo_Verde_2.svg";

import { Container } from "../ui/Container";
import { Icon } from "../ui/Icon";

const navigationGroups = [
  {
    title: "Explorar",
    links: [
      { label: "Soluções", href: "/solucoes" },
      { label: "Matching", href: "/matching" },
      { label: "Conteúdos", href: "/conteudos" },
    ],
  },

  {
    title: "The Bridge",
    links: [
      { label: "Nossa História", href: "/nossa-historia" },
      { label: "Contato", href: "/#contato" },
    ],
  },
];


const socialLinks = [
  {
    label: "LinkedIn",
    href: "#",
    icon: FaLinkedinIn,
  },
  {
    label: "Instagram",
    href: "#",
    icon: FaInstagram,
  },
  {
    label: "YouTube",
    href: "#",
    icon: FaYoutube,
  },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border-subtle bg-surface-primary">
      <Container size="wide">
        {/* Main footer */}
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.6fr] lg:gap-10 lg:py-20">
          {/* Brand */}
          <div className="max-w-sm">
            <a
              href="/"
              aria-label="The Bridge — início"
              className="inline-flex"
            >
              <img
                src={logo}
                alt="The Bridge"
                className="h-auto w-[175px]"
              />
            </a>

            <p className="mt-7 max-w-sm font-body text-sm leading-6 text-text-secondary">
              Conectando conhecimento, inovação e oportunidades para
              transformar potencial científico em impacto.
            </p>
          </div>

          {/* Navigation */}
          {navigationGroups.map((group) => (
            <div key={group.title}>
              <h2 className="font-heading text-sm font-semibold text-text-primary">
                {group.title}
              </h2>

              <nav
                aria-label={`Navegação — ${group.title}`}
                className="mt-5"
              >
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className={[
                          "font-body text-sm",
                          "text-text-secondary",
                          "transition-colors duration-200",
                          "hover:text-brand-green-moss",
                        ].join(" ")}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h2 className="font-heading text-sm font-semibold text-text-primary">
              Receba novidades
            </h2>

            <p className="mt-3 max-w-sm font-body text-sm leading-6 text-text-secondary">
              Assine nossa newsletter e fique por dentro das
              iniciativas, eventos e conteúdos.
            </p>

            <form
              className="mt-5"
              onSubmit={(event) => event.preventDefault()}
            >
              <div className="flex min-h-14 overflow-hidden rounded-md border border-border-subtle bg-surface-white">
                <label
                  htmlFor="footer-email"
                  className="sr-only"
                >
                  Seu e-mail
                </label>

                <input
                  id="footer-email"
                  name="email"
                  type="email"
                  placeholder="Seu e-mail"
                  autoComplete="email"
                  className={[
                    "min-w-0 flex-1",
                    "bg-transparent px-4",
                    "font-body text-sm text-text-primary",
                    "placeholder:text-text-secondary/70",
                    "outline-none",
                  ].join(" ")}
                />

                <button
                  type="submit"
                  aria-label="Assinar newsletter"
                  className={[
                    "m-1 flex w-12 shrink-0 items-center justify-center",
                    "rounded-md",
                    "bg-brand-green-dark text-brand-off-white",
                    "transition-colors duration-200",
                    "hover:bg-brand-brown",
                    "focus-visible:outline-2",
                    "focus-visible:outline-offset-2",
                    "focus-visible:outline-brand-green-moss",
                  ].join(" ")}
                >
                  <Icon
                    icon={ArrowRight}
                    size={18}
                    strokeWidth={1.75}
                  />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-6 border-t border-border-subtle py-7 md:flex-row md:items-center md:justify-between">
          <p className="font-body text-xs text-text-secondary">
            © {new Date().getFullYear()} The Bridge. Todos os direitos
            reservados.
          </p>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
            {/* Legal */}
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <a
                href="/privacidade"
                className="font-body text-xs text-text-secondary transition-colors hover:text-brand-green-moss"
              >
                Política de privacidade
              </a>

              <a
                href="/termos"
                className="font-body text-xs text-text-secondary transition-colors hover:text-brand-green-moss"
              >
                Termos de uso
              </a>
            </div>

            {/* Social */}
            <nav
              aria-label="Redes sociais"
              className="flex items-center gap-5"
            >
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={[
                    "text-text-primary",
                    "transition-colors duration-200",
                    "hover:text-brand-green-moss",
                    "focus-visible:outline-2",
                    "focus-visible:outline-offset-3",
                    "focus-visible:outline-brand-green-moss",
                  ].join(" ")}
                >
                  <social.icon
                    size={18}
                    aria-hidden="true"
                  />
                </a>
              ))}
            </nav>
          </div>
        </div>
      </Container>
    </footer>
  );
}
import { useTheme } from "@/components/ThemeProvider";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Globe, ExternalLink } from "lucide-react";
import anpgLogoColor from "@/assets/anpg-logo-color.svg";
import anpgLogoWhite from "@/assets/anpg-logo-white.svg";

const links = [
  { label: "Portal ANPG", href: "https://www.anpg.co.ao", external: true },
  { label: "Legislação Petrolífera", href: "https://www.anpg.co.ao/legislacao", external: true },
  { label: "Blocos & Concessões", href: "/", external: false },
  { label: "Relatórios", href: "/reports", external: false },
];

const contacts = [
  { icon: MapPin, text: "Rua Pedro de Castro Van-Dúnem Loy, Luanda, Angola" },
  { icon: Phone, text: "+244 222 337 957" },
  { icon: Mail, text: "info@anpg.co.ao" },
  { icon: Globe, text: "www.anpg.co.ao" },
];

export const InstitutionalFooter = () => {
  const { theme } = useTheme();

  return (
    <footer className="border-t border-border/50 bg-card/60 backdrop-blur-sm print:hidden">
      <div className="max-w-[1920px] 3xl:max-w-[2400px] mx-auto px-4 md:px-6 3xl:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <img
              src={theme === "dark" ? anpgLogoWhite : anpgLogoColor}
              alt="ANPG Logo"
              className="h-10 3xl:h-12"
            />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Agência Nacional de Petróleo, Gás e Biocombustíveis — entidade reguladora do sector petrolífero angolano.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Links Úteis</h4>
            <ul className="space-y-2">
              {links.map((link) =>
                link.external ? (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground/80 hover:text-primary transition-colors inline-flex items-center gap-1.5"
                    >
                      {link.label}
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </a>
                  </li>
                ) : (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-foreground/80 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contacts */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Contactos</h4>
            <ul className="space-y-2.5">
              {contacts.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <item.icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-5 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ANPG — Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            ANPG Concession Vision • Plataforma de Inteligência Petrolífera
          </p>
        </div>
      </div>
    </footer>
  );
};

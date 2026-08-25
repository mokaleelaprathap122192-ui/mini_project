import Link from 'next/link';
import {
  Github,
  FileText,
  BookOpen,
  Shield,
  Scale,
  LayoutDashboard,
  UploadCloud,
  BarChart3,
  Heart,
  Sparkles,
} from 'lucide-react';

const PLATFORM_LINKS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Upload', href: '/upload', icon: UploadCloud },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
];

const RESOURCE_LINKS = [
  { label: 'Documentation', href: '#', icon: BookOpen },
  { label: 'Model Card', href: '#', icon: FileText },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy', icon: Shield },
  { label: 'Terms of Service', href: '/terms', icon: Scale },
];

const TEAM = ['G.Vaishnavi', 'M.Surya Teja', 'M.Leela Prathap'];

export default function Footer() {
  return (
    <footer className="relative mt-20 px-6 sm:px-8">
      <div
        className="pointer-events-none absolute inset-x-0 -top-10 h-40 opacity-60"
        aria-hidden
      >
        <div className="mx-auto h-full max-w-5xl rounded-full bg-gradient-to-r from-neon-blue/10 via-neon-purple/15 to-neon-cyan/10 blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="glass rounded-3xl p-8 md:p-12 overflow-hidden">
          <div className="grid gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2 flex flex-col gap-5">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-blue via-neon-purple to-neon-cyan shadow-glow-purple">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="font-display text-lg font-bold tracking-tight">
                    Fairness<span className="gradient-text">Audit</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Cross-Lingual AI
                  </span>
                </div>
              </Link>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                An advanced model-driven audit engine for multilingual sentiment fairness across
                Indian languages. Powered by explainable AI, bias detection, and precision analytics.
              </p>
              <div className="flex items-center gap-2">
                {[Github, FileText, BookOpen].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-all hover:border-neon-purple/40 hover:text-neon-purple hover:shadow-glow-purple"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-5 font-display text-sm font-semibold uppercase tracking-widest text-foreground/90">
                Platform
              </h4>
              <ul className="flex flex-col gap-3">
                {PLATFORM_LINKS.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-neon-purple"
                    >
                      <Icon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-5 font-display text-sm font-semibold uppercase tracking-widest text-foreground/90">
                Resources
              </h4>
              <ul className="flex flex-col gap-3">
                {RESOURCE_LINKS.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-neon-blue"
                    >
                      <Icon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-5 font-display text-sm font-semibold uppercase tracking-widest text-foreground/90">
                Legal
              </h4>
              <ul className="flex flex-col gap-3">
                {LEGAL_LINKS.map(({ label, href, icon: Icon }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-neon-cyan"
                    >
                      <Icon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center">
            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              <div>
                © {new Date().getFullYear()} Cross-Lingual Fairness Audit Platform.
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Research Team:</span>
                {TEAM.map((name, i) => (
                  <span key={name} className="inline-flex items-center gap-1">
                    <span className="font-medium text-foreground/80">{name}</span>
                    {i < TEAM.length - 1 && <span className="opacity-40">·</span>}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className="py-8 text-center text-[11px] text-muted-foreground/70">
          Powered by the next generation of multilingual fairness auditing models.
        </div>
      </div>
    </footer>
  );
}

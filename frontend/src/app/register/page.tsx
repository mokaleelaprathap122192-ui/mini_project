'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  UserPlus,
  Loader2,
  User,
  Mail,
  Lock,
  Building2,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import NeuralBackground from '@/components/common/NeuralBackground';

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'researcher' as 'researcher' | 'student',
    organization: '',
    password: '',
    confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) return setError('Please enter your full name.');
    if (!form.email.trim()) return setError('Please enter your email.');
    if (!form.organization.trim()) return setError('Please enter your organization.');
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters long.');
    if (form.password !== form.confirm)
      return setError('Passwords do not match. Please re-confirm.');

    try {
      setLoading(true);
      await login(form.email, form.password, form.role);
      router.push('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions: {
    id: 'researcher' | 'student';
    label: string;
    description: string;
    accent: string;
  }[] = [
    {
      id: 'researcher',
      label: 'Researcher',
      description: 'Full benchmarks & exportable reports',
      accent: 'neon-purple',
    },
    {
      id: 'student',
      label: 'Student',
      description: 'Learning mode with assessments',
      accent: 'neon-blue',
    },
  ];

  const perks = [
    'Unlimited uploads & audits',
    '10+ Indian languages supported',
    'SHAP / LIME explainability',
    'Exportable PDF/CSV reports',
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <NeuralBackground />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute left-5 top-5 z-20"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-muted-foreground backdrop-blur-md transition-all hover:border-neon-purple/30 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Home
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_1fr]"
      >
        <div className="hidden lg:flex glass relative rounded-[2rem] p-8 sm:p-10 flex-col justify-between overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            aria-hidden
          >
            <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-neon-purple/20 blur-3xl" />
            <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-neon-blue/20 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-blue via-neon-purple to-neon-cyan shadow-glow-purple">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold">
                Fairness<span className="gradient-text">Audit</span>
              </span>
            </Link>
            <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
              Start your <span className="gradient-text">fairness journey</span> today
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Join hundreds of researchers and students auditing sentiment models across 10+
              Indian languages with explainable, bias-aware pipelines.
            </p>
          </div>

          <ul className="relative mt-8 grid gap-3">
            {perks.map((p, i) => (
              <motion.li
                key={p}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-neon-green" />
                <span className="text-sm text-foreground/90">{p}</span>
              </motion.li>
            ))}
          </ul>

          <div className="relative mt-8 rounded-2xl border border-neon-purple/20 bg-gradient-to-br from-neon-purple/10 to-neon-blue/10 p-5">
            <p className="text-xs uppercase tracking-widest text-neon-purple font-semibold mb-2">
              Research Team
            </p>
            <p className="text-sm text-foreground/90 leading-relaxed">
              Built by G.Vaishnavi, M.Surya Teja &amp; M.Leela Prathap — Dept. of AI, ML &amp;
              DS, Final Year Project.
            </p>
          </div>
        </div>

        <div className="glass relative rounded-[2rem] p-7 sm:p-10 overflow-hidden">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-50 blur-3xl"
            style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }}
          />

          <div className="relative">
            <div className="mb-7 flex flex-col">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                Create <span className="gradient-text">account</span>
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Takes less than a minute. No credit card required.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4.5 flex flex-col gap-4.5">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Dr. Jane Researcher"
                    className="!pl-11 !h-12"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Institutional email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@university.edu"
                    className="!pl-11 !h-12"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label>I am a…</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {roleOptions.map((opt) => {
                    const selected = form.role === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => update('role', opt.id)}
                        className={cn(
                          'group relative flex flex-col items-start gap-1.5 rounded-2xl border p-4 text-left transition-all',
                          selected
                            ? `border-${opt.accent}/50 bg-${opt.accent}/10 shadow-glow-purple`
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]',
                        )}
                      >
                        <div className="flex w-full items-center justify-between">
                          <Shield
                            className={cn(
                              'h-5 w-5',
                              selected ? `text-${opt.accent}` : 'text-muted-foreground',
                            )}
                          />
                          {selected && (
                            <CheckCircle2 className={`h-4 w-4 text-${opt.accent}`} />
                          )}
                        </div>
                        <span className="font-display text-sm font-semibold">
                          {opt.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground leading-snug">
                          {opt.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="org">Organization / University</Label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="org"
                    type="text"
                    autoComplete="organization"
                    placeholder="AI Research Lab / University Name"
                    className="!pl-11 !h-12"
                    value={form.organization}
                    onChange={(e) => update('organization', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    className="!pl-11 !h-12"
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    className="!pl-11 !h-12"
                    value={form.confirm}
                    onChange={(e) => update('confirm', e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-neon-red/30 bg-neon-red/10 px-4 py-3 text-sm text-neon-red"
                >
                  {error}
                </motion.div>
              )}

              <label className="inline-flex items-start gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-neon-purple"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    className="font-medium text-neon-purple hover:underline"
                  >
                    Terms of Service
                  </Link>{' '}
                  &amp;{' '}
                  <Link
                    href="/privacy"
                    className="font-medium text-neon-purple hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              <Button
                type="submit"
                size="lg"
                className="neon-btn w-full !h-12 mt-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Create account
                  </>
                )}
              </Button>
            </form>

            <p className="mt-7 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-neon-purple hover:text-neon-cyan transition-colors"
              >
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

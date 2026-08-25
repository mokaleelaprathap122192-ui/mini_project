'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Loader2, ArrowLeft, Sparkles, Mail, Lock, UserCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

import NeuralBackground from '@/components/common/NeuralBackground';

// Role selection removed — simplified single-role login form

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const guestLogin = useAuthStore((s) => s.guestLogin);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // role switching removed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    try {
      setLoading(true);
      await login(email, password, 'researcher');
      router.push('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    guestLogin();
    router.push('/dashboard');
  };

  // role-specific icon removed

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
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="absolute -inset-0.5 -z-10 rounded-[2rem] bg-gradient-to-br from-neon-blue/40 via-neon-purple/40 to-neon-cyan/40 opacity-50 blur-2xl" />

        <div className="glass relative rounded-[2rem] p-7 sm:p-10 overflow-hidden">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full opacity-50 blur-3xl"
            style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }}
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-24 h-60 w-60 rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle, #2563EB, transparent)' }}
          />

          <div className="relative mb-8 flex flex-col items-center text-center">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-blue via-neon-purple to-neon-cyan shadow-glow-purple">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold">
                Fairness<span className="gradient-text">Audit</span>
              </span>
            </Link>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Welcome <span className="gradient-text">back</span>
            </h1>
            <p className="mt-2 max-w-md text-sm sm:text-base text-muted-foreground">
              Sign in to continue auditing sentiment models across 10+ Indian languages.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@organization.edu"
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 pl-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">Password</label>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 pl-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 accent-neon-purple"
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-neon-purple hover:underline">Forgot password?</a>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl border border-neon-red/30 bg-neon-red/10 px-4 py-3 text-sm text-neon-red">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-3">
              <button type="submit" className="neon-btn w-full !h-12 flex items-center justify-center" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign in
                  </>
                )}
              </button>

              <button type="button" onClick={handleGuest} className="w-full rounded-lg border border-white/10 py-3 text-sm text-neon-cyan">
                <UserCircle2 className="inline-block h-4 w-4 mr-2" /> Continue as Guest
              </button>
            </div>
          </form>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-neon-purple hover:text-neon-cyan transition-colors"
              >
                Create one →
              </Link>
            </p>
            <button
              type="button"
              onClick={handleGuest}
              className="text-sm font-medium text-neon-cyan hover:underline text-center sm:text-right"
            >
              Or skip &amp; enter as Guest →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Sparkles, Clock, Eye } from 'lucide-react';
import NeuralBackground from '@/components/common/NeuralBackground';

export default function PrivacyPage() {
  const sections = [
    {
      heading: '1. Information We Collect',
      body:
        'We collect the minimal information necessary to provide our research platform services: your full name, institutional email, role (researcher / student / admin), and organization name when you create an account. When you use our audit pipelines, we process uploaded text, documents, and metadata you choose to provide. Guests may use the platform without an account, in which case no persistent personal information is stored.',
    },
    {
      heading: '2. How We Use Your Information',
      body:
        'Your data powers the fairness audit experience: authenticating your account, running multilingual sentiment, bias, and fairness pipelines, rendering personalized dashboards, generating exportable research reports, and sending rare operational communications (e.g., password resets). Uploaded datasets are processed in-session and, by default, are not shared with or visible to any third party. Aggregated, fully anonymized statistics may be retained for the purpose of improving model benchmarks and platform performance.',
    },
    {
      heading: '3. Data Storage & Retention',
      body:
        'Account data is encrypted at rest and retained for the lifetime of your account or as required for academic integrity. Audit results associated with your account may be exported by you at any time from the Reports view. Uploaded raw inputs are retained for 30 days after the last pipeline run, after which they are automatically purged unless you explicitly pin them to your workspace.',
    },
    {
      heading: '4. Academic Research Context',
      body:
        'This platform was developed as a Final Year Project by the Dept. of AI, ML & DS. Any anonymized, de-identified findings or insights produced on the platform may be used in academic publications, presentations, or open-source benchmark releases. No personally identifiable information (PII) will ever be included in such outputs without separate, explicit written consent.',
    },
    {
      heading: '5. Sharing & Third Parties',
      body:
        'We do not sell, rent, or trade your personal information. Model inference and fairness calculations run locally-first; any third-party LLM or translation providers you explicitly opt into may receive the snippets of text you submit for processing, subject to their respective privacy terms. We only share data with external parties when required by applicable law, valid legal process, or to protect the rights, safety, or integrity of the platform and its users.',
    },
    {
      heading: '6. Security',
      body:
        'We use industry-standard safeguards: encrypted transport (TLS 1.3+), per-tenant session isolation, password hashing with modern adaptive algorithms, role-based access controls (RBAC), and automated audit logging of sensitive actions. No system is perfectly secure, but we follow best practices and conduct periodic internal review of our controls.',
    },
    {
      heading: '7. Your Rights',
      body:
        'You may access, update, correct, export, or delete your personal data at any time from your account settings, or by emailing the research team. You may withdraw consent for non-essential processing and close your account permanently. Deletion requests are fulfilled within 30 days, except where longer retention is required by law.',
    },
    {
      heading: '8. Cookies & Local Storage',
      body:
        'We use essential cookies and a minimal amount of local storage (Zustand persist middleware) only to keep you signed in and preserve lightweight UI preferences between visits. We do not use third-party advertising cookies or cross-site tracking.',
    },
    {
      heading: '9. Children & Minors',
      body:
        'The platform is designed for use by researchers, educators, and undergraduate/graduate students. It is not directed to children under 16, and we do not knowingly collect information from minors of that age without verifiable parental or institutional consent.',
    },
    {
      heading: '10. Changes to This Policy',
      body:
        'We may update this Privacy Policy from time to time as the project evolves. Material changes will be posted prominently on this page with an updated "Last revised" date, and, where reasonable, we will notify active users via the in-app notification center or email.',
    },
    {
      heading: '11. Contact',
      body:
        'Questions, requests, or concerns regarding this policy or the handling of your information may be directed to the research team at privacy@fairness.ai. We aim to acknowledge every inquiry within 5 business days.',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
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

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-col items-center text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-neon-purple/30 bg-neon-purple/10 px-3.5 py-1 text-xs font-medium uppercase tracking-widest text-neon-purple">
            <Shield className="h-3.5 w-3.5" />
            Legal
          </div>
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-blue via-neon-purple to-neon-cyan shadow-glow-purple">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold">
              Fairness<span className="gradient-text">Audit</span>
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight">
            <span className="gradient-text">Privacy Policy</span>
          </h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Last revised: July 31, 2026
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Effective immediately
            </span>
          </div>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground leading-relaxed">
            Your privacy matters. This document explains what information the Cross-Lingual
            Fairness Audit Platform collects, how it is used, and the choices and rights you
            hold as a user of this academic research platform.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass relative rounded-3xl p-7 sm:p-10 md:p-14 overflow-hidden"
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, #2563EB, transparent)' }}
          />

          <article className="relative space-y-10">
            {sections.map((s, i) => (
              <motion.section
                key={s.heading}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12 + i * 0.04 }}
                className="scroll-mt-28"
              >
                <h2 className="mb-3 font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                  {s.heading}
                </h2>
                <p className="text-[15px] leading-[1.85] text-foreground/80">
                  {s.body}
                </p>
              </motion.section>
            ))}

            <div className="mt-12 rounded-2xl border border-neon-purple/20 bg-gradient-to-br from-neon-purple/10 via-transparent to-neon-blue/10 p-6 sm:p-8">
              <h3 className="mb-2 font-display text-lg font-semibold">
                Questions? Reach out to the Research Team.
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                We typically respond within 5 business days.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="neon-btn !py-2.5 !px-5 text-sm"
                >
                  Sign in to Platform
                </Link>
                <Link
                  href="/terms"
                  className="glass-btn !py-2.5 !px-5 text-sm"
                >
                  Read Terms of Service →
                </Link>
              </div>
            </div>
          </article>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 text-center text-xs text-muted-foreground"
        >
          © {new Date().getFullYear()} Cross-Lingual Fairness Audit Platform · Dept. of AI, ML
          &amp; DS · G.Vaishnavi, M.Surya Teja, M.Leela Prathap
        </motion.div>
      </div>
    </div>
  );
}

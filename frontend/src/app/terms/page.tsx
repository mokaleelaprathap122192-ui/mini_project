'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Scale, Sparkles, Clock, FileCheck } from 'lucide-react';
import NeuralBackground from '@/components/common/NeuralBackground';

export default function TermsPage() {
  const sections = [
    {
      heading: '1. Acceptance of Terms',
      body:
        'By accessing or using the Cross-Lingual Fairness Audit Platform ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms in full, you must discontinue use immediately. These Terms constitute a binding agreement between you and the research team operating the Platform (G.Vaishnavi, M.Surya Teja & M.Leela Prathap, Dept. of AI, ML & DS).',
    },
    {
      heading: '2. Purpose of the Platform',
      body:
        'The Platform is an academic research tool built as a Final Year Project. It provides an Explainable AI pipeline for multilingual sentiment analysis, fairness auditing, bias detection, fact-checking, explainability (SHAP / LIME), Knowledge Graphs, and GraphRAG across 10+ Indian languages. It is provided for educational, non-commercial research, and evaluative purposes.',
    },
    {
      heading: '3. Accounts, Roles & Access',
      body:
        'You may create an account as a Researcher or Student, or request Admin access. You may also explore the Platform as a Guest without registration. You are responsible for safeguarding your credentials and for all activity conducted under your account. You agree to provide accurate, truthful registration information and to update it when necessary. Accounts are non-transferable without written consent.',
    },
    {
      heading: '4. Acceptable Use',
      body:
        'You agree to use the Platform only for lawful, ethical, and academic purposes. Specifically, you will not: upload content that violates laws or third-party rights (including copyright, privacy, or intellectual property rights); introduce malicious code, vulnerabilities, or automated bulk-traffic; reverse-engineer, repackage, or redistribute proprietary components of the Platform; use the output to make consequential, high-stakes decisions without independent human verification; or interfere with the availability, integrity, or performance of the Platform for other users.',
    },
    {
      heading: '5. Uploaded Content & Intellectual Property',
      body:
        'You retain all ownership rights in content you upload to the Platform. By uploading content, you grant the Platform a limited, revocable, non-exclusive license to process, analyze, store temporarily, and render the content within your private, authenticated workspace solely for the purpose of running the requested fairness and sentiment audit pipelines. We do not claim any broader ownership or license over your uploaded datasets or source material.',
    },
    {
      heading: '6. AI Outputs — "As Is" Basis',
      body:
        'All outputs produced by the Platform — including sentiment polarities, fairness metrics, bias scores, fact verdicts, SHAP/LIME explanations, GraphRAG responses, and generated prose — are statistical in nature and are provided on an "AS IS" and "AS AVAILABLE" basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. The research team disclaims all warranties, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement. AI outputs are not guaranteed to be accurate, complete, fair, or unbiased, and must not be treated as legal, financial, medical, or other professional advice.',
    },
    {
      heading: '7. Research Outputs & Benchmarks',
      body:
        'De-identified, aggregated insights from Platform usage may be used in conference papers, journals, posters, talks, open datasets, and benchmark releases. No personally identifiable information (PII) or raw uploaded content will ever appear in such outputs. Where applicable, the research team will endeavor to cite or acknowledge institutional usage upon request.',
    },
    {
      heading: '8. Limitation of Liability',
      body:
        'To the maximum extent permitted by applicable law, in no event shall the research team, its affiliated institution, or contributors be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, or any loss of profit, data, use, goodwill, or other intangible losses, arising out of or related to your access, use, or inability to use the Platform, even if advised of the possibility of such damages. In no event shall the aggregate total liability of the research team for any and all claims exceed one thousand U.S. dollars (USD 1,000) or the equivalent in local currency.',
    },
    {
      heading: '9. Indemnification',
      body:
        'You agree to defend, indemnify, and hold harmless the research team, its institution, advisors, and contributors from and against any and all claims, damages, obligations, losses, liabilities, costs, debt, and expenses (including reasonable attorneys\' fees) arising from your use of and access to the Platform in violation of these Terms, or from any violation of rights of any third party attributable to your content or your conduct.',
    },
    {
      heading: '10. Modifications & Termination',
      body:
        'The research team reserves the right to modify, suspend, or discontinue the Platform (or any feature) at any time, with or without notice, for academic, security, or operational reasons. We also reserve the right to terminate or restrict access to accounts that violate these Terms, pose a security or integrity risk, or are otherwise detrimental to the Platform community, without liability.',
    },
    {
      heading: '11. Governing Law & Disputes',
      body:
        'These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any dispute arising out of or relating to these Terms shall first be resolved through good-faith informal discussion with the research team, and if unresolved, shall be subject to the exclusive jurisdiction of the courts located in the city of the principal affiliated institution.',
    },
    {
      heading: '12. Severability & Entire Agreement',
      body:
        'If any provision of these Terms is held to be unenforceable or invalid, such provision shall be adjusted and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law, and the remaining provisions shall remain in full force and effect. These Terms, together with the Privacy Policy, constitute the entire agreement between you and the research team regarding the Platform.',
    },
    {
      heading: '13. Contact',
      body:
        'For legal inquiries, takedown requests, reports of abuse, or questions about these Terms, please contact the research team at legal@fairness.ai. Acknowledged issues will be triaged and responded to within 7 business days.',
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
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3.5 py-1 text-xs font-medium uppercase tracking-widest text-neon-cyan">
            <Scale className="h-3.5 w-3.5" />
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
            <span className="gradient-text">Terms of Service</span>
          </h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Last revised: July 31, 2026
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileCheck className="h-3.5 w-3.5" />
              Binding upon use
            </span>
          </div>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground leading-relaxed">
            Please read these terms carefully before using the Cross-Lingual Fairness Audit
            Platform. Using the Platform means you accept these Terms in full.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="glass relative rounded-3xl p-7 sm:p-10 md:p-14 overflow-hidden"
        >
          <div
            className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full opacity-40 blur-3xl"
            style={{ background: 'radial-gradient(circle, #06B6D4, transparent)' }}
          />
          <div
            className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }}
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

            <div className="mt-12 rounded-2xl border border-neon-blue/20 bg-gradient-to-br from-neon-blue/10 via-transparent to-neon-purple/10 p-6 sm:p-8">
              <h3 className="mb-2 font-display text-lg font-semibold">
                Ready to run an audit?
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Sign in, or try Guest mode instantly.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/login" className="neon-btn !py-2.5 !px-5 text-sm">
                  Sign in / Register
                </Link>
                <Link
                  href="/privacy"
                  className="glass-btn !py-2.5 !px-5 text-sm"
                >
                  Read Privacy Policy →
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

'use client';

import { motion } from 'framer-motion';
import NeuralBackground from '@/components/common/NeuralBackground';
import Hero from '@/components/landing/Hero';

import FeatureCards from '@/components/landing/FeatureCards';
import Footer from '@/components/landing/Footer';
import { ChevronDown } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <NeuralBackground />

      <main className="relative z-10">
        <Hero />
        <FeatureCards />
      </main>

      <div className="relative z-10">
        <Footer />
      </div>

      {/* Scroll widget removed */}
    </div>
  );
}

"use client";

import { Html, useProgress } from '@react-three/drei';
import { motion } from 'framer-motion';

export default function LoadingProgress() {
  const { progress, active } = useProgress();

  if (!active) return null;

  return (
    <Html center>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="flex flex-col items-center gap-4 select-none"
      >
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'var(--color-glass-border)' }} />
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="30"
              fill="none"
              stroke="url(#fire-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 30}`}
              strokeDashoffset={`${2 * Math.PI * 30 * (1 - progress / 100)}`}
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient id="fire-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff9f1c" />
                <stop offset="50%" stopColor="#ff7b33" />
                <stop offset="100%" stopColor="#ff5630" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>{Math.round(progress)}%</span>
          </div>
        </div>
        <p className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-text-muted)' }}>
          Summoning Charizard...
        </p>
      </motion.div>
    </Html>
  );
}

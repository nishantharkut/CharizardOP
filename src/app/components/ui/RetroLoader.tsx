"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RetroLoaderProps {
  onComplete: () => void;
  show: boolean;
}

export default function RetroLoader({ onComplete, show }: RetroLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState('INITIALIZING...');

  const loadingTexts = [
    'INITIALIZING...',
    'LOADING ASSETS...',
    'PREPARING 3D MODELS...',
    'OPTIMIZING PERFORMANCE...',
    'ALMOST READY...',
    'WELCOME BACK!'
  ];

  useEffect(() => {
    if (!show) return;

    let progressInterval: NodeJS.Timeout;
    let textInterval: NodeJS.Timeout;

    // Progress animation
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          // Complete loading when progress reaches 100%
          setTimeout(onComplete, 200);
          return 100;
        }
        return prev + 2; // Fast progress increment
      });
    }, 30); // Fast interval for smooth animation

    // Text cycling
    textInterval = setInterval(() => {
      setCurrentText(prev => {
        const currentIndex = loadingTexts.indexOf(prev);
        const nextIndex = (currentIndex + 1) % loadingTexts.length;
        return loadingTexts[nextIndex];
      });
    }, 250); // Fast text cycling

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ 
          background: 'linear-gradient(45deg, #000000, #1a1a2e, #16213e)',
          fontFamily: 'monospace'
        }}
      >
        {/* Retro Grid Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(cyan 1px, transparent 1px),
              linear-gradient(90deg, cyan 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            animation: 'retroGrid 2s linear infinite'
          }}
        />

        {/* Main Content */}
        <div className="relative z-10 text-center">
          {/* Title */}
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-8 retro-text"
            style={{ 
              color: '#00ffff',
              textShadow: '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff',
              fontFamily: 'monospace'
            }}
          >
            NISHANT.EXE
          </motion.h1>

          {/* Progress Bar Container */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <div 
              className="w-80 h-4 mx-auto border-2 rounded-none relative overflow-hidden"
              style={{ borderColor: '#00ffff' }}
            >
              {/* Progress Fill */}
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                style={{ 
                  width: `${progress}%`,
                  boxShadow: '0 0 10px #00ffff'
                }}
                transition={{ duration: 0.1 }}
              />
              
              {/* Progress Text */}
              <div 
                className="absolute inset-0 flex items-center justify-center text-black font-bold text-sm"
                style={{ mixBlendMode: 'difference' }}
              >
                {progress}%
              </div>
            </div>
          </motion.div>

          {/* Loading Text */}
          <motion.p 
            key={currentText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-lg font-mono tracking-wider"
            style={{ 
              color: '#00ffff',
              textShadow: '0 0 5px #00ffff'
            }}
          >
            {currentText}
          </motion.p>

          {/* Retro Decoration */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex justify-center space-x-2"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-3 h-3 border border-cyan-400"
                style={{ 
                  backgroundColor: progress > (i * 20) ? '#00ffff' : 'transparent',
                  boxShadow: progress > (i * 20) ? '0 0 5px #00ffff' : 'none'
                }}
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{ 
                  duration: 0.8,
                  delay: i * 0.1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Scanlines Effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.05) 2px, rgba(0, 255, 255, 0.05) 4px)',
            animation: 'scanlines 0.1s linear infinite'
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

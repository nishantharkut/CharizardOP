"use client";

import { motion } from 'framer-motion';

export default function About() {
  return (
    <section id="about" className="relative py-28">
      <div className="max-w-5xl mx-auto px-6 md:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-8"
          style={{ color: 'var(--color-text)' }}
        >
          About Me
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-lg leading-relaxed max-w-3xl"
          style={{ color: 'var(--color-text-muted)' }}
        >
          I am a multi-disciplinary creator blending engineering and design to craft immersive, performant web experiences. From <span className="font-medium" style={{ color: 'var(--color-text)' }}>frontend</span> micro-interactions and visually rich <span className="font-medium" style={{ color: 'var(--color-text)' }}>3D interfaces</span> to scalable <span className="font-medium" style={{ color: 'var(--color-text)' }}>backend architecture</span>, I enjoy owning the full stack. My creative background in <span className="font-medium" style={{ color: 'var(--color-text)' }}>UI/UX</span>, <span className="font-medium" style={{ color: 'var(--color-text)' }}>graphic design</span>, and <span className="font-medium" style={{ color: 'var(--color-text)' }}>video editing</span> helps me ship cohesive, branded experiences. I'm continuously exploring <span className="font-medium" style={{ color: 'var(--color-text)' }}>cybersecurity practices</span> and leveraging emerging <span className="font-medium" style={{ color: 'var(--color-text)' }}>AI/ML</span> tools to accelerate development and creativity.
        </motion.p>
      </div>
    </section>
  );
}

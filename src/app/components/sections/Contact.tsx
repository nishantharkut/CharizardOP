"use client";

import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <section id="contact" className="relative py-28">
      <div className="max-w-4xl mx-auto px-6 md:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-8"
          style={{ color: 'var(--color-text)' }}
        >
          Get In Touch
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65 }}
          className="text-lg mb-8 max-w-2xl"
          style={{ color: 'var(--color-text-muted)' }}
        >
          I'm open to collaborations, freelance opportunities, or just a good conversation about emerging tech, design systems, or creative 3D on the web.
        </motion.p>
        <form className="grid gap-6 max-w-xl">
          <div className="grid gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Name</label>
            <input 
              type="text" 
              className="glass-input px-4 py-3 text-sm" 
              placeholder="Ash Ketchum"
              style={{ color: 'var(--color-text)' }}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Email</label>
            <input 
              type="email" 
              className="glass-input px-4 py-3 text-sm" 
              placeholder="you@example.com"
              style={{ color: 'var(--color-text)' }}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Message</label>
            <textarea 
              rows={4} 
              className="glass-input px-4 py-3 text-sm resize-none" 
              placeholder="Let's build something amazing..."
              style={{ color: 'var(--color-text)' }}
            />
          </div>
          <button 
            type="submit" 
            className="justify-self-start glass-button px-8 py-3 font-semibold text-sm transition-all duration-300 fire-glow"
            style={{ 
              background: 'var(--color-accent-gradient, var(--color-accent))',
              color: 'var(--color-button-text)',
              border: 'none'
            }}
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}

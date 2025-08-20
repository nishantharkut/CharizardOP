"use client";

import { motion } from 'framer-motion';

const skillGroups: { title: string; items: string[] }[] = [
  { title: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'TailwindCSS', 'Three.js'] },
  { title: 'Backend', items: ['Node.js', 'Express', 'Prisma', 'PostgreSQL', 'REST', 'GraphQL'] },
  { title: 'UI / UX', items: ['Wireframing', 'Figma', 'Prototyping', 'Accessibility', 'Design Systems'] },
  { title: 'Creative', items: ['After Effects', 'Premiere Pro', 'Illustrator', 'Blender'] },
  { title: 'Security', items: ['OWASP', 'Auth', 'Encryption', 'Threat Modeling'] },
  { title: 'AI / ML', items: ['Python', 'Pandas', 'TensorFlow', 'LLMs Basics'] },
];

export default function Skills() {
  return (
    <section id="skills" className="relative py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold mb-12"
          style={{ color: 'var(--color-text)' }}
        >
          Skills Stack
        </motion.h2>
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group, i) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.55, delay: i * 0.05 }}
              className="group glass-card p-6 overflow-hidden"
            >
              <div className="absolute inset-0 rounded-2xl card-hover-effect" />
              <h3 className="font-semibold mb-4 text-lg tracking-wide" style={{ color: 'var(--color-accent)' }}>{group.title}</h3>
              <ul className="flex flex-wrap gap-2">
                {group.items.map(item => (
                  <li 
                    key={item} 
                    className="text-xs px-3 py-1 rounded-full glass-button transition-all duration-300"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

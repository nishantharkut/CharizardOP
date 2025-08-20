"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const roles = [
  'Frontend Developer',
  'Backend Developer', 
  'Full Stack Engineer',
  'UI / UX Designer',
  'Graphic Designer',
  'Video Editor',
  'Cybersecurity Enthusiast',
  'AI / ML Explorer'
];

interface TypewriterRolesProps {
  interval?: number;
}

export default function TypewriterRoles({ interval = 3000 }: TypewriterRolesProps) {
  const [roleIndex, setRoleIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    const currentRole = roles[roleIndex];
    
    const typeSpeed = isDeleting ? 50 : 100;
    const pauseTime = isDeleting ? 500 : interval;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing forward
        if (charIndex < currentRole.length) {
          setDisplayText(currentRole.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        // Deleting backward
        if (charIndex > 0) {
          setDisplayText(currentRole.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          // Finished deleting, move to next role
          setIsDeleting(false);
          setRoleIndex((roleIndex + 1) % roles.length);
        }
      }
    }, typeSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, roleIndex, interval]);

  return (
    <div className="h-8 md:h-10 relative overflow-hidden font-medium tracking-wide flex items-center justify-center lg:justify-start">
      <div className="flex items-center">
        <span 
          className="bg-clip-text text-transparent"
          style={{
            background: 'var(--color-accent-gradient, var(--color-accent))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}
        >
          {displayText}
        </span>
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
          className="ml-1 bg-clip-text text-transparent"
          style={{
            background: 'var(--color-accent-gradient, var(--color-accent))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}
        >
          |
        </motion.span>
      </div>
    </div>
  );
}

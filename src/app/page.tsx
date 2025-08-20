import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Skills from './components/sections/Skills';
import Projects from './components/sections/Projects';
import Contact from './components/sections/Contact';
import Bento from './components/sections/Bento';
import Experience from './components/sections/Experience';



export default function Home() {
  return (
    <main className="relative w-full min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <div className="section-divider my-8 sm:my-12 md:my-16" />
      <Bento />
      <div className="section-divider my-12 sm:my-16 md:my-20" />
      {/* <About /> */}
      <Experience />
      <div className="section-divider my-8 sm:my-12 md:my-16" />
      <Skills />
      <Projects />
      <Contact />
      <footer className="py-16 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
        © {new Date().getFullYear()} Your Name. All rights reserved.
      </footer>
    </main>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ExperienceItem {
  position: string;
  company: string;
  year: string;
  description: string;
}

const experienceData: ExperienceItem[] = [
  {
    position: "Senior web developer",
    company: "Blue Cube Digital",
    year: "2017",
    description: "Developed and managed web projects, including frontend/backend, CMS dashboards, and responsive, accessible web pages with PHP, MySQL, and JavaScript."
  },
  {
    position: "Associate Solution Leader",
    company: "Brane Enterprises",
    year: "2020",
    description: "Built web features, product prototypes, and reusable components/microservices, implemented UI improvements and 3D UI interface compatible with Typescript."
  },
  {
    position: "Freelance & Upskilling",
    company: "Freelance",
    year: "NOW",
    description: "During this period, I worked as a freelancer for various clients, providing 3D and web services, while actively upskilling also in multiple areas increasing my Techstack."
  }
];

const Experience = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const sparkRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Timeline growth animation
      gsap.fromTo(
        timelineRef.current,
        { height: "0%" },
        {
          height: "100%",
          duration: 1.5,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "bottom 30%",
            scrub: 1,
          },
        }
      );

      // Bomb fuse spark effect
      gsap.fromTo(
        sparkRef.current,
        { 
          top: "0%",
          scale: 0.8,
          opacity: 0.5
        },
        {
          top: "100%",
          scale: 1,
          opacity: 1,
          duration: 1.5,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "bottom 30%",
            scrub: 0.5,
          },
        }
      );

      // Items fade in as you scroll
      itemsRef.current.forEach((item, index) => {
        if (item) {
          gsap.fromTo(
            item,
            {
              opacity: 0,
              y: 20,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: item,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative w-full py-8 sm:py-12 md:py-20 px-3 sm:px-4 mt-8 sm:mt-12 md:mt-16 lg:mt-20 mb-4 sm:mb-8 md:mb-12 lg:mb-16"
      style={{ zIndex: 1 }}
      id="experience-section"
    >
      <div className="max-w-5xl mx-auto">
        {/* Title */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20 lg:mb-24">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-light leading-tight">
            <span className="text-white">My career</span>{' '}
            <span className="text-[#FD7D24] font-light">&</span>
            <br />
            <span className="text-[#FF9C54]">experience</span>
          </h2>
        </div>

        {/* Experience Timeline */}
        <div className="relative">
          {/* Timeline - Mobile: Left positioned, Desktop: Center */}
          <div 
            ref={timelineRef}
            className="absolute left-6 md:left-1/2 md:-translate-x-1/2 w-[2px] h-full bg-gradient-to-b from-[#FD7D24] to-transparent"
          />
          
          {/* Spark Effect - Mobile: Left positioned, Desktop: Center */}
          <div 
            ref={sparkRef}
            className="absolute left-[23px] md:left-1/2 md:-translate-x-1/2 w-3 h-3 z-10"
            style={{
              background: '#FFD970',
              borderRadius: '50%',
              filter: 'blur(1px)',
              boxShadow: '0 0 8px 2px rgba(255, 217, 112, 0.8), 0 0 12px 5px rgba(253, 125, 36, 0.6)',
              animation: 'sparkle 0.6s ease-out infinite alternate'
            }}
          />

          {/* Experience Items */}
          <div className="relative md:pb-20">
            {experienceData.map((item, index) => (
              <div
                key={index}
                ref={(el) => { itemsRef.current[index] = el; }}
                className={`mb-12 sm:mb-16 md:mb-20 lg:mb-28 relative ${
                  // Mobile: Always left aligned with padding, Desktop: Alternating
                  `pl-12 md:pl-0 ${
                    index % 2 === 0 
                    ? 'md:text-right md:pr-[calc(50%+40px)]' 
                    : 'md:text-left md:pl-[calc(50%+40px)]'
                  }`
                }`}
              >
                {/* Timeline Dot - Mobile only */}
                <div className="absolute left-[15px] top-4 md:hidden w-4 h-4 rounded-full bg-[#FD7D24] border-2 border-white shadow-lg z-10" />

                <div className="w-full">
                  {/* Position & Year - Desktop (keep exactly as is) */}
                  <div className="hidden md:flex md:justify-between md:items-baseline md:mb-6">
                    {index % 2 === 0 ? (
                      <>
                        <div className="text-5xl text-[#FF9C54] font-light">{item.year}</div>
                        <div>
                          <h3 className="text-3xl text-white font-light mb-2">{item.position}</h3>
                          <h4 className="text-xl text-[#FD7D24] font-light">{item.company}</h4>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <h3 className="text-3xl text-white font-light mb-2">{item.position}</h3>
                          <h4 className="text-xl text-[#FD7D24] font-light">{item.company}</h4>
                        </div>
                        <div className="text-5xl text-[#FF9C54] font-light">{item.year}</div>
                      </>
                    )}
                  </div>

                  {/* Position & Year - Mobile (improved layout) */}
                  <div className="md:hidden mb-4 bg-gray-900/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl text-white font-light leading-tight">{item.position}</h3>
                        <h4 className="text-base sm:text-lg text-[#FD7D24] font-light mt-1">{item.company}</h4>
                      </div>
                      <div className="text-2xl sm:text-3xl text-[#FF9C54] font-light ml-4 flex-shrink-0">{item.year}</div>
                    </div>
                    {/* Description - Mobile */}
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">{item.description}</p>
                  </div>

                  {/* Description - Desktop only */}
                  <p className="hidden md:block text-gray-300 text-sm md:text-base">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes sparkle {
          0% {
            opacity: 0.6;
            transform: translate(-50%, 0) scale(0.8);
            box-shadow: 0 0 5px 2px rgba(255, 217, 112, 0.5), 0 0 8px 4px rgba(253, 125, 36, 0.4);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1.2);
            box-shadow: 0 0 10px 4px rgba(255, 217, 112, 0.8), 0 0 20px 6px rgba(253, 125, 36, 0.6),
                        0 0 30px 10px rgba(253, 125, 36, 0.2);
          }
        }

        @media (max-width: 767px) {
          #experience-section {
            overflow-x: hidden;
          }
          
          /* Fix for very small screens */
          @media (max-width: 320px) {
            #experience-section {
              padding-left: 0.75rem;
              padding-right: 0.75rem;
            }
          }
        }

        /* Tablet adjustments */
        @media (min-width: 640px) and (max-width: 767px) {
          #experience-section .timeline-content {
            padding-left: 3.5rem;
          }
        }

        /* Ensure smooth transitions between breakpoints */
        @media (min-width: 768px) {
          .timeline-mobile-layout {
            display: none;
          }
        }
      `}</style>
    </section>
  );
};

export default Experience;
"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { 
  ArrowTopRightOnSquareIcon, 
  ArrowDownTrayIcon,
  CodeBracketIcon,
  BriefcaseIcon,
  TrophyIcon,
  UserIcon
} from "@heroicons/react/24/outline";

export interface BentoCardProps {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  href?: string;
  content?: React.ReactNode;
}

export interface BentoProps {
  textAutoHide?: boolean;
  enableStars?: boolean;
  enableSpotlight?: boolean;
  enableBorderGlow?: boolean;
  disableAnimations?: boolean;
  spotlightRadius?: number;
  particleCount?: number;
  enableTilt?: boolean;
  glowColor?: string;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = "255, 179, 71";
const MOBILE_BREAKPOINT = 768;

// Social icons data - matching your image
const socialIcons = [
  { name: "GitHub", icon: "🐙", href: "https://github.com", color: "#333" },
  { name: "LinkedIn", icon: "💼", href: "https://linkedin.com", color: "#0077B5" },
  { name: "Analytics", icon: "📊", href: "#", color: "#FF6B35" },
  { name: "Tools", icon: "🛠️", href: "#", color: "#4A90E2" },
  { name: "Shell", icon: "🐚", href: "#", color: "#FF5722" },
  { name: "Chat", icon: "💬", href: "#", color: "#25D366" },
];

// Updated card data to match your layout
const cardData: BentoCardProps[] = [
  {
    id: "about",
    title: "About Me",
    description: "UI/UX Designer passionate about creating innovative digital experiences",
    icon: <UserIcon className="w-5 h-5" />,
    className: "bento-card--about",
  },
  {
    id: "skills",
    title: "Top Skills",
    description: "React, TypeScript, UI/UX, Three.js, GSAP",
    icon: <CodeBracketIcon className="w-5 h-5" />,
    className: "bento-card--skills",
  },
  {
    id: "projects",
    title: "Featured Projects",
    description: "Showcase of my best creative work and developments",
    icon: <ArrowTopRightOnSquareIcon className="w-5 h-5" />,
    className: "bento-card--projects",
    content: (
      <div className="mt-auto flex flex-col gap-4">
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <button className="w-full py-3 px-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium backdrop-blur-sm border border-white/10">
          All Projects
        </button>
      </div>
    ),
  },
  {
    id: "experience",
    title: "Experience",
    description: "3+ years in full-stack development and creative design",
    icon: <BriefcaseIcon className="w-5 h-5" />,
    className: "bento-card--experience",
  },
  {
    id: "achievements",
    title: "Achievements",
    description: "Awards, certifications and recognitions",
    icon: <TrophyIcon className="w-5 h-5" />,
    className: "bento-card--achievements",
  },
];

const createParticleElement = (
  x: number,
  y: number,
  color: string = DEFAULT_GLOW_COLOR
): HTMLDivElement => {
  const el = document.createElement("div");
  el.className = "particle";
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 5;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number
) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty("--glow-x", `${relativeX}%`);
  card.style.setProperty("--glow-y", `${relativeY}%`);
  card.style.setProperty("--glow-intensity", glow.toString());
  card.style.setProperty("--glow-radius", `${radius}px`);
};

const ParticleCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  disableAnimations?: boolean;
  style?: React.CSSProperties;
  particleCount?: number;
  glowColor?: string;
  enableTilt?: boolean;
  clickEffect?: boolean;
  enableMagnetism?: boolean;
}> = ({
  children,
  className = "",
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef<HTMLDivElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(
        Math.random() * width,
        Math.random() * height,
        glowColor
      )
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        },
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true) as HTMLDivElement;
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
        );

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });

        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, index * 100);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableTilt && !enableMagnetism) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05;
        const magnetY = (y - centerY) * 0.05;

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 3;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        {
          scale: 0,
          opacity: 1,
        },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        }
      );
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("click", handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("click", handleClick);
      clearAllParticles();
    };
  }, [
    animateParticles,
    clearAllParticles,
    disableAnimations,
    enableTilt,
    enableMagnetism,
    clickEffect,
    glowColor,
  ]);

  return (
    <div
      ref={cardRef}
      className={`${className} relative overflow-hidden`}
      style={{ ...style, position: "relative", overflow: "hidden" }}
    >
      {children}
    </div>
  );
};

const GlobalSpotlight: React.FC<{
  gridRef: React.RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
  enabled?: boolean;
  spotlightRadius?: number;
  glowColor?: string;
}> = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);
  const isInsideSection = useRef(false);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement("div");
    spotlight.className = "global-spotlight";
    spotlight.style.cssText = `
      position: absolute;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        rgba(${glowColor}, 0.02) 40%,
        rgba(${glowColor}, 0.01) 65%,
        transparent 70%
      );
      z-index: 10;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    
    // Append to the bento section instead of body
    const bentoSection = gridRef.current?.closest('.bento-section');
    if (bentoSection) {
      bentoSection.appendChild(spotlight);
    } else {
      document.body.appendChild(spotlight);
    }
    spotlightRef.current = spotlight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current.closest(".bento-section");
      const rect = section?.getBoundingClientRect();
      const mouseInside =
        rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      isInsideSection.current = mouseInside || false;
      const cards = gridRef.current.querySelectorAll(".bento-card");

      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });
        cards.forEach((card) => {
          (card as HTMLElement).style.setProperty("--glow-intensity", "0");
        });
        return;
      }

      const { proximity, fadeDistance } =
        calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach((card) => {
        const cardElement = card as HTMLElement;
        const cardRect = cardElement.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) -
          Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity =
            (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(
          cardElement,
          e.clientX,
          e.clientY,
          glowIntensity,
          spotlightRadius
        );
      });

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
            ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
            : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      isInsideSection.current = false;
      gridRef.current?.querySelectorAll(".bento-card").forEach((card) => {
        (card as HTMLElement).style.setProperty("--glow-intensity", "0");
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

const MagicBento: React.FC<BentoProps> = ({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  return (
    <>
      <style>
        {`
          .bento-section {
            --glow-x: 50%;
            --glow-y: 50%;
            --glow-intensity: 0;
            --glow-radius: 200px;
            --glow-color: ${glowColor};
            position: relative;
            z-index: 2;
          }
          
          .bento-grid {
            display: grid;
            grid-template-columns: repeat(11, 1fr);
            grid-template-rows: repeat(5, minmax(140px, auto));
            gap: 1rem;
            width: 100%;
            position: relative;
            z-index: 1;
          }
          
          .bento-card {
            background: rgba(40, 40, 43, 0.6);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255, 179, 71, 0.2);
            border-radius: 20px;
            padding: 1.5rem;
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            color: white;
            display: flex;
            flex-direction: column;
            box-shadow: 
              0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
            z-index: 2;
            min-height: 140px;
          }
          
          .bento-card:hover {
            transform: translateX(-2px) scale(1.02);
            box-shadow: 
              0 20px 25px -5px rgba(255, 179, 71, 0.1),
              0 10px 10px -5px rgba(255, 179, 71, 0.04),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 179, 71, 0.4);
          }
          
          .bento-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(
              135deg, 
              rgba(255, 179, 71, 0.1) 0%, 
              transparent 50%, 
              rgba(255, 179, 71, 0.05) 100%
            );
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            z-index: 1;
          }
          
          .bento-card:hover::before {
            opacity: 1;
          }
          
          .bento-card--border-glow::after {
            content: '';
            position: absolute;
            inset: 0;
            padding: 2px;
            background: radial-gradient(
              var(--glow-radius) circle at var(--glow-x) var(--glow-y),
              rgba(${glowColor}, calc(var(--glow-intensity) * 0.8)) 0%,
              rgba(${glowColor}, calc(var(--glow-intensity) * 0.4)) 30%,
              transparent 60%
            );
            border-radius: inherit;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: subtract;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            pointer-events: none;
            transition: opacity 0.3s ease;
            z-index: 1;
          }
          
          .bento-card > * {
            position: relative;
            z-index: 1;
          }
          
          /* Exact layout matching your image */
          .bento-card--about {
            grid-column: 1 / 5;
            grid-row: 1 / 4;
          }
          
          .bento-card--skills {
            grid-column: 5 / 8;
            grid-row: 1 / 4;
          }
          
          .bento-card--projects {
            grid-column: 8 / 12;
            grid-row: 1 / 5;
          }
          
          .bento-card--experience {
            grid-column: 1 / 5;
            grid-row: 4 / 6;
          }
          
          .bento-card--achievements {
            grid-column: 5 / 8;
            grid-row: 4 / 6;
          }
          
          .bento-card--social {
            grid-column: 8 / 12;
            grid-row: 5 / 6;
            display: flex;
            flex-direction: column;
          }
          
          /* Download icon styling */
          .download-icon {
            position: absolute;
            bottom: 1.5rem;
            right: 1.5rem;
            width: 2.5rem;
            height: 2.5rem;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 5;
          }
          
          .download-icon:hover {
            background: rgba(0, 0, 0, 0.9);
            transform: scale(1.1);
            border-color: rgba(255, 179, 71, 0.5);
          }

          /* Mobile responsiveness */
          @media (max-width: 768px) {
            .bento-section {
              margin-bottom: 1rem;
            }
            
            .bento-grid {
              grid-template-columns: 1fr !important;
              grid-template-rows: auto !important;
              height: auto !important;
              gap: 1rem;
              margin-bottom: 1rem;
            }
            
            .bento-card--about,
            .bento-card--skills,
            .bento-card--projects,
            .bento-card--experience,
            .bento-card--achievements,
            .bento-card--social {
              grid-column: 1 !important;
              grid-row: auto !important;
              min-height: 200px;
            }
            
            .bento-card {
              padding: 1.25rem;
            }
          }
        `}
      </style>

      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <div className="bento-section" ref={gridRef}>
        <div className="bento-grid">
          {cardData.map((card) => {
            const CardComponent = enableStars ? ParticleCard : "div";
            const cardProps = enableStars
              ? {
                  disableAnimations: shouldDisableAnimations,
                  particleCount,
                  glowColor,
                  enableTilt,
                  clickEffect,
                  enableMagnetism,
                }
              : {};

            return (
              <CardComponent
                key={card.id}
                {...cardProps}
                className={`bento-card ${card.className} ${
                  enableBorderGlow ? "bento-card--border-glow" : ""
                }`}
                style={{
                  "--glow-x": "50%",
                  "--glow-y": "50%",
                  "--glow-intensity": "0",
                  "--glow-radius": "200px",
                } as React.CSSProperties}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {card.icon}
                    <h3 className="text-lg font-semibold">{card.title}</h3>
                  </div>
                  <ArrowTopRightOnSquareIcon className="w-5 h-5 opacity-60" />
                </div>
                
                {card.description && (
                  <p className="text-sm opacity-80 mb-4">{card.description}</p>
                )}
                
                {card.content}
                
                {/* Add download icon to About Me card */}
                {card.id === "about" && (
                  <div className="download-icon">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  </div>
                )}
              </CardComponent>
            );
          })}
          
          {/* Social icons card - separate from cardData for better layout control */}
          <div className={`bento-card bento-card--social ${
            enableBorderGlow ? "bento-card--border-glow" : ""
          }`}>
            <div className="flex flex-wrap gap-2 mt-auto">
              {socialIcons.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-lg backdrop-blur-sm border border-white/10"
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MagicBento;
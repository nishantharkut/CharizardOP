"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "../styles/Projects.css";
import Link from "next/link";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Projects = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const projectFlexRef = useRef<HTMLDivElement>(null);
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    viewportWidth: 0,
    viewportHeight: 0
  });

  // Debounce function
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
  }, []);

  // Device detection and viewport management
  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDeviceInfo({
        isMobile: width <= 768,
        isTablet: width > 768 && width <= 1024,
        viewportWidth: width,
        viewportHeight: height
      });
    };

    updateDeviceInfo();
    const debouncedUpdate = debounce(updateDeviceInfo, 250);
    
    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateDeviceInfo, 300);
    });

    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, [debounce]);

  useGSAP(() => {
    // Clean up any existing ScrollTrigger instances
    ScrollTrigger.getById("projects")?.kill();
    
    const projectBoxes = document.querySelectorAll(".project-box");
    const container = document.querySelector(".project-container");
    const projectFlex = document.querySelector(".project-flex");
    
    if (!projectBoxes.length || !container || !projectFlex) {
      return;
    }

    // Calculate different values based on device type
    const firstBox = projectBoxes[0] as HTMLElement;
    const boxWidth = firstBox.offsetWidth;
    const totalBoxesWidth = boxWidth * projectBoxes.length;
    const containerWidth = container.clientWidth;
    
    // Calculate total distance to scroll
    let translateX = 0;
    
    if (deviceInfo.isMobile) {
      // For mobile, we want to ensure all boxes are visible
      translateX = totalBoxesWidth - containerWidth + 50; // Add extra space
    } else if (deviceInfo.isTablet) {
      translateX = totalBoxesWidth - containerWidth + (deviceInfo.viewportWidth * 0.08);
    } else {
      translateX = totalBoxesWidth - containerWidth + (deviceInfo.viewportWidth * 0.1);
    }

    // Only proceed if we have content to scroll
    if (translateX <= 0) return;
    
    // Create a new timeline with proper configuration
    let timeline = gsap.timeline({
      scrollTrigger: {
        id: "projects",
        trigger: ".projects-section",
        start: "top top",
        // Shorter scroll distance for mobile to ensure it completes
        end: deviceInfo.isMobile ? `+=${translateX * 1.2}` : `+=${translateX}`,
        scrub: 0.5, // Smoother scrolling, especially important for mobile
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        refreshPriority: 1
      }
    });

    // Create the horizontal scroll animation
    timeline.to(projectFlex, {
      x: -translateX,
      ease: "none"
    });
    
    // On mobile, ensure the ScrollTrigger works even if scroll behavior is unusual
    if (deviceInfo.isMobile) {
      // Optional: Add a helper to ensure proper scrolling on touch devices
      document.querySelector(".projects-section")?.classList.add("mobile-scroll-helper");
    }

    return () => {
      ScrollTrigger.getById("projects")?.kill();
    };
  }, [deviceInfo]); // Re-run when device info changes

  // Project data
  const projects = [
    {
      number: "01",
      title: "Fendi",
      category: "3D Modeling",
      tools: "Blender, Substance Painter, Low poly modeling",
      image: "/images/project1.jpg"
    },
    {
      number: "02",
      title: "Executive Spaces",
      category: "Web design and development",
      tools: "Javascript, Scrollmagic, PHP, Blog admin",
      image: "/images/project2.jpg"
    },
    {
      number: "03",
      title: "Games Catalog",
      category: "Web Application",
      tools: "React, Typescript, Express",
      image: "/images/project3.jpg"
    },
    {
      number: "04",
      title: "Portfolio Website",
      category: "Web Development",
      tools: "Next.js, GSAP, Tailwind CSS",
      image: "/images/project4.jpg"
    },
    {
      number: "05",
      title: "Mobile App",
      category: "Mobile Development",
      tools: "React Native, Firebase",
      image: "/images/project5.jpg"
    }
  ];

  return (
    <div 
      className={`projects-section ${deviceInfo.isMobile ? 'mobile' : ''} ${deviceInfo.isTablet ? 'tablet' : ''}`} 
      id="projects" 
      ref={containerRef}
    >
      <div className="project-container section-container">
        <h2 className="section-heading">
          My <span>Work</span>
        </h2>
        <div className="project-flex" ref={projectFlexRef}>
          {projects.map((project, index) => (
            <div className="project-box" key={index}>
              <div className="project-header">
                <div className="project-number">{project.number}</div>
                <div className="project-title">
                  <h3>{project.title}</h3>
                  <p>{project.category}</p>
                </div>
              </div>
              
              <div className="project-info">
                <h4>Tools and features</h4>
                <p>{project.tools}</p>
              </div>
              
              <div className="project-image">
                <img src={project.image} alt={project.title} loading="lazy" />
              </div>
            </div>
          ))}
          
          {/* View all projects card */}
          <div className="project-box view-all-box">
            <Link href="/projects" className="view-all-link">
              <div className="view-all-content">
                <div className="view-all-text">
                  <h3>View All Projects</h3>
                  <span className="arrow-icon">→</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
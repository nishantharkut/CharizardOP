"use client";

import { motion } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Environment, PerspectiveCamera, OrbitControls, ContactShadows, useGLTF, useAnimations, AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import TypewriterRoles from '../ui/RotatingRoles';
import { useLoading } from '../../contexts/LoadingContext';
import * as THREE from 'three';

// Device and Browser Detection Hook
function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    isLowEnd: false,
    isMobile: false,
    supportsWebGL2: false,
    memoryLimit: 4000, // Default to 4GB for SSR
    maxTextureSize: 1024
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    setIsClient(true);
    
    // Detect mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const supportsWebGL2 = !!canvas.getContext('webgl2');
    
    // Get device memory (if available)
    const deviceMemory = (navigator as any).deviceMemory || 4;
    
    // Detect low-end devices
    const isLowEnd = isMobile && deviceMemory <= 2;
    
    // Get max texture size
    const maxTextureSize = gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 1024;
    
    setCapabilities({
      isLowEnd,
      isMobile,
      supportsWebGL2,
      memoryLimit: deviceMemory * 1000,
      maxTextureSize: Math.min(maxTextureSize, isLowEnd ? 512 : 2048)
    });
  }, []);

  return { capabilities, isClient };
}

// Performance Monitor Component
function PerformanceController({ onPerformanceChange }: { onPerformanceChange: (settings: any) => void }) {
  return (
    <PerformanceMonitor
      onIncline={(api) => {
        // Performance is good, increase quality
        onPerformanceChange({
          shadows: true,
          antialias: true,
          pixelRatio: Math.min(window.devicePixelRatio, 2),
          enableEffects: true
        });
      }}
      onDecline={(api) => {
        // Performance is struggling, reduce quality
        onPerformanceChange({
          shadows: false,
          antialias: false,
          pixelRatio: 1,
          enableEffects: false
        });
      }}
      onFallback={(api) => {
        // Very poor performance, minimal quality
        onPerformanceChange({
          shadows: false,
          antialias: false,
          pixelRatio: 1,
          enableEffects: false
        });
      }}
    />
  );
}

// Optimized Charizard Model Component with LOD and Performance Features
function CharizardModel({ capabilities, performanceSettings }: { 
  capabilities: any, 
  performanceSettings: any 
}) {
  const group = useRef<THREE.Group>(null!);
  const { scene, animations } = useGLTF('/models/charizard.glb');
  const { actions, names } = useAnimations(animations, group);
  const [fitted, setFitted] = useState(false);
  const [idleTime, setIdleTime] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const { gl, size } = useThree();
  const { setModelLoaded } = useLoading();

  // Detect mobile viewport
  const isMobileViewport = typeof window !== 'undefined' && window.innerWidth < 1024;

  // Notify when model is loaded and ready
  useEffect(() => {
    if (scene && !modelReady) {
      setModelReady(true);
      setModelLoaded(true);
    }
  }, [scene, modelReady, setModelLoaded]);

  // Optimize model based on device capabilities
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Optimize materials for low-end devices
          if (capabilities.isLowEnd) {
            if (child.material) {
              const material = child.material as THREE.MeshStandardMaterial;
              if (material.map) {
                // Reduce texture resolution on low-end devices
                material.map.minFilter = THREE.LinearFilter;
                material.map.magFilter = THREE.LinearFilter;
                material.map.generateMipmaps = false;
              }
              // Disable expensive material features
              material.roughness = 0.7;
              material.metalness = 0.1;
            }
          }
          
          // Enable shadows only if performance allows
          if (performanceSettings.shadows) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        }
      });
    }
  }, [scene, capabilities, performanceSettings]);

  // Optimized animation selection
  const selectedAnimation = useMemo(() => {
    if (capabilities.isLowEnd) {
      // Use simpler animation or no animation for low-end devices
      return names.find(n => /idle/i.test(n)) || null;
    }
    return names.find(n => /(fly|idle)/i.test(n)) || names[0];
  }, [names, capabilities]);

  useEffect(() => {
    if (selectedAnimation && actions[selectedAnimation]) {
      actions[selectedAnimation].reset().fadeIn(0.5).play();
    }
    return () => {
      if (selectedAnimation && actions[selectedAnimation]) {
        actions[selectedAnimation].fadeOut(0.3);
      }
    };
  }, [actions, selectedAnimation]);

  // Throttled frame updates for low-end devices
  const frameSkip = useRef(0);
  const shouldUpdateFrame = useCallback(() => {
    if (capabilities.isLowEnd) {
      frameSkip.current++;
      return frameSkip.current % 2 === 0; // Update every other frame
    }
    return true;
  }, [capabilities.isLowEnd]);

  useFrame((state) => {
    if (!group.current || !shouldUpdateFrame()) return;
    
    // Auto-fit on first frame
    if (!fitted) {
      const box = new THREE.Box3().setFromObject(group.current);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      
      // Center the model
      group.current.position.sub(center);
      
      // Scale to reasonable size - restore original desktop sizing
      const targetHeight = isMobileViewport ? 3.5 : 5; // Keep original 4 for desktop
      const currentHeight = size.y;
      const s = targetHeight / currentHeight;
      group.current.scale.setScalar(s);
      

      //-------CHANGE HERE------------
      // Position the model with responsive positioning - restore perfect desktop position
      if (isMobileViewport) {
        // Mobile positioning - keep improved mobile position
        group.current.position.x = 0; // Center horizontally
        group.current.position.y = -0.8; // Higher position for mobile
        group.current.position.z = 0;
      } else {
        // Desktop positioning - restore original perfect position
        group.current.position.x = 3.25; // Original perfect positioning
        group.current.position.y = -3; // Original perfect positioning
        group.current.position.z = 0;
      }
      

      //-------CHANGE HERE------------
      // Start entrance animation from far away with responsive values
      group.current.position.z = -100;
      if (isMobileViewport) {
        group.current.position.x = 0; // Start from center for mobile
        group.current.position.y = 1.5; // Start higher for mobile
      } else {
        group.current.position.x = 5.5; // Restore original entrance position
        group.current.position.y = -3; // Restore original entrance position
      }
      group.current.rotation.y = -0.2;
      
      setFitted(true);
    }


    //-------CHANGE HERE------------
    // Entrance animation with responsive targets
    if (fitted && !hasEntered) {
      // Responsive target position - restore perfect desktop values
      const targetX = isMobileViewport ? 0 : 3.25; // Restore original perfect position
      const targetY = isMobileViewport ? -0.8 : -3; // Restore original perfect position
      const targetZ = 0;
      const targetRotY = 0;
      
      // Smooth movement to target
      group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetX, 0.03);
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.025);
      group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, targetZ, 0.02);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, 0.03);
      
      // Check if arrived
      const distance = Math.sqrt(
        Math.pow(group.current.position.x - targetX, 2) +
        Math.pow(group.current.position.y - targetY, 2) +
        Math.pow(group.current.position.z - targetZ, 2)
      );
      
      if (distance < 0.3) {
        setHasEntered(true);
      }
    }

    // Idle animations after entrance (optimized for performance)
    if (hasEntered) {
      // Reduce mouse interaction sensitivity on low-end devices
      const mouseThreshold = capabilities.isLowEnd ? 0.05 : 0.02;
      const mouseInfluence = Math.abs(state.pointer.x) + Math.abs(state.pointer.y);
      
      if (mouseInfluence > mouseThreshold) {
        setIdleTime(0);
        const rotationSpeed = capabilities.isLowEnd ? 0.03 : 0.05;
        group.current.rotation.y = THREE.MathUtils.lerp(
          group.current.rotation.y,
          0.3 + (state.pointer.x * 0.2),
          rotationSpeed
        );
      } else {
        setIdleTime(prev => prev + state.clock.getDelta());
        if (idleTime > 4) {
          const autoRotationSpeed = capabilities.isLowEnd ? 0.001 : 0.002;
          group.current.rotation.y += autoRotationSpeed;
        }
      }
      
      // Gentle floating (reduced on low-end devices, responsive positioning)
      const floatAmplitude = capabilities.isLowEnd ? 0.05 : 0.1;
      const floatSpeed = capabilities.isLowEnd ? 0.5 : 0.8;
      const baseY = isMobileViewport ? -0.8 : -3; // Restore original desktop base Y
      group.current.position.y = baseY + Math.sin(state.clock.elapsedTime * floatSpeed) * floatAmplitude;
      
    }
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

// Fallback Component for Very Low-End Devices
function CharizardFallback() {
  return (
    <div className="absolute top-1/2 right-1/2 translate-x-1/4 -translate-y-1/2 w-96 h-96 opacity-60">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="w-full h-full rounded-full blur-3xl"
        style={{ background: 'var(--color-accent-gradient)' }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute inset-0 rounded-full blur-2xl"
        style={{ background: 'var(--color-accent-gradient)' }}
      />
    </div>
  );
}

export default function Hero() {
  const { capabilities, isClient } = useDeviceCapabilities();
  const [performanceSettings, setPerformanceSettings] = useState({
    shadows: false, // Default to false for SSR
    antialias: false,
    pixelRatio: 1,
    enableEffects: false
  });

  // Update performance settings once client is ready
  useEffect(() => {
    if (isClient) {
      setPerformanceSettings({
        shadows: !capabilities.isLowEnd,
        antialias: !capabilities.isLowEnd,
        pixelRatio: capabilities.isLowEnd ? 1 : (typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1),
        enableEffects: !capabilities.isLowEnd
      });
    }
  }, [isClient, capabilities]);

  // Show fallback for very low-end devices - only after client is ready
  if (isClient && capabilities.isLowEnd && capabilities.memoryLimit < 2000) {
    return (
      <section className="relative w-full h-screen overflow-hidden">
        <CharizardFallback />
        <div className="relative z-10 h-full flex items-center">
          {/* Container with exact same width as navbar: max-w-7xl */}
          <div className="max-w-7xl w-full mx-auto px-6 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* LEFT SIDE - Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="flex flex-col justify-center h-full lg:col-span-7 order-2 lg:order-1 max-w-2xl mx-auto lg:mx-0"
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight mb-4 sm:mb-6 text-center lg:text-left">
                  <span className="block">Hi, I'm <span className="text-gradient-fire">Nishant</span></span>
                </h1>
                <div className="mb-4 sm:mb-6 h-7 sm:h-8 md:h-9 text-base sm:text-lg md:text-xl lg:text-2xl text-center lg:text-left" style={{ color: 'var(--color-text-secondary)' }}>
                  <TypewriterRoles />
                </div>
                <p className="text-sm sm:text-base lg:text-lg leading-relaxed mb-6 sm:mb-8 font-light max-w-xl mx-auto lg:mx-0 text-center lg:text-left" style={{ color: 'var(--color-text-secondary)' }}>
                  I create graphic designs and immersive web experiences for the love of it. Passionate about full stack engineering, creative media, security and AI experimentation.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start max-w-md mx-auto lg:mx-0">
                  <a href="/resume.pdf" className="rounded-full glass px-6 sm:px-8 py-2.5 sm:py-3 text-sm font-medium transition-opacity hover:opacity-80 backdrop-blur-xl text-center" style={{ color: 'var(--color-text)' }}>View Resume</a>
                  <a href="#contact" className="rounded-full px-6 sm:px-8 py-2.5 sm:py-3 text-sm font-semibold transition-opacity hover:opacity-80 text-center fire-glow" style={{ background: 'var(--color-accent-gradient)', color: 'var(--color-button-text)' }}>Connect With Me</a>
                </div>
              </motion.div>
              
              {/* RIGHT SIDE - Fallback Visual */}
              <div className="relative h-64 sm:h-80 lg:h-full lg:col-span-5 flex items-center justify-center pointer-events-none order-1 lg:order-2">
                {/* Fallback renders here */}
              </div>
            </div>
          </div>
        </div>
        
        {/* Internship Announcement Strip - Static for Desktop, Animated for Mobile */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="banner-container"
        >
          {/* Desktop & Tablet - Static Text */}
          <div className="hidden md:block text-center py-3 px-4 text-sm font-medium tracking-wide min-h-[48px] flex items-center justify-center">
            I am Currently Looking for Internships - SWE || Full stack Development || Security Analyst || Frontend Dev || Backend Dev
          </div>
          
          {/* Mobile - Animated Scrolling Text */}
          <div className="md:hidden banner-scroll-container py-2.5 min-h-[40px] flex items-center">
            <div className="flex animate-scroll whitespace-nowrap">
              <div className="flex-shrink-0 px-3 sm:px-4">
                <span className="text-xs font-medium tracking-wide">Looking for Internships - SWE || Full Stack || Security || Frontend || Backend</span>
              </div>
              <div className="flex-shrink-0 px-3 sm:px-4">
                <span className="text-xs font-medium tracking-wide">Looking for Internships - SWE || Full Stack || Security || Frontend || Backend</span>
              </div>
              <div className="flex-shrink-0 px-3 sm:px-4">
                <span className="text-xs font-medium tracking-wide">Looking for Internships - SWE || Full Stack || Security || Frontend || Backend</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Optimized 3D Canvas with Performance Monitoring */}
      <div className="absolute inset-0 pointer-events-none">
        <Canvas 
          shadows={performanceSettings.shadows}
          gl={{ 
            antialias: performanceSettings.antialias, 
            alpha: true,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false
          }} 
          dpr={[1, performanceSettings.pixelRatio]}
          className="!bg-transparent w-full h-full"
          style={{ pointerEvents: 'none', touchAction: 'none' }}
          onWheel={(e) => e.preventDefault()}
          onScroll={(e) => e.preventDefault()}
          frameloop={capabilities.isLowEnd ? "demand" : "always"}
        >
          <AdaptiveDpr pixelated />
          <PerformanceController onPerformanceChange={setPerformanceSettings} />
          
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
          
          {/* Adaptive Lighting */}
          <ambientLight intensity={capabilities.isLowEnd ? 0.8 : 0.6} />
            {!capabilities.isLowEnd && (
              <>
                <directionalLight 
                  position={[10, 10, 5]} 
                  castShadow={performanceSettings.shadows}
                  intensity={1} 
                  shadow-mapSize-width={capabilities.isLowEnd ? 512 : 1024} 
                  shadow-mapSize-height={capabilities.isLowEnd ? 512 : 1024}
                />
                <spotLight 
                  position={[5, 5, 5]} 
                  angle={0.3} 
                  penumbra={1} 
                  intensity={0.3} 
                  color="#ff6b35"
                />
              </>
            )}
            
            <CharizardModel capabilities={capabilities} performanceSettings={performanceSettings} />
            
            {!capabilities.isLowEnd && (
              <ContactShadows 
                position={[3, -3, 0]} 
                opacity={0.1} 
                blur={2} 
                scale={6} 
                far={10} 
              />
            )}
            
            <Environment preset={capabilities.isLowEnd ? "apartment" : "sunset"} />
            
            {performanceSettings.enableEffects && (
              <EffectComposer>
                <Bloom 
                  intensity={capabilities.isLowEnd ? 0.1 : 0.2} 
                  mipmapBlur 
                  luminanceThreshold={0.9} 
                  radius={0.3}
                />
              </EffectComposer>
            )}
            
            <OrbitControls 
              enablePan={false} 
              enableZoom={false}
              enableRotate={false}
              enableDamping={false}
            />
        </Canvas>
        
        {/* Ambient glow behind model - restore original positioning */}
        <div className="absolute top-1/2 right-1/2 translate-x-1/4 -translate-y-1/2 w-96 h-96 opacity-30 [mask-image:radial-gradient(circle,black,transparent_70%)] bg-[radial-gradient(circle,rgba(255,140,40,0.4),transparent_60%)]" />
      </div>

      <div className="relative z-10 h-full flex items-center">
        {/* Container with exact same width as navbar: max-w-7xl */}
        <div className="max-w-7xl w-full mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* LEFT SIDE - Content - restore original */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="flex flex-col justify-center h-full max-w-xl order-2 lg:order-1"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-4 sm:mb-6 text-center lg:text-left" style={{ color: 'var(--color-text)' }}>
                <span className="block">Hi, I'm <span className="text-gradient-fire">Nishant</span></span>
              </h1>
              <div className="mb-4 sm:mb-6 h-8 sm:h-9 text-lg sm:text-xl md:text-2xl text-center lg:text-left" style={{ color: 'var(--color-text-muted)' }}>
                <TypewriterRoles />
              </div>
              <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8 font-light max-w-lg mx-auto lg:mx-0 text-center lg:text-left" style={{ color: 'var(--color-text-muted)' }}>
                I create graphic designs and immersive web experiences for the love of it. Passionate about full stack engineering, creative media, security and AI experimentation.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
                <a href="/resume.pdf" className="rounded-full glass px-6 sm:px-8 py-2.5 sm:py-3 text-sm font-medium transition-opacity hover:opacity-80 backdrop-blur-xl text-center" style={{ color: 'var(--color-text)' }}>View Resume</a>
                <a href="#contact" className="rounded-full px-6 sm:px-8 py-2.5 sm:py-3 text-sm font-semibold transition-opacity hover:opacity-80 text-center fire-glow" style={{ background: 'var(--color-accent-gradient)', color: 'var(--color-button-text)' }}>Connect With Me</a>
              </div>
            </motion.div>
            
            {/* RIGHT SIDE - Space for 3D Model (Canvas renders seamlessly behind) */}
            <div className="relative h-64 sm:h-80 lg:h-full flex items-center justify-center pointer-events-none order-1 lg:order-2">
              {/* Canvas renders absolutely positioned behind this space */}
            </div>
          </div>
        </div>
      </div>
      
      {/* Internship Announcement Strip - Static for Desktop, Animated for Mobile */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="banner-container"
      >
        {/* Desktop & Tablet - Static Text */}
        <div className="hidden md:block text-center py-3 px-4 text-sm font-medium tracking-wide min-h-[48px] flex items-center justify-center">
          I am Currently Looking for Internships - SWE || Full stack Development || Security Analyst || Frontend Dev || Backend Dev
        </div>
        
        {/* Mobile - Animated Scrolling Text */}
        <div className="md:hidden banner-scroll-container py-2.5 min-h-[40px] flex items-center">
          <div className="flex animate-scroll whitespace-nowrap">
            <div className="flex-shrink-0 px-3 sm:px-4">
              <span className="text-xs font-medium tracking-wide">Looking for Internships - SWE || Full Stack || Security || Frontend || Backend</span>
            </div>
            <div className="flex-shrink-0 px-3 sm:px-4">
              <span className="text-xs font-medium tracking-wide">Looking for Internships - SWE || Full Stack || Security || Frontend || Backend</span>
            </div>
            <div className="flex-shrink-0 px-3 sm:px-4">
              <span className="text-xs font-medium tracking-wide">Looking for Internships - SWE || Full Stack || Security || Frontend || Backend</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

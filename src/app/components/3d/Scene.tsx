"use client";

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Environment, PerspectiveCamera, OrbitControls, ContactShadows, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import CharizardModel from './CharizardModel';

export default function Scene() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <Suspense fallback={<FallbackLoader />}>        
          <PerspectiveCamera makeDefault position={[0, 0.4, 5]} fov={50} />
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[5, 6, 3]}
            castShadow
            intensity={1.1}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <CharizardModel position={[0, -0.6, 0]} scale={1.9} />
          <ContactShadows position={[0, -1.2, 0]} opacity={0.5} blur={2.5} scale={10} far={2.5} />
          <Environment preset="sunset" />
          <EffectComposer>
            <Bloom intensity={0.3} mipmapBlur luminanceThreshold={0.8} />
          </EffectComposer>
          <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 1.9} minPolarAngle={Math.PI / 3} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function FallbackLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4 select-none">
        <div className="w-14 h-14 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--color-glass-border)', borderTopColor: 'var(--color-accent)' }} />
        <p className="text-xs tracking-wide uppercase" style={{ color: 'var(--color-text-secondary)' }}>Summoning Charizard...</p>
      </div>
    </Html>
  );
}

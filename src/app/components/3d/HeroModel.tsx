"use client";
import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useMemo } from 'react';
import { Environment, PerspectiveCamera, OrbitControls, ContactShadows, Html, Bounds } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import CharizardModel from './CharizardModel';
import LoadingProgress from '../ui/LoadingProgress';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroModel() {
  return (
    <div className="pointer-events-none select-none relative w-full h-[360px] md:h-[500px] lg:h-[560px] xl:h-[600px]">
      {/* Ambient radial glow behind model */}
      <div className="absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(circle_at_center,black,transparent_65%)] bg-[radial-gradient(circle_at_center,rgba(255,140,40,0.2),transparent_55%)]" />
      <Canvas shadows gl={{ antialias: true, alpha: true }} dpr={[1, 2]} className="!bg-transparent">
        <Suspense fallback={<LoadingProgress />}>        
          <PerspectiveCamera makeDefault position={[0, 0.2, 6.8]} fov={42} />
          <scene>
            <ambientLight intensity={0.65} />
            <directionalLight position={[6, 7, 4]} castShadow intensity={1.15} shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
            <group position={[0, -0.5, 0]}>
              <Bounds fit observe margin={1.2}> 
                <CharizardModel scale={1.0} />
              </Bounds>
            </group>
            <ContactShadows position={[0, -1.1, 0]} opacity={0.4} blur={2.8} scale={20} far={4} />
            <Environment preset="sunset" />
            <EffectComposer>
              <Bloom intensity={0.32} mipmapBlur luminanceThreshold={0.88} />
            </EffectComposer>
            <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 1.85} minPolarAngle={Math.PI / 3.2} enableDamping dampingFactor={0.05} />
          </scene>
        </Suspense>
      </Canvas>
    </div>
  );
}

"use client";

import { useGLTF, useAnimations } from '@react-three/drei';
import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CharizardModelProps {
  scale?: number | [number, number, number];
  position?: [number, number, number];
  onLoaded?: () => void;
}

export default function CharizardModel({ scale = 1.2, position = [0, 0, 0], onLoaded }: CharizardModelProps) {
  const group = useRef<THREE.Group>(null!);
  const { scene, animations } = useGLTF('/models/charizard.glb');
  const { actions, names } = useAnimations(animations, group);
  const [fitted, setFitted] = useState(false);
  const [idleTime, setIdleTime] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);
  const [finalYPosition, setFinalYPosition] = useState(0);
  const [modelReady, setModelReady] = useState(false);

  // Notify when model is loaded and ready
  useEffect(() => {
    if (scene && !modelReady) {
      setModelReady(true);
      onLoaded?.();
    }
  }, [scene, modelReady, onLoaded]);

  useEffect(() => {
    const preferred = names.find(n => /(fly|idle)/i.test(n)) || names[0];
    if (preferred && actions[preferred]) {
      actions[preferred].reset().fadeIn(0.5).play();
    }
    return () => {
      if (preferred && actions[preferred]) actions[preferred].fadeOut(0.3);
    };
  }, [actions, names]);

  useFrame((state) => {
    if (!group.current) return;
    
    // Auto-fit on first frame
    if (!fitted) {
      const box = new THREE.Box3().setFromObject(group.current);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      
      // Center the model and calculate a good Y offset
      group.current.position.sub(center);
      const yOffset = -size.y * 0.35;
      group.current.position.y = yOffset;
      setFinalYPosition(yOffset);
      
      // Scale to fit viewport nicely
      const targetHeight = 3.5;
      const currentHeight = size.y;
      const s = targetHeight / currentHeight;
      group.current.scale.setScalar((Array.isArray(scale) ? (scale as any)[0] : scale) * s);
      
      // Set initial far position for entrance animation - top right corner
      group.current.position.z = 20;
      group.current.position.x = 15;
      group.current.position.y = yOffset + 8; // Start high up from final position
      group.current.rotation.y = -1.2; // More dramatic angle
      group.current.rotation.z = -0.3; // Banking turn
      setFitted(true);
    }

    // Entrance animation - fly in from top-right corner
    if (fitted && !hasEntered) {
      const targetZ = 0;
      const targetX = 0; 
      const targetY = finalYPosition; // Use the stored final Y position
      const targetRotY = 0.2; // Slight right-facing angle
      const targetRotZ = 0; // Level out
      
      group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, targetZ, 0.018);
      group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetX, 0.022);
      group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetY, 0.025);
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, 0.028);
      group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetRotZ, 0.035);
      
      // Check if close enough to target position
      if (Math.abs(group.current.position.z - targetZ) < 0.15 && 
          Math.abs(group.current.position.x - targetX) < 0.15 &&
          Math.abs(group.current.position.y - targetY) < 0.15) {
        setHasEntered(true);
      }
    }

    // Normal interactions after entrance
    if (hasEntered) {
      // Smooth mouse interaction with idle auto-rotation
      const mouseInfluence = Math.abs(state.pointer.x) + Math.abs(state.pointer.y);
      if (mouseInfluence > 0.01) {
        setIdleTime(0);
        group.current.rotation.y = THREE.MathUtils.lerp(
          group.current.rotation.y,
          0.2 + (state.pointer.x * 0.25), // Base angle + reduced mouse influence
          0.04
        );
      } else {
        setIdleTime(prev => prev + state.clock.getDelta());
        if (idleTime > 3) {
          // Gentle auto-rotation after 3s of no interaction
          group.current.rotation.y += 0.003;
        }
      }
      
      // Subtle breathing/floating
      group.current.position.y = finalYPosition + Math.sin(state.clock.elapsedTime * 1.2) * 0.08;
      group.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.02;
    }
  });

  return (
    <group ref={group} position={position} scale={scale as any} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/models/charizard.glb');

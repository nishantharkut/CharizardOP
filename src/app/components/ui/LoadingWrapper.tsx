"use client";

import { useLoading } from '../../contexts/LoadingContext';
import LoadingScreen from './LoadingScreen';
import RetroLoader from './RetroLoader';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function LoadingWrapper({ children }: { children: React.ReactNode }) {
  const { 
    isInitialLoading, 
    isRouteLoading, 
    setVideoComplete,
    finishRouteLoading,
    finishInitialLoading
  } = useLoading();

  const [isReturningVisitor, setIsReturningVisitor] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const hasVisited = sessionStorage.getItem('hasVisited');
        setIsReturningVisitor(!!hasVisited);
      } catch (error) {
        console.warn('SessionStorage not available:', error);
      }
    }
  }, []);

  console.log('LoadingWrapper render:', { isInitialLoading, isRouteLoading, isReturningVisitor });

  const handleVideoComplete = () => {
    setVideoComplete(true);
  };

  const handleRetroLoaderComplete = () => {
    finishInitialLoading();
  };

  return (
    <>
      {/* Always render children so 3D model can start loading immediately */}
      {children}
      
      {/* Overlay loading screens on top */}
      <AnimatePresence mode="wait">
        {isInitialLoading && !isReturningVisitor && (
          <LoadingScreen
            key="initial-loading"
            type="starter"
            show={isInitialLoading}
            onComplete={handleVideoComplete}
          />
        )}
        {isInitialLoading && isReturningVisitor && (
          <RetroLoader
            key="retro-loading"
            show={isInitialLoading}
            onComplete={handleRetroLoaderComplete}
          />
        )}
        {isRouteLoading && (
          <LoadingScreen
            key="route-loading"
            type="casual"
            show={isRouteLoading}
            onComplete={finishRouteLoading}
          />
        )}
      </AnimatePresence>
    </>
  );
}

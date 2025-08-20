"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface RetroDragonLoaderProps {
  type: "starter" | "casual";
  onComplete: () => void;
  show: boolean;
  dragonImageSrc?: string | null;
  fallbackTimeoutMs?: number;
}

/**
 * Improved RetroDragonLoader:
 * - Smooth progressive bar (driven by rAF, completes at fallbackTimeoutMs unless video ends earlier)
 * - Each block has an inner fill that animates smoothly (no jumps)
 * - If video ends early, animate to 100% and complete
 * - Retains video blur + invert+sharpen svg filter and centered overlay
 */
export default function RetroDragonLoader({
  type,
  onComplete,
  show,
  dragonImageSrc = null,
  fallbackTimeoutMs = 8000,
}: RetroDragonLoaderProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  // progress 0..100
  const [progress, setProgress] = useState(0);

  // refs for rAF and timers
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const fallbackTimeoutRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  // call onComplete just once
  const callCompleteOnce = () => {
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  };

  // Start/stop progress animation when show changes
  useEffect(() => {
    // cleanup helper
    const cleanupAnimation = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      startTimeRef.current = null;
    };

    if (!show) {
      // reset everything
      setProgress(0);
      setIsVideoLoaded(false);
      setVideoEnded(false);
      completedRef.current = false;

      // clear fallback timeout
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }

      cleanupAnimation();
      return;
    }

    // start fallback timeout: if reached, set progress=100 then complete
    if (fallbackTimeoutRef.current) {
      clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
    fallbackTimeoutRef.current = window.setTimeout(() => {
      // animate to 100% quickly then call complete (if not already)
      setProgress(100);
      // ensure onComplete called
      callCompleteOnce();
    }, fallbackTimeoutMs);

    // start rAF-based linear progress driven by elapsed time
    startTimeRef.current = performance.now();
    const animate = (now: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = now;
      }
      const elapsed = now - startTimeRef.current;
      // linear progression towards 100% over fallbackTimeoutMs
      const raw = Math.min(100, (elapsed / fallbackTimeoutMs) * 100);
      // If the video is loaded and is short, we still let the bar progress to near 100%
      // but we won't call onComplete here — video end will call it.
      setProgress((p) => {
        // Keep monotonic increase
        return raw > p ? raw : p;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      // cleanup on hide/unmount
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
      cleanupAnimation();
    };
  }, [show, fallbackTimeoutMs]);

  // When video ends: set progress to 100 and complete
  useEffect(() => {
    if (videoEnded) {
      // stop any running timers
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      // animate to 100% and then call complete after a tiny visual delay
      setProgress(100);
      setTimeout(() => {
        callCompleteOnce();
      }, 120);
    }
  }, [videoEnded]);

  if (!show) return null;

  const videoSrc =
    type === "starter"
      ? "/videos/Lazy Loader - starter 1.mp4"
      : "/videos/lazy loader - casual.mp4";

  // block logic: 5 blocks
  const blocksTotal = 5;
  // blockIndex = fully filled blocks count (0..5)
  const fullBlocks = Math.floor((progress / 100) * blocksTotal);
  // fraction for current partial block (0..1)
  const percentIntoBlock =
    ((progress / 100) * blocksTotal - fullBlocks) * 100; // 0..100

  // styles reused for blocks
  const blockOuterStyle: React.CSSProperties = {
    width: 48,
    height: 28,
    border: "4px solid #111",
    boxSizing: "border-box",
    background: "#ffffff",
    position: "relative",
    overflow: "hidden",
    imageRendering: "pixelated",
  };

  const innerFillBase: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "0%",
    transition: "width 180ms linear", // smooth inner fill
    imageRendering: "pixelated",
    boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.08)",
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "var(--color-bg-start, #060608)",
        color: "var(--color-text, #fff)",
      }}
    >
      {/* Inlined svg filter definitions (invert + sharpen) */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <filter id="invertSharpen" x="-20%" y="-20%" width="140%" height="140%">
            <feColorMatrix
              type="matrix"
              values="
                -1 0 0 0 1
                 0 -1 0 0 1
                 0 0 -1 0 1
                 0 0 0 1 0
              "
              result="inverted"
            />
            <feConvolveMatrix
              in="inverted"
              order="3 3"
              kernelMatrix="0 -1 0 -1 6 -1 0 -1 0"
              divisor="1"
              bias="0"
              edgeMode="duplicate"
              result="sharpened"
            />
            <feBlend in="SourceGraphic" in2="sharpened" mode="multiply" />
          </filter>
        </defs>
      </svg>

      {/* Fullscreen video */}
      <video
        ref={(el) => { videoElRef.current = el; }}
        className="retro-bg-video"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          // apply a subtle blur and the svg filter (note: some browsers treat svg filter differently;
          // if you want to disable the filter on some browsers, remove the url(...))
          filter: "blur(3px) url(#invertSharpen)",
          transform: "translateZ(0)",
        }}
        autoPlay
        muted
        playsInline
        preload="auto"
        onLoadedData={() => setIsVideoLoaded(true)}
        onCanPlayThrough={() => setIsVideoLoaded(true)}
        onEnded={() => setVideoEnded(true)}
        onError={(e) => {
          console.error("Loader video error:", e, videoSrc);
          // directly complete if video fails
          setProgress(100);
          callCompleteOnce();
        }}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Black shade overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          zIndex: 5,
        }}
      />

      {/* Centered panel (absolute + flex centering ensures perfect centering) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "auto", // blocks background interactions
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            alignItems: "center",
            padding: 16,
            background: "rgba(0,0,0,0.18)",
            borderRadius: 10,
            border: "2px solid rgba(255,255,255,0.04)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.55)",
            imageRendering: "pixelated",
          }}
        >
          {/* Dragon area */}
          <div
            style={{
              width: 96,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              imageRendering: "pixelated",
              background: "transparent",
            }}
          >
            {dragonImageSrc ? (
              <img
                src={dragonImageSrc}
                alt="pixel dragon"
                style={{
                  width: 72,
                  height: 72,
                  imageRendering: "pixelated",
                }}
              />
            ) : (
              // small inline fallback sprite (4 frames)
              <svg
                viewBox="0 0 24 24"
                width={72}
                height={72}
                style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="running dragon"
              >
                <style>{`
                  .frame { opacity: 0; animation: cycle 0.72s steps(1) infinite; }
                  .f0 { animation-delay: 0s; }
                  .f1 { animation-delay: -0.18s; }
                  .f2 { animation-delay: -0.36s; }
                  .f3 { animation-delay: -0.54s; }
                  @keyframes cycle {
                    0% { opacity: 1; }
                    24.99% { opacity: 1; }
                    25% { opacity: 0; }
                    100% { opacity: 0; }
                  }
                  .tail { transform-origin: 100% 100%; animation: tail 0.36s ease-in-out infinite; }
                  @keyframes tail {
                    0% { transform: rotate(0deg); }
                    50% { transform: rotate(-8deg) translateX(1px); }
                    100% { transform: rotate(0deg); }
                  }
                `}</style>

                {/* frame 0 */}
                <g className="frame f0" transform="scale(6)">
                  <rect x="0" y="1" width="3" height="3" fill="#ff9a3c" stroke="#000" strokeWidth="0.06" />
                  <rect x="1" y="2" width="1" height="2" fill="#f9e36b" stroke="#000" strokeWidth="0.03" />
                  <rect x="2.2" y="1.25" width="0.4" height="0.4" fill="#fff" stroke="#000" strokeWidth="0.03" />
                  <rect x="2.32" y="1.45" width="0.16" height="0.16" fill="#000" />
                  <rect x="0.2" y="3.6" width="0.8" height="0.46" fill="#ff9a3c" stroke="#000" strokeWidth="0.03" />
                  <rect x="2.05" y="3.6" width="0.8" height="0.46" fill="#ff9a3c" stroke="#000" strokeWidth="0.03" />
                  <g className="tail">
                    <rect x="3.0" y="1.9" width="1" height="0.5" fill="#ff9a3c" stroke="#000" strokeWidth="0.03" />
                    <rect x="4.05" y="1.6" width="0.4" height="0.4" fill="#d32b00" stroke="#000" strokeWidth="0.02" />
                    <rect x="4.18" y="1.35" width="0.25" height="0.25" fill="#ffcf6e" stroke="#000" strokeWidth="0.01" />
                  </g>
                </g>

                {/* frame 1 */}
                <g className="frame f1" transform="scale(6)">
                  <rect x="0" y="1" width="3" height="3" fill="#ff9a3c" stroke="#000" strokeWidth="0.06" />
                  <rect x="1" y="2" width="1" height="2" fill="#f9e36b" stroke="#000" strokeWidth="0.03" />
                  <rect x="2.15" y="1.2" width="0.42" height="0.42" fill="#fff" stroke="#000" strokeWidth="0.03" />
                  <rect x="2.28" y="1.38" width="0.16" height="0.16" fill="#000" />
                  <rect x="0.05" y="3.5" width="0.8" height="0.46" fill="#ff9a3c" stroke="#000" strokeWidth="0.03" />
                  <rect x="2.15" y="3.15" width="0.8" height="0.55" fill="#ff9a3c" stroke="#000" strokeWidth="0.03" />
                  <g className="tail">
                    <rect x="3.0" y="1.85" width="1" height="0.5" fill="#ff9a3c" stroke="#000" strokeWidth="0.03" />
                    <rect x="4.06" y="1.55" width="0.36" height="0.36" fill="#c12a00" stroke="#000" strokeWidth="0.02" />
                    <rect x="4.22" y="1.28" width="0.22" height="0.22" fill="#ffd27f" stroke="#000" strokeWidth="0.01" />
                  </g>
                </g>

                {/* frame 2 */}
                <g className="frame f2" transform="scale(6)">
                  <rect x="0" y="1" width="3" height="3" fill="#ff9a3c" stroke="#000" strokeWidth="0.06" />
                  <rect x="1" y="2" width="1" height="2" fill="#f9e36b" stroke="#000" strokeWidth="0.03" />
                  <rect x="2.3" y="1.22" width="0.38" height="0.38" fill="#fff" stroke="#000" strokeWidth="0.03" />
                  <rect x="2.4" y="1.4" width="0.16" height="0.16" fill="#000" />
                  <rect x="0.3" y="3.25" width="0.8" height="0.52" fill="#ff9a3c" stroke="#000" strokeWidth="0.03" />
                  <rect x="1.95" y="3.6" width="0.8" height="0.44" fill="#ff9a3c" stroke="#000" strokeWidth="0.03" />
                  <g className="tail">
                    <rect x="3.0" y="1.82" width="1" height="0.5" fill="#ff9a3c" stroke="#000" strokeWidth="0.03" />
                    <rect x="4.02" y="1.55" width="0.4" height="0.36" fill="#d73300" stroke="#000" strokeWidth="0.02" />
                    <rect x="4.18" y="1.28" width="0.2" height="0.2" fill="#ffd88a" stroke="#000" strokeWidth="0.01" />
                  </g>
                </g>

                {/* frame 3 */}
                <g className="frame f3" transform="scale(6)">
                  <rect x="0" y="1" width="3" height="3" fill="#ff9a3c" stroke="#000" strokeWidth="0.06" />
                  <rect x="1" y="2" width="1" height="2" fill="#f9e36b" stroke="#000" strokeWidth="0.03" />
                  <rect x="2.2" y="1.12" width="0.44" height="0.44" fill="#fff" stroke="#000" strokeWidth="0.03" />
                  <rect x="2.34" y="1.32" width="0.16" height="0.16" fill="#000" />
                  <rect x="0.05" y="3.1" width="0.8" height="0.5" fill="#ff9a3c" stroke="#000" strokeWidth="0.03" />
                  <rect x="2.2" y="3.4" width="0.8" height="0.5" fill="#ff9a3c" stroke="#000" strokeWidth="0.03" />
                  <g className="tail">
                    <rect x="3.0" y="1.78" width="1" height="0.5" fill="#ff9a3c" stroke="#000" strokeWidth="0.03" />
                    <rect x="4.07" y="1.58" width="0.4" height="0.36" fill="#d73300" stroke="#000" strokeWidth="0.02" />
                    <rect x="4.18" y="1.28" width="0.24" height="0.24" fill="#ffd88a" stroke="#000" strokeWidth="0.01" />
                  </g>
                </g>
              </svg>
            )}
          </div>

          {/* Loading bar container */}
          <div
            style={{
              display: "inline-flex",
              padding: 6,
              gap: 6,
              border: "6px solid #000",
              borderRadius: 12,
              background: "#e9f0f4",
              boxShadow: "4px 4px 0 0 rgba(0,0,0,0.6) inset",
            }}
            aria-label={`Loading ${Math.floor(progress)}%`}
          >
            {Array.from({ length: blocksTotal }).map((_, idx) => {
              const isFull = idx < fullBlocks;
              const isCurrent = idx === fullBlocks && progress < 100;
              const innerWidth = isFull ? "100%" : isCurrent ? `${percentIntoBlock}%` : "0%";

              return (
                <div key={idx} style={blockOuterStyle}>
                  <div
                    style={{
                      ...innerFillBase,
                      width: innerWidth,
                      background: isFull || isCurrent ? "#2db56b" : "transparent",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* LOADING text */}
          <div
            style={{
              marginTop: 6,
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 11,
              color: "#e6f3ea",
              textShadow: "1px 1px 0 #000",
            }}
          >
            {`LOADING${".".repeat(1 + Math.floor((progress / 100) * 3))}`}
          </div>
        </div>
      </div>

      {/* optional font import */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`}</style>
    </motion.div>
  );
}

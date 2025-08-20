"use client";

import MagicBento from "../ui/MagicBento";

export default function Bento() {
  return (
    <section className="relative w-full py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 px-4 flex justify-center">
      <div className="max-w-7xl w-full relative">
      <MagicBento
        textAutoHide={true}
        enableStars={true}
        enableSpotlight={true}
        enableBorderGlow={true}
        enableTilt={true}
        enableMagnetism={true}
        clickEffect={true}
        spotlightRadius={300}
        particleCount={12}
        glowColor="255, 179, 71"
      />
      </div>
    </section>
  );
}
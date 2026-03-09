'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BeforeAfterSliderProps {
  beforeImage: string; // Original slice
  afterImage: string; // Translated canvas slice
  labelBefore?: string;
  labelAfter?: string;
}

export const BeforeAfterSlider = ({
  beforeImage,
  afterImage,
  labelBefore = "Orijinal",
  labelAfter = "Antigravity"
}: BeforeAfterSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const onMouseMove = (e: MouseEvent | React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const onTouchMove = (e: TouchEvent | React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove as unknown as EventListener);
      window.addEventListener('mouseup', () => setIsDragging(false));
      window.addEventListener('touchmove', onTouchMove as unknown as EventListener, { passive: false });
      window.addEventListener('touchend', () => setIsDragging(false));
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove as unknown as EventListener);
      window.removeEventListener('mouseup', () => setIsDragging(false));
      window.removeEventListener('touchmove', onTouchMove as unknown as EventListener);
      window.removeEventListener('touchend', () => setIsDragging(false));
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden select-none cursor-ew-resize group shadow-2xl rounded-2xl border border-white/10 shrink-0"
      onMouseDown={(e) => { setIsDragging(true); handleMove(e.clientX); }}
      onTouchStart={(e) => { setIsDragging(true); handleMove(e.touches[0].clientX); }}
    >
      {/* Base Image (After / Translated) */}
      <img 
        src={afterImage} 
        alt="Translated" 
        className="block w-full h-auto object-cover" 
        draggable={false}
      />
      
      {/* Overlay Image (Before / Original) */}
      <div 
        className="absolute inset-0 overflow-hidden z-10"
        style={{ width: `${sliderPosition}%` }}
      >
        <img 
          src={beforeImage} 
          alt="Original" 
          className="block h-auto object-cover" 
          style={{ width: containerRef.current?.offsetWidth || '100%', maxWidth: 'none' }}
          draggable={false}
        />
      </div>

      {/* Slider Handle */}
      <div 
        className="absolute inset-y-0 z-20 w-1 bg-white/50 cursor-ew-resize"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-xs font-bold text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {labelBefore}
      </div>
      <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-primary/80 backdrop-blur-md rounded-lg text-xs font-bold text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {labelAfter}
      </div>
    </div>
  );
};

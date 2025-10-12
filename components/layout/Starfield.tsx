'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export function Starfield() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Generate 50 random stars
    const stars: Star[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 50, // Only top half of screen
      size: Math.random() > 0.7 ? 2 : 1, // Mostly 1px, some 2px
      delay: Math.random() * 3, // 0-3s delay
      duration: 2 + Math.random() * 2, // 2-4s duration
    }));

    // Create star elements
    stars.forEach((star) => {
      const starEl = document.createElement('div');
      starEl.className = 'absolute rounded-full bg-observatory-light';
      starEl.style.left = `${star.x}%`;
      starEl.style.top = `${star.y}%`;
      starEl.style.width = `${star.size}px`;
      starEl.style.height = `${star.size}px`;
      starEl.style.animation = `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`;
      starEl.style.opacity = '0.3';

      canvasRef.current?.appendChild(starEl);
    });

    // Cleanup
    return () => {
      if (canvasRef.current) {
        canvasRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        height: '50%',
        opacity: 0.15,
      }}
      aria-hidden="true"
    />
  );
}

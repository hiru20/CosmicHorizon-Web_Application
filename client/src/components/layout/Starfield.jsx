import React, { useEffect, useRef } from 'react';

/**
 * Faint static starfield behind all content, drawn once to a canvas (redrawn on resize).
 * No animation: a quiet backdrop for the black base.
 */
const Starfield = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return undefined;

    // Deterministic pseudo-random so the sky doesn't reshuffle on resize
    let seed = 1337;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const draw = () => {
      seed = 1337;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const count = Math.min(260, Math.round((w * h) / 8000));
      for (let i = 0; i < count; i += 1) {
        const x = rand() * w;
        const y = rand() * h;
        const r = rand() < 0.92 ? 0.5 : 0.9;
        ctx.fillStyle = rand() < 0.3 ? `rgba(147,197,253,${0.2 + rand() * 0.35})` : `rgba(226,236,255,${0.15 + rand() * 0.3})`;
        ctx.fillRect(x, y, r, r);
      }
    };

    draw();
    let timer;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(draw, 200);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10 pointer-events-none" aria-hidden="true" />;
};

export default Starfield;

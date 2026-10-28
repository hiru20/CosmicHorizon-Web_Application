import React, { useEffect, useRef, useState } from 'react';

const INTERACTIVE = 'a, button, [role="button"], [role="tab"], select, label, summary, [data-cursor="hover"]';

/**
 * Desktop-only custom cursor: a small dot plus a trailing ring that expands over interactive elements.
 * Disabled on touch / coarse pointers and under prefers-reduced-motion (native cursor stays).
 */
const Cursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [enabled] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (!enabled) return undefined;
    const root = document.documentElement;
    root.classList.add('has-custom-cursor');

    const pos = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let hovering = false;
    let visible = false;
    let frame = 0;

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        ring.x = pos.x;
        ring.y = pos.y;
        if (dotRef.current) dotRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }
      const next = !!(e.target instanceof Element && e.target.closest(INTERACTIVE));
      if (next !== hovering) {
        hovering = next;
        ringRef.current?.setAttribute('data-hover', String(hovering));
      }
    };
    const onLeave = () => {
      visible = false;
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };
    const tick = () => {
      ring.x += (pos.x - ring.x) * 0.2;
      ring.y += (pos.y - ring.y) * 0.2;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    frame = requestAnimationFrame(tick);
    return () => {
      root.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80]">
      <div ref={dotRef} className="absolute left-0 top-0 opacity-0">
        <span className="block -ml-[2px] -mt-[2px] w-1 h-1 bg-signal" />
      </div>
      <div ref={ringRef} className="group absolute left-0 top-0 opacity-0" data-hover="false">
        <span className="block w-7 h-7 -ml-3.5 -mt-3.5 rounded-full border border-fg/40 transition-[transform,border-color] duration-300 ease-out group-data-[hover=true]:scale-[1.7] group-data-[hover=true]:border-signal" />
      </div>
    </div>
  );
};

export default Cursor;

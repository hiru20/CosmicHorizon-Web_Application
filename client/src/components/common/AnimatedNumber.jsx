import React, { useEffect, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

const defaultFormat = (n) => Math.round(n).toLocaleString();

/** Tweens smoothly from the previous value to `value` whenever it changes. Display only. */
const AnimatedNumber = ({ value, format = defaultFormat, duration = 0.8, className = '' }) => {
  const ref = useRef(null);
  const prev = useRef(typeof value === 'number' ? value : 0);
  // Rendered once; afterwards the text node is driven by the tween so React never fights it
  const initialText = useRef(typeof value === 'number' && !Number.isNaN(value) ? format(value) : '—');
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (typeof value !== 'number' || Number.isNaN(value) || !ref.current) return;
    if (prev.current === value) {
      ref.current.textContent = format(value);
      return;
    }
    const node = ref.current;
    if (reduceMotion) {
      node.textContent = format(value);
      prev.current = value;
      return;
    }
    const controls = animate(prev.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => {
        node.textContent = format(v);
      },
    });
    prev.current = value;
    return () => controls.stop();
  }, [value, format, duration, reduceMotion]);

  return (
    <span ref={ref} className={`telemetry ${className}`}>
      {initialText.current}
    </span>
  );
};

export default AnimatedNumber;

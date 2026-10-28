import React, { useId } from 'react';

/** CSS-only tooltip, shown on hover and on keyboard focus of the wrapped element. */
const Tooltip = ({ label, children, side = 'top', className = '' }) => {
  const id = useId();
  const position =
    side === 'bottom'
      ? 'top-full mt-2 left-1/2 -translate-x-1/2'
      : side === 'left'
      ? 'right-full mr-2 top-1/2 -translate-y-1/2'
      : side === 'right'
      ? 'left-full ml-2 top-1/2 -translate-y-1/2'
      : 'bottom-full mb-2 left-1/2 -translate-x-1/2';

  return (
    <span className={`relative inline-flex group/tooltip ${className}`} aria-describedby={id}>
      {children}
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute z-50 whitespace-nowrap border border-line-strong bg-ink-800 px-2 py-1 font-mono text-[0.625rem] uppercase tracking-label text-fg opacity-0 transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100 ${position}`}
      >
        {label}
      </span>
    </span>
  );
};

export default Tooltip;

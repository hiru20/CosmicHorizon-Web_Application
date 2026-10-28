import React from 'react';

/**
 * Flat surface block with hairline border.
 * - `index` + `title`: renders a mono header strip ("04 — TELEMETRY")
 * - `crosshairs`: corner registration marks
 * - `tone`: 'base' (#0A0A0A) | 'raised' (#111) | 'clear' (transparent)
 * - `interactive`: border brightens + subtle lift on hover
 */
const TONES = {
  base: 'bg-ink-900',
  raised: 'bg-ink-800',
  clear: 'bg-transparent',
};

const Panel = ({
  as: Component = 'div',
  index,
  title,
  meta,
  crosshairs = false,
  interactive = false,
  tone = 'base',
  padding = 'p-5 sm:p-6',
  className = '',
  bodyClassName = '',
  children,
  ...props
}) => {
  const hasHeader = index || title || meta;
  return (
    <Component
      className={`border border-line ${TONES[tone] || TONES.base} ${crosshairs ? 'crosshairs' : ''} ${
        interactive ? 'transition-[border-color,transform] duration-300 ease-out hover:border-line-bright hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {hasHeader && (
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 h-10 border-b border-line">
          <span className="label flex items-center gap-2 min-w-0 truncate">
            {index && <span className="text-fg-faint">{index}</span>}
            {index && title && <span className="w-3 h-px bg-line-bright" aria-hidden="true" />}
            {title && <span className="text-fg-muted truncate">{title}</span>}
          </span>
          {meta && <span className="label text-fg-faint flex-shrink-0">{meta}</span>}
        </div>
      )}
      <div className={`${padding} ${bodyClassName}`}>{children}</div>
    </Component>
  );
};

export default Panel;

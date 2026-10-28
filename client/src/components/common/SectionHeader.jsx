import React from 'react';

/**
 * Editorial section opener: a ruled line that draws in, an index number ("03"),
 * a mono kicker, an oversized serif title and an optional standfirst + actions.
 * `as` sets the heading level (h1 for page headers).
 */
const SectionHeader = ({
  as: Heading = 'h1',
  index,
  eyebrow,
  title,
  description,
  actions,
  size = 'lg',
  className = '',
}) => {
  const titleSize = size === 'xl' ? 'text-display-xl' : size === 'md' ? 'text-display-md' : 'text-display-lg';
  return (
    <header className={`relative ${className}`}>
      <div className="flex items-center gap-4 mb-6 sm:mb-8">
        {index && <span className="font-mono text-[0.6875rem] text-signal tabular-nums">{index}</span>}
        <span className="relative flex-1 h-px bg-line overflow-hidden" aria-hidden="true">
          <span className="absolute inset-0 bg-line-bright origin-left animate-draw-x" />
        </span>
        {eyebrow && <span className="label">{eyebrow}</span>}
      </div>
      <div className="grid grid-cols-12 gap-x-6 gap-y-6 items-end">
        <Heading className={`col-span-12 lg:col-span-8 font-display font-normal text-fg ${titleSize}`}>{title}</Heading>
        {(description || actions) && (
          <div className="col-span-12 lg:col-span-4 lg:pb-2 space-y-5">
            {description && <p className="text-sm text-fg-muted leading-relaxed max-w-md">{description}</p>}
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        )}
      </div>
    </header>
  );
};

export default SectionHeader;

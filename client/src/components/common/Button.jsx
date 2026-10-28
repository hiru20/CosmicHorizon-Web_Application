import React from 'react';
import { Link } from 'react-router-dom';

const VARIANTS = {
  // Filled signal orange: the one primary action on a screen
  primary: 'bg-signal text-black border border-signal hover:bg-signal-hover hover:border-signal-hover',
  // Hairline outline: default secondary action
  secondary: 'border border-line-strong text-fg hover:border-fg-muted hover:bg-white/[0.03]',
  ghost: 'border border-transparent text-fg-muted hover:text-fg',
  danger: 'border border-danger/50 text-danger hover:border-danger hover:bg-danger/10',
  'danger-solid': 'bg-danger text-black border border-danger hover:bg-[#ee6366]',
  // Text link with a sweeping underline
  link: 'link-sweep text-fg hover:text-signal px-0 py-0 border-0',
};
// Legacy variant names map onto the restrained set
VARIANTS.outline = VARIANTS.secondary;
VARIANTS.cyan = VARIANTS.primary;
VARIANTS.amber = VARIANTS.primary;
VARIANTS['amber-soft'] = VARIANTS.secondary;

const SIZES = {
  xs: 'h-7 px-2.5 text-[0.6875rem] gap-1.5',
  sm: 'h-9 px-3.5 text-xs gap-2',
  md: 'h-11 px-5 text-xs gap-2',
  lg: 'h-14 px-7 text-sm gap-3',
  icon: 'h-9 w-9 justify-center',
};

const Spinner = () => (
  <span className="relative inline-block w-3 h-3" aria-hidden="true">
    <span className="absolute inset-0 border border-current opacity-25" />
    <span className="absolute inset-0 border border-transparent border-t-current animate-spin" />
  </span>
);

/**
 * Shared button. Renders a router <Link> when `to` is given, an <a> when `href` is given,
 * otherwise a native <button>; all other props pass straight through.
 * Labels are set in uppercase mono for the instrument-panel voice.
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  to,
  href,
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  children,
  type = 'button',
  disabled,
  ...props
}) => {
  const isLink = variant === 'link';
  const classes = `inline-flex items-center font-mono uppercase tracking-label font-medium transition-[color,background-color,border-color,transform] duration-200 ease-out disabled:opacity-40 disabled:pointer-events-none active:translate-y-px ${
    VARIANTS[variant] || VARIANTS.primary
  } ${isLink ? 'text-xs' : SIZES[size] || SIZES.md} ${className}`;

  const content = (
    <>
      {loading ? <Spinner /> : Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />}
      {children}
      {IconRight && !loading && (
        <IconRight className="w-3.5 h-3.5 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden="true" />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`group ${classes}`} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={`group ${classes}`} {...props}>
        {content}
      </a>
    );
  }
  return (
    <button type={type} className={`group ${classes}`} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
};

export default Button;

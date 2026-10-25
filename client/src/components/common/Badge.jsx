import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
      case 'go':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'warning':
      case 'tbd':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'danger':
      case 'hazard':
      case 'hold':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'info':
      case 'live':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'purple':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getVariantStyles()} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;

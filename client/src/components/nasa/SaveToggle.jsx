import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';

/**
 * Save-to-favorites toggle with an unmistakable saved state:
 * outline "Save" vs filled signal "Saved". Calls the caller's handler unchanged.
 */
const SaveToggle = ({ saved, onClick, savedLabel = 'Saved', label = 'Save to favorites', size = 'md', className = '' }) => {
  const Icon = saved ? BookmarkCheck : Bookmark;
  const sizing = size === 'sm' ? 'h-8 px-3 gap-1.5' : 'h-11 px-4 gap-2';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={!!saved}
      className={`inline-flex items-center font-mono text-[0.6875rem] uppercase tracking-label border transition-colors duration-200 active:translate-y-px ${sizing} ${
        saved
          ? 'bg-signal border-signal text-black hover:bg-signal-hover'
          : 'bg-black/70 border-line-bright text-fg hover:border-fg-muted'
      } ${className}`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />
      <span>{saved ? savedLabel : label}</span>
    </button>
  );
};

export default SaveToggle;

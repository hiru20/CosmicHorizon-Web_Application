import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, BookmarkCheck } from 'lucide-react';

/**
 * Watchlist toggle. Outline when off, filled signal orange when on.
 * Purely presentational: `onClick` is the existing watchlist handler.
 */
const WatchToggle = ({ pressed, onClick, labelOn = 'Tracking', labelOff = 'Track', size = 'sm', className = '', ...props }) => {
  const Icon = pressed ? BookmarkCheck : Bookmark;
  const sizing = size === 'md' ? 'h-11 px-5' : size === 'xs' ? 'h-7 px-2.5' : 'h-9 px-3.5';
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={!!pressed}
      whileTap={{ scale: 0.95 }}
      animate={{ scale: pressed ? [1, 1.05, 1] : 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`inline-flex items-center gap-2 ${sizing} rounded-btn border font-mono text-[0.6875rem] font-medium uppercase tracking-label transition-colors duration-200 ${
        pressed ? 'btn-gradient' : 'btn-gradient-soft'
      } ${className}`}
      {...props}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={1.5} aria-hidden="true" />
      <span>{pressed ? labelOn : labelOff}</span>
    </motion.button>
  );
};

export default WatchToggle;

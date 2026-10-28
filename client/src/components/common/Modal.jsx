import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-3xl' }) => {
  const titleId = useId();
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();

      // Keep keyboard focus inside the dialog
      if (e.key === 'Tab' && dialogRef.current) {
        const nodes = dialogRef.current.querySelectorAll(FOCUSABLE);
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    let previouslyFocused = null;
    if (isOpen) {
      previouslyFocused = document.activeElement;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      requestAnimationFrame(() => dialogRef.current?.focus());
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-ink/85 animate-fade-in" onClick={onClose} aria-hidden="true" />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative w-full ${maxWidth} surface-raised rounded-xl border border-line-strong crosshairs z-10 my-8 animate-zoom-in focus:outline-none`}
      >
        {/* Header strip */}
        <div className="flex items-center justify-between gap-4 pl-5 sm:pl-6 pr-2 h-14 border-b border-line">
          <h3 id={titleId} className="font-display text-2xl leading-none text-fg flex items-center gap-2.5 min-w-0 truncate">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="h-10 w-10 flex items-center justify-center text-fg-muted hover:text-fg border border-transparent hover:border-line-strong transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
        {/* Animated hairline under the header */}
        <div className="h-px bg-signal origin-left animate-draw-x w-16 -mt-px" aria-hidden="true" />

        {/* Content */}
        <div className="p-5 sm:p-6 max-h-[78vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

import React, { useEffect, useId, useRef, useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Full-viewport image viewer with a metadata sidebar.
 * Open/close is driven entirely by the caller's existing state (`isOpen` / `onClose`).
 * `meta`: [{ label, value }] rendered as a mono definition list. `actions`: sidebar footer slot.
 */
const ImageViewer = ({ isOpen, onClose, src, alt, kicker, title, meta = [], children, actions }) => {
  const titleId = useId();
  const dialogRef = useRef(null);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previouslyFocused = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
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
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    requestAnimationFrame(() => dialogRef.current?.focus());
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', onKey);
      setZoomed(false);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-ink flex flex-col lg:flex-row animate-fade-in focus:outline-none"
    >
      {/* Stage */}
      <div className="relative flex-1 min-h-[45vh] overflow-auto bg-ink flex items-center justify-center">
        <img
          src={src}
          alt={alt}
          onClick={() => setZoomed((z) => !z)}
          className={`transition-transform duration-500 ease-out ${
            zoomed ? 'max-w-none w-[180%] lg:w-[160%] cursor-zoom-out' : 'max-h-[100vh] max-w-full object-contain cursor-zoom-in'
          }`}
        />
        <div className="absolute top-0 inset-x-0 h-12 flex items-center justify-between px-4 border-b border-line bg-ink/80">
          <span className="label">{kicker}</span>
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
            aria-pressed={zoomed}
            className="h-8 px-2 flex items-center gap-1.5 label hover:text-fg"
          >
            {zoomed ? <ZoomOut className="w-3.5 h-3.5" strokeWidth={1.5} /> : <ZoomIn className="w-3.5 h-3.5" strokeWidth={1.5} />}
            <span>{zoomed ? '1:1' : 'Zoom'}</span>
          </button>
        </div>
      </div>

      {/* Metadata sidebar */}
      <aside className="w-full lg:w-[24rem] flex-shrink-0 border-t lg:border-t-0 lg:border-l border-line surface flex flex-col max-h-[55vh] lg:max-h-none">
        <div className="h-12 flex items-center justify-between pl-5 pr-2 border-b border-line flex-shrink-0">
          <span className="label text-fg-faint">Record</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close viewer"
            className="h-9 w-9 flex items-center justify-center text-fg-muted hover:text-fg border border-transparent hover:border-line-strong"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <h2 id={titleId} className="font-display text-display-sm text-fg">
            {title}
          </h2>
          {meta.length > 0 && (
            <dl className="border-t border-line divide-y divide-line">
              {meta.map((m) => (
                <div key={m.label} className="grid grid-cols-[6.5rem_1fr] gap-3 py-2.5">
                  <dt className="label text-fg-faint">{m.label}</dt>
                  <dd className="font-mono text-xs text-fg break-words">{m.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {children}
        </div>
        {actions && <div className="p-5 border-t border-line flex flex-wrap items-center gap-3 flex-shrink-0">{actions}</div>}
      </aside>
    </div>
  );
};

export default ImageViewer;

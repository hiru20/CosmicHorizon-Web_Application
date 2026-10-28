import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notifySuccess = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const notifyError = useCallback((msg) => addToast(msg, 'error', 5000), [addToast]);
  const notifyInfo = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  return (
    <NotificationContext.Provider
      value={{ addToast, removeToast, notifySuccess, notifyError, notifyInfo }}
    >
      {children}
      {/* Toast Notification Container */}
      <div
        className="fixed bottom-4 right-4 sm:right-6 left-4 sm:left-auto z-[60] flex flex-col gap-1.5 sm:max-w-md sm:w-full pointer-events-none"
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex items-center gap-3 min-h-11 pl-3 pr-1 border bg-black transition-all duration-300 animate-slide-up ${
              toast.type === 'success'
                ? 'border-line-strong text-live'
                : toast.type === 'error'
                ? 'border-danger/60 text-danger'
                : 'border-line-strong text-signal'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />}
            {toast.type === 'error' && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />}
            {toast.type === 'info' && <Info className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} aria-hidden="true" />}
            <span className="font-mono text-[0.625rem] uppercase tracking-label flex-shrink-0">
              {toast.type === 'success' ? 'OK' : toast.type === 'error' ? 'ERR' : 'MSG'}
            </span>
            <p className="font-mono text-xs flex-1 text-fg py-2.5 border-l border-line pl-3">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="h-9 w-9 flex items-center justify-center text-fg-muted hover:text-fg transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

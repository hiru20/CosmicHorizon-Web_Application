import React, { forwardRef, useId } from 'react';

/**
 * Underline-style form control. Renders an <input> by default, or a <select>/<textarea> via `as`.
 * All native props (value, onChange, onBlur, name, type, ...) pass straight through.
 */
const Input = forwardRef(
  ({ as: Component = 'input', label, icon: Icon, error, hint, rightSlot, className = '', inputClassName = '', id, children, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id || autoId;
    const errorId = `${fieldId}-error`;
    const hintId = `${fieldId}-hint`;

    return (
      <div className={`group/field ${className}`}>
        {label && (
          <label
            htmlFor={fieldId}
            className={`label block mb-1 transition-colors ${error ? 'text-danger' : 'group-focus-within/field:text-signal'}`}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${error ? 'text-danger' : 'text-fg-faint'}`}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          )}
          <Component
            ref={ref}
            id={fieldId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={`field ${Icon && Component !== 'textarea' ? 'pl-7' : ''} ${rightSlot ? 'pr-10' : ''} ${
              error ? '!border-danger' : ''
            } ${inputClassName}`}
            {...props}
          >
            {children}
          </Component>
          {rightSlot && <div className="absolute right-0 top-1/2 -translate-y-1/2">{rightSlot}</div>}
        </div>
        {error ? (
          <p id={errorId} className="mt-1.5 font-mono text-[0.6875rem] text-danger" role="alert">
            <span aria-hidden="true">ERR — </span>
            {error}
          </p>
        ) : (
          hint && (
            <p id={hintId} className="mt-1.5 font-mono text-[0.6875rem] text-fg-muted">
              {hint}
            </p>
          )
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

import React, { useState } from 'react';

/**
 * Lazy image with a skeleton placeholder that dissolves once the bitmap has decoded.
 * `mono` applies the editorial desaturated treatment (colour returns on hover/focus).
 */
const LazyImage = ({ src, alt, className = '', wrapperClassName = '', mono = true, onError, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-ink-800 ${wrapperClassName}`}>
      {!loaded && <div className="skeleton absolute inset-0" aria-hidden="true" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setLoaded(true);
          if (onError) onError(e);
        }}
        className={`${mono ? 'img-mono' : ''} transition-[opacity,filter] duration-700 ${loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'} ${className}`}
        {...props}
      />
    </div>
  );
};

export default LazyImage;

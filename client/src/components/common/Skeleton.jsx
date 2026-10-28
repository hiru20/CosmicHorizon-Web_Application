import React from 'react';

const Skeleton = ({ className = 'h-4 w-full' }) => <div className={`skeleton ${className}`} aria-hidden="true" />;

/** Card-shaped placeholder that mirrors image-card layouts */
export const SkeletonCard = ({ withImage = true, imageClassName = 'aspect-[4/3]' }) => (
  <div className="rounded-xl overflow-hidden border border-line surface" aria-hidden="true">
    {withImage && <Skeleton className={`w-full ${imageClassName}`} />}
    <div className="p-4 space-y-3">
      <Skeleton className="h-2.5 w-20" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-2.5 w-1/2" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 6, withImage = true, className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line' }) => (
  <div className={className} role="status" aria-label="Loading">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} withImage={withImage} />
    ))}
  </div>
);

/** Table-row placeholder for manifest / ruled-list layouts */
export const SkeletonRows = ({ rows = 6, cols = 5 }) => (
  <div className="border-y border-line divide-y divide-line" role="status" aria-label="Loading">
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="grid gap-6 py-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: cols }).map((__, c) => (
          <Skeleton key={c} className={`h-3 ${c === 1 ? 'w-full' : 'w-2/3'}`} />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;

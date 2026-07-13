/**
 * Reusable skeleton loader components for polished loading states.
 * Uses a custom shimmer animation for a smooth, premium feel.
 */

function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-lg ${className}`}
    />
  );
}

function SkeletonCircle({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 w-8", md: "h-12 w-12", lg: "h-16 w-16" };
  return (
    <div
      className={`animate-shimmer rounded-full ${sizes[size]}`}
    />
  );
}

/** Full-page skeleton shown during initial SSR/hydration */
export function PageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      {/* Header skeleton */}
      <div className="mb-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex flex-col gap-2">
            <SkeletonBar className="h-8 w-48" />
            <SkeletonBar className="h-4 w-36" />
          </div>
          <div className="flex items-center gap-2">
            <div className="animate-shimmer h-9 w-20 rounded-lg" />
            <div className="animate-shimmer h-9 w-20 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Form skeleton */}
      <div className="mx-auto max-w-2xl space-y-5">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <SkeletonBar className="mb-1.5 h-4 w-24" />
            <SkeletonBar className="h-11 w-full" />
          </div>
        ))}
        <div>
          <SkeletonBar className="mb-1.5 h-4 w-12" />
          <SkeletonBar className="h-11 w-full" />
        </div>
        <SkeletonBar className="h-12 w-full" />
      </div>

      {/* Empty state placeholder */}
      <div className="mx-auto mt-16 max-w-md text-center">
        <div className="mb-4 inline-flex h-16 w-16 animate-shimmer items-center justify-center rounded-2xl" />
        <SkeletonBar className="mx-auto h-4 w-64" />
      </div>
    </div>
  );
}

/** Script card skeleton shown during generate */
export function ScriptCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-gray-700/30 bg-gray-800/20 p-5">
      <div className="mb-3 flex items-center justify-between">
        <SkeletonCircle size="sm" />
        <SkeletonBar className="h-5 w-24 rounded-full" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="mb-3">
          <SkeletonBar className="mb-1 h-3 w-16" />
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="mt-1 h-4 w-3/4" />
        </div>
      ))}
      <SkeletonBar className="mt-auto h-8 w-full" />
    </div>
  );
}

/** Results grid skeleton (3 cards) shown during generate */
export function ResultsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 text-center">
        <SkeletonBar className="mx-auto h-6 w-40" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <ScriptCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
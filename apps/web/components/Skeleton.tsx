export function CardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-[#1a1635] border border-white/10 animate-pulse">
      <div className="h-48 bg-white/5" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
        <div className="h-3 bg-white/5 rounded w-1/3" />
      </div>
    </div>
  );
}
export function GridSkeleton({ n = 4 }: { n?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: n }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white/90 ring-1 ring-zinc-200/60 shadow-sm">
      <div className="h-1.5 w-full bg-zinc-100" />
      <div className="p-4 sm:p-5 flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-zinc-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/3 bg-zinc-200 rounded animate-pulse" />
          <div className="h-3 w-1/3 bg-zinc-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6 flex flex-col gap-8">
      {/* Header Skeleton */}
      <div>
        <div className="h-9 w-40 bg-muted rounded-lg animate-pulse" />
        <div className="h-5 w-64 bg-muted rounded-md animate-pulse mt-2" />
      </div>

      {/* Banner Skeleton */}
      <div className="h-14 w-full bg-muted rounded-xl animate-pulse" />

      {/* Credits Skeleton */}
      <div className="h-20 w-full bg-muted rounded-xl animate-pulse" />

      {/* Portfolio Grid Skeleton */}
      <div>
        <div className="h-8 w-36 bg-muted rounded-md animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex flex-col bg-card border rounded-2xl overflow-hidden min-h-[250px] animate-pulse"
            >
              <div className="p-6 flex-1 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="h-6 w-32 bg-muted rounded-md" />
                  <div className="h-5 w-16 bg-muted rounded" />
                </div>
                <div className="h-5 w-24 bg-muted rounded-md" />
                <div className="mt-auto h-4 w-20 bg-muted rounded" />
              </div>
              <div className="flex border-t h-12 bg-muted/20">
                <div className="flex-1 border-r" />
                <div className="flex-1 border-r" />
                <div className="w-[60px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

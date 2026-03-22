"use client";

export function SessionRouteError({
  onRetry,
}: Readonly<{ onRetry: () => void }>) {
  return (
    <div className="dark flex size-full flex-col items-center justify-center gap-4 bg-[#020617]">
      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-medium text-[#F9FAFB]">
          Something went wrong
        </p>
        <p className="text-sm text-[#9CA3AF]">
          Could not load this session. Please try again.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/80"
      >
        Retry
      </button>
    </div>
  );
}

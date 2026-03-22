"use client";

export function SessionRouteNotFound() {
  return (
    <div className="dark flex size-full flex-col items-center justify-center gap-2 bg-[#020617]">
      <p className="text-lg font-medium text-[#F9FAFB]">Session not found</p>
      <p className="text-sm text-[#9CA3AF]">
        This session may have been deleted or you don&apos;t have access.
      </p>
    </div>
  );
}

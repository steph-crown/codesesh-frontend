"use client";

import { Spinner } from "@/components/ui/spinner";

export function SessionRouteLoading() {
  return (
    <div className="dark flex size-full items-center justify-center bg-[#020617]">
      <Spinner className="size-6 text-white/60" />
    </div>
  );
}

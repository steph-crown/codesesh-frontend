"use client";

import { cn } from "@/lib/utils";

export type ConnectionStatus =
  | "connected"
  | "connecting"
  | "reconnecting"
  | "disconnected"
  | "ended";

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { color: string; pulse: boolean; label: string }
> = {
  connected: { color: "bg-[#16A34A]", pulse: false, label: "Connected" },
  /** Join in progress or first WebSocket handshake — not a dropped connection. */
  connecting: { color: "bg-[#FACC15]", pulse: true, label: "Connecting..." },
  reconnecting: { color: "bg-[#FACC15]", pulse: true, label: "Reconnecting..." },
  disconnected: { color: "bg-[#DC2626]", pulse: false, label: "Disconnected" },
  ended: { color: "bg-[#DC2626]", pulse: false, label: "Ended" },
};

export function ConnectionIndicator({
  status = "connected",
  className,
}: {
  status?: ConnectionStatus;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="relative flex size-2">
        {config.pulse && (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-75",
              config.color,
            )}
          />
        )}
        <span
          className={cn("relative inline-flex size-2 rounded-full", config.color)}
        />
      </span>
      <span className="text-xs text-[#9CA3AF]">{config.label}</span>
    </div>
  );
}

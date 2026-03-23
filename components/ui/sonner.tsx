"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Alert02Icon,
  MultiplicationSignCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      icons={{
        success: (
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            strokeWidth={2}
            className="size-4"
          />
        ),
        info: (
          <HugeiconsIcon
            icon={InformationCircleIcon}
            strokeWidth={2}
            className="size-4"
          />
        ),
        warning: (
          <HugeiconsIcon
            icon={Alert02Icon}
            strokeWidth={2}
            className="size-4"
          />
        ),
        error: (
          <HugeiconsIcon
            icon={MultiplicationSignCircleIcon}
            strokeWidth={2}
            className="size-4"
          />
        ),
        loading: (
          <HugeiconsIcon
            icon={Loading03Icon}
            strokeWidth={2}
            className="size-4 animate-spin"
          />
        ),
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex items-center gap-2.5 w-full rounded-xl bg-[#111827] border border-white/10 px-4 py-3 text-sm text-[#F9FAFB] shadow-lg font-sans",
          title: "font-medium",
          description: "text-[#9CA3AF] text-xs",
          icon: "text-[#ff3c00] shrink-0",
          success: "[&>[data-icon]]:text-[#22C55E]",
          error: "[&>[data-icon]]:text-[#DC2626]",
          warning: "[&>[data-icon]]:text-[#F59E0B]",
          info: "[&>[data-icon]]:text-[#3B82F6]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

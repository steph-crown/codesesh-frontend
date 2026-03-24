"use client";

import { useReportWebVitals } from "next/web-vitals";
import { isGaEnabled } from "@/lib/analytics";

export function WebVitalsToGa() {
  useReportWebVitals((metric) => {
    if (!isGaEnabled() || globalThis.window === undefined) return;

    const value =
      metric.name === "CLS"
        ? Math.round(metric.value * 1000)
        : Math.round(metric.value);

    globalThis.window.gtag?.("event", metric.name, {
      value,
      metric_id: metric.id,
      metric_rating: metric.rating,
      metric_delta: metric.delta,
      event_category: "Web Vitals",
      non_interaction: true,
    });
  });

  return null;
}

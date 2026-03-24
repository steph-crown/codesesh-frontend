import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-[#FBF6F2] px-6 text-center">
      <h1 className="text-2xl font-bold text-[#0A0A0A]">Page not found</h1>
      <p className="max-w-md text-sm text-[#4B5563]">
        The page you’re looking for doesn’t exist or was moved.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Back to {SITE_NAME}
      </Link>
    </main>
  );
}

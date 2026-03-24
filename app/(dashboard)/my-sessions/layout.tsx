import type { Metadata } from "next";
import {
  getSiteOrigin,
  SITE_DESCRIPTION,
  SITE_NAME,
} from "@/lib/site-config";

export const metadata: Metadata = {
  title: "My sessions",
  description: `View and manage your ${SITE_NAME} coding sessions. Create a new live room or rejoin a shared session.`,
  alternates: { canonical: "/my-sessions" },
  openGraph: {
    url: `${getSiteOrigin()}/my-sessions`,
    title: `My sessions — ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    title: `My sessions — ${SITE_NAME}`,
    description: SITE_DESCRIPTION,
  },
};

export default function MySessionsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

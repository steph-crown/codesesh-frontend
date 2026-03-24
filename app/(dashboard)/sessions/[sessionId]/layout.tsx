import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site-config";

/** Live rooms are private-by-use; avoid indexing thin / duplicate session URLs. */
export const metadata: Metadata = {
  title: "Live session",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: `Live session — ${SITE_NAME}`,
  },
};

export default function SessionRoomLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

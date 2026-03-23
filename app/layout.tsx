import type { Metadata } from "next";
import { Figtree, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/query-provider";
import { IdentityDialog } from "@/components/identity-dialog";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "CodeSesh",
  description: "Realtime collaborative code editing sessions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", figtree.variable, jetbrainsMono.variable)}
    >
      <body className="antialiased">
        <QueryProvider>
          {children}
          <IdentityDialog />
          <Toaster position="bottom-center" />
        </QueryProvider>
      </body>
    </html>
  );
}

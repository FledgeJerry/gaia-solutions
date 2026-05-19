import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "gaia.solutions — We build tools that hold up.",
  description: "Worker-owned software cooperative. Websites and CRM for entrepreneurs, nonprofits, and artists. Civic tech, data platforms, and cooperative infrastructure. Lansing, MI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: { default: "gaia.solutions — We build tools that hold up.", template: "%s | gaia.solutions" },
  description: "Worker-owned software cooperative. Websites and CRM for entrepreneurs, nonprofits, and artists. Civic tech, data platforms, and cooperative infrastructure. Lansing, MI.",
  keywords: ["gaia solutions", "worker cooperative", "software cooperative", "Lansing MI tech", "civic tech", "nonprofit websites", "co-op software", "mutual aid tech"],
  metadataBase: new URL("https://gaia.solutions"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "gaia.solutions",
    title: "gaia.solutions — We build tools that hold up.",
    description: "Worker-owned software cooperative building websites, CRM, civic tech, and data platforms in Lansing, MI.",
    url: "https://gaia.solutions",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "gaia.solutions" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "gaia.solutions — We build tools that hold up.",
    description: "Worker-owned software cooperative. Websites, CRM, civic tech, and data platforms. Lansing, MI.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "gaia.solutions",
              url: "https://gaia.solutions",
              description: "Worker-owned software cooperative building websites, CRM, civic tech, and data platforms in Lansing, MI.",
              address: { "@type": "PostalAddress", streetAddress: "1300 Eureka St", addressLocality: "Lansing", addressRegion: "MI", postalCode: "48912", addressCountry: "US" },
              contactPoint: { "@type": "ContactPoint", email: "jerry@thefledge.com", contactType: "customer service" },
            }),
          }}
        />
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

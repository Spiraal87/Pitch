import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pitch — Understand the Game",
  description: "Sports intelligence for the 2026 FIFA World Cup. Plain English context, team stories, and AI briefings for fans.",
  keywords: ["World Cup 2026", "FIFA", "soccer", "football", "sports", "tournament", "teams", "players", "briefings"],
  authors: [{ name: "Christopher Johnson" }],
  creator: "Christopher Johnson",
  publisher: "Pitch",
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Pitch — Understand the Game",
    description: "Sports intelligence for the 2026 FIFA World Cup. Plain English context, team stories, and AI briefings for fans.",
    url: "https://pitch.world",
    siteName: "Pitch",
    images: [
      {
        url: "https://pitch.world/pitch-logo.svg",
        width: 200,
        height: 60,
        alt: "Pitch Logo",
        type: "image/svg+xml",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pitch — Understand the Game",
    description: "Sports intelligence for the 2026 FIFA World Cup",
    images: ["https://pitch.world/pitch-logo.svg"],
    creator: "@pitch",
  },
  alternates: {
    canonical: "https://pitch.world",
  },
  applicationName: "Pitch",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pitch",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flag-icons@7.2.3/css/flag-icons.min.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Pitch',
              description: 'Sports intelligence for the 2026 FIFA World Cup',
              url: 'https://pitch.world',
              applicationCategory: 'SportsApplication',
              author: {
                '@type': 'Person',
                name: 'Christopher Johnson',
              },
              offers: {
                '@type': 'Offer',
                priceCurrency: 'USD',
                price: '0',
              },
              inLanguage: 'en-US',
              isAccessibleForFree: true,
              image: 'https://pitch.world/pitch-logo.svg',
              datePublished: '2026-01-01',
              dateModified: new Date().toISOString().split('T')[0],
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased bg-pitch-cream text-pitch-ink flex flex-col min-h-screen">
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}

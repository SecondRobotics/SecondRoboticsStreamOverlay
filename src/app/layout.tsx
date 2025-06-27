import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s | FRC Stream Overlay',
    default: 'FRC Stream Overlay',
  },
  description: "Real-time stream overlay management for FRC competitions",
  keywords: ['FRC', 'FIRST Robotics', 'stream overlay', 'broadcasting', 'competition'],
  authors: [{ name: 'FRC Stream Team' }],
  openGraph: {
    title: 'FRC Stream Overlay',
    description: 'Real-time stream overlay management for FRC competitions',
    type: 'website',
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

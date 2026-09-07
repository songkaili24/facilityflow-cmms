import type { Metadata, Viewport } from "next";
import { Barlow, Inter } from "next/font/google";
import { PwaRegister } from "./pwa-register";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "FacilityFlow — CMMS for building operations",
    template: "%s | FacilityFlow",
  },
  description:
    "FacilityFlow connects building engineers with maintenance vendors. Dispatch, track, and close work orders from the loading dock or the penthouse — online or off.",
  applicationName: "FacilityFlow",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "FacilityFlow",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1E293B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${barlow.variable}`}>
      <body className="font-sans">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}

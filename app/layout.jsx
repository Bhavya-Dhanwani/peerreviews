import { Geist, Geist_Mono } from "next/font/google";
import AppToaster from "@/components/ui/AppToaster";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Kodex Peer Reviews",
  description: "Collaborative peer review platform for Kodex.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Analytics />
        <AuthProvider>
          {children}
          <AppToaster />
        </AuthProvider>
      </body>
    </html>
  );
}

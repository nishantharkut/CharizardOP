import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LoadingProvider } from "./contexts/LoadingContext";
import LoadingWrapper from "./components/ui/LoadingWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Charizard Developer Portfolio',
  description: 'Full stack developer & creative technologist portfolio with immersive 3D experience.',
  openGraph: {
    title: 'Charizard Developer Portfolio',
    description: 'Immersive 3D portfolio blending development, design, and creative technology.',
    type: 'website'
  },
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoadingProvider>
          <ThemeProvider>
            <LoadingWrapper>
              {children}
            </LoadingWrapper>
          </ThemeProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}

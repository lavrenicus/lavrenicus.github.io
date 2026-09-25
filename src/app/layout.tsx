import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Shell from "@/components/Shell";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lavrenicus.github.io"),
  title: {
    default: "Lavrenicus — Technical Artist & Python Specialist",
    template: "%s — Lavrenicus",
  },
  description: "Portfolio of Lavrenicus: technical artist, pipeline engineer and game developer.",
  openGraph: {
    type: "website",
    url: "https://lavrenicus.github.io/",
    siteName: "Lavrenicus",
    title: "Lavrenicus — Technical Artist & Python Specialist",
    description:
      "Portfolio of Lavrenicus: technical artist, pipeline engineer and game developer.",
  },
  twitter: {
    card: "summary",
    title: "Lavrenicus — Technical Artist & Python Specialist",
    description: "Portfolio of Lavrenicus: technical artist, pipeline engineer and game developer.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const classes = spaceGrotesk.variable + " " + jetbrainsMono.variable;
  return (
    <html lang="en" className={classes}>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}

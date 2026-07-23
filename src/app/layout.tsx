import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
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
  title: "Lavrenicus \u2014 Technical Artist & Python Specialist",
  description: "Portfolio of Lavrenicus: technical artist, pipeline engineer and game developer.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const classes = spaceGrotesk.variable + " " + jetbrainsMono.variable;
  return (
    <html lang="en" className={classes}>
      <body>{children}</body>
    </html>
  );
}

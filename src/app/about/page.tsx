import type { Metadata } from "next";
import About from "@/components/About";

export const metadata: Metadata = {
  title: "About",
  description: "About Lavrenicus: background, base and working profile.",
};

export default function AboutPage() {
  return <About />;
}

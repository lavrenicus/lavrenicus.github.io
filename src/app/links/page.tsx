import type { Metadata } from "next";
import Links from "@/components/Links";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact and social links: GitHub, LinkedIn, Sketchfab and email.",
};

export default function LinksPage() {
  return <Links />;
}

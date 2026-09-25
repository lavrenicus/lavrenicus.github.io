import type { Metadata } from "next";
import Experience from "@/components/Experience";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Selected work by Lavrenicus: real-time engines, technical art and CG pipeline automation.",
};

export default function ExperiencePage() {
  return <Experience />;
}

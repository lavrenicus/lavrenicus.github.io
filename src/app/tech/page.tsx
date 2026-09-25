import type { Metadata } from "next";
import TechGrid from "@/components/TechGrid";

export const metadata: Metadata = {
  title: "Tech",
  description:
    "Stack and tools: Python, TypeScript, Unity, WebGL and pipeline automation.",
};

export default function TechPage() {
  return <TechGrid />;
}

import type { Metadata } from "next";
import Assets from "@/components/Assets";

export const metadata: Metadata = {
  title: "Assets",
  description: "3D assets and Sketchfab models: characters, creatures and sci-fi props.",
};

export default function AssetsPage() {
  return <Assets />;
}

import type { Metadata } from "next";
import Games from "@/components/Games";

export const metadata: Metadata = {
  title: "Playable demos",
  description: "Playable WebGL demos built with Three.js and PixiJS.",
};

export default function GamesPage() {
  return <Games />;
}

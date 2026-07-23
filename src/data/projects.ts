import { Project, TechSkill, NavLink, SocialLink } from "@/types";

export const projects: Project[] = [
  {
    id: "pixiandestroy",
    title: "PixiAndDestroy",
    meta: "tactical grid game · Three.js · in development",
    description: "A grid-based tactical game built with a custom finite-state-machine core and Three.js rendering.",
    demoKey: "pixiandestroy",
    gradientFrom: "#0d1826",
    gradientTo: "#091220",
  },
  {
    id: "bam",
    title: "BAM: Historical Journey",
    meta: "interactive historical exhibit · Babylon.js",
    description: "An interactive walkthrough built for an exhibit on the Baikal-Amur Mainline, rendered in Babylon.js for an interactive kiosk.",
    demoKey: "bam",
    gradientFrom: "#0d1826",
    gradientTo: "#091220",
  },
  {
    id: "campus",
    title: "Campus Navigator",
    meta: "3D wayfinding tool · Babylon.js",
    description: "A navigable 3D map built for an institute's campus, letting visitors find their way through the building in real time.",
    demoKey: "campus",
    gradientFrom: "#0d1826",
    gradientTo: "#091220",
  },
  {
    id: "rails",
    title: "Logic Rails",
    meta: "puzzle game · Unity · WebGL build",
    description: "A logic puzzle about routing trains through a rail network, built for an interactive stand and exported to WebGL.",
    demoKey: "rails",
    gradientFrom: "#0d1826",
    gradientTo: "#091220",
  },
];

export const techSkills: TechSkill[] = [
  { name: "Python" },
  { name: "Unity" },
  { name: "Babylon.js" },
  { name: "Three.js" },
  { name: "PyTorch" },
  { name: "Docker" },
  { name: "PySide / Qt" },
  { name: "Pipeline automation" },
  { name: "Rigging & motion capture" },
  { name: "Render farm ops" },
];

export const navLinks: NavLink[] = [
  { label: "home", href: "home" },
  { label: "projects", href: "projects" },
  { label: "games", href: "games" },
  { label: "tech", href: "tech" },
  { label: "about", href: "about" },
  { label: "links", href: "links" },
];

export const socialLinks: SocialLink[] = [
  { label: "github", href: "https://github.com/", external: true },
  { label: "sketchfab", href: "https://sketchfab.com/modelicus", external: true },
  { label: "linkedin", href: "#", external: true },
  { label: "email", href: "mailto:hello@example.com", external: false },
];

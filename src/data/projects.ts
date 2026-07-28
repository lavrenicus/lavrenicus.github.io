import { ProjectItem, GameItem, AssetItem, TechSkill, NavLink, SocialLink } from "@/types";

// Technical projects — pipeline tools, no playable demo.
export const projects: ProjectItem[] = [
  {
    id: "smartpool",
    title: "SmartPool",
    meta: "computer vision · C++ · OpenCV",
    description: "Homography calibration for billiard table tracking using computer vision.",
    stack: ["C++", "OpenCV"],
    scope: "personal",
    status: "in development",
  },
  {
    id: "nnrigger",
    title: "NNRigger",
    meta: "automated rigging · PyTorch · GNN",
    description: "A graph neural network system that automates character rigging from mesh data.",
    stack: ["Python", "PyTorch"],
    scope: "personal",
    status: "in development",
  },
];

// Playable WebGL games — rendered inside /public/demos/<demoKey>/.
export const games: GameItem[] = [
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
    id: "rails",
    title: "Logic Rails",
    meta: "puzzle game · Unity · WebGL build",
    description: "A logic puzzle about routing trains through a rail network, built for an interactive stand and exported to WebGL.",
    demoKey: "rails",
    gradientFrom: "#0d1826",
    gradientTo: "#091220",
  },
];

// 3D assets / models — external showcases (e.g. Sketchfab).
export const assets: AssetItem[] = [
  {
    id: "asset-01",
    title: "Add your first asset",
    meta: "sketchfab · 3d model",
    image: "/images/asset-placeholder.png",
    link: "https://sketchfab.com/modelicus",
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
  { label: "assets", href: "assets" },
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

import { ProjectItem, GameItem, AssetItem, TechSkill, NavLink, SocialLink } from "@/types";

// Technical projects — pipeline tools, no playable demo.
export const projects: ProjectItem[] = [
  {
    id: "sharks-vs-dolphins",
    title: "Sharks vs Dolphins: Underwater Battle Checkers",
    year: 2014,
    meta: "3D models & level design · Unity",
    description: "An underwater checkers game with local multiplayer and three AI difficulty levels. Created 3D models and designed the game levels.",
    stack: ["Unity", "3D Modeling", "Level Design"],
    scope: "team",
    status: "released",
    images: [
      { src: "/images/sharks-vs-dolphins-gameplay.png", alt: "Underwater checkers gameplay" },
      { src: "/images/sharks-vs-dolphins-credits.png", alt: "Game credits listing Ilya Lavrov" },
    ],
    link: "https://www.indiedb.com/games/sharks-vs-dolphins-checkers/",
    linkLabel: "IndieDB",
  },
  {
    id: "russia-my-history",
    title: "Russia — My History",
    year: 2014,
    meta: "3D generalist · technical animator",
    description: "Created crowd and large-scale battle simulations, reconstructed war-torn Stalingrad in 3D, and produced destruction simulations for three multimedia historical exhibitions.",
    stack: ["3D", "Technical Animation", "Crowd Simulation", "Destruction FX"],
    scope: "team",
    status: "exhibition",
    links: [
      { href: "https://myhistorypark.ru/expositions/romanovyi-1613-1917/", label: "Romanovs" },
      { href: "https://myhistorypark.ru/expositions/ryurikovichi-862-1598/", label: "Rurikids" },
      { href: "https://myhistorypark.ru/expositions/1914-1945-ot-velikix-potryasenij-k-velikoj-pobede/", label: "1914–1945" },
      { href: "https://www.kommersant.ru/doc/2599201", label: "Kommersant" },
    ],
  },
  {
    id: "100-kilowatt",
    title: "100 Kilowatt Animation Studio",
    year: 2016,
    period: "2016–2019",
    meta: "studio pipeline developer · 3D animation",
    description: "Developed the studio production pipeline for «Бобр добр», «Домики», «Ник-изобретатель» and «Волшебная кухня», as well as the frozen projects «Мой друг с Тау Кита» and «Космос».",
    stack: ["Pipeline Development", "3D Animation", "Automation"],
    scope: "team",
    status: "studio production",
    images: [
      { src: "/images/100kwt-domiki.jpg", alt: "Домики series artwork" },
      { src: "/images/100kwt-bobr-dobr.jpg", alt: "Бобр добр series artwork" },
      { src: "/images/100kwt-nik-izobretatel.jpg", alt: "Ник-изобретатель episode frame" },
      { src: "/images/100kwt-volshebnaya-kuhnya.jpg", alt: "Волшебная кухня series artwork" },
    ],
    links: [
      { href: "http://100kwt.com/", label: "Studio" },
      { href: "https://aakr.ru/100-kilowatt/", label: "Animation Association" },
    ],
  },
  {
    id: "zombie-blast-squad",
    title: "Zombie Blast Squad",
    year: 2020,
    meta: "technical artist · mobile game",
    description: "Automated game-asset integration into the production build and resolved rendering and graphics issues for the match-3 puzzle RPG.",
    stack: ["Technical Art", "Asset Integration", "Pipeline Automation", "Graphics Debugging"],
    scope: "team",
    status: "released",
    images: [
      { src: "/images/zombie-blast-squad-key-art.jpg", alt: "Zombie Blast Squad characters" },
      { src: "/images/zombie-blast-squad-review.jpg", alt: "Zombie Blast Squad title artwork" },
    ],
    links: [
      { href: "https://zbs.my.games/", label: "Official Site" },
      { href: "https://www.hardcoredroid.com/zombie-blast-squad-review/", label: "Review" },
    ],
  },
  {
    id: "sidus-heroes",
    title: "SIDUS HEROES",
    year: 2022,
    period: "2022–present",
    meta: "technical artist · multi-game ecosystem",
    description: "Built post-processing effects and animation controllers for NIDUM, animation controllers for Tembazar, and UI layouts, graphics optimizations, and asset integration workflows for Xenna.",
    stack: ["Post-Processing", "Animation Controllers", "UI Layout", "Graphics Optimization", "Asset Integration"],
    scope: "team",
    status: "ongoing",
    images: [
      { src: "/images/sidus-nidum.png", alt: "NIDUM official artwork" },
      { src: "/images/sidus-tembazar.png", alt: "Tembazar official artwork" },
      { src: "/images/sidus-xenna.png", alt: "Xenna official artwork" },
    ],
    links: [
      { href: "https://sidusheroes.com/nidum", label: "NIDUM" },
      { href: "https://sidusheroes.com/tembazar", label: "Tembazar" },
      { href: "https://sidusheroes.com/xenna", label: "Xenna" },
    ],
  },
  {
    id: "immerse-render",
    title: "ImmerseRender",
    year: 2024,
    period: "2024–2026",
    meta: "render farm operations · 3D production",
    description: "Managed render farm operations and its integration with 3D modeling and rendering software.",
    stack: ["Render Farm", "3D Software", "Pipeline Operations"],
    scope: "team",
    status: "company",
  },
  {
    id: "smartpool",
    title: "SmartPool",
    meta: "computer vision · C++ · OpenCV",
    description: "Homography calibration for billiard table tracking using computer vision.",
    stack: ["C++", "OpenCV"],
    scope: "team",
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
    demoAvailable: true,
    gradientFrom: "#0d1826",
    gradientTo: "#091220",
  },
];

// 3D assets / models — external showcases (e.g. Sketchfab).
export const assets: AssetItem[] = [
  {
    id: "sci-fi-corridor",
    title: "Sci-fi Corridor",
    meta: "sci-fi · environment",
    image: "/images/sketchfab/sci-fi-corridor.jpg",
    link: "https://sketchfab.com/3d-models/none-f4c18c0c955a46d8b7327091725a915e",
  },
  {
    id: "supermutant",
    title: "Supermutant",
    meta: "character · animation",
    image: "/images/sketchfab/supermutant.jpg",
    link: "https://sketchfab.com/3d-models/none-dfddb35e603c495fa9c9ece8d095f068",
  },
  {
    id: "orc",
    title: "Orc",
    meta: "fantasy · character",
    image: "/images/sketchfab/orc.jpg",
    link: "https://sketchfab.com/3d-models/none-b84023de44ea48c09c82b9d69d8e24b6",
  },
  {
    id: "swamp-creature",
    title: "Swamp Creature",
    meta: "creature · animation",
    image: "/images/sketchfab/swamp-creature.jpg",
    link: "https://sketchfab.com/3d-models/none-ac86acea72a34462a83aa8a380f663f2",
  },
  {
    id: "goalkeeper",
    title: "Goalkeeper",
    meta: "character · 3d model",
    image: "/images/sketchfab/goalkeeper.jpg",
    link: "https://sketchfab.com/3d-models/none-517444d1642748e4985c2447d3841ac8",
  },
  {
    id: "wizard",
    title: "Wizard",
    meta: "character · sculpt",
    image: "/images/sketchfab/wizard.jpg",
    link: "https://sketchfab.com/3d-models/none-e6113ef4918349f09d3cad74a9ff2a39",
  },
  {
    id: "knight",
    title: "Knight",
    meta: "character · animation",
    image: "/images/sketchfab/knight.jpg",
    link: "https://sketchfab.com/3d-models/none-7ec0da12c73f4cef8b852bcc8f6522de",
  },
  {
    id: "sci-fi-girl",
    title: "Sci-fi Girl",
    meta: "character · 3d model",
    image: "/images/sketchfab/sci-fi-girl.jpg",
    link: "https://sketchfab.com/3d-models/none-7f3c2e43814643da993d0eb45c67563c",
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
  { label: "experience", href: "experience" },
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

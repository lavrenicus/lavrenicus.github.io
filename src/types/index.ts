export interface ProjectItem {
  id: string;
  title: string;
  meta: string;
  description: string;
  stack: string[];
  scope: "personal" | "team";
  link?: string;
  linkLabel?: string;
  status?: string;
}

export interface GameItem {
  id: string;
  title: string;
  meta: string;
  description: string;
  demoKey: string;
  demoAvailable?: boolean;
  gradientFrom: string;
  gradientTo: string;
}

export interface AssetItem {
  id: string;
  title: string;
  meta: string;
  image: string;
  link: string;
}

export interface TechSkill {
  name: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  external: boolean;
}

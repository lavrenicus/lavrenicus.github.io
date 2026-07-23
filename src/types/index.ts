export interface Project {
  id: string;
  title: string;
  meta: string;
  description: string;
  demoKey: string;
  demoAvailable?: boolean;
  gradientFrom: string;
  gradientTo: string;
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

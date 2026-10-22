import data from '../data/portfolio.json';

export interface ProjectCard {
  slug: string;
  title: string;
  location: string;
  type: string;
  image: string;
  image_alt: string;
}

export interface Project extends ProjectCard {
  sectors: string[];
  /** Space-separated sector keys for the portfolio filter */
  sector_keys: string;
  sector_labels: string;
  use: string;
  size: string;
  featured: boolean;
  headline: string;
  summary: string;
  services: { name: string }[];
  glance: { label: string; value: string }[];
  intro_html: string;
  sections: { heading: string; body_html: string }[];
  quote?: { text: string; name: string; role: string } | null;
  related: ProjectCard[];
  next: { slug: string; title: string };
}

export const projects = data as Project[];
export const featuredProjects = projects.filter((p) => p.featured);

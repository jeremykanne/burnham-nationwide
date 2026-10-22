import data from '../data/offices.json';

export interface Office {
  slug: string;
  city: string;
  state: string;
  hq: boolean;
  /** Address with a <br> between lines */
  address_html: string;
  phone: string;
  phone_digits: string;
  email: string;
  meta_title: string;
  meta_description: string;
  headline: string;
  intro_html: string;
  image: string;
  image_alt: string;
  maps_url: string;
  guide_title: string;
  guide_intro: string;
  guides: { id: string; title: string; body_html: string }[];
  others: { slug: string; city: string; state: string }[];
}

export const offices = data as Office[];

// Content source layer. Async-first ON PURPOSE: pages await these getters, so
// swapping the backing store from typed constants to Payload CMS queries later
// (Phase 4) is a localized change with no page rewrites. Server-only.
import "server-only";

export type ShopDetails = {
  name: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  email: string;
  phone?: string;
  socials: { instagram: string; facebook: string };
};

export type Stat = { value: number; suffix?: string; label: string };
export type Testimonial = {
  quote: string;
  name: string;
  suburb: string;
  rating: number;
};
export type TeamMember = { name: string; role: string; bio?: string };

const SHOP: ShopDetails = {
  name: "OnWood Tiles",
  street: "2/11 Packer Street",
  suburb: "Baringa",
  state: "QLD",
  postcode: "4551",
  email: "sales@onwoodtiles.com.au",
  socials: {
    instagram: "https://www.instagram.com/onwood_tiles",
    facebook: "https://www.facebook.com/share/18qX1BsNrf/",
  },
};

const STATS: Stat[] = [
  { value: 100, suffix: "s", label: "Colours & finishes" },
  { value: 1, label: "Sunshine Coast showroom" },
  { value: 100, suffix: "%", label: "Local & independent" },
];

const TESTIMONIALS: Testimonial[] = [];
const TEAM: TeamMember[] = [];

// Async getters (constants today, Payload tomorrow).
export async function getShopDetails(): Promise<ShopDetails> {
  return SHOP;
}
export async function getStats(): Promise<Stat[]> {
  return STATS;
}
export async function getTestimonials(): Promise<Testimonial[]> {
  return TESTIMONIALS;
}
export async function getTeam(): Promise<TeamMember[]> {
  return TEAM;
}

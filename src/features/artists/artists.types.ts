import type { PortfolioImage } from "../portfolio/portfolio.types";

export type ArtistSpecialty = string;

export interface ArtistProfile {
  id: string;
  username: string;
  fullName: string;
  bio: string | null;
  location: string | null;
  specialty: ArtistSpecialty[];
  priceRange: string | null;
  instagramHandle: string | null;
  profileImageUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ArtistProfileRecord extends ArtistProfile {
  userId: string;
}

export interface ArtistProfileDetail extends ArtistProfile {
  portfolioImages: PortfolioImage[];
}

export interface CreateOrUpdateArtistInput {
  fullName: string;
  username: string;
  bio?: string | null;
  location?: string | null;
  specialty?: ArtistSpecialty[];
  priceRange?: string | null;
  instagramHandle?: string | null;
  profileImageUrl?: string | null;
  isPublished?: boolean;
}

export interface ArtistDiscoveryFilters {
  location?: string;
  specialty?: ArtistSpecialty;
  priceRange?: string;
}

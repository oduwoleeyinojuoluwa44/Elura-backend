export type ArtistSpecialty = string;

export interface ArtistProfile {
  id: string;
  userId: string;
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

export interface CreateOrUpdateArtistInput {
  fullName: string;
  username: string;
  bio?: string;
  location?: string;
  specialty?: ArtistSpecialty[];
  priceRange?: string;
  instagramHandle?: string;
  profileImageUrl?: string;
  isPublished?: boolean;
}

export interface ArtistDiscoveryFilters {
  location?: string;
  specialty?: ArtistSpecialty;
  priceRange?: string;
}


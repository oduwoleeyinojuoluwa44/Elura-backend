export interface PortfolioImage {
  id: string;
  artistId: string;
  imageUrl: string;
  storagePath: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface CreatePortfolioImageInput {
  artistId: string;
  imageUrl: string;
  storagePath: string;
  caption?: string;
  sortOrder?: number;
}

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

export interface UploadPortfolioImageInput {
  artistId: string;
  fileBytes: Uint8Array;
  contentType: string;
  fileExtension: string;
  caption?: string;
  sortOrder?: number;
}

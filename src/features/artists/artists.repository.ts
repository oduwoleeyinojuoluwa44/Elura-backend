import { notImplemented, type AppError } from "../../shared/errors";
import { err, type Result } from "../../shared/result.types";
import type { ArtistDiscoveryFilters, ArtistProfile, CreateOrUpdateArtistInput } from "./artists.types";

export async function upsertArtistProfileInStore(
  ownerUserId: string,
  input: CreateOrUpdateArtistInput
): Promise<Result<ArtistProfile, AppError>> {
  void ownerUserId;
  void input;

  return err(notImplemented("Artist profile persistence is not implemented yet."));
}

export async function fetchPublishedArtistsFromStore(
  filters: ArtistDiscoveryFilters
): Promise<Result<ArtistProfile[], AppError>> {
  void filters;

  return err(notImplemented("Artist discovery query is not implemented yet."));
}

export async function fetchPublishedArtistByUsernameFromStore(
  username: string
): Promise<Result<ArtistProfile, AppError>> {
  void username;

  return err(notImplemented("Artist profile lookup is not implemented yet."));
}


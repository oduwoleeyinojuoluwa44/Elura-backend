import type { PostgrestError } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "../../lib/supabase/admin";
import type { Database } from "../../lib/supabase/database.types";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { createError, type AppError } from "../../shared/errors";
import { err, ok, type Result } from "../../shared/result.types";
import type {
  ArtistDiscoveryFilters,
  ArtistProfile,
  ArtistProfileRecord,
  CreateOrUpdateArtistInput
} from "./artists.types";

type ArtistRow = Database["public"]["Tables"]["artists"]["Row"];
type ArtistInsert = Database["public"]["Tables"]["artists"]["Insert"];

function mapArtistRow(row: ArtistRow): ArtistProfileRecord {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username,
    fullName: row.full_name,
    bio: row.bio,
    location: row.location,
    specialty: row.specialty,
    priceRange: row.price_range,
    instagramHandle: row.instagram_handle,
    profileImageUrl: row.profile_image_url,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function toPublicArtistProfile(record: ArtistProfileRecord): ArtistProfile {
  return {
    id: record.id,
    username: record.username,
    fullName: record.fullName,
    bio: record.bio,
    location: record.location,
    specialty: record.specialty,
    priceRange: record.priceRange,
    instagramHandle: record.instagramHandle,
    profileImageUrl: record.profileImageUrl,
    isPublished: record.isPublished,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
}

function mapPostgrestError(error: PostgrestError, action: string): AppError {
  if (error.code === "23505") {
    return createError("CONFLICT", "That username is already in use.");
  }

  return createError("INTERNAL_ERROR", `Failed to ${action}.`, {
    code: error.code,
    details: error.details,
    hint: error.hint
  });
}

function buildArtistUpsertPayload(
  ownerUserId: string,
  input: CreateOrUpdateArtistInput
): ArtistInsert {
  const payload: ArtistInsert = {
    user_id: ownerUserId,
    username: input.username,
    full_name: input.fullName
  };

  if ("bio" in input) {
    payload.bio = input.bio ?? null;
  }

  if ("location" in input) {
    payload.location = input.location ?? null;
  }

  if ("specialty" in input) {
    payload.specialty = input.specialty ?? [];
  }

  if ("priceRange" in input) {
    payload.price_range = input.priceRange ?? null;
  }

  if ("instagramHandle" in input) {
    payload.instagram_handle = input.instagramHandle ?? null;
  }

  if ("profileImageUrl" in input) {
    payload.profile_image_url = input.profileImageUrl ?? null;
  }

  if ("isPublished" in input) {
    payload.is_published = input.isPublished ?? false;
  }

  return payload;
}

export async function fetchArtistProfileByOwnerUserIdFromStore(
  ownerUserId: string
): Promise<Result<ArtistProfileRecord | null, AppError>> {
  try {
    const adminClient = createSupabaseAdminClient();
    const response = await adminClient
      .from("artists")
      .select("*")
      .eq("user_id", ownerUserId)
      .maybeSingle();

    if (response.error !== null) {
      return err(mapPostgrestError(response.error, "load the artist profile"));
    }

    if (response.data === null) {
      return ok(null);
    }

    const artistRow: ArtistRow = response.data as ArtistRow;
    return ok(mapArtistRow(artistRow));
  } catch (error: unknown) {
    return err(
      createError("INTERNAL_ERROR", "Failed to initialize the artist profile store.", {
        cause: error instanceof Error ? error.message : "unknown"
      })
    );
  }
}

export async function upsertArtistProfileInStore(
  ownerUserId: string,
  input: CreateOrUpdateArtistInput
): Promise<Result<ArtistProfile, AppError>> {
  try {
    const adminClient = createSupabaseAdminClient();
    const payload: ArtistInsert = buildArtistUpsertPayload(ownerUserId, input);
    const response = await adminClient
      .from("artists")
      .upsert(payload, { onConflict: "user_id" })
      .select("*")
      .single();

    if (response.error !== null) {
      return err(mapPostgrestError(response.error, "save the artist profile"));
    }

    const artistRow: ArtistRow = response.data as ArtistRow;
    return ok(toPublicArtistProfile(mapArtistRow(artistRow)));
  } catch (error: unknown) {
    return err(
      createError("INTERNAL_ERROR", "Failed to initialize the artist profile store.", {
        cause: error instanceof Error ? error.message : "unknown"
      })
    );
  }
}

export async function fetchPublishedArtistsFromStore(
  filters: ArtistDiscoveryFilters
): Promise<Result<ArtistProfile[], AppError>> {
  try {
    const serverClient = createSupabaseServerClient();
    let query = serverClient
      .from("artists")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (filters.location !== undefined) {
      query = query.eq("location", filters.location);
    }

    if (filters.specialty !== undefined) {
      query = query.contains("specialty", [filters.specialty]);
    }

    if (filters.priceRange !== undefined) {
      query = query.eq("price_range", filters.priceRange);
    }

    const response = await query;
    if (response.error !== null) {
      return err(mapPostgrestError(response.error, "load artist discovery results"));
    }

    const artistRows: ArtistRow[] = response.data as ArtistRow[];
    return ok(artistRows.map((row: ArtistRow): ArtistProfile => toPublicArtistProfile(mapArtistRow(row))));
  } catch (error: unknown) {
    return err(
      createError("INTERNAL_ERROR", "Failed to initialize the artist discovery store.", {
        cause: error instanceof Error ? error.message : "unknown"
      })
    );
  }
}

export async function fetchPublishedArtistByUsernameFromStore(
  username: string
): Promise<Result<ArtistProfile, AppError>> {
  try {
    const serverClient = createSupabaseServerClient();
    const response = await serverClient
      .from("artists")
      .select("*")
      .eq("username", username)
      .eq("is_published", true)
      .maybeSingle();

    if (response.error !== null) {
      return err(mapPostgrestError(response.error, "load the public artist profile"));
    }

    if (response.data === null) {
      return err(createError("NOT_FOUND", "Artist profile not found."));
    }

    const artistRow: ArtistRow = response.data as ArtistRow;
    return ok(toPublicArtistProfile(mapArtistRow(artistRow)));
  } catch (error: unknown) {
    return err(
      createError("INTERNAL_ERROR", "Failed to initialize the public artist profile store.", {
        cause: error instanceof Error ? error.message : "unknown"
      })
    );
  }
}

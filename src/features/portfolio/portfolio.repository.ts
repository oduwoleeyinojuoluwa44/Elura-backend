import type { PostgrestError } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "../../lib/supabase/admin";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import type { Database } from "../../lib/supabase/database.types";
import { createError, type AppError } from "../../shared/errors";
import { err, ok, type Result } from "../../shared/result.types";
import type { CreatePortfolioImageInput, PortfolioImage } from "./portfolio.types";

type ArtistRow = Database["public"]["Tables"]["artists"]["Row"];
type PortfolioImageRow = Database["public"]["Tables"]["portfolio_images"]["Row"];
type PortfolioImageInsert = Database["public"]["Tables"]["portfolio_images"]["Insert"];

function mapPortfolioImageRow(row: PortfolioImageRow): PortfolioImage {
  return {
    id: row.id,
    artistId: row.artist_id,
    imageUrl: row.image_url,
    storagePath: row.storage_path,
    caption: row.caption,
    sortOrder: row.sort_order,
    createdAt: row.created_at
  };
}

function mapPostgrestError(error: PostgrestError, action: string): AppError {
  return createError("INTERNAL_ERROR", `Failed to ${action}.`, {
    code: error.code,
    details: error.details,
    hint: error.hint
  });
}

function isMissingPortfolioTableError(error: PostgrestError): boolean {
  return error.code === "PGRST205";
}

function isStoragePathOwnedByArtist(storagePath: string, artistId: string): boolean {
  const normalizedPath: string = storagePath.trim().replace(/^\/+/, "");

  return (
    normalizedPath.startsWith(`${artistId}/`) ||
    normalizedPath.startsWith(`portfolio-images/${artistId}/`)
  );
}

async function fetchArtistRowById(artistId: string): Promise<Result<ArtistRow | null, AppError>> {
  try {
    const adminClient = createSupabaseAdminClient();
    const response = await adminClient
      .from("artists")
      .select("*")
      .eq("id", artistId)
      .maybeSingle();

    if (response.error !== null) {
      return err(mapPostgrestError(response.error, "load the artist profile"));
    }

    if (response.data === null) {
      return ok(null);
    }

    return ok(response.data as ArtistRow);
  } catch (error: unknown) {
    return err(
      createError("INTERNAL_ERROR", "Failed to initialize the portfolio store.", {
        cause: error instanceof Error ? error.message : "unknown"
      })
    );
  }
}

export async function createPortfolioImageInStore(
  ownerUserId: string,
  input: CreatePortfolioImageInput
): Promise<Result<PortfolioImage, AppError>> {
  const artistResult: Result<ArtistRow | null, AppError> = await fetchArtistRowById(input.artistId);
  if (!artistResult.ok) {
    return artistResult;
  }

  if (artistResult.value === null) {
    return err(createError("NOT_FOUND", "Artist profile not found."));
  }

  if (artistResult.value.user_id !== ownerUserId) {
    return err(
      createError("FORBIDDEN", "You can only add portfolio images to your own artist profile.")
    );
  }

  if (!isStoragePathOwnedByArtist(input.storagePath, input.artistId)) {
    return err(
      createError(
        "VALIDATION_ERROR",
        "storagePath must live under the authenticated artist portfolio directory."
      )
    );
  }

  const payload: PortfolioImageInsert = {
    artist_id: input.artistId,
    image_url: input.imageUrl,
    storage_path: input.storagePath.trim(),
    caption: input.caption ?? null,
    sort_order: input.sortOrder ?? 0
  };

  try {
    const adminClient = createSupabaseAdminClient();
    const response = await adminClient
      .from("portfolio_images")
      .insert(payload)
      .select("*")
      .single();

    if (response.error !== null) {
      if (isMissingPortfolioTableError(response.error)) {
        return err(
          createError(
            "NOT_IMPLEMENTED",
            "Portfolio image persistence is not configured in this environment."
          )
        );
      }

      return err(mapPostgrestError(response.error, "save the portfolio image"));
    }

    return ok(mapPortfolioImageRow(response.data as PortfolioImageRow));
  } catch (error: unknown) {
    return err(
      createError("INTERNAL_ERROR", "Failed to initialize the portfolio store.", {
        cause: error instanceof Error ? error.message : "unknown"
      })
    );
  }
}

export async function fetchPortfolioImagesByArtistIdFromStore(
  artistId: string
): Promise<Result<PortfolioImage[], AppError>> {
  try {
    const serverClient = createSupabaseServerClient();
    const response = await serverClient
      .from("portfolio_images")
      .select("*")
      .eq("artist_id", artistId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (response.error !== null) {
      if (isMissingPortfolioTableError(response.error)) {
        return ok([]);
      }

      return err(mapPostgrestError(response.error, "load portfolio images"));
    }

    return ok((response.data as PortfolioImageRow[]).map(mapPortfolioImageRow));
  } catch (error: unknown) {
    return err(
      createError("INTERNAL_ERROR", "Failed to initialize the portfolio store.", {
        cause: error instanceof Error ? error.message : "unknown"
      })
    );
  }
}

export async function countPortfolioImagesByArtistIdInStore(
  artistId: string
): Promise<Result<number, AppError>> {
  try {
    const adminClient = createSupabaseAdminClient();
    const response = await adminClient
      .from("portfolio_images")
      .select("*", { count: "exact", head: true })
      .eq("artist_id", artistId);

    if (response.error !== null) {
      if (isMissingPortfolioTableError(response.error)) {
        return ok(0);
      }

      return err(mapPostgrestError(response.error, "count portfolio images"));
    }

    return ok(response.count ?? 0);
  } catch (error: unknown) {
    return err(
      createError("INTERNAL_ERROR", "Failed to initialize the portfolio store.", {
        cause: error instanceof Error ? error.message : "unknown"
      })
    );
  }
}

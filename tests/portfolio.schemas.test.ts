import assert from "node:assert/strict";
import test from "node:test";
import { parsePortfolioUploadFormData } from "../src/features/portfolio/portfolio-upload.utils.ts";

function createPngBytes(): Uint8Array {
  return new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d
  ]);
}

test("parsePortfolioUploadFormData accepts a valid PNG upload", async () => {
  const formData = new FormData();
  formData.set("artistId", "artist-123");
  formData.set("caption", "Soft glam");
  formData.set("sortOrder", "2");
  formData.set(
    "image",
    new File([createPngBytes()], "look.png", {
      type: "image/png"
    })
  );

  const result = await parsePortfolioUploadFormData(formData);

  assert.equal(result.artistId, "artist-123");
  assert.equal(result.caption, "Soft glam");
  assert.equal(result.sortOrder, 2);
  assert.equal(result.contentType, "image/png");
  assert.equal(result.fileExtension, "png");
  assert.equal(result.fileBytes[0], 0x89);
});

test("parsePortfolioUploadFormData rejects unsupported file contents", async () => {
  const formData = new FormData();
  formData.set("artistId", "artist-123");
  formData.set(
    "image",
    new File([new Uint8Array([0x41, 0x42, 0x43, 0x44])], "look.txt", {
      type: "text/plain"
    })
  );

  await assert.rejects(
    () => parsePortfolioUploadFormData(formData),
    /image must be a valid JPEG, PNG, GIF, or WebP file\./
  );
});

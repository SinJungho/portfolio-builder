import { publicStorageUrl } from "./storage";

describe("publicStorageUrl", () => {
  it("converts the authenticated S3 endpoint into a browser-readable public object URL", () => {
    expect(publicStorageUrl(
      "https://project-ref.storage.supabase.co/storage/v1/s3",
      "portfolio images",
      "uploads/profile photo.png",
    )).toBe(
      "https://project-ref.supabase.co/storage/v1/object/public/portfolio%20images/uploads/profile%20photo.png",
    );
  });
});

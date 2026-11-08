import { describe, expect, it } from "vitest";
import { productPatchSchema, productSchema } from "./product.schema";

describe("productPatchSchema", () => {
  it("keeps only the fields that were sent, so a quick change cannot blank the description", () => {
    expect(productPatchSchema.parse({ availability: "PREBOOK" })).toEqual({ availability: "PREBOOK" });
    expect(productPatchSchema.parse({ isPublished: false })).toEqual({ isPublished: false });
    expect(productPatchSchema.parse({ price: 500 })).toEqual({ price: 500 });
  });

  it("still clears the description when it is sent empty", () => {
    expect(productPatchSchema.parse({ description: "" })).toEqual({ description: "" });
  });
});

describe("productSchema", () => {
  it("creates a product with an empty description when none is sent", () => {
    const parsed = productSchema.parse({
      name: "পাটালি গুড়",
      category: "GUR",
      packSize: 1,
      packUnit: "kg",
      price: 500,
      comparePrice: null,
      availability: "IN_STOCK",
      isPublished: true,
      isFeatured: false,
      sortOrder: 0,
      images: [],
    });
    expect(parsed.description).toBe("");
  });
});

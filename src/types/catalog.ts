import type { Availability } from "@/constants/catalog";

export interface PublicImage {
  url: string;
  width: number;
  height: number;
}

export interface PublicProduct {
  id: string;
  slug: string;
  name: string;
  nameEn: string | null;
  category: string;
  packSize: number;
  packUnit: string;
  price: number;
  comparePrice: number | null;
  description: string;
  descriptionEn: string | null;
  availability: Availability;
  isFeatured: boolean;
  images: PublicImage[];
}

export interface AdminImage extends PublicImage {
  publicId: string;
}

export interface AdminProduct extends Omit<PublicProduct, "images"> {
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  images: AdminImage[];
}

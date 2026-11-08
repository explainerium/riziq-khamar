export const TIME_ZONE = "Asia/Dhaka";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3006").replace(/\/$/, "");

export const CART_STORAGE_KEY = "riziq-cart-v1";

/** Cloudinary folder every product photo goes into. */
export const UPLOAD_FOLDER = "riziq-khamar/products";

export const ADMIN_LINKS = {
  overview: "/admin",
  orders: "/admin/orders",
  products: "/admin/products",
  newProduct: "/admin/products/new",
  settings: "/admin/settings",
  login: "/admin/login",
} as const;

import { preconnect } from "react-dom";
import { cn } from "@/lib/utils";
import { cloudinaryWidth } from "@/utils/cloudinary";

const WIDTHS = [240, 360, 480, 640, 800, 1080, 1400];

/**
 * Plain <img> on purpose: Cloudinary already resizes and serves the best format
 * from its CDN, so the browser picks a width from `srcSet` and no JavaScript
 * or second optimizer is involved.
 */
export function CloudImage({
  url,
  alt,
  sizes,
  className,
  widths = WIDTHS,
  width,
  height,
  priority = false,
  thrifty = false,
}: {
  url: string;
  alt: string;
  sizes: string;
  className?: string;
  /** Only for images always shown small, like the logo. */
  widths?: number[];
  width?: number;
  height?: number;
  priority?: boolean;
  /** Fewer bytes for a little quality, where speed matters most: the first screen and grids of cards. */
  thrifty?: boolean;
}) {
  // The image that paints first: open the connection early.
  if (priority) preconnect("https://res.cloudinary.com");

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cloudinaryWidth(url, widths[Math.floor(widths.length / 2)], thrifty)}
      srcSet={widths.map((w) => `${cloudinaryWidth(url, w, thrifty)} ${w}w`).join(", ")}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={cn("object-cover", className)}
    />
  );
}

import { Leaf } from "lucide-react";
import { preconnect } from "react-dom";
import { cn } from "@/lib/utils";
import { cloudinaryWidth } from "@/utils/cloudinary";

const WIDTHS = [240, 360, 480, 640, 800, 1080, 1400];

/**
 * Plain <img> on purpose: Cloudinary already resizes and serves the best format
 * from its CDN, so the browser picks a width from `srcSet` and no JavaScript
 * or second optimizer is involved.
 */
export function ProductImage({
  url,
  alt,
  sizes,
  className,
  priority = false,
  thrifty = false,
}: {
  url: string | null | undefined;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  thrifty?: boolean;
}) {
  if (!url) {
    return (
      <div className={cn("grid place-items-center bg-secondary text-frond/40", className)} role="img" aria-label={alt}>
        <Leaf className="size-1/4" strokeWidth={1.25} aria-hidden />
      </div>
    );
  }

  // The image that paints first: open the connection early.
  if (priority) preconnect("https://res.cloudinary.com");

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cloudinaryWidth(url, 640, thrifty)}
      srcSet={WIDTHS.map((width) => `${cloudinaryWidth(url, width, thrifty)} ${width}w`).join(", ")}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={cn("object-cover", className)}
    />
  );
}

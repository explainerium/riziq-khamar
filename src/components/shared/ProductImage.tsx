import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { CloudImage } from "./CloudImage";

/** A product's photo, or a quiet leaf when it has none yet. */
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

  return <CloudImage url={url} alt={alt} sizes={sizes} priority={priority} thrifty={thrifty} className={className} />;
}

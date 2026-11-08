"use client";

import { useRef, useState } from "react";
import { ProductImage } from "@/components/shared/ProductImage";
import { cn } from "@/lib/utils";
import type { PublicImage } from "@/types/catalog";

/** Swipe on phones (scroll snap, no carousel script); thumbnails jump to a photo. */
export function ProductGallery({ images, alt }: { images: PublicImage[]; alt: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return <ProductImage url={null} alt={alt} sizes="100vw" className="leaf aspect-[4/5] w-full md:aspect-square" />;
  }

  return (
    <div className="min-w-0">
      <div
        ref={track}
        onScroll={(event) => {
          const { scrollLeft, clientWidth } = event.currentTarget;
          setActive(Math.round(scrollLeft / clientWidth));
        }}
        className="scrollbar-none leaf flex snap-x snap-mandatory overflow-x-auto"
      >
        {images.map((image, index) => (
          <div key={image.url} className="w-full shrink-0 snap-center">
            <ProductImage
              url={image.url}
              alt={alt}
              sizes="(min-width: 768px) 50vw, 100vw"
              priority={index === 0}
              className="aspect-[4/5] w-full md:aspect-square"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              aria-label={`${alt} ${index + 1}`}
              aria-current={index === active ? "true" : undefined}
              onClick={() => track.current?.scrollTo({ left: track.current.clientWidth * index, behavior: "smooth" })}
              className={cn(
                "leaf-sm size-14 overflow-hidden ring-2 ring-offset-2 ring-offset-mist transition",
                index === active ? "ring-frond" : "ring-transparent opacity-75",
              )}
            >
              <ProductImage url={image.url} alt="" sizes="56px" className="size-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

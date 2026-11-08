"use client";

import { ImagePlus, Star, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { ProductImage } from "@/components/shared/ProductImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MAX_PRODUCT_IMAGES } from "@/constants/catalog";
import { useApiErrorText } from "@/hooks/useApiErrorText";
import { useSignUploadMutation } from "@/redux/api/productApi";
import type { AdminImage } from "@/types/catalog";
import { uploadToCloudinary } from "@/utils/cloudinary";
import { resizeForUpload } from "@/utils/imageResize";
import { uuid } from "@/utils/uuid";

interface Pending {
  id: string;
  preview: string;
  percent: number;
}

/**
 * Photo tiles. Each photo is shrunk in the browser and sent straight to
 * Cloudinary with a one-time signature; the form only keeps the result.
 */
export function ImageUploader({ onBusyChange }: { onBusyChange: (busy: boolean) => void }) {
  const t = useTranslations("admin.products");
  const apiError = useApiErrorText();
  const { getValues, setValue } = useFormContext();
  const { field } = useController({ name: "images" });
  const images = (field.value ?? []) as AdminImage[];

  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [signUpload] = useSignUploadMutation();

  const setImages = (next: AdminImage[]) => setValue("images", next, { shouldDirty: true });

  const uploadOne = async (file: File) => {
    const id = uuid();
    const preview = URL.createObjectURL(file);
    setPending((current) => [...current, { id, preview, percent: 0 }]);

    try {
      const signed = await signUpload().unwrap();
      try {
        const blob = await resizeForUpload(file);
        const uploaded = await uploadToCloudinary(blob, signed, (percent) =>
          setPending((current) => current.map((entry) => (entry.id === id ? { ...entry, percent } : entry))),
        );
        // Read fresh: the list may have changed while this photo was uploading.
        setImages([...(getValues("images") as AdminImage[]), uploaded]);
      } catch {
        toast.error(t("uploadFailed"));
      }
    } catch (error) {
      toast.error(apiError(error));
    } finally {
      setPending((current) => current.filter((entry) => entry.id !== id));
      URL.revokeObjectURL(preview);
    }
  };

  const onFiles = async (list: FileList | null) => {
    const files = Array.from(list ?? []);
    if (input.current) input.current.value = "";
    if (files.length === 0) return;

    const room = MAX_PRODUCT_IMAGES - images.length - pending.length;
    if (files.length > room) toast.error(t("tooManyPhotos"));

    onBusyChange(true);
    // One at a time: on a phone connection, parallel uploads only slow each other down.
    for (const file of files.slice(0, Math.max(0, room))) await uploadOne(file);
    onBusyChange(false);
  };

  const makeMain = (index: number) => setImages([images[index], ...images.filter((_, i) => i !== index)]);
  const remove = (index: number) => setImages(images.filter((_, i) => i !== index));

  return (
    <div>
      <p className="text-[0.95rem] font-medium">{t("photos")}</p>
      <p className="text-sm text-muted-foreground">{t("photosHint")}</p>

      <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-3">
        {images.map((image, index) => (
          <li key={image.publicId} className="relative">
            <ProductImage url={image.url} alt="" sizes="140px" className="leaf-sm aspect-square w-full" />
            <Button
              type="button"
              size="icon-sm"
              aria-label={t("removePhoto")}
              onClick={() => remove(index)}
              className="absolute top-1 right-1 size-8 rounded-full bg-soil/80 text-white hover:bg-soil"
            >
              <X aria-hidden />
            </Button>
            {index === 0 ? (
              <Badge className="absolute bottom-1 left-1 h-auto bg-paddy px-2 py-0.5 text-xs font-semibold text-palm">
                {t("main")}
              </Badge>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={() => makeMain(index)}
                className="absolute bottom-1 left-1 rounded-full bg-white/90 px-2 text-palm hover:bg-white"
              >
                <Star aria-hidden />
                {t("makeMain")}
              </Button>
            )}
          </li>
        ))}

        {pending.map((entry) => (
          <li key={entry.id} className="leaf-sm relative aspect-square overflow-hidden" aria-busy>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={entry.preview} alt="" className="size-full object-cover opacity-50" />
            <span className="absolute inset-0 grid place-items-center font-bold text-palm">{entry.percent}%</span>
          </li>
        ))}

        {images.length + pending.length < MAX_PRODUCT_IMAGES && (
          <li>
            <Button
              type="button"
              variant="outline"
              onClick={() => input.current?.click()}
              className="leaf-sm! aspect-square h-auto w-full flex-col gap-1 border-2 border-dashed border-input bg-card p-1 text-sm whitespace-normal text-frond hover:bg-secondary hover:text-frond"
            >
              <ImagePlus className="size-6" aria-hidden />
              {t("addPhoto")}
            </Button>
          </li>
        )}
      </ul>

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(event) => onFiles(event.target.files)}
      />
    </div>
  );
}

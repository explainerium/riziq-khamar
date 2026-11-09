"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { CloudImage } from "@/components/shared/CloudImage";
import { MEDIA } from "@/constants/media";
import { cloudinaryWidth } from "@/utils/cloudinary";

const FRAME = "leaf aspect-[478/850] w-full bg-palm object-cover";

/**
 * A lazy image until someone taps play: a <video poster> downloads with the
 * page however far down it sits, and on a phone connection that competes with
 * the first screen.
 */
export function VideoPlayer({ playLabel }: { playLabel: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <video controls autoPlay playsInline poster={cloudinaryWidth(MEDIA.farmStoryPoster, 640)} className={FRAME}>
        <source src={MEDIA.farmStoryVideo} type="video/mp4" />
      </video>
    );
  }

  return (
    <button type="button" aria-label={playLabel} onClick={() => setPlaying(true)} className="group relative block w-full">
      <CloudImage url={MEDIA.farmStoryPoster} alt="" sizes="19rem" thrifty className={FRAME} />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-16 place-items-center rounded-full bg-palm/85 text-white transition-colors group-hover:bg-palm">
          <Play className="size-7 translate-x-0.5 fill-current" aria-hidden />
        </span>
      </span>
    </button>
  );
}

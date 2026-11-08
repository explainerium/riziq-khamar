"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { useFormContext, useFormState } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ProSubmitProps {
  children: ReactNode;
  /** Shown while the submit handler is in flight. */
  pendingLabel?: ReactNode;
  disabled?: boolean;
  className?: string;
  size?: ComponentProps<typeof Button>["size"];
}

/** How long a submit may run before the button says so in words. */
const SLOW_AFTER_MS = 4000;

/**
 * Submit button that disables itself while the form is submitting, so no call
 * site can forget to guard against a double submit.
 *
 * `useFormState`, not `useFormContext().formState`: the subscription belongs to
 * the component reading it, and this one is the one that has to re-render.
 */
export function ProSubmit({ children, pendingLabel, disabled, className, size = "lg" }: ProSubmitProps) {
  const t = useTranslations("common");
  const { control } = useFormContext();
  const { isSubmitting } = useFormState({ control });
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!isSubmitting) return;
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => {
      clearTimeout(timer);
      setSlow(false);
    };
  }, [isSubmitting]);

  return (
    <Button
      type="submit"
      size={size}
      disabled={isSubmitting || disabled}
      aria-busy={isSubmitting}
      className={cn(isSubmitting && "cursor-wait disabled:opacity-100", className)}
    >
      {isSubmitting && <Loader2 className="size-4 animate-spin" />}
      {isSubmitting ? (slow ? t("stillWorking") : (pendingLabel ?? t("working"))) : children}
    </Button>
  );
}

"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FieldShellProps {
  name: string;
  label?: string;
  description?: string;
  /** A key in `validation.*`, as the zod schemas report them. */
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

/** Label, control, hint and error in one stack, so every field looks and reads the same. */
export function FieldShell({ name, label, description, error, required, className, children }: FieldShellProps) {
  const t = useTranslations("validation");
  const errorText = error ? (t.has(error as never) ? t(error as never) : t("invalid")) : null;

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={name} className="text-[0.95rem] font-medium">
          {label}
          {required && (
            <span className="text-destructive" aria-hidden>
              {" "}
              *
            </span>
          )}
        </Label>
      )}

      {children}

      {/* The hint gives way to the error: two lines of small print under one field is noise. */}
      {errorText ? (
        <p id={`${name}-error`} role="alert" className="text-sm text-destructive">
          {errorText}
        </p>
      ) : description ? (
        <p id={`${name}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import type { HTMLInputAutoCompleteAttribute, HTMLInputTypeAttribute } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FieldShell } from "./FieldShell";

export interface ProInputProps {
  name: string;
  label?: string;
  type?: HTMLInputTypeAttribute;
  inputMode?: "text" | "tel" | "email" | "numeric" | "decimal" | "url";
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: HTMLInputAutoCompleteAttribute;
  className?: string;
}

export function ProInput({
  name,
  label,
  type = "text",
  inputMode,
  placeholder,
  description,
  required,
  disabled,
  autoComplete,
  className,
}: ProInputProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => (
        <FieldShell
          name={name}
          label={label}
          description={description}
          error={error?.message}
          required={required}
          className={className}
        >
          <Input
            {...field}
            id={name}
            type={type}
            inputMode={inputMode}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : description ? `${name}-description` : undefined}
            // `?? ""` keeps the input controlled from the first render.
            value={field.value ?? ""}
          />
        </FieldShell>
      )}
    />
  );
}

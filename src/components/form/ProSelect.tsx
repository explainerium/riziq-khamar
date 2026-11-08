"use client";

import { useTranslations } from "next-intl";
import { Controller, useFormContext } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FieldShell } from "./FieldShell";

export interface ProSelectOption {
  label: string;
  value: string;
}

export interface ProSelectProps {
  name: string;
  options: ProSelectOption[];
  label?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ProSelect({
  name,
  options,
  label,
  placeholder,
  description,
  required,
  disabled,
  className,
}: ProSelectProps) {
  const t = useTranslations("common");
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
          <Select
            value={field.value == null ? undefined : String(field.value)}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              id={name}
              className="w-full"
              aria-invalid={!!error}
              aria-describedby={error ? `${name}-error` : description ? `${name}-description` : undefined}
            >
              <SelectValue placeholder={placeholder ?? t("select")} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldShell>
      )}
    />
  );
}

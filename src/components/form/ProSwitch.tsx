"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ProSwitch({ name, label, description }: { name: string; label: string; description?: string }) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Label htmlFor={name} className="text-[0.95rem] font-medium">
              {label}
            </Label>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <Switch id={name} checked={!!field.value} onCheckedChange={field.onChange} className="mt-1" />
        </div>
      )}
    />
  );
}

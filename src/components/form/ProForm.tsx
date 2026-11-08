"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import {
  FormProvider,
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form";
import type { input, output, ZodType } from "zod";

export type FormSchema = ZodType<FieldValues, FieldValues>;

export interface ProFormProps<S extends FormSchema> {
  children: ReactNode;
  schema: S;
  /** Receives the form too, so a server error can be set on its field. */
  onSubmit: (values: output<S>, form: UseFormReturn<input<S>, unknown, output<S>>) => unknown;
  defaultValues?: DefaultValues<input<S>>;
  className?: string;
  id?: string;
}

/**
 * Form shell. Holds the react-hook-form context so every Pro* field below can
 * find it with useFormContext and no props have to be threaded down.
 *
 * onSubmit may be async: it is awaited, so isSubmitting stays true for the
 * whole request and ProSubmit can show that without extra state.
 */
export function ProForm<S extends FormSchema>({
  children,
  schema,
  onSubmit,
  defaultValues,
  className,
  id,
}: ProFormProps<S>) {
  const form = useForm<input<S>, unknown, output<S>>({
    resolver: zodResolver(schema as never) as unknown as Resolver<input<S>, unknown, output<S>>,
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <form id={id} className={className} onSubmit={form.handleSubmit((values) => onSubmit(values, form))} noValidate>
        {children}
      </form>
    </FormProvider>
  );
}

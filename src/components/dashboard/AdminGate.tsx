"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsClient } from "@/hooks/useIsClient";
import { useGetMeQuery } from "@/redux/api/authApi";
import { QueryError } from "./common";

function PageSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

function Gate({ children }: { children: ReactNode }) {
  const { data, isError, refetch } = useGetMeQuery();
  if (data) return children;
  // A 401 has already sent the browser to sign in; anything else can be retried.
  if (isError) return <QueryError onRetry={refetch} />;
  return <PageSkeleton />;
}

/**
 * Wraps each dashboard page: renders it in the browser once the session is
 * confirmed. The proxy already redirects signed-out visitors; this covers a
 * session that has ended since. RTK Query reads the clock, so it cannot run in
 * a prerender.
 */
export function AdminGate({ children }: { children: ReactNode }) {
  return useIsClient() ? <Gate>{children}</Gate> : <PageSkeleton />;
}

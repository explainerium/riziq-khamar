import { ok, route } from "@/server/http/route";

export const GET = route({ auth: true }, async ({ admin }) =>
  ok({ id: admin.id, name: admin.name, email: admin.email }),
);

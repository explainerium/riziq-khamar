import { clearSessionCookie } from "@/server/auth/session";
import { ok, route } from "@/server/http/route";

export const POST = route({}, async () => {
  const response = ok();
  clearSessionCookie(response);
  return response;
});

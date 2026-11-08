import { loginSchema } from "@/schemas/auth.schema";
import { setSessionCookie } from "@/server/auth/session";
import { clientIp, ok, route } from "@/server/http/route";
import { login } from "@/server/modules/auth/auth.service";

export const POST = route({ body: loginSchema }, async ({ req, body }) => {
  const { token, admin } = await login(body.email, body.password, clientIp(req));
  const response = ok(admin);
  setSessionCookie(response, token);
  return response;
});

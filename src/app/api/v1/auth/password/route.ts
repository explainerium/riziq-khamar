import { passwordSchema } from "@/schemas/auth.schema";
import { setSessionCookie } from "@/server/auth/session";
import { ok, route } from "@/server/http/route";
import { changePassword } from "@/server/modules/auth/auth.service";

export const PATCH = route({ auth: true, body: passwordSchema }, async ({ admin, body }) => {
  const token = await changePassword(admin, body.currentPassword, body.newPassword);
  const response = ok();
  setSessionCookie(response, token);
  return response;
});

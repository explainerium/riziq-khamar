import { ok, route } from "@/server/http/route";
import { signUpload } from "@/server/modules/upload/upload.service";

export const POST = route({ auth: true }, async () => ok(signUpload()));

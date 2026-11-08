import { Anek_Bangla } from "next/font/google";

/**
 * One variable family for Bangla and Latin keeps the font payload small on
 * phones. Only Bangla is preloaded; Latin still loads when a page uses it.
 */
const anek = Anek_Bangla({
  subsets: ["bengali"],
  variable: "--font-anek",
  display: "swap",
});

export const fontVariables = anek.variable;

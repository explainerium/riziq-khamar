import slugifyLib from "slugify";

const INDEPENDENT_VOWELS: Record<string, string> = {
  অ: "a",
  আ: "a",
  ই: "i",
  ঈ: "i",
  উ: "u",
  ঊ: "u",
  ঋ: "ri",
  এ: "e",
  ঐ: "oi",
  ও: "o",
  ঔ: "ou",
};

const VOWEL_SIGNS: Record<string, string> = {
  "া": "a",
  "ি": "i",
  "ী": "i",
  "ু": "u",
  "ূ": "u",
  "ৃ": "ri",
  "ে": "e",
  "ৈ": "oi",
  "ো": "o",
  "ৌ": "ou",
};

const CONSONANTS: Record<string, string> = {
  ক: "k",
  খ: "kh",
  গ: "g",
  ঘ: "gh",
  ঙ: "ng",
  চ: "ch",
  ছ: "chh",
  জ: "j",
  ঝ: "jh",
  ঞ: "n",
  ট: "t",
  ঠ: "th",
  ড: "d",
  ঢ: "dh",
  ণ: "n",
  ত: "t",
  থ: "th",
  দ: "d",
  ধ: "dh",
  ন: "n",
  প: "p",
  ফ: "f",
  ব: "b",
  ভ: "bh",
  ম: "m",
  য: "j",
  র: "r",
  ল: "l",
  শ: "sh",
  ষ: "sh",
  স: "s",
  হ: "h",
};

const NUKTA = "়";
const HALANT = "্";
const NUKTA_FORMS: Record<string, string> = { ড: "r", ঢ: "rh", য: "y" };
const SIGNS: Record<string, string> = { "ং": "ng", "ঃ": "h", "ৎ": "t" };

const isWordEnd = (char: string | undefined) => char === undefined || /\s/.test(char);

/**
 * A readable Latin spelling of Bangla text, for URLs: "পাটালি গুড়" → "patali gur".
 * The inherent vowel is kept inside a word and dropped at its end, as Bangla
 * is spoken. It does not need to be perfect; the admin can edit the slug.
 */
export function banglaToLatin(input: string): string {
  // NFC keeps ো whole but splits ড় into ড + nukta, which is the form handled below.
  const chars = [...input.normalize("NFC")];
  let output = "";

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    if (CONSONANTS[char]) {
      let sound = CONSONANTS[char];
      let next = i + 1;
      if (chars[next] === NUKTA && NUKTA_FORMS[char]) {
        sound = NUKTA_FORMS[char];
        next++;
      }
      output += sound;
      i = next - 1;

      const following = chars[next];
      const addsOwnVowel = following !== undefined && (VOWEL_SIGNS[following] !== undefined || following === HALANT);
      if (!addsOwnVowel && !isWordEnd(following)) output += "a";
      continue;
    }

    output += INDEPENDENT_VOWELS[char] ?? VOWEL_SIGNS[char] ?? SIGNS[char] ?? (char === HALANT || char === "ঁ" ? "" : char);
  }

  return output;
}

/** URL slug from any name: lowercase, Latin, hyphen-separated. Empty if nothing usable is left. */
export const toSlug = (input: string): string =>
  slugifyLib(banglaToLatin(input), { lower: true, strict: true, trim: true }).slice(0, 80).replace(/-+$/, "");

/** A slug not taken yet: "gur", then "gur-2", "gur-3", ... `isTaken` checks the table. */
export async function uniqueSlug(input: string, isTaken: (slug: string) => Promise<boolean>): Promise<string> {
  const base = toSlug(input) || "product";
  let candidate = base;
  for (let n = 2; await isTaken(candidate); n++) candidate = `${base}-${n}`;
  return candidate;
}

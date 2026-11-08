import type { DeliveryOption } from "@/types/settings";

/**
 * Used until the dashboard saves real settings. Contact details come from the
 * Facebook page; the delivery charges are starting values for the client to
 * confirm in Settings.
 */
export const DEFAULT_DELIVERY_OPTIONS: DeliveryOption[] = [
  { id: "inside-dhaka", label: "ঢাকার ভিতরে", labelEn: "Inside Dhaka", charge: 80 },
  { id: "outside-dhaka", label: "ঢাকার বাইরে", labelEn: "Outside Dhaka", charge: 130 },
];

export const DEFAULT_SETTINGS = {
  phone: "01890334837",
  whatsapp: "8801890334837",
  facebookUrl: "https://www.facebook.com/riziqkhamar",
  address: "তাড়াশ, সিরাজগঞ্জ",
  addressEn: "Tarash, Sirajganj",
  announcement: "এই শীতের গুড়ের প্রি-বুকিং চলছে",
  announcementEn: "Pre-booking is open for this winter's gur",
  prebookNote: "প্রি-বুকিং পণ্য তৈরি হওয়ার পর পাঠানো হবে। পাঠানোর আগে আমরা ফোন করে জানাবো।",
  prebookNoteEn: "Pre-booked items ship once they are ready. We will call you before sending them.",
  notifyEmail: null as string | null,
  deliveryOptions: DEFAULT_DELIVERY_OPTIONS,
};

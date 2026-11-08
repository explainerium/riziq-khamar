export interface DeliveryOption {
  id: string;
  label: string;
  labelEn: string | null;
  charge: number;
}

export interface StoreSettings {
  phone: string;
  whatsapp: string;
  facebookUrl: string;
  address: string;
  addressEn: string | null;
  announcement: string | null;
  announcementEn: string | null;
  prebookNote: string | null;
  prebookNoteEn: string | null;
  notifyEmail: string | null;
  deliveryOptions: DeliveryOption[];
}

/** What public pages may see: everything except the alert email. */
export type PublicSettings = Omit<StoreSettings, "notifyEmail">;

/** A wa.me link; `number` is digits with the country code, e.g. 8801890334837. */
export const whatsappLink = (number: string, text?: string): string =>
  `https://wa.me/${number.replace(/\D/g, "")}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

/** The same for a customer's local number (01XXXXXXXXX). */
export const whatsappLinkForLocal = (phone: string, text?: string): string => whatsappLink(`88${phone}`, text);

export const telLink = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, "")}`;

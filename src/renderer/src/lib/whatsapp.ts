/**
 * Normalizes a phone number and generates a WhatsApp URL.
 * Sri Lanka country code is 94.
 * Example local format: 0771234567 -> 94771234567
 */
export function formatWhatsAppUrl(phone: string, message: string): string {
  // Strip all non-numeric characters
  let cleanPhone = phone.replace(/\D/g, "");

  // If local zero number: 0771234567 -> 94771234567
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "94" + cleanPhone.substring(1);
  } else if (cleanPhone.length === 9) {
    // Missing country code: 771234567 -> 94771234567
    cleanPhone = "94" + cleanPhone;
  }

  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}

export const allocationVehicle = 'Ferrari 12Cilindri Coupé' as const;
export const ownershipOptions = ['Already own', 'Ordered', 'Considering purchase'] as const;
export type AllocationEnquiry = {
  name: string; phone: string; email: string; country: string;
  vehicle: typeof allocationVehicle; ownership: string; message: string; consent: boolean;
};

export function validateAllocationEnquiry(value: unknown): AllocationEnquiry | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const limits = { name: 100, phone: 35, email: 254, country: 80, ownership: 40, message: 3000 };
  const data: Record<string, string> = {};
  for (const [key, limit] of Object.entries(limits)) {
    if (typeof input[key] !== 'string') return null;
    data[key] = input[key].trim();
    if (data[key].length > limit || (key !== 'message' && !data[key])) return null;
    if (key !== 'message' && /[\r\n\x00-\x1f]/.test(data[key])) return null;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return null;
  if (!/^\+?[\d\s().-]+$/.test(data.phone) || data.phone.replace(/\D/g, '').length < 7 || data.phone.replace(/\D/g, '').length > 15) return null;
  if (!ownershipOptions.some(option => option === data.ownership) || input.consent !== true) return null;
  return { ...data, vehicle: allocationVehicle, consent: true } as AllocationEnquiry;
}

export function allocationEnquiryText(data: AllocationEnquiry, available: boolean) {
  return [
    available ? 'Private enquiry: Ferrari 12Cilindri N-LARGO allocation' : 'Future opportunity enquiry: Ferrari 12Cilindri N-LARGO (fully allocated)',
    'NOVITEC conversion package only — Ferrari vehicle not included.',
    `Full name: ${data.name}`, `WhatsApp / phone: ${data.phone}`, `Email: ${data.email}`,
    `Country: ${data.country}`, `Vehicle: ${data.vehicle}`, `Ownership status: ${data.ownership}`,
    `Message: ${data.message || 'No additional message.'}`, 'Customer agreed to be contacted about this enquiry.',
  ].join('\n\n');
}

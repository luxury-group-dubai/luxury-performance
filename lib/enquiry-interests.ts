export const enquiryInterests = [
  'Exhausts',
  'Carbon & body kits',
  'Wheels',
  'Suspension',
  'Genuine OEM parts',
  'Complete package',
  'Other / not sure',
] as const;

const legacyInterests: Record<string, string[]> = {
  'Exhaust & performance': ['Exhausts'],
  'Carbon & aerodynamics': ['Carbon & body kits'],
  'Wheels & suspension': ['Wheels', 'Suspension'],
  'A complete programme': ['Complete package'],
  'Help me decide': ['Other / not sure'],
};

export function resolveEnquiryInterests(value: string): string[] {
  if (legacyInterests[value]) return legacyInterests[value];
  return enquiryInterests.some(interest => interest === value) ? [value] : [];
}

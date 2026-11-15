// Campaign controls. Change status to 'fully-allocated' when the allocation is sold.
// Keep deliveryWindow null until February 2027 vs Q2 2027 is confirmed.
export type AllocationStatus = 'available' | 'fully-allocated';
export const nlargoAllocation: {
  status: AllocationStatus;
  deliveryWindow: string | null;
  arrival: string;
  mediaStage: 'teaser' | 'release';
} = {
  status: 'available',
  deliveryWindow: null,
  arrival: 'Expected in Dubai in November 2026',
  mediaStage: 'teaser',
};

export const nlargoPath = '/novitec-12cilindri-n-largo';
export const nlargoAvailable = nlargoAllocation.status === 'available';
export const nlargoStatus = nlargoAvailable ? 'Only 1 allocation available' : 'Fully allocated';
export const nlargoCta = nlargoAvailable ? 'Enquire about allocation' : 'Discuss future opportunities';
export const nlargoGallery = [
  { src: '/images/nlargo/hero.webp', alt: 'Ferrari 12Cilindri N-LARGO in NOVITEC’s official teaser film' },
  { src: '/images/nlargo/detail.webp', alt: 'Detail of the Ferrari 12Cilindri N-LARGO from NOVITEC’s official teaser film' },
];

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
  mediaStage: 'release',
};

export const nlargoPath = '/novitec-12cilindri-n-largo';
export const nlargoAvailable = nlargoAllocation.status === 'available';
export const nlargoStatus = nlargoAvailable ? 'Only 1 allocation available' : 'Fully allocated';
export const nlargoCta = nlargoAvailable ? 'Enquire about allocation' : 'Discuss future opportunities';
export const nlargoGallery = [
  { redSrc: '/images/nlargo/gallery-front-red.webp', src: '/images/nlargo/gallery-front-light.webp', alt: 'Front view of the Ferrari 12Cilindri N-LARGO', caption: 'Front view' },
  { redSrc: '/images/nlargo/gallery-overhead-red.webp', src: '/images/nlargo/release-front.webp', alt: 'Overhead front three-quarter view of the Ferrari 12Cilindri N-LARGO', caption: 'Overhead view' },
  { redSrc: '/images/nlargo/gallery-rear-red.webp', src: '/images/nlargo/gallery-rear-light.webp', alt: 'Rear three-quarter view of the Ferrari 12Cilindri N-LARGO', caption: 'Rear three-quarter view' },
  { redSrc: '/images/nlargo/gallery-low-front-red.webp', src: '/images/nlargo/gallery-low-front-light.webp', alt: 'Low front three-quarter view of the Ferrari 12Cilindri N-LARGO', caption: 'Front three-quarter view' },
  { redSrc: '/images/nlargo/gallery-back-red.webp', src: '/images/nlargo/release-diffuser.webp', alt: 'Rear view of the Ferrari 12Cilindri N-LARGO', caption: 'Rear detailing' },
  { redSrc: '/images/nlargo/gallery-low-rear-red.webp', src: '/images/nlargo/gallery-low-rear-light.webp', alt: 'Low rear three-quarter view of the Ferrari 12Cilindri N-LARGO', caption: 'Low rear view', alignment: 'low-rear' },
];

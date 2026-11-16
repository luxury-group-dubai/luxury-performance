import { nlargoGallery } from './nlargo-allocation';

export type NlargoHeroImage = { id: string; label: string; src: string; alt: string; lighting: 'red' | 'light'; shift: number; scale?: number; offsetX?: number; edge: string; extension?: string; background: string };
const backgrounds: Record<string, string> = {
  "front-light": "rgb(51,61,69)",
  "front-quarter-light": "rgb(77,87,95)",
  "front-quarter-red": "rgb(195,0,1)",
  "front-red": "rgb(220,0,1)",
  "low-rear-light": "rgb(90,99,108)",
  "low-rear-red": "rgb(194,0,1)",
  "overhead-light": "rgb(78,88,96)",
  "overhead-red": "rgb(231,0,1)",
  "rear-quarter-light": "rgb(88,99,107)",
  "rear-quarter-red": "rgb(218,0,1)"
};

// These two photographs cast a shadow through the sampled edge. Extend only
// the studio wall/floor tones so that shadow is not repeated across the copy.
const studioExtensions: Record<string, string> = {
  'low-rear-light': 'linear-gradient(rgb(90,99,108),rgb(100,110,118) 20%,rgb(98,108,116) 50%,rgb(178,188,196) 75%,rgb(119,129,137) 85%,rgb(64,74,82))',
  'front-quarter-light': 'linear-gradient(rgb(77,87,95),rgb(87,97,105) 20%,rgb(96,106,114) 40%,rgb(132,142,150) 70%,rgb(98,108,116) 80%,rgb(48,58,66))',
};

// Match each car's visual centre while retaining the front hero's scale.
const angles = [
  { id: 'front', index: 0, shift: 0 },
  { id: 'overhead', index: 1, shift: -3 },
  { id: 'rear-quarter', index: 2, shift: -10 },
  { id: 'low-rear', index: 5, shift: -8 },
  { id: 'front-quarter', index: 3, shift: -7 },
];
export const nlargoHeroImages: NlargoHeroImage[] = angles.flatMap(angle => {
  const photo = nlargoGallery[angle.index];
  return (['red', 'light'] as const).map(lighting => ({
    id: `${angle.id}-${lighting}`, label: `${photo.caption} — ${lighting === 'red' ? 'Red' : 'Light'}`,
    src: `/images/nlargo/hero-${angle.id}-${lighting}.webp`,
    edge: `/images/nlargo/hero-${angle.id}-${lighting}-edge.png`,
    background: backgrounds[`${angle.id}-${lighting}`],
    extension: studioExtensions[`${angle.id}-${lighting}`],
    alt: `${photo.alt}, ${lighting === 'red' ? 'red' : 'studio'} lighting`, lighting,
    // The studio exposures were framed slightly differently. Match the car,
    // not the frame edges, so revealing light does not move or resize it.
    shift: angle.shift + (lighting === 'light' ? angle.id === 'low-rear' ? 3.91124 : angle.id === 'front-quarter' ? 0.77356 : 0 : 0),
    scale: lighting === 'light' && angle.id === 'low-rear' ? 1.013415 : 1,
    offsetX: lighting === 'light' && angle.id === 'low-rear' ? 0.15764 : 0,
  }));
});

type HeroImage = { image: string; mobile: { src: string; width: number; height: number }; alt: string };

/** Keep the homepage slides and partner landing pages on the same original artwork. */
export const brandHeroImages: Partial<Record<string, HeroImage>> = {
  novitec: {
    image: '/images/home/novitec-purosangue-esteso.jpg',
    mobile: { src: '/images/home/novitec-purosangue-esteso.jpg', width: 2560, height: 1717 },
    alt: 'Black and red Ferrari Purosangue ESTESO builds with NOVITEC widebody styling, carbon fibre and forged wheels',
  },
  valvetronic: {
    image: '/images/home/valvetronic-porsche.webp',
    mobile: { src: '/images/home/valvetronic-mobile.jpg', width: 1320, height: 1639 },
    alt: 'Porsche GT3 RS with a Valvetronic Designs exhaust in a specialist installation bay',
  },
  techart: {
    image: '/images/home/techart-gtstreet-touring-full.jpg',
    mobile: { src: '/images/home/techart-gtstreet-touring-full.jpg', width: 3000, height: 2000 },
    alt: 'Blue TECHART GTstreet R Touring Porsche 911 on an Alpine road, with carbon aerodynamics and custom wheels',
  },
};

/** Partner cards and landing pages share each brand's selected artwork. */
export const partnerHeroImages: Partial<Record<string, HeroImage>> = {
  ...brandHeroImages,
  capristo: {
    image: '/images/partners/capristo-f40-enhanced.png',
    mobile: { src: '/images/partners/capristo-f40-enhanced.png', width: 1672, height: 941 },
    alt: 'Ferrari F40 fitted with a Capristo exhaust',
  },
  novitec: {
    image: '/images/novitec-models/novitec-partner-hero-wide.jpg',
    mobile: { src: '/images/novitec-models/novitec-partner-hero-mobile.jpg', width: 687, height: 1024 },
    alt: 'NOVITEC Ferrari Purosangue lineup in a dark studio',
  },
};

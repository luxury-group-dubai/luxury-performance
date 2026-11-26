import Image from 'next/image';
import { ArrowLink } from '@/components/ui';
import { partnerCardImages } from '@/lib/brand-hero-images';
import { DivisionsSection } from './divisions-section';
import styles from './divisions-timeline.module.css';

type DivisionPhoto = {
  src: string;
  alt: string;
  aspectRatio?: number;
  paired?: boolean;
  filter?: string;
  objectPosition?: string;
};

const stripedFerrariStill = '/images/divisions/rental-fleet-striped-ferrari.webp';
const convoyStill = '/images/divisions/rental-fleet-convoy.webp';

const divisions = [
  {
    period: '2019', name: 'Luxury Supercar Rentals',
    mark: 'lsr',
    gallery: [
      { src: '/images/divisions/rental-lamborghini-road.webp', alt: 'Red Lamborghini from the rental fleet facing the camera on a palm-lined road' },
      // Each row crops the matching shot from the two three-panel reel stills.
      { src: stripedFerrariStill, alt: 'Turquoise McLaren on the Dubai highway', paired: true, aspectRatio: 1.82, objectPosition: 'center 1.5%' },
      { src: convoyStill, alt: 'A red Lamborghini, teal SUV and striped Ferrari driving abreast on the highway', paired: true, aspectRatio: 1.82, objectPosition: 'center 1.5%' },
      { src: stripedFerrariStill, alt: 'Yellow racing stripes on the bonnet of a grey Ferrari', paired: true, aspectRatio: 1.82, objectPosition: 'center 51.5%' },
      { src: convoyStill, alt: 'Driver at the open window of a teal SUV', paired: true, aspectRatio: 1.82, objectPosition: 'center 51.5%' },
      { src: stripedFerrariStill, alt: 'Front view of the rental convoy across several highway lanes', paired: true, aspectRatio: 1.82, objectPosition: 'center bottom' },
      { src: convoyStill, alt: 'Close-up of a red Lamborghini in the convoy', paired: true, aspectRatio: 1.82, objectPosition: 'center bottom' },
      {
        src: '/images/divisions/rental-showroom-sign-wide.webp',
        alt: 'Illuminated Luxury Supercar Rentals wing emblems on the corner of the glass showroom at night',
        aspectRatio: 16 / 9,
        objectPosition: 'center top',
        filter: 'saturate(.86) brightness(.86) contrast(1.04)',
      },
    ],
    story: 'The group began with a fleet of supercars for hire in Dubai. Drivers could get behind the wheel of a Ferrari, Lamborghini or McLaren for the day.',
    alt: 'Three supercars lined up in the desert beneath a sunset sky',
    href: 'https://luxurysupercarsdubai.com', link: 'Explore rentals',
  },
  {
    period: '2021', name: 'Luxury Chauffeur Services',
    mark: 'lcs',
    gallery: [
      { src: '/images/divisions/chauffeur-at-the-wheel.webp', alt: 'View from the rear seat of a chauffeur driving a Rolls-Royce with tan leather seats' },
      { src: '/images/divisions/chauffeur-rolls-royce-arrival.webp', alt: 'Black Rolls-Royce waiting at an entrance with its rear door held open', paired: true },
      { src: '/images/divisions/chauffeur-wedding-flowers.webp', alt: 'White wedding flowers tied to the door of a Rolls-Royce convertible', paired: true },
      { src: '/images/divisions/chauffeur-opening-door.webp', alt: 'A suited chauffeur holding open the door of a black Rolls-Royce', aspectRatio: 1 },
    ],
    story: 'Two years later, the group took the wheel. A dedicated chauffeur team began driving executives, visiting artists and diplomatic guests across the UAE.',
    alt: 'A chauffeur between a black SUV and saloon, with the Burj Khalifa in the distance',
    href: 'https://luxurychauffeurdubai.com', link: 'Chauffeur services',
  },
  {
    period: '2022', name: 'Source Luxury Cars',
    mark: 'slc',
    gallery: [
      { src: '/images/divisions/sourcing-purosangue-transporter.webp', alt: 'Black Ferrari Purosangue secured inside a curtain-sided transporter' },
      { src: '/images/divisions/sourcing-black-porsche.webp', alt: 'Black Porsche 911 beside a transporter outside a lit showroom at night', paired: true, aspectRatio: 4 / 3 },
      { src: '/images/divisions/sourcing-gt3-rs-flatbed.webp', alt: 'White Porsche 911 GT3 RS strapped to a flatbed at night', paired: true, aspectRatio: 4 / 3 },
      { src: '/images/divisions/sourcing-ferrari-unloading.webp', alt: 'Black Ferrari on the loading ramp of an enclosed transporter', paired: true, aspectRatio: 4 / 3 },
      { src: '/images/divisions/sourcing-ferrari-enclosed.webp', alt: 'Red Ferrari inside an illuminated enclosed transporter at night', paired: true, aspectRatio: 4 / 3 },
      { src: '/images/divisions/sourcing-airfreight.webp', alt: 'Classic silver coupé on a cargo pallet beside an Emirates SkyCargo aircraft', objectPosition: 'center bottom' },
    ],
    story: 'When a collector’s search led overseas, Source Luxury Cars found and imported the car. The team focused on rare supercars and limited-production models, primarily from Europe.',
    alt: 'A black supercar outside a yellow DHL cargo building',
    href: 'https://sourceluxurycars.com', link: 'Explore sourcing',
  },
  {
    period: '2025', name: 'Luxury Auto Care',
    mark: 'lac',
    gallery: [
      { src: '/images/divisions/auto-care-workshop-bays.webp', alt: 'Turquoise, red and yellow supercars in adjacent service bays at Luxury Auto Care', aspectRatio: 4 / 3 },
      { src: '/images/divisions/auto-care-technicians.webp', alt: 'Two Luxury Auto Care technicians working under an open bonnet in the Al Quoz workshop', paired: true, aspectRatio: 4 / 3 },
      { src: '/images/divisions/auto-care-brake-inspection.webp', alt: 'Technician shining a light on an exposed brake disc beside a yellow caliper', paired: true, aspectRatio: 4 / 3 },
      { src: '/images/home/ferrari-sf90-workshop-aligned-v1.webp', alt: 'Technician working on a red Ferrari SF90 in the workshop', aspectRatio: 4 / 3 },
    ],
    story: 'The group opened its own workshop in Al Quoz. Paintwork, upholstery, protective film and mechanical work came together under one roof, alongside performance parts installation.',
    alt: 'A red supercar with its engine cover raised beside an orange sports car inside the workshop',
    href: 'https://luxuryautocaredubai.com/', link: 'Explore the workshop',
  },
  {
    period: '2026', name: 'Luxury Car Gallery',
    mark: 'lcg',
    gallery: [
      { src: '/images/divisions/gallery-revuelto-rear.webp', alt: 'Rear view of the gallery’s matte-black Lamborghini Revuelto against a white backdrop' },
      { src: '/images/divisions/gallery-g63-rear.webp', alt: 'Rear of a black Mercedes-AMG G63 with its spare wheel mounted on the tailgate', paired: true },
      { src: '/images/divisions/gallery-570s-rear.webp', alt: 'White McLaren 570S photographed from behind against a white studio backdrop', paired: true },
      { src: '/images/divisions/gallery-valhalla-exhaust.webp', alt: 'Twin top-exit exhausts and a yellow stripe on the purple Aston Martin Valhalla’s carbon fibre engine cover', aspectRatio: 1.55 },
    ],
    image: '/images/divisions/car-gallery-valhalla.webp',
    story: 'Luxury Car Gallery brought vehicle sales to the group’s Al Quoz showroom. Buyers can explore new and pre-owned cars, and owners can offer theirs on consignment.',
    alt: 'Aston Martin Valhalla photographed head-on with both doors raised',
    href: 'https://www.dubicars.com/dealers/dubai-luxury-car-gallery-auto-trading-3413', link: 'Browse the gallery',
  },
  {
    period: 'TODAY', name: 'Luxury Performance',
    mark: 'lxp',
    gallery: [{ src: '/images/home/techart-gtstreet-r-wheel.webp', alt: 'Red TECHART wheel and yellow brake caliper on a silver GTstreet R', aspectRatio: 1.85 }],
    partnerPhotos: [{ slug: 'valvetronic', paired: true }, { slug: 'capristo', paired: true }, { slug: 'gintani', paired: false }],
    image: '/images/nlargo/hero-front-red.webp',
    story: 'Today, we bring that workshop experience to owners choosing their next upgrade. At LXP, we help you find the exhaust, wheels or carbon fibre parts that fit your car.',
    alt: 'Front view of the NOVITEC Ferrari 12Cilindri N-LARGO under red studio lights',
    href: '/partners', link: 'Meet our partners',
  },
].map(division => {
  const slug = division.period.toLowerCase();
  const photos: DivisionPhoto[] = [{ src: division.image ?? `/images/divisions/${slug}.webp`, alt: division.alt }, ...division.gallery];
  for (const partner of division.partnerPhotos ?? []) {
    const artwork = partnerCardImages[partner.slug];
    if (artwork) photos.push({ src: artwork.image, alt: artwork.alt, paired: partner.paired, aspectRatio: partner.paired ? 1.5 : undefined });
  }
  return { ...division, slug, photos };
});

export function DivisionsTimeline() {
  return (
    <DivisionsSection>
      <header className={styles.intro}>
        <Image
          className={styles.introPhoto}
          src="/images/divisions/forecourt-sunset-enhanced.webp"
          alt=""
          fill
          quality={90}
          sizes="(max-width: 767px) max(100vw, min(146.67vw, 96svh)), (max-aspect-ratio: 4/3) 133.34svh, 100vw"
        />
        <h2 id="divisions-title">Our divisions.</h2>
      </header>
      <div className={styles.track}>
        <div aria-hidden="true" className={styles.rail}><span className={styles.marker} /></div>
        <ol className={styles.chapters}>
          {divisions.map(({ period, slug, photos, mark, name, story, href, link }) => (
            <li id={'division-' + slug} key={slug} className={styles.chapter}>
              <div className={styles.year}>
                {slug === 'today' ? period : <time dateTime={period}>{period}</time>}
              </div>
              <div className={styles.chapterContent}>
                <div className={styles.story}>
                  <h3>{name}</h3>
                  <p>{story}</p>
                </div>
                <div className={styles.mediaColumn}>
                  <div className={styles.gallery}>
                    {photos.map((photo, index) => (
                      <div key={`${photo.src}-${photo.objectPosition ?? 'center'}`} className={photo.paired ? `${styles.photo} ${styles.paired}` : styles.photo} style={{ aspectRatio: photo.aspectRatio }}
                        data-division={index === 0 ? mark : undefined}>
                        <Image className={styles.photoImage} src={photo.src} alt={photo.alt} fill style={{ filter: photo.filter, objectPosition: photo.objectPosition }}
                          sizes={photo.paired
                            ? '(max-width: 650px) calc(50vw - 46px), (max-width: 767px) calc(45vw - 22px), (max-width: 1000px) 23.5vw, (max-width: 1686px) 22vw, 370px'
                            : '(max-width: 650px) calc(100vw - 84px), (max-width: 767px) calc(90vw - 36px), (max-width: 1000px) 47vw, (max-width: 1686px) 44vw, 745px'} />
                        {index === 0 && <Image className={styles.coverLogo} src={`/images/divisions/marks/${mark}.svg`}
                          width={600} height={600} alt="" />}
                      </div>
                    ))}
                  </div>
                  <div className={styles.logoFrame} aria-hidden="true">
                    <svg className={styles.closingEmblem} viewBox="60 310 934 364" width="934" height="364" focusable="false">
                      <use className={styles.closingWings} href={`/images/divisions/marks/${mark}-winged-gold.svg#wings`} />
                      <svg className={styles.closingLettering} x="527" y="529" width="934" height="364" viewBox="527 529 934 364" overflow="visible">
                        <use href={`/images/divisions/marks/${mark}-winged-gold.svg#lettering`} />
                      </svg>
                    </svg>
                  </div>
                  {href && <ArrowLink className={styles.galleryLink} href={href} external={href.startsWith('https://')}>{link}</ArrowLink>}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </DivisionsSection>
  );
}

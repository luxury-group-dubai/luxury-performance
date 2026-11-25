import Image from 'next/image';
import { ChapterNav } from '@/components/chapter-nav';
import { ArrowLink } from '@/components/ui';
import { DivisionsSection } from './divisions-section';
import styles from './divisions-timeline.module.css';

type DivisionPhoto = { src: string; alt: string; aspectRatio?: number };

const divisions = [
  {
    period: '2019', label: 'Rentals', name: 'Luxury Supercar Rentals',
    mark: 'lsr', detail: { src: '/images/divisions/rental-revuelto.webp', alt: 'Red Revuelto from the rental fleet with its doors raised in the desert' },
    additionalPhoto: { src: '/images/divisions/rental-lamborghini-road.webp', alt: 'Red Lamborghini from the rental fleet facing the camera on a palm-lined road' },
    story: 'The group began with a fleet of supercars for hire in Dubai. Drivers could get behind the wheel of a Ferrari, Lamborghini or McLaren for the day.',
    alt: 'Three supercars lined up in the desert beneath a sunset sky',
    href: 'https://luxurysupercarsdubai.com', link: 'Explore rentals',
  },
  {
    period: '2021', label: 'Chauffeur', name: 'Luxury Chauffeur Services',
    mark: 'lcs', detail: { src: '/images/divisions/chauffeur-opening-door.webp', alt: 'A suited chauffeur holding open the door of a black Rolls-Royce', aspectRatio: 1 },
    additionalPhoto: { src: '/images/divisions/chauffeur-at-the-wheel.webp', alt: 'View from the rear seat of a chauffeur driving a Rolls-Royce with tan leather seats' },
    story: 'Two years later, the group took the wheel. A dedicated chauffeur team began driving executives, visiting artists and diplomatic guests across the UAE.',
    alt: 'A chauffeur between a black SUV and saloon, with the Burj Khalifa in the distance',
    href: 'https://luxurychauffeurdubai.com', link: 'Chauffeur services',
  },
  {
    period: '2022', label: 'Sourcing', name: 'Source Luxury Cars',
    mark: 'slc',
    additionalPhoto: { src: '/images/divisions/sourcing-purosangue-transporter.webp', alt: 'Black Ferrari Purosangue secured inside a curtain-sided transporter' },
    detail: { src: '/images/divisions/sourcing-ferrari-enclosed.webp', alt: 'Red Ferrari inside an illuminated enclosed transporter at night' },
    story: 'When a collector’s search led overseas, Source Luxury Cars found and imported the car. The team focused on rare supercars and limited-production models, primarily from Europe.',
    alt: 'A black supercar outside a yellow DHL cargo building',
    href: 'https://sourceluxurycars.com', link: 'Explore sourcing',
  },
  {
    period: '2025', label: 'Auto care', name: 'Luxury Auto Care',
    mark: 'lac', detail: { src: '/images/home/ferrari-sf90-workshop-aligned-v1.webp', alt: 'Technician working on a red Ferrari SF90 in the workshop', aspectRatio: 4 / 3 },
    additionalPhoto: { src: '/images/divisions/auto-care-technicians.webp', alt: 'Two Luxury Auto Care technicians working under an open bonnet in the Al Quoz workshop' },
    story: 'The group opened its own workshop in Al Quoz. Paintwork, upholstery, protective film and mechanical work came together under one roof, alongside performance parts installation.',
    alt: 'A red supercar with its engine cover raised beside an orange sports car inside the workshop',
  },
  {
    period: '2026', label: 'Gallery', name: 'Luxury Car Gallery',
    mark: 'lcg', detail: { src: '/images/divisions/valhalla-mirror.webp', alt: 'Yellow mirror against the purple Aston Martin Valhalla bodywork' },
    additionalPhoto: { src: '/images/divisions/gallery-revuelto-rear.webp', alt: 'Rear view of the gallery’s matte-black Lamborghini Revuelto against a white backdrop' },
    image: '/images/divisions/car-gallery-valhalla.webp',
    story: 'Luxury Car Gallery brought vehicle sales to the group’s Al Quoz showroom. Buyers can explore new and pre-owned cars, and owners can offer theirs on consignment.',
    alt: 'Aston Martin Valhalla photographed head-on with both doors raised',
    href: 'https://www.dubicars.com/dealers/dubai-luxury-car-gallery-auto-trading-3413', link: 'Browse the gallery',
  },
  {
    period: 'TODAY', label: 'Performance', name: 'Luxury Performance',
    mark: 'lxp', detail: { src: '/images/home/techart-gtstreet-r-wheel.webp', alt: 'Red TECHART wheel and yellow brake caliper on a silver GTstreet R' },
    image: '/images/nlargo/hero-front-red.webp',
    story: 'Today, we bring that workshop experience to owners choosing their next upgrade. At LXP, we help you find the exhaust, wheels or carbon fibre parts that fit your car.',
    alt: 'Front view of the NOVITEC Ferrari 12Cilindri N-LARGO under red studio lights',
    href: '/partners', link: 'Meet our partners',
  },
].map(division => {
  const slug = division.period.toLowerCase();
  const photos: DivisionPhoto[] = [{ src: division.image ?? `/images/divisions/${slug}.webp`, alt: division.alt }];
  if (division.additionalPhoto) photos.push(division.additionalPhoto);
  photos.push(division.detail);
  return { ...division, slug, photos };
});

const chapters = divisions.map(({ period, slug, label }) => ({
  id: 'division-' + slug, title: period, detail: label,
}));

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
          sizes="(max-aspect-ratio: 4/3) 133.34svh, 100vw"
        />
        <h2 id="divisions-title">Our divisions.</h2>
      </header>
      <ChapterNav label="Divisions timeline" chapters={chapters} activeAt="var(--pin-top)" />
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
                      <div key={photo.src} className={styles.photo} style={{ aspectRatio: photo.aspectRatio }}
                        data-division={index === 0 ? mark : undefined}>
                        <Image className={styles.photoImage} src={photo.src} alt={photo.alt} fill
                          sizes="(max-width: 650px) calc(100vw - 70px - clamp(69px, 18vw, 102px)), (max-width: 760px) calc(90vw - 124px), (max-width: 1000px) 47vw, (max-width: 1686px) 44vw, 745px" />
                        {index === 0 && <Image className={styles.coverLogo} src={`/images/divisions/marks/${mark}.svg`}
                          width={600} height={600} alt="" />}
                      </div>
                    ))}
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

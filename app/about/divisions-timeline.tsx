import Image from 'next/image';
import { ChapterNav } from '@/components/chapter-nav';
import { ArrowLink } from '@/components/ui';
import styles from './divisions-timeline.module.css';

const divisions = [
  {
    period: '2019', label: 'Rentals', name: 'Luxury Supercar Rentals',
    story: 'The group began with a fleet of supercars for hire in Dubai. Drivers could get behind the wheel of a Ferrari, Lamborghini or McLaren for the day.',
    alt: 'Three supercars lined up in the desert beneath a sunset sky',
    href: 'https://luxurysupercarsdubai.com', link: 'Explore rentals',
  },
  {
    period: '2021', label: 'Chauffeur', name: 'Luxury Chauffeur Services',
    story: 'Two years later, the group took the wheel. A dedicated chauffeur team began driving executives, visiting artists and diplomatic guests across the UAE.',
    alt: 'A chauffeur between a black SUV and saloon, with the Burj Khalifa in the distance',
    href: 'https://luxurychauffeurdubai.com', link: 'Chauffeur services',
  },
  {
    period: '2022', label: 'Sourcing', name: 'Source Luxury Cars',
    story: 'When a collector’s search led overseas, Source Luxury Cars found and imported the car. The team focused on rare supercars and limited-production models, primarily from Europe.',
    alt: 'A black supercar outside a yellow DHL cargo building',
    href: 'https://sourceluxurycars.com', link: 'Explore sourcing',
  },
  {
    period: '2025', label: 'Auto care', name: 'Luxury Auto Care',
    story: 'The group opened its own workshop in Al Quoz. Paintwork, upholstery, protective film and mechanical work came together under one roof, alongside performance parts installation.',
    alt: 'A red supercar with its engine cover raised beside an orange sports car inside the workshop',
  },
  {
    period: '2026', label: 'Gallery', name: 'Luxury Car Gallery',
    image: 'car-gallery-valhalla',
    story: 'Luxury Car Gallery brought vehicle sales to the group’s Al Quoz showroom. Buyers can explore new and pre-owned cars, and owners can offer theirs on consignment.',
    alt: 'Purple Aston Martin Valhalla with both doors raised beneath the Luxury Car Gallery wordmark',
    href: 'https://www.dubicars.com/dealers/dubai-luxury-car-gallery-auto-trading-3413', link: 'Browse the gallery',
  },
  {
    period: 'Today', label: 'Performance', name: 'Luxury Performance',
    story: 'Today, we bring that workshop experience to owners choosing their next upgrade. At LXP, we help you find the exhaust, wheels or carbon fibre parts that fit your car.',
    alt: 'A pair of gold NOVITEC exhaust tips set into red bodywork',
    href: '/partners', link: 'Meet our partners',
  },
].map(division => ({ ...division, slug: division.period.toLowerCase() }));

const chapters = divisions.map(({ period, slug, label }) => ({
  id: 'division-' + slug, title: period, detail: label,
}));

export function DivisionsTimeline() {
  return (
    <section id="our-divisions" aria-labelledby="divisions-title" className={styles.archive}>
      <div className={styles.opening}>
        <header className={styles.intro}>
          <h2 id="divisions-title">Our divisions.</h2>
          <p>It started with supercar rentals in Dubai. Here’s how the group grew into six divisions.</p>
        </header>
      </div>
      <ChapterNav label="Divisions timeline" chapters={chapters} />
      <ol className={styles.chapters}>
        {divisions.map(({ period, slug, image = slug, name, alt, story, href, link }) => (
          <li id={'division-' + slug} key={slug} className={styles.chapter}>
            <div className={styles.caption}>
              <div className={styles.year}>
                {period === 'Today' ? period : <time dateTime={period}>{period}</time>}
              </div>
              <div className={styles.story}>
                <h3>{name}</h3>
                <p>{story}</p>
                {href && <ArrowLink href={href} external={href.startsWith('https://')}>{link}</ArrowLink>}
              </div>
            </div>
            <div className={styles.photo}>
              <Image src={'/images/divisions/' + image + '.webp'} alt={alt} fill
                sizes="(max-width: 650px) calc(100vw - 48px), (max-width: 760px) 90vw, (max-width: 1000px) 47vw, (max-width: 1686px) 44vw, 745px" />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

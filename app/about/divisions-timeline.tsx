import Image from 'next/image';
import { ChapterNav } from '@/components/chapter-nav';
import { ArrowLink } from '@/components/ui';
import styles from './divisions-timeline.module.css';

const divisions = [
  {
    year: '2019', label: 'Rentals', name: 'Luxury Supercar Rentals',
    story: 'The group began with a fleet of supercars for hire in Dubai. Drivers could get behind the wheel of a Ferrari, Lamborghini or McLaren for the day.',
    alt: 'Three supercars lined up in the desert beneath a sunset sky',
    href: 'https://luxurysupercarsdubai.com', link: 'Explore rentals',
  },
  {
    year: '2021', label: 'Chauffeur', name: 'Luxury Chauffeur Services',
    story: 'Two years later, the group took the wheel. A dedicated chauffeur team began driving executives, visiting artists and diplomatic guests across the UAE.',
    alt: 'A chauffeur between a black SUV and saloon, with the Burj Khalifa in the distance',
    href: 'https://luxurychauffeurdubai.com', link: 'Chauffeur services',
  },
  {
    year: '2022', label: 'Sourcing', name: 'Source Luxury Cars',
    story: 'When a collector’s search led overseas, Source Luxury Cars found and imported the car. The team focused on rare supercars and limited-production models, primarily from Europe.',
    alt: 'A black supercar outside a yellow DHL cargo building',
    href: 'https://sourceluxurycars.com', link: 'Explore sourcing',
  },
  {
    year: '2025', label: 'Auto care', name: 'Luxury Auto Care',
    story: 'The group opened its own workshop in Al Quoz. Paintwork, upholstery, protective film and mechanical work came together under one roof, alongside performance parts installation.',
    alt: 'A red supercar with its engine cover raised beside an orange sports car inside the workshop',
  },
  {
    year: '2026', label: 'Performance', name: 'Luxury Performance',
    story: 'LXP brought that workshop experience to owners choosing their next upgrade. Our performance division pairs specialist parts with advice on what fits each car.',
    alt: 'A pair of gold NOVITEC exhaust tips set into red bodywork',
    href: '/partners', link: 'Meet our partners',
  },
];

const chapters = divisions.map(({ year, label }) => ({
  id: 'division-' + year, title: year, detail: label,
}));

export function DivisionsTimeline() {
  return (
    <section id="our-divisions" aria-labelledby="divisions-title" className={styles.archive}>
      <div className={styles.index}>
        <header className={styles.intro}>
          <h2 id="divisions-title">Our divisions.</h2>
          <p>It started with supercar rentals in Dubai. Here’s how the group grew into five divisions.</p>
        </header>
        <ChapterNav label="Divisions by founding year" chapters={chapters} />
      </div>
      <ol className={styles.chapters}>
        {divisions.map(({ year, name, alt, story, href, link }) => (
          <li id={'division-' + year} key={year} className={styles.chapter}>
            <div className={styles.photo}>
              <Image src={'/images/divisions/' + year + '.webp'} alt={alt} fill
                sizes="(max-width: 760px) 100vw, (max-width: 1650px) 58vw, 960px" />
              <time dateTime={year} className={styles.year}>{year}</time>
            </div>
            <div className={styles.caption}>
              <h3>{name}</h3>
              <p>{story}</p>
              {href && <ArrowLink href={href} external={href.startsWith('https://')}>{link}</ArrowLink>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

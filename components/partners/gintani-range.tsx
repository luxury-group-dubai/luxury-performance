import Image from 'next/image';
import Link from 'next/link';
import { BrandArtwork } from '@/components/brand-artwork';
import newsprint from '@/components/hero-newsprint.module.css';
import { ArrowLink } from '@/components/ui';
import styles from '@/app/partners/partners.module.css';
import { GintaniMakeNav } from './gintani-make-nav';
import { PartnerFaq } from './partner-faq';

const makes = [
  {
    id: 'gintani-lamborghini',
    title: 'Lamborghini',
    systems: [
      ['aventador-svj-ultimae', 'Aventador SVJ / Ultimae', 'Full exhaust system'],
      ['aventador-sv-cutout', 'Aventador SV', 'Full exhaust system'],
      ['aventador-s-cutout', 'Aventador S', 'Full exhaust system'],
      ['huracan-cutout', 'Huracán', 'Rear exhaust system'],
      ['revuelto', 'Revuelto', 'F1 exhaust system'],
    ],
  },
  {
    id: 'gintani-ferrari',
    title: 'Ferrari',
    systems: [
      ['ferrari-812-f12', '812 / F12', 'Valved exhaust system'],
      ['ferrari-488-pista-f8', '488 / Pista / F8', 'Full exhaust system'],
      ['ferrari-purosangue', 'Purosangue', 'F1 valved exhaust system'],
    ],
  },
  {
    id: 'gintani-mclaren',
    title: 'McLaren',
    systems: [['mclaren-765lt', '765LT', 'Full exhaust system']],
  },
  {
    id: 'gintani-porsche',
    title: 'Porsche',
    systems: [['porsche-992-gt3-gt3rs-cutout', '992 GT3 / GT3 RS', 'Exhaust system']],
  },
];

const chapters = makes.map(({ id, title }) => ({ id, title }));
const enquiry = '/contact?programme=Gintani';

export function GintaniRange() {
  return <>
    <section className={`${styles.introduction} ${styles.gintaniIntroduction}`} aria-labelledby="gintani-intro-title">
      <div>
        <h2 id="gintani-intro-title">Built for sound.<br />Built to fit.</h2>
        <p>Gintani hand-welds stainless steel exhaust systems in Southern California. The range includes full systems, rear sections and valved options. Our Dubai team can help with fitment, sound and installation.</p>
      </div>
      <div className={styles.gintaniIntroPhoto}>
        <div className={styles.gintaniIntroPhotoArtwork}>
          <Image src="/images/partners/gintani/gintani-ferrari-purosangue.webp"
            alt="Gintani F1 valved exhaust system for the Ferrari Purosangue" fill
            sizes="(max-width: 700px) 90vw, 44vw" quality={75} />
        </div>
      </div>
    </section>
    <div className={styles.gintaniWordmark} aria-hidden="true">
      <BrandArtwork brand="gintani" className={styles.gintaniWordmarkArtwork} labelled={false}
        sizes="(min-width: 1800px) 1600px, 90vw" loading="lazy" />
    </div>
    <div id="gintani-range" className={styles.gintaniBrowsing}>
      <section className={styles.gintaniCategories} aria-labelledby="gintani-range-title">
        <div className={styles.gintaniCategorySidebar}>
          <div className={styles.gintaniCategoryBackdrop}>
            <Image src="/images/partners/gintani/hero.webp" alt="" fill sizes="100vw" />
          </div>
          <div className={styles.gintaniCategoryNav}>
            <h2 id="gintani-range-title">Exhaust systems by make</h2>
            <GintaniMakeNav chapters={chapters} />
          </div>
        </div>
        <div className={styles.gintaniCategoryStory}>
          {makes.map(({ id, title, systems }) => (
            <article key={id} id={id} className={`${styles.gintaniCategory} ${styles.gintaniChapter}`}>
              <h3>{title}</h3>
              <ul className={styles.gintaniSystems}>
                {systems.map(([photo, model, system]) => (
                  <li key={photo} className={styles.gintaniSystem}>
                    <Link href={`/products/gintani-${photo.replace(/-cutout$/, '')}`} prefetch={false} className={styles.gintaniProductLink}>
                      <div className={`${styles.gintaniSystemPhoto} ${newsprint.photo}`}>
                        <Image src={`/images/partners/gintani/gintani-${photo}.webp`} alt="" fill
                          sizes="(max-width: 700px) 90vw, 44vw" quality={75} />
                      </div>
                      <h4>{model}</h4>
                      <p>{system}</p>
                    </Link>
                    <ArrowLink href={`${enquiry}&${new URLSearchParams({
                      vehicle: `${title} ${model}`,
                      details: `I’m interested in the Gintani ${system.toLowerCase()} for the ${title} ${model}. Please confirm fitment and availability.`,
                    })}`}>Enquire about fitment<span className="sr-only">{` for ${title} ${model}`}</span></ArrowLink>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
    <PartnerFaq brand="gintani" enquiry={enquiry} />
    <section className={styles.support} aria-labelledby="gintani-support-title">
      <h2 id="gintani-support-title">Need help with fitment?</h2>
      <div>
        <p>Tell our Dubai team what you drive and the sound you’re after. We’ll help confirm fitment, configuration and availability.</p>
        <ArrowLink href={enquiry} light>Talk to our team</ArrowLink>
      </div>
    </section>
  </>;
}

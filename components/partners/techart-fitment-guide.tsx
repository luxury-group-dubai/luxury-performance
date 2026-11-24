import Link from 'next/link';
import styles from './techart-fitment-guide.module.css';

export function TechartFitmentGuide() {
  return <section className={styles.guide} aria-labelledby="techart-fitment-title">
    <h2 id="techart-fitment-title">Built around your Porsche.</h2>
    <div>
      <p>Start with an individual carbon detail or plan a specification across bodywork, wheels, exhaust, suspension and interior. The TECHART range differs by model and generation. Choose your model and generation above, then select its variant and body style in the shop to explore matching parts and prices.</p>
      <h3>TECHART for the Porsche 911.</h3>
      <p>Match the generation, variant and body style to your car. Carrera, Turbo, GT3, GT3 RS and S/T parts should not be assumed interchangeable, even within the same generation. Check the product notes and any factory equipment requirements.</p>
      <h3>TECHART for the Porsche Cayenne.</h3>
      <p>Confirm the generation and SUV or Coupé body style before choosing parts. A facelift, hybrid powertrain or different factory equipment can change fitting requirements. Parts marked for fitment confirmation need a further compatibility check before ordering.</p>
      <h3>Plan your upgrades in Dubai.</h3>
      <p>Our team can help check part numbers and finishes, confirm the supplied components, availability and delivery estimates, and discuss installation options. Tell us which Porsche you drive and the changes you have in mind.</p>
      <nav aria-label="Explore TECHART Porsche parts" className={styles.links}>
        <Link href="/shop/techart/porsche/911">Shop TECHART Porsche 911 parts</Link>
        <Link href="/shop/techart/porsche/cayenne">Shop TECHART Porsche Cayenne parts</Link>
        <Link href="/contact?programme=TECHART">Discuss your Porsche specification</Link>
      </nav>
    </div>
  </section>;
}

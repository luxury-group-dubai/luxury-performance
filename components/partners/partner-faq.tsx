import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import styles from './partner-faq.module.css';

const questions = {
  'fi-exhaust': [
    {
      question: 'How do I order an FI Exhaust system in Dubai?',
      answer: <>Send our team an <Link href="/contact?programme=FI%20Exhaust">FI Exhaust enquiry</Link> with your vehicle model, year, engine and the sound you have in mind. We can help identify the available system and confirm its configuration, price and availability.</>,
    },
    {
      question: 'How do I confirm an FI Exhaust system fits my car?',
      answer: 'Share your exact model, year, engine, body style and any existing exhaust modifications. We’ll check the fitting requirements and supplied components for the system you’re considering before you order.',
    },
    {
      question: 'How are the exhaust valves controlled?',
      answer: 'The control setup depends on the vehicle and system. Ask us to confirm how the valves operate, which controls are included and whether additional components are needed for your car.',
    },
    {
      question: 'Can you help with FI Exhaust installation in Dubai?',
      answer: 'Yes. Tell us which system you’re considering and what is already fitted to your car. Our team can discuss compatibility, installation options and timing with you.',
    },
    {
      question: 'How do I check FI Exhaust pricing and lead times?',
      answer: 'Ask our team for a quotation for your exact vehicle and configuration. We’ll confirm current availability, the supplied components and the delivery estimate before you place an order.',
    },
  ],
  gintani: [
    {
      question: 'Which cars does Gintani make exhausts for?',
      answer: 'The range above covers selected Lamborghini Aventador, Huracán and Revuelto models, Ferrari 812, F12, 488, Pista, F8 and Purosangue models, the McLaren 765LT and the Porsche 992 GT3 and GT3 RS.',
    },
    {
      question: 'How do I confirm fitment?',
      answer: <>Check the <Link href="/shop/gintani">Gintani product listing</Link> for your vehicle. Tell our Dubai team your model year, exact trim and any changes to your current exhaust so we can check fitment and what the system includes.</>,
    },
    {
      question: 'Can I choose a valved exhaust?',
      answer: 'Some systems offer valved and non-valved configurations. Tell us how you want the car to sound and we’ll confirm the options and valve controls for your model.',
    },
    {
      question: 'How do I get pricing and a lead time?',
      answer: <>Check the <Link href="/shop/gintani">Gintani shop</Link> for the price, available configurations and stock status of your system. For supplier orders or a specific delivery date, ask our Dubai team to confirm the current lead time and installation options before ordering.</>,
    },
    {
      question: 'Can I use a Gintani exhaust on the road?',
      answer: 'Some systems are intended for closed-course use. Tell us where and how you plan to use the car so we can confirm the manufacturer’s intended use for the exact system.',
    },
  ],
  capristo: [
    {
      question: 'Where can I buy CAPRISTO exhausts in Dubai?',
      answer: <>Browse our <Link href="/shop/capristo">CAPRISTO catalogue</Link> to see exhaust systems, carbon fibre components and the other parts listed for your vehicle. Our Dubai team can help confirm compatibility, price and availability before you order.</>,
    },
    {
      question: 'How do I find the right CAPRISTO system for my car?',
      answer: 'Choose your vehicle make and model, then select the generation and version where available. Check the listing for engine, body style and fitment notes. Share your model year and existing modifications if you need help confirming compatibility.',
    },
    {
      question: 'Can I order carbon fibre parts as well as an exhaust?',
      answer: <>Explore <Link href="/shop/capristo?category=Aerodynamics">CAPRISTO aerodynamic components</Link> alongside the <Link href="/shop/capristo?category=Exhaust">exhaust range</Link>. Carbon parts and finishes vary by model; check the supplied components and fitting requirements on each listing.</>,
    },
    {
      question: 'Can you help with CAPRISTO installation in Dubai?',
      answer: 'Tell us your vehicle details and the components you are considering. We can discuss fitting requirements, installation options and timing before you place your order.',
    },
    {
      question: 'Are CAPRISTO parts in stock or special order?',
      answer: 'Check the product listing for stock status. Availability depends on the exact part and specification. Ask our team to confirm current lead times for supplier orders before ordering for a particular date.',
    },
  ],
  techart: [
    {
      question: 'Where can I buy TECHART Porsche parts in Dubai?',
      answer: <>Explore the <Link href="/shop/techart">TECHART shop at Luxury Performance</Link> for Porsche bodywork, carbon fibre parts, wheels, exhausts, suspension and interior upgrades. Start with your 911 or Cayenne, then select its generation, body style and trim. Our Dubai team can help confirm part numbers, availability and installation options.</>,
    },
    {
      question: 'Which Porsche models can I find TECHART parts for?',
      answer: <>Browse TECHART parts for the <Link href="/shop/techart/porsche/911">Porsche 911</Link> and <Link href="/shop/techart/porsche/cayenne">Cayenne</Link>, then select the correct generation and body style. Availability varies by variant and the upgrade you’re considering.</>,
    },
    {
      question: 'How do I confirm a TECHART part fits my Porsche?',
      answer: 'Check the exact generation, model, body style and any fitment notes on the listing. Share your model year, factory options and existing modifications with us if you need help. Parts marked for fitment confirmation need an additional check before ordering.',
    },
    {
      question: 'Can I order individual parts or a complete TECHART package?',
      answer: 'You can explore individual upgrades or plan a package for your Porsche. Some components require matching parts or specific factory equipment, so ask us to confirm the full requirements for your build.',
    },
    {
      question: 'Can you help with TECHART installation in Dubai?',
      answer: 'Yes. Send us your vehicle details and the parts you have in mind. We’ll discuss compatibility, fitting requirements, installation options and timing.',
    },
    {
      question: 'Are TECHART parts in stock or made to order?',
      answer: 'Check each listing for its stock status. Availability and lead times depend on the part and specification. Contact us to confirm timing for special orders and any painting or finishing required.',
    },
    {
      question: 'What is included with the part I’m ordering?',
      answer: 'Check the listing for the supplied components and finish. Photos may show a car fitted with several upgrades. Ask us to confirm whether painting, fitting hardware or additional components are included in your chosen part.',
    },
  ],
  novitec: [
    {
      question: 'Which cars does NOVITEC support?',
      answer: <>Explore NOVITEC for <Link href="/partners/novitec/ferrari">Ferrari</Link>, <Link href="/partners/novitec/lamborghini">Lamborghini</Link>, <Link href="/partners/novitec/mclaren">McLaren</Link> and <Link href="/partners/novitec/rolls-royce">Rolls-Royce</Link>. Available parts depend on the model, generation and body style. Choose your exact vehicle before ordering.</>,
    },
    {
      question: 'How do I check whether a NOVITEC part fits my car?',
      answer: 'Match the listing to your model, year and variant. Share your current wheels, suspension, bodywork or exhaust setup with us if it affects the part you’re considering.',
    },
    {
      question: 'Can I buy a single part or plan a complete build?',
      answer: <>You can order individual NOVITEC <Link href="/shop/novitec?category=Aerodynamics">carbon fibre and body kit components</Link>, <Link href="/shop/novitec?category=Exhaust">exhausts</Link>, <Link href="/shop/novitec?category=Wheels">wheels</Link> or <Link href="/shop/novitec?category=Suspension">suspension</Link>. For a complete build, our Dubai team can check component compatibility and discuss the fitting requirements. Parts and finishes vary by vehicle.</>,
    },
    {
      question: 'Can you help with NOVITEC installation in Dubai?',
      answer: 'Yes. Send us your vehicle details and the parts you have in mind. We’ll discuss the fitting requirements, installation options and timing.',
    },
    {
      question: 'How do I check availability and lead times?',
      answer: 'Check the product listing for its stock status. If a part is on special order or you need it by a specific date, ask us to confirm the current lead time before ordering.',
    },
  ],
  valvetronic: [
    {
      question: 'Which Valvetronic exhaust fits my car?',
      answer: <>Start with the <Link href="/shop/valvetronic">Valvetronic Designs catalogue</Link> and select your vehicle make and model. Fitment depends on your exact year, engine and existing exhaust setup. Send our Dubai team those details and any modifications so we can confirm the right system.</>,
    },
    {
      question: 'How do I control the exhaust valves?',
      answer: 'Valve controls vary by system. Some applications use the car’s existing controls, while others use a separate controller. Check the product listing or ask us what’s included for your vehicle.',
    },
    {
      question: 'How will it sound on my car?',
      answer: <>Vehicle, exhaust configuration and recording conditions all affect what you hear. Start with <a href="#hear-the-difference">Hear the difference</a>, then ask us for a comparable setup if cabin sound or drone is a priority.</>,
    },
    {
      question: 'Can you help with Valvetronic installation in Dubai?',
      answer: 'Yes. Tell us which system you’re considering and what’s already fitted. We’ll go over compatibility, fitting requirements and available installation options.',
    },
    {
      question: 'Are Valvetronic exhausts in stock or special order?',
      answer: 'Availability varies by system and specification. Check the listing for stock status and contact us for the current lead time on special orders.',
    },
    {
      question: 'What warranty applies to my Valvetronic system?',
      answer: 'Ask us for the warranty terms for your exact system before ordering. Product coverage and installation workmanship may have separate terms.',
    },
  ],
};

export function PartnerFaq({ brand, enquiry }: { brand: keyof typeof questions; enquiry: string }) {
  return (
    <section id="faq" className={styles.section} aria-labelledby="partner-faq-title">
      <div className={styles.intro}>
        <h2 id="partner-faq-title">Frequently asked questions</h2>
        <p>Have a question about your car? <Link href={enquiry}>Ask our team</Link>.</p>
      </div>
      <div className={styles.questions}>
        {questions[brand].map(({ question, answer }) => (
          <details key={question} name={`${brand}-faq`} className={styles.item}>
            <summary>
              <span>{question}</span>
              <ChevronDown size={18} strokeWidth={1.5} aria-hidden="true" />
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

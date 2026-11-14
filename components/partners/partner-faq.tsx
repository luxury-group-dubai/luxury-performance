import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import styles from './partner-faq.module.css';

const questions = {
  gintani: [
    {
      question: 'Which cars does Gintani make exhausts for?',
      answer: 'The range above covers selected Lamborghini Aventador, Huracán and Revuelto models, Ferrari 812, F12, 488, Pista, F8 and Purosangue models, the McLaren 765LT and the Porsche 992 GT3 and GT3 RS.',
    },
    {
      question: 'How do I confirm fitment?',
      answer: 'Use the enquiry link on your chosen system. Tell us your model year, exact trim and any changes to your current exhaust so we can check fitment and what the system includes.',
    },
    {
      question: 'Can I choose a valved exhaust?',
      answer: 'Some systems offer valved and non-valved configurations. Tell us how you want the car to sound and we’ll confirm the options and valve controls for your model.',
    },
    {
      question: 'How do I get pricing and a lead time?',
      answer: 'Send a fitment enquiry for the system you’re considering. Our Dubai team can confirm the configuration, current price, availability and installation options before you order.',
    },
    {
      question: 'Can I use a Gintani exhaust on the road?',
      answer: 'Some systems are intended for closed-course use. Tell us where and how you plan to use the car so we can confirm the manufacturer’s intended use for the exact system.',
    },
  ],
  techart: [
    {
      question: 'Which Porsche models can I find TECHART parts for?',
      answer: 'Start with the vehicle selector above to see the models and generations in our catalogue. Availability varies by variant, body style and the type of upgrade you’re considering.',
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
      answer: 'Our NOVITEC range covers Ferrari, Lamborghini, McLaren and Rolls-Royce. Available parts depend on the model, generation and body style.',
    },
    {
      question: 'How do I check whether a NOVITEC part fits my car?',
      answer: 'Match the listing to your model, year and variant. Share your current wheels, suspension, bodywork or exhaust setup with us if it affects the part you’re considering.',
    },
    {
      question: 'Can I buy a single part or plan a complete build?',
      answer: 'You can shop for individual aerodynamic parts, exhausts, wheels or suspension. For a complete build, we can help check how the parts fit together on your car.',
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
      answer: 'Fitment depends on your exact model, year, engine and existing exhaust setup. Send us those details and any modifications so we can help confirm the right system.',
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

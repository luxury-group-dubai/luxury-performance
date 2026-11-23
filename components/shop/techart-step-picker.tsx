import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Filters } from '@/lib/shop/taxonomy';
import type { VehicleGeneration, VehicleProfile } from '@/lib/shop/techart-fitment';
import { techartStep } from '@/lib/shop/techart-steps';
import { shopBrandHref } from '@/lib/shop/routes';
import placeholders from '@/lib/generated/porsche-selector-placeholders.json';
import { SelectorCarImage } from './selector-car-image';
import styles from './techart-step-picker.module.css';

export type TechartOptions = Record<'911' | 'cayenne', VehicleGeneration[]>;
type Props = { options: TechartOptions; model?: '911' | 'cayenne'; generation?: string; body?: string; headingLevel?: 2 | 3 };

export function techartStepHeading({ model, generation, body }: Pick<Props, 'model' | 'generation' | 'body'>) {
  return !model ? 'Choose your Porsche.' : !generation ? `Choose your ${model === '911' ? '911' : 'Cayenne'} generation.`
    : !body ? 'Choose your body style.' : 'Choose your trim.';
}

export function TechartStepPicker({ options, model, generation, body, headingLevel = 2 }: Props) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  const state = model ? techartStep(options[model], { brand: 'techart', model, generation, body }) : undefined;
  const base: Filters = { brand: 'techart', make: 'porsche', model, generation };
  const cards: { name: string; detail: string; filters: Filters; image?: VehicleProfile }[] = !model
    ? (['911', 'cayenne'] as const).filter(key => options[key].length).map(key => ({
      name: `Porsche ${key === '911' ? '911' : 'Cayenne'}`, detail: 'Choose generation', filters: { brand: 'techart', make: 'porsche', model: key },
      image: options[key].at(-1)?.bodies[0]?.choices[0]?.image,
    }))
    : !state?.generation ? options[model].map(item => ({ name: item.name, detail: 'Choose body style', filters: { ...base, generation: item.key }, image: item.bodies[0]?.choices[0]?.image }))
    : !state.body ? state.bodies.map(item => ({ name: item.name, detail: 'Choose trim', filters: { ...base, body: item.key }, image: item.choices[0]?.image }))
    : state.body.choices.map(item => ({ name: item.name, detail: item.count ? `${item.count} ${item.count === 1 ? 'part' : 'parts'}` : 'Confirm available parts', filters: { ...base, body, fit: item.fit }, image: item.image }));
  return <section className={styles.picker} aria-label={techartStepHeading({ model, generation, body })}>
    <div className={styles.grid}>
      {cards.map(card => <Link className={styles.card} key={card.name} href={shopBrandHref('techart', card.filters)}>
        <div className={styles.image}>{card.image && <SelectorCarImage {...card.image} placeholder={(placeholders as Record<string, string>)[card.image.src] || card.image.src} optimized={false} />}</div>
        <div className={styles.caption}><Heading>{card.name}</Heading><ArrowUpRight size={18} aria-hidden="true" /></div>
        <p>{card.detail}</p>
      </Link>)}
    </div>
    {!cards.length && <p>No parts are currently listed for this selection. <Link href="/contact?programme=TECHART">Ask our team about your Porsche.</Link></p>}
    {model && <p className={styles.note}>Images illustrate the model or body style. Parts are matched to your selected generation, body style and trim.</p>}
  </section>;
}

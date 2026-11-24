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
type Props = { options: TechartOptions; model?: '911' | 'cayenne'; generation?: string; body?: string; fit?: string; headingLevel?: 2 | 3 };

export function techartStepHeading({ model, generation, fit }: Pick<Props, 'model' | 'generation' | 'body' | 'fit'>) {
  return !model ? 'Choose your Porsche.' : !generation ? `Choose your ${model === '911' ? '911' : 'Cayenne'} generation.`
    : !fit ? 'Choose your variant.' : 'Choose your body style.';
}

export function TechartStepPicker({ options, model, generation, body, fit, headingLevel = 2 }: Props) {
  const Heading = headingLevel === 3 ? 'h3' : 'h2';
  if (!model) return <section className={styles.picker} aria-label="Choose your Porsche.">
    <div className={styles.modelGrid}>
      {(['911', 'cayenne'] as const).filter(key => options[key].length).map(key => {
        const image = options[key].at(-1)?.bodies[0]?.choices[0]?.image;
        return <details key={key} className={styles.model} name="techart-model">
          <summary className={styles.card}>
            <div className={styles.image}>{image && <SelectorCarImage {...image} placeholder={(placeholders as Record<string, string>)[image.src] || image.src} optimized={false} />}</div>
            <div className={styles.caption}><Heading>Porsche {key === '911' ? '911' : 'Cayenne'}</Heading><ArrowUpRight size={18} aria-hidden="true" /></div>
            <p>Choose generation</p>
          </summary>
          <div className={styles.expanded}>
            <p className={styles.prompt}>Select your generation</p>
            <div className={styles.generations}>
              {[...options[key]].reverse().map(item => <Link className={styles.generation} key={item.key} href={shopBrandHref('techart', { make: 'porsche', model: key, generation: item.key })}>
                <span className={styles.caption}><span>{item.name}</span><ArrowUpRight size={16} aria-hidden="true" /></span>
              </Link>)}
            </div>
          </div>
        </details>;
      })}
    </div>
  </section>;
  const state = model ? techartStep(options[model], { brand: 'techart', model, generation, body, fit }) : undefined;
  const base: Filters = { brand: 'techart', make: 'porsche', model, generation, fit };
  const cards: { name: string; detail: string; filters: Filters; image?: VehicleProfile }[] = !state?.generation ? options[model].map(item => ({ name: item.name, detail: 'Choose variant', filters: { ...base, generation: item.key } }))
    : !fit ? state.variants.map(item => ({ name: item.name, detail: item.body === 'targa' ? 'Explore matching parts' : 'Select body style', filters: { ...base, body: item.body, fit: item.fit }, image: item.image }))
    : state.availableBodies.map(item => ({ name: item.name, detail: 'Explore matching parts', filters: { ...base, body: item.key }, image: item.choices.find(choice => choice.fit === fit)?.image }));
  const generationStep = !!model && !generation;
  return <section className={styles.picker} aria-label={techartStepHeading({ model, generation, body, fit })}>
    <div className={generationStep ? styles.generations : styles.grid}>
      {cards.map(card => <Link className={generationStep ? styles.generation : styles.card} key={card.name} href={shopBrandHref('techart', card.filters)}>
        {!generationStep && <div className={styles.image}>{card.image && <SelectorCarImage {...card.image} placeholder={(placeholders as Record<string, string>)[card.image.src] || card.image.src} optimized={false} />}</div>}
        <div className={styles.caption}><Heading>{card.name}</Heading><ArrowUpRight size={18} aria-hidden="true" /></div>
        {!generationStep && <p>{card.detail}</p>}
      </Link>)}
    </div>
    {!cards.length && <p>No parts are currently listed for this selection. <Link href="/contact?programme=TECHART">Ask our team about your Porsche.</Link></p>}
    {!generationStep && <p className={styles.note}>Images illustrate the model or body style. Parts are matched to your selected generation, variant and body style.</p>}
  </section>;
}

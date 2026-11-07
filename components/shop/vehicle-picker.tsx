/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { CayenneBody } from '@/lib/shop/techart-cayenne-body-fitment';
import type { BodyStyle, VehicleGeneration } from '@/lib/shop/techart-fitment';
import styles from './vehicle-selector.module.css';

type PickerProps = {
  model: '911' | 'cayenne';
  options: VehicleGeneration[];
  shopPath: string;
  initialFit?: string;
  initialBody?: BodyStyle | CayenneBody;
};

export function VehiclePicker({ model, options, shopPath, initialFit, initialBody }: PickerProps) {
  const cayenne = model === 'cayenne';
  const modelName = cayenne ? 'Cayenne' : '911';
  const initialGeneration = options.find(item => initialFit?.startsWith(`${item.key}_`));
  const [generationKey, setGeneration] = useState(initialGeneration?.key || (cayenne ? 'e3_2' : '992_1'));
  const [bodyName, setBody] = useState(() => initialGeneration?.bodies.find(body => (
    (!initialBody || body.key === initialBody) && body.choices.some(choice => choice.fit === initialFit)
  ))?.name ?? initialGeneration?.bodies.find(body => body.key === initialBody)?.name);
  const generation = options.find(item => item.key === generationKey) || options[0];
  const body = generation.bodies.find(item => item.name === bodyName) || generation.bodies[0];
  const shopQuery = new URLSearchParams({ brand: 'techart', make: 'porsche', model });
  const modelShop = `${shopPath}?${shopQuery}`;
  const factoryGallery = generation.key === 'e3_2' ? 'cayenne' : generation.key === '992_2' ? '911' : undefined;

  return <div className={styles.selector}>
    <div className={styles.control}><span className={styles.label}>Generation</span><div className={styles.pills} role="group" aria-label={`Porsche ${modelName} generation`}>
      {options.map(item => <button key={item.key} type="button" aria-pressed={generation.key === item.key} onClick={() => setGeneration(item.key)}>{item.name}</button>)}
    </div></div>
    {body ? <>
      <div className={styles.control}><span className={styles.label}>Body style</span><div className={styles.pills} role="group" aria-label={`${modelName} body style`}>
        {generation.bodies.map(item => <button key={item.name} type="button" aria-pressed={body.name === item.name} onClick={() => setBody(item.name)}>{item.name}</button>)}
      </div></div>
      <div className={styles.familyHeading}><h3>{`${modelName} ${generation.name} · ${body.name}`}</h3><p>Choose your trim to shop parts.</p></div>
      <div className={styles.grid}>
        {body.choices.map(choice => {
          const title = choice.name === modelName ? modelName : `${modelName} ${choice.name}`;
          const count = `${choice.count} ${choice.count === 1 ? 'part' : 'parts'}`;
          const bodyLabel = body.key === 'targa' || body.name === choice.name ? '' : ` ${body.name}`;
          return <Link className={`${styles.card} ${styles.trimCard}`} key={choice.fit} href={`${modelShop}&fit=${choice.fit}&body=${body.key}`} aria-label={`Shop ${count} for ${title} ${generation.name}${bodyLabel}`}>
            <div className={styles.image}><img {...choice.image} alt="" loading="lazy" /></div>
            <div className={styles.trimCaption}><div><span>{title}</span><small>{count}</small></div><ArrowUpRight size={18} aria-hidden="true" /></div>
          </Link>;
        })}
      </div>
      <p className={styles.note}>{factoryGallery
        ? <>Factory side profiles from <a href={`https://www.porsche.com/usa/models/${factoryGallery}/configure/`}>Porsche</a> where available. </>
        : <>Representative profiles from <a href="https://configurator.techart.de/">TECHART’s model selection</a>. {generation.key === '992_1' && <>GT3 RS profile from <a href="https://www.porsche.com/international/models/911/configure/">Porsche</a>. </>}</>}
        Counts reflect recorded body-style fitment. Parts needing confirmation are listed separately.</p>
    </> : <p className={styles.note}>No parts are currently listed for this generation. <Link href="/contact">Ask us about your Porsche.</Link></p>}
    {cayenne && <nav className={styles.cayenneLinks} aria-label="Browse Cayenne parts">
      {body && <Link className={styles.change} href={`${modelShop}&fit=${generation.key}`}>Shop all {generation.name} parts</Link>}
      <Link className={styles.change} href={modelShop}>All Cayenne parts</Link>
    </nav>}
  </div>;
}

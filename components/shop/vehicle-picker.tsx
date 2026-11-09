/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
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
  modelChoices?: ReactNode;
};

const badgeSizes: Record<string, [number, number]> = {
  gt3: [151, 25], 'gt3-rs': [238, 25], turbo: [142, 24], 'turbo-s': [199, 25],
  st: [129, 49], s: [51, 24], t: [51, 24], '4': [51, 24], gts: [134, 24], gt: [102, 24],
  cayenne: [245, 35], carrera: [1851, 227], targa: [1276, 292], 'e-hybrid': [492, 71], touring: [1140, 188], dakar: [455, 65],
};

const badgeClasses: Record<string, string> = {
  'gt3-rs': styles.gt3RsBadge,
  st: styles.stBadge,
  carrera: styles.carreraBadge,
  targa: styles.targaBadge,
  'e-hybrid': styles.hybridBadge,
  touring: styles.touringBadge,
  dakar: styles.dakarBadge,
};

function ModelBadge({ name }: { name: string }) {
  const [width, height] = badgeSizes[name];
  return <img className={`${styles.modelBadge} ${badgeClasses[name] ?? ''}`} src={`/brand/porsche-models/${name}.svg`} width={width} height={height} alt="" />;
}

function PorscheTrimName({ name, model }: { name: string; model: PickerProps['model'] }) {
  if (model === 'cayenne') {
    const marks: Record<string, string[]> = {
      Cayenne: ['cayenne'], 'E-Hybrid': ['e-hybrid'], S: ['s'], 'S E-Hybrid': ['s', 'e-hybrid'],
      GTS: ['gts'], Turbo: ['turbo'], 'Turbo S E-Hybrid': ['turbo-s', 'e-hybrid'],
      'Turbo E-Hybrid': ['turbo', 'e-hybrid'], 'Turbo GT': ['turbo', 'gt'],
    };
    return marks[name] ? <span className={styles.modelWordmark} aria-hidden="true">
      {marks[name].map(mark => <ModelBadge key={mark} name={mark} />)}
    </span> : <span>{name}</span>;
  }
  const badge = name === 'GT3' || name === 'GT3 Touring' ? 'gt3'
    : name === 'GT3 RS' ? 'gt3-rs'
    : name === 'Turbo S' ? 'turbo-s'
    : name === 'Turbo' ? 'turbo'
    : name === 'Dakar' ? 'dakar'
    : name === 'S/T' ? 'st' : undefined;
  if (badge) return <span className={styles.modelWordmark} aria-hidden="true">
    <ModelBadge name={badge} />{name === 'GT3 Touring' && <ModelBadge name="touring" />}
  </span>;
  const carrera = /^(Carrera|Targa)(?: (4 GTS|GTS|4S|S|T|4))?$/.exec(name);
  if (!carrera) return <span className={styles.modelWordmark}>{name}</span>;
  const suffix = carrera[2] === '4S' ? ['4', 's'] : carrera[2]?.toLowerCase().split(' ') ?? [];
  return <span className={`${styles.modelWordmark} ${styles.mixedWordmark}`} aria-hidden="true">
    <ModelBadge name={carrera[1].toLowerCase()} />{suffix.length > 0 && <span className={styles.badgeSuffix}>{suffix.map(mark => <ModelBadge key={mark} name={mark} />)}</span>}
  </span>;
}

export function VehiclePicker({ model, options, shopPath, initialFit, initialBody, modelChoices }: PickerProps) {
  const cayenne = model === 'cayenne';
  const modelName = cayenne ? 'Cayenne' : '911';
  const initialGeneration = options.find(item => initialFit?.startsWith(`${item.key}_`));
  const [generationKey, setGeneration] = useState(initialGeneration?.key || (cayenne ? 'e3_2' : '992_2'));
  const [bodyName, setBody] = useState(() => initialGeneration?.bodies.find(body => (
    (!initialBody || body.key === initialBody) && body.choices.some(choice => choice.fit === initialFit)
  ))?.name ?? initialGeneration?.bodies.find(body => body.key === initialBody)?.name);
  const generation = options.find(item => item.key === generationKey) || options[0];
  const body = generation.bodies.find(item => item.name === bodyName) || generation.bodies[0];
  const shopQuery = new URLSearchParams({ brand: 'techart', make: 'porsche', model });
  const modelShop = `${shopPath}?${shopQuery}`;

  return <div className={styles.selector}>
    <aside className={styles.filters} aria-label="Vehicle filters">
      {modelChoices && <div className={styles.control}><span className={styles.label}>Model</span><div className={styles.models}>{modelChoices}</div></div>}
      <div className={styles.control}><span className={styles.label}>Generation</span><div className={styles.pills} role="group" aria-label={`Porsche ${modelName} generation`}>
        {options.map(item => <button key={item.key} type="button" aria-pressed={generation.key === item.key} onClick={() => setGeneration(item.key)}>{item.name}</button>)}
      </div></div>
      {body && <div className={styles.control}><span className={styles.label}>Body style</span><div className={styles.pills} role="group" aria-label={`${modelName} body style`}>
        {generation.bodies.map(item => <button key={item.name} type="button" aria-pressed={body.name === item.name} onClick={() => setBody(item.name)}>{item.name}</button>)}
      </div></div>}
    </aside>
    <div className={styles.results}>
    {body ? <>
      <div className={styles.familyHeading}><h3><img className={`${styles.seriesBadge} ${cayenne ? styles.cayenneSeriesBadge : ''}`} src={`/brand/porsche-models/${cayenne ? 'cayenne' : '911'}.svg`} width={cayenne ? 245 : 94} height={cayenne ? 35 : 25} alt={modelName} /> {generation.name} · {body.name}</h3><p>Choose your trim to shop parts.</p></div>
      <div className={styles.grid}>
        {body.choices.map(choice => {
          const title = choice.name === modelName ? modelName : `${modelName} ${choice.name}`;
          const count = `${choice.count} ${choice.count === 1 ? 'part' : 'parts'}`;
          const bodyLabel = body.key === 'targa' || body.name === choice.name ? '' : ` ${body.name}`;
          return <Link className={`${styles.card} ${styles.trimCard}`} key={choice.fit} href={`${modelShop}&fit=${choice.fit}&body=${body.key}`} aria-label={`Shop ${count} for ${title} ${generation.name}${bodyLabel}`}>
            <div className={styles.image}><img {...choice.image} alt="" loading="lazy" /></div>
            <div className={styles.trimCaption}><div><PorscheTrimName name={choice.name} model={model} /><small>{count}</small></div><ArrowUpRight size={18} aria-hidden="true" /></div>
          </Link>;
        })}
      </div>
      <p className={styles.note}>{!cayenne
        ? <>Representative <a href="https://www.porsche.com/usa/models/911/configure/">Porsche</a> images may show a newer generation or related trim. Parts are filtered by your selected generation, body style and trim.</>
        : <>Representative <a href="https://www.porsche.com/usa/models/cayenne/configure/">Porsche</a> images may show a newer generation or related trim.{' '}
          Counts reflect recorded body-style fitment. Parts needing confirmation are listed separately.</>}
      </p>
    </> : <p className={styles.note}>No parts are currently listed for this generation. <Link href="/contact">Ask us about your Porsche.</Link></p>}
    {cayenne && <nav className={styles.cayenneLinks} aria-label="Browse Cayenne parts">
      {body && <Link className={styles.change} href={`${modelShop}&fit=${generation.key}`}>Shop all {generation.name} parts</Link>}
      <Link className={styles.change} href={modelShop}>All Cayenne parts</Link>
    </nav>}
    </div>
  </div>;
}

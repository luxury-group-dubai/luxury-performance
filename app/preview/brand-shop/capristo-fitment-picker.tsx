'use client';

import { capristoFitmentOptions } from '@/lib/shop/capristo-fitment';
import type { CatalogProduct } from '@/lib/shop/types';
import styles from './shop-preview.module.css';

type Props = {
  products: CatalogProduct[];
  make: string;
  model: string;
  generation?: string;
  fit?: string;
  onChange: (generation?: string, fit?: string) => void;
};

export function CapristoFitmentPicker({ products, make, model, generation, fit, onChange }: Props) {
  const versions = capristoFitmentOptions(products, make, model);
  if (!versions.length) return null;
  const generations = [...new Map(versions.filter(version => version.generation).map(version => [version.generation!, version.generationLabel!])).entries()];
  const choices = versions.filter(version => version.generation === generation);

  return <div className={styles.fitmentPicker} aria-label="Refine your Capristo vehicle">
    {!!generations.length && <fieldset>
      <legend>Generation</legend>
      <div className={styles.fitmentOptions}>
        <button type="button" aria-pressed={!generation && !fit} onClick={() => onChange()}>All generations</button>
        {generations.map(([key, name]) => <button key={key} type="button" aria-pressed={generation === key} onClick={() => onChange(key)}>{name}</button>)}
      </div>
    </fieldset>}
    {!!choices.length && <fieldset>
      <legend>Version</legend>
      <div className={styles.fitmentOptions}>
        <button type="button" aria-pressed={!fit} onClick={() => onChange(generation)}>All versions</button>
        {choices.map(version => <button key={version.key} type="button" aria-pressed={fit === version.key} onClick={() => onChange(generation, version.key)}>{version.version}<small>{version.count}</small></button>)}
      </div>
    </fieldset>}
  </div>;
}

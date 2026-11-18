'use client';

import type { VehicleFitment } from '@/lib/shop/types';
import styles from './shop-preview.module.css';

type Props = {
  versions: (VehicleFitment & { count: number })[];
  brand: string;
  generation?: string;
  fit?: string;
  onChange: (generation?: string, fit?: string) => void;
};

export function VehicleVersionPicker({ versions, brand, generation, fit, onChange }: Props) {
  if (!versions.length) return null;
  const choices = versions.filter(version => version.generation === generation);

  return <div className={styles.fitmentPicker} aria-label={`Refine your ${brand} vehicle`}>
    {!!choices.length && <fieldset>
      <legend>Version</legend>
      <div className={styles.fitmentOptions}>
        <button type="button" aria-pressed={!fit} onClick={() => onChange(generation)}>All versions</button>
        {choices.map(version => <button key={version.key} type="button" aria-pressed={fit === version.key} onClick={() => onChange(generation, version.key)}>{version.version}<small>{version.count}</small></button>)}
      </div>
    </fieldset>}
  </div>;
}

import styles from './divisions-timeline.module.css';

// Original pen strokes from the SLC lettering artwork, in writing order.
const slcLetters = [
  'M600 203 C617 175 633 142 637 119 C644 78 611 86 578 101 C507 133 423 194 375 248 C349 277 353 295 370 314 C393 339 440 358 470 381 C498 402 513 416 500 443 C486 473 442 507 406 522 C380 533 347 540 352 516 C357 489 428 445 479 412 C514 390 560 368 590 354',
  'M700 149 C688 143 656 207 631 263 C611 307 596 348 590 379 C585 402 587 416 599 420 C619 429 683 381.285714 715 347',
  'M747 357 C755 347 763 333 757 329 C748 321 729 332 715 347 C699 364 685 391 700 405 C718 424 770 398 826 356',
];

// Split the finished LCG silhouette at its junction so every stroke has its own sharp tips.
const lcgStrokes = [
  {
    id: 'outer',
    outline: 'M75.70478 46.36865 59.58017 74.29731 85.42850 74.29731 83.60649 71.14149 64.97551 71.14149 77.49145 49.46325Z',
    trace: 'M76.6 47.7 62.2 72.72H85.5',
  },
  {
    id: 'peak',
    outline: 'M68.04253 71.14149 79.18327 51.84516 85.59203 62.94546 81.70604 62.94546 79.07276 58.38448 71.70749 71.14149Z',
    trace: 'M69.87 71.3 79.13 55.1 84.1 63.6',
  },
  {
    id: 'foot',
    outline: 'M78.12825 65.58802 76.39557 68.58913 85.26521 68.58913 88.56083 74.29731 91.88585 74.29731 86.85754 65.58802Z',
    trace: 'M76.35 67.09H86.06L90.6 74.9',
  },
];

export function DivisionMonogram({ mark }: { mark: 'slc' | 'lcg' }) {
  if (mark === 'slc') {
    return (
      <svg className={styles.standaloneMark} viewBox="126.25 -152.25 925 925" focusable="false">
        <g fill="none" stroke="white" strokeWidth="19" strokeLinecap="round" strokeLinejoin="round">
          {slcLetters.map((d) => <path key={d} className={styles.inkStroke} d={d} pathLength="1" />)}
        </g>
      </svg>
    );
  }

  return (
    <svg className={styles.standaloneMark} viewBox="44.66284 29.29664 62.14033 62.14033" focusable="false">
      <defs>
        {lcgStrokes.map(({ id, outline }) => (
          <clipPath key={id} id={`division-lcg-${id}`}><path d={outline} /></clipPath>
        ))}
      </defs>
      <g fill="none" stroke="white" strokeWidth="5" strokeLinecap="square" strokeLinejoin="miter">
        {lcgStrokes.map(({ id, trace }) => (
          <path key={id} className={styles.inkStroke} d={trace} clipPath={`url(#division-lcg-${id})`} pathLength="1" />
        ))}
      </g>
    </svg>
  );
}

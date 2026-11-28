import Image from 'next/image';
import { useRef, useState, type CSSProperties } from 'react';
import { clamp, detailChapters, filmChapterStart } from './motion';
import styles from './film.module.css';

const chapters = detailChapters.map((chapter, index) => {
  const start = filmChapterStart(index + 1);
  const end = index === detailChapters.length - 1 ? chapter.at : filmChapterStart(index + 2);
  return {
    ...chapter,
    preview: `/images/purosangue-film/chapter-${chapter.name.toLowerCase().replaceAll(' ', '-')}.webp`,
    trackStyle: {
      '--film-segment-index': index,
      '--film-segment-count': detailChapters.length,
      '--film-segment-start': start,
      '--film-segment-duration': end - start,
    } as CSSProperties,
  };
});

function positionPreview(timeline: HTMLDivElement, left: number, x: number, source: 'focus' | 'pointer') {
  timeline.style.setProperty('--film-preview-start', `${-left}px`);
  timeline.style.setProperty('--film-preview-end', `${document.documentElement.clientWidth - left}px`);
  timeline.style.setProperty(`--film-preview-${source}-x`, `${x}px`);
}

export function FilmChapters({ chapter, onSeek }: { chapter: number; onSeek: (index: number) => void }) {
  const timeline = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const previewIndex = hovered ?? focused;
  const preview = previewIndex === null ? null : chapters[previewIndex];

  return <div ref={timeline} className={styles.chapterTimeline}
    onPointerMove={event => {
      if (event.pointerType !== 'mouse' || !rail.current) return;
      const { left, width } = rail.current.getBoundingClientRect();
      const x = event.clientX - left;
      const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>('button[data-film-chapter]') : null;
      const index = button ? Number(button.dataset.filmChapter) : clamp(Math.floor(x / width * chapters.length), 0, chapters.length - 1);
      const segmentLeft = rail.current.children[index].getBoundingClientRect().left;
      positionPreview(event.currentTarget, left, x, 'pointer');
      event.currentTarget.style.setProperty('--film-hover-fill', `${event.clientX - segmentLeft}px`);
      if (hovered !== index) setHovered(index);
    }}
    onPointerLeave={() => setHovered(null)}
    onKeyDown={event => {
      if (event.key !== 'Escape') return;
      setHovered(null);
      setFocused(null);
    }}>
    <div ref={rail} className={styles.filmProgress} aria-hidden="true">
      {chapters.map((item, index) => <span key={item.name} className={styles.filmSegment} style={item.trackStyle} data-hovered={hovered === index || undefined}>
        <span className={styles.filmBufferFill} />
        <span className={styles.filmDetailFill} />
      </span>)}
    </div>
    <nav className={styles.chapters} aria-label="Transformation chapters">
      {chapters.map((item, index) => <button type="button" key={item.name} aria-label={item.name} aria-current={chapter === index + 1 ? 'step' : undefined}
        data-film-chapter={index} data-hovered={hovered === index || undefined} onClick={() => onSeek(index + 1)}
        onFocus={event => {
          const button = event.currentTarget;
          if (!timeline.current || !button.matches(':focus-visible')) return;
          const { left, width } = button.getBoundingClientRect();
          const timelineLeft = timeline.current.getBoundingClientRect().left;
          positionPreview(timeline.current, timelineLeft, left - timelineLeft + width / 2, 'focus');
          setFocused(index);
        }}
        onBlur={() => setFocused(null)}>
        <span>{item.name}</span>
        <span className={styles.chapterDot} />
      </button>)}
    </nav>
    {preview && <Image key={preview.name} className={styles.chapterPreview} src={preview.preview} alt="" width={208} height={117}
      unoptimized loading="eager" fetchPriority="low" data-pointer-preview={hovered !== null || undefined}
      onLoad={event => { event.currentTarget.dataset.ready = 'true'; }} />}
  </div>;
}

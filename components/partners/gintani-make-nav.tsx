import { ChapterNav } from '../chapter-nav';

export function GintaniMakeNav({ chapters }: { chapters: { id: string; title: string }[] }) {
  return <ChapterNav chapters={chapters} label="Gintani vehicle makes" />;
}

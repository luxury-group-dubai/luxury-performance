'use client';
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { Search } from 'lucide-react';
import styles from './header-search.module.css';

const SearchDialog = dynamic(() => import('./header-search-dialog').then(module => module.HeaderSearchDialog), {
  ssr: false,
  loading: () => <span className="sr-only" role="status">Opening search…</span>,
});

export function HeaderSearch({ onOpen }: { onOpen: () => void }) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  return <>
    <button ref={trigger} type="button" className={styles.trigger} aria-label="Search the store" aria-haspopup="dialog" aria-expanded={open} onClick={() => { onOpen(); setOpen(true); }}><Search size={19} strokeWidth={1.5} aria-hidden="true" /></button>
    {open && <SearchDialog trigger={trigger} onClose={() => setOpen(false)} />}
  </>;
}

'use client';
import { ActionArrow } from '@/components/action-arrow';
import Link from 'next/link';
export default function PartnerError({ reset }: { reset: () => void }) { return <div className="shop-page shop-loading"><h1>Let’s try that again.</h1><p>This partner’s collection couldn’t load.</p><button className="shop-button" onClick={reset}>Reload collection <ActionArrow direction="right" /></button><p><Link href="/partners">Back to our partners</Link></p></div>; }

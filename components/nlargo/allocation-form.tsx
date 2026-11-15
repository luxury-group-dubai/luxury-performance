'use client';

import { useRef, useState, type FormEvent } from 'react';
import { ActionArrow } from '@/components/action-arrow';
import { contact } from '@/lib/content';
import { allocationEnquiryText, validateAllocationEnquiry, ownershipOptions, vehicleOptions } from '@/lib/allocation-enquiry';
import styles from './nlargo.module.css';

export function AllocationForm({ available }: { available: boolean }) {
  const [state, setState] = useState<'idle' | 'ready' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [whatsapp, setWhatsapp] = useState(contact.whatsapp);
  const result = useRef<HTMLDivElement>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = { ...Object.fromEntries(form), consent: form.get('consent') === 'on' };
    const data = validateAllocationEnquiry(body);
    if (!data) { setState('error'); setMessage('Please check your contact details, including your international phone number.'); return; }
    setWhatsapp(`${contact.whatsapp}?text=${encodeURIComponent(allocationEnquiryText(data, available))}`);
    setMessage(allocationEnquiryText(data, available));
    setState('ready');
    requestAnimationFrame(() => { result.current?.focus({ preventScroll: true }); result.current?.scrollIntoView({ behavior: 'instant', block: 'center' }); });
  }
  return <form className={styles.form} onSubmit={submit} onChange={() => { setState('idle'); setMessage(''); }}>
    <fieldset className={styles.fields}>
      <legend className="sr-only">Private N-LARGO enquiry</legend>
      <label>Full name <span>*</span><input name="name" autoComplete="name" required maxLength={100} pattern=".*\S.*" /></label>
      <label>WhatsApp / phone <span>*</span><input name="phone" type="tel" autoComplete="tel" placeholder="Include country code" required maxLength={35} /></label>
      <label>Email address <span>*</span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      <label>Country <span>*</span><input name="country" autoComplete="country-name" required maxLength={80} pattern=".*\S.*" /></label>
      <label>Your 12Cilindri <span>*</span><select name="vehicle" required defaultValue=""><option value="" disabled>Select body style</option>{vehicleOptions.map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Vehicle ownership <span>*</span><select name="ownership" required defaultValue=""><option value="" disabled>Select ownership status</option>{ownershipOptions.map(value => <option key={value}>{value}</option>)}</select></label>
      <label className={styles.full}>Additional message<textarea name="message" rows={4} maxLength={3000} placeholder="Your vehicle, location or plans for the conversion." /></label>
      <label className={styles.consent}><input type="checkbox" name="consent" required /><span>I agree to Luxury Performance contacting me by phone, WhatsApp or email about this enquiry. This enquiry concerns the NOVITEC conversion package only; the Ferrari vehicle is not included.</span></label>
      <button className={styles.button} type="submit">Prepare private enquiry<ActionArrow size={18} /></button>
    </fieldset>
    <p className={styles.formNote}>We prepare a message for our sales team. You review and send it in WhatsApp. This website does not submit or store your details. An enquiry does not reserve an allocation.</p>
    <div ref={result} tabIndex={-1} role={state === 'error' ? 'alert' : 'status'} className={message ? styles.feedback : undefined}>
      {state === 'ready' ? <><h3>Your private enquiry is ready.</h3><p>Your details have not been sent yet. Review your message below, then send it to our sales team in WhatsApp.</p><pre className={styles.messagePreview}>{message}</pre><a className={styles.button} href={whatsapp} target="_blank" rel="noopener noreferrer">Continue on WhatsApp <ActionArrow size={16} /></a></> : message}
    </div>
  </form>;
}

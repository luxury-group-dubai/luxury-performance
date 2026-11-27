'use client';
import { ActionLabel } from '@/components/action-label';

import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { ActionArrow } from '@/components/action-arrow';
import { contact } from '@/lib/content';
import { enquiryInterests, resolveEnquiryInterests } from '@/lib/enquiry-interests';
import { ArrowLink } from './ui';

export function EnquiryForm({ initialInterest = '', initialVehicle = '', programme = '', initialDetails = '' }: { initialInterest?: string; initialVehicle?: string; programme?: string; initialDetails?: string }) {
  const [message, setMessage] = useState('');
  const confirmation = useRef<HTMLDialogElement>(null);
  const initialInterests = resolveEnquiryInterests(initialInterest);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const vehicle = String(data.get('vehicle') ?? '').trim();
    if (!name || !vehicle) return;
    const interests = data.getAll('interest').map(String);
    const text = [`Hello Luxury Performance, my name is ${name}.`, `Vehicle: ${vehicle}${data.get('year') ? ` (${data.get('year')})` : ''}.`, programme ? `Programme: ${programme}.` : '', `Interested in: ${interests.join(', ') || 'Advice on my vehicle'}.`, String(data.get('details') ?? '').trim()].filter(Boolean).join('\n\n');
    setMessage(text);
    confirmation.current?.showModal();
  }

  return <form className="enquiry-form" onSubmit={handleSubmit} onChange={() => { if (message) setMessage(''); }}>
    {programme && <p className="form-subheading">Enquiring about {programme}.</p>}
    <div className="field-grid">
      <label className="field full"><span>Your name *</span><input name="name" placeholder="Your name" required pattern=".*\S.*" autoComplete="name" maxLength={100} /></label>
      <label className="field"><span>Your vehicle *</span><input name="vehicle" placeholder="e.g. Porsche 911 GT3 (992)" required pattern=".*\S.*" defaultValue={initialVehicle} maxLength={150} /></label>
      <label className="field"><span>Model year</span><input name="year" placeholder="e.g. 2024" type="text" inputMode="numeric" pattern="[0-9]{4}" title="Enter a four-digit model year" maxLength={4} /></label>
    </div>
    <fieldset className="interest-group">
      <legend className="form-label">What are you looking for?</legend>
      <p className="form-disclaimer">Select all that apply.</p>
      <div className="interest-options">{enquiryInterests.map(interest => <label key={interest}><input type="checkbox" name="interest" value={interest} defaultChecked={initialInterests.includes(interest)} /><span>{interest}</span></label>)}</div>
    </fieldset>
    <label className="field"><span>Tell us more</span><textarea defaultValue={initialDetails} name="details" rows={3} maxLength={initialDetails ? 12000 : 1500} placeholder="Tell us which parts or upgrades you’re interested in." /></label>
    <button className="form-submit" type="submit"><ActionLabel>Review my enquiry</ActionLabel><ActionArrow size={19} /></button>
    <p className="form-disclaimer">Review your enquiry before sending it on WhatsApp. Your details are not submitted or stored by this website.</p>
    <dialog className="enquiry-modal" ref={confirmation} aria-labelledby="enquiry-modal-title" onClick={event => { if (event.target === confirmation.current) confirmation.current?.close(); }}>
      <div className="enquiry-modal-content">
        <button type="button" className="enquiry-modal-close" aria-label="Close review" onClick={() => confirmation.current?.close()}><X size={22} /></button>
        <h2 id="enquiry-modal-title">Review your enquiry.</h2>
        <p>Make sure everything looks right before sending it to our team on WhatsApp.</p>
        <div className="message-preview">{message}</div>
        <ArrowLink href={`${contact.whatsapp}?text=${encodeURIComponent(message)}`} external>Continue on WhatsApp</ArrowLink>
        <button className="enquiry-modal-edit" type="button" onClick={() => confirmation.current?.close()}>Edit enquiry</button>
      </div>
    </dialog>
  </form>;
}

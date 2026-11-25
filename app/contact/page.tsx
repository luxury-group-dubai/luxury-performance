import './contact.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { defaultSocialImage } from '@/lib/social-images';
import { PageHeading } from '@/components/page-heading';
import { ArrowLink } from '@/components/ui';
import { EnquiryForm } from '@/components/enquiry-form';
import { contact, expertise } from '@/lib/content';
const title = 'Contact Luxury Performance | Dubai';
const description = 'Contact Luxury Performance in Al Quoz, Dubai for auto parts, vehicle fitment, stock and installation enquiries. Call, email, WhatsApp or get directions.';
export const metadata: Metadata = {
  title: { absolute: title }, description, alternates: { canonical: '/contact' },
  openGraph: { title, description, url: '/contact', type: 'website', images: [defaultSocialImage] },
  twitter: { card: 'summary_large_image', title, description, images: [defaultSocialImage.url] },
};
export default async function Contact({ searchParams }: { searchParams: Promise<{ interest?: string; vehicle?: string; programme?: string }> }) {
  const query = await searchParams;
  const interest = [...expertise.map(item => item.title), 'A complete programme', 'Help me decide'].some(title => title === query.interest) ? query.interest : '';
  return <><PageHeading title="Contact." description="Need a part or help choosing an upgrade? Share your vehicle model, year and what you have in mind." /><section className="contact-layout"><div className="contact-info"><p>Speak with our Dubai team about vehicle fitment, stock, lead times and installation options. You can also <Link href="/shop">browse the shop</Link> or <Link href="/partners">explore our partner brands</Link> before starting your enquiry.</p><a className="contact-method" href={`tel:${contact.telephone}`}>{contact.phone}</a><a className="contact-method" href={`mailto:${contact.email}`}>{contact.email}</a><ArrowLink href={contact.whatsapp} external>Message us on WhatsApp</ArrowLink><div className="contact-address"><span className="tiny-label">Find us in Dubai</span><a href={contact.maps} target="_blank" rel="noopener noreferrer">4th Street, Al Quoz Industrial 3<br />Dubai, United Arab Emirates ↗</a><p>Monday–Saturday · 10am–8pm</p></div></div><EnquiryForm initialInterest={interest} initialVehicle={typeof query.vehicle==='string'?query.vehicle.slice(0,150):''} programme={typeof query.programme==='string'?query.programme.slice(0,100):''} /></section></>;
}

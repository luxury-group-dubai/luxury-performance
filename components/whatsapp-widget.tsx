import { WhatsAppIcon } from './whatsapp-icon';
import { contact } from '@/lib/content';
import styles from './whatsapp-widget.module.css';

export function WhatsAppWidget() {
  return <a className={styles.widget} href={contact.whatsapp} target="_blank" rel="noopener noreferrer"
    aria-label="Chat with Luxury Performance on WhatsApp (opens in a new tab)">
    <WhatsAppIcon size={28}/>
    <span className={styles.label} aria-hidden="true">Chat on WhatsApp</span>
  </a>;
}

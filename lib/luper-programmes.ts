import { nlargoPath, nlargoStatus } from './nlargo-allocation';
import { emptyLuperProfile, type LuperProfile, type LuperShopping } from './luper-shopping';
import { vehicleQuery } from './luper-vehicle-index';
import type { LuperMessage } from './luper';

/** The 12Cilindri N-LARGO campaign has its own enquiry page outside the parts shop. */
export function luperProgrammeReply(messages: LuperMessage[], previous: LuperProfile): { reply: string; shopping: LuperShopping } | undefined {
  const latest = vehicleQuery(messages.at(-1)?.content || '');
  if (!/\bn ?largo\b/.test(latest)) return;
  const isFollowUp = /\b12cilindri\b/.test(vehicleQuery(previous.model))
    && !latest.replace(/\b(n largo|nlargo|novitec|from|for|the|what|about|and|please|show|me)\b/g, '').trim();
  if (!/\b12cilindri\b/.test(latest) && !isFollowUp) return;
  return {
    reply: 'The NOVITEC Ferrari 12Cilindri N-LARGO has a dedicated private enquiry page. Open it below to discuss the allocation, specification and next steps with our team.',
    shopping: { profile: { ...emptyLuperProfile(), make: 'Ferrari', model: '12Cilindri', interest: 'NOVITEC N-LARGO' },
      enquirySummary: 'I’d like to enquire about the NOVITEC Ferrari 12Cilindri N-LARGO programme.', contactTeam: false,
      recommendations: [{ id: 'programme:novitec-12cilindri-n-largo', kind: 'programme',
        title: 'NOVITEC Ferrari 12Cilindri N-LARGO', href: `${nlargoPath}#private-enquiry`, subtitle: nlargoStatus,
        image: '/images/nlargo/gallery-low-front-red.webp' }] },
  };
}

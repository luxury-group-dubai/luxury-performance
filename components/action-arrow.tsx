import { ArrowRight, ArrowUpRight } from 'lucide-react';

export function ActionArrow({ direction = 'diagonal', size = 16, strokeWidth }: {
  direction?: 'diagonal' | 'right';
  size?: number;
  strokeWidth?: number;
}) {
  const Icon = direction === 'right' ? ArrowRight : ArrowUpRight;
  return (
    <span className="action-arrow" aria-hidden="true">
      <Icon size={size} strokeWidth={strokeWidth} />
      <Icon size={size} strokeWidth={strokeWidth} />
    </span>
  );
}

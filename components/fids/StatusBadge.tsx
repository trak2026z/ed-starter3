import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { FlightStatus } from '@/types';

const statusBadgeVariants = cva(
  'inline-flex min-w-[104px] items-center justify-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] shadow-sm',
  {
    variants: {
      status: {
        'On Time': 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200',
        Boarding:
          'border-amber-300/60 bg-amber-300/15 text-amber-100 shadow-amber-300/10 animate-pulse',
        Departed: 'border-zinc-500/25 bg-zinc-700/20 text-zinc-400',
        Delayed: 'border-orange-300/45 bg-orange-400/10 text-orange-100',
        Cancelled: 'border-red-400/45 bg-red-500/10 text-red-100',
      },
    },
    defaultVariants: {
      status: 'On Time',
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  status: FlightStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}

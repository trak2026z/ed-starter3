import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { FlightStatus } from '@/types';

const statusBadgeVariants = cva(
  'inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold uppercase tracking-widest rounded-sm min-w-[90px]',
  {
    variants: {
      status: {
        'On Time': 'bg-emerald-900 text-emerald-300 border border-emerald-700',
        Boarding: 'bg-amber-900 text-amber-300 border border-amber-600 animate-pulse',
        Departed: 'bg-zinc-800 text-zinc-500 border border-zinc-700',
        Delayed: 'bg-orange-900 text-orange-300 border border-orange-700',
        Cancelled: 'bg-red-950 text-red-400 border border-red-800',
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
  return <span className={cn(statusBadgeVariants({ status }), className)}>{status}</span>;
}

import { cn } from '@shared/utils/cn';

interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <p
      role="alert"
      className={cn('animate-shake rounded-chip border-2 border-danger bg-danger-soft px-3 py-2 text-[15px] font-bold text-danger-deep', className)}
    >
      {message}
    </p>
  );
}

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

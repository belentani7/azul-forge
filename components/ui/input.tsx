'use client';

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...rest }, ref) {
    return <input ref={ref} className={`input-forge ${className}`} {...rest} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className = '', ...rest }, ref) {
  return <textarea ref={ref} className={`input-forge min-h-[110px] resize-y ${className}`} {...rest} />;
});

export function Label({
  children,
  htmlFor,
  hint,
}: {
  children: React.ReactNode;
  htmlFor: string;
  hint?: string;
}) {
  return (
    <label className="label-forge" htmlFor={htmlFor}>
      {children}
      {hint ? <span className="ml-2 normal-case tracking-normal text-[var(--gris-neblina)]/70">{hint}</span> : null}
    </label>
  );
}

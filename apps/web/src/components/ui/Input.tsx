'use client';

import * as React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  type?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${className}`}
        type={type}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
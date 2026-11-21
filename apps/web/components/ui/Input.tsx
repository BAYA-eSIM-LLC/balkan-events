import { InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, className = '', id, ...props }, ref) => (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-ink mb-1">{label}</label>}
      <input
        ref={ref}
        id={id}
        className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-ink placeholder:text-ink-subtle focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition ${className}`}
        {...props}
      />
    </div>
  )
);
Input.displayName = 'Input';

export const SearchInput = forwardRef<HTMLInputElement, Props>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      type="search"
      className={`w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm bg-white text-ink placeholder:text-ink-subtle focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition ${className}`}
      {...props}
    />
  )
);
SearchInput.displayName = 'SearchInput';

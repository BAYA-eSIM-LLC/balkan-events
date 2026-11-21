interface Props {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'success' | 'muted';
}

const styles = {
  default: 'bg-brand-100 text-brand-800',
  accent: 'bg-accent-100 text-accent-600',
  success: 'bg-emerald-100 text-emerald-700',
  muted: 'bg-gray-100 text-ink-muted',
};

export function Badge({ children, variant = 'default' }: Props) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}

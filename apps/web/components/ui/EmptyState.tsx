interface Props {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="text-center py-16 px-4">
      <p className="text-lg font-medium text-ink">{title}</p>
      {description && <p className="text-sm text-ink-muted mt-2 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// components/ui/StatusBadge.tsx
interface StatusBadgeProps {
  status: 'active' | 'pending' | 'completed' | 'failed';
  text?: string;
}

export default function StatusBadge({ status, text }: StatusBadgeProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800',
  };

  const statusTexts = {
    active: 'Active',
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}
    >
      {text || statusTexts[status]}
    </span>
  );
}
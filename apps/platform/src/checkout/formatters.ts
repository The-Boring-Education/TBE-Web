export const formatInr = (n: number) =>
  `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const formatShortDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

export const formatRelativeEnd = (iso: string): string => {
  const end = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, end - now);
  const d = Math.floor(diff / 86400000);
  if (d >= 1) {
    return `${d}d left`;
  }
  const h = Math.floor(diff / 3600000);
  if (h >= 1) {
    return `${h}h left`;
  }
  const m = Math.floor(diff / 60000);
  return m > 0 ? `${m}m left` : 'Ending soon';
};

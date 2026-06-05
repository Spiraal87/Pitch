'use client';

interface LocalKickoffProps {
  date: string;
}

export default function LocalKickoff({ date }: LocalKickoffProps) {
  const d = new Date(date);
  const now = new Date();

  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const tzStr = d.toLocaleTimeString([], { timeZoneName: 'short' }).split(' ').pop();

  if (isToday) return <>{`TODAY · ${timeStr} ${tzStr}`}</>;
  if (isTomorrow) return <>{`TOMORROW · ${timeStr} ${tzStr}`}</>;
  if (isYesterday) return <>YESTERDAY</>;

  const dateStr = d.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  return <>{`${dateStr} · ${timeStr} ${tzStr}`}</>;
}

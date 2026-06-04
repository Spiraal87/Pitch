import { getIsoCodeByName } from '@/lib/flags';

interface FlagProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass = { sm: 'w-4 h-3', md: 'w-5 h-[15px]', lg: 'w-8 h-6' };

export default function Flag({ name, size = 'sm' }: FlagProps) {
  const iso = getIsoCodeByName(name);
  if (!iso) return null;
  return (
    <span
      className={`fi fi-${iso} rounded-[1px] flex-shrink-0 ${sizeClass[size]}`}
      aria-hidden="true"
    />
  );
}

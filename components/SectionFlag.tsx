import Link from 'next/link';

interface SectionFlagProps {
  label: string;
  linkText?: string;
  linkHref?: string;
}

export default function SectionFlag({ label, linkText, linkHref }: SectionFlagProps) {
  return (
    <div className="flex items-center justify-between px-[18px] pt-4 pb-2">
      <div className="flex items-center gap-3">
        <div className="w-[4px] h-[20px] bg-pitch-green flex-shrink-0" />
        <span className="font-serif text-[19px] font-medium text-pitch-ink">
          {label}
        </span>
      </div>
      {linkText && linkHref && (
        <Link
          href={linkHref}
          className="font-sans text-[11px] text-pitch-green-mid hover:text-pitch-green"
        >
          {linkText} →
        </Link>
      )}
    </div>
  );
}

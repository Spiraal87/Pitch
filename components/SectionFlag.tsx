import Link from 'next/link';

interface SectionFlagProps {
  label: string;
  linkText?: string;
  linkHref?: string;
}

export default function SectionFlag({ label, linkText, linkHref }: SectionFlagProps) {
  if (linkText && linkHref) {
    return (
      <Link href={linkHref}>
        <div className="flex items-center justify-between px-[18px] pt-4 pb-2 hover:bg-pitch-cream transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-[4px] h-[20px] bg-pitch-green flex-shrink-0" />
            <span className="font-serif text-[19px] font-medium text-pitch-ink">
              {label}
            </span>
          </div>
          <span className="font-sans text-[13px] font-medium text-pitch-green-mid">
            {linkText} →
          </span>
        </div>
      </Link>
    );
  }

  return (
    <div className="flex items-center justify-between px-[18px] pt-4 pb-2">
      <div className="flex items-center gap-3">
        <div className="w-[4px] h-[20px] bg-pitch-green flex-shrink-0" />
        <span className="font-serif text-[19px] font-medium text-pitch-ink">
          {label}
        </span>
      </div>
    </div>
  );
}

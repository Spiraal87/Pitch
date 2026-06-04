'use client';

import { useState, useRef } from 'react';

interface FaqItem {
  label: string;
  body: string;
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const answerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  function toggle(label: string) {
    const next = open === label ? null : label;
    setOpen(next);

    if (next) {
      // Wait for React to render the answer, then scroll it into view.
      // scroll-padding-bottom: 200px on <html> ensures the ask bar is cleared.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          answerRefs.current[next]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        });
      });
    }
  }

  return (
    <div className="border-b border-pitch-rule">
      {items.map((item) => (
        <div key={item.label} className="border-t border-pitch-rule first:border-t-0">
          <button
            onClick={() => toggle(item.label)}
            className="w-full text-left px-[18px] py-4"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="font-sans text-[13px] font-medium text-pitch-ink leading-[1.5]">
                {item.label}
              </p>
              <span className={`font-sans text-[18px] leading-none text-pitch-green transition-transform duration-200 flex-shrink-0 ${open === item.label ? 'rotate-45' : ''}`}>
                +
              </span>
            </div>
          </button>
          {open === item.label && (
            <div
              ref={(el) => { answerRefs.current[item.label] = el; }}
              className="px-[18px] pb-4"
            >
              <p className="font-sans text-[13px] text-pitch-ink-mid leading-[1.6]">{item.body}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

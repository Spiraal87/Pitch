'use client';

import { useState, useEffect, useRef } from 'react';

interface NavItem {
  label: string;
  href: string;
}

interface PageNavProps {
  items: NavItem[];
}

export default function PageNav({ items }: PageNavProps) {
  const [activeHref, setActiveHref] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ids = items
      .filter((item) => item.href.startsWith('#'))
      .map((item) => item.href.replace('#', ''));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveHref(`#${entry.target.id}`);
            break;
          }
        }
      },
      { rootMargin: '-10% 0px -75% 0px', threshold: 0 }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  // Scroll active pill into view — horizontal only, never affects page scroll
  useEffect(() => {
    if (!activeHref || !scrollRef.current) return;
    const container = scrollRef.current;
    const active = container.querySelector(`[data-href="${activeHref}"]`) as HTMLElement;
    if (!active) return;
    const containerRect = container.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const target = container.scrollLeft + (activeRect.left - containerRect.left) - containerRect.width / 2 + activeRect.width / 2;
    container.scrollTo({ left: target, behavior: 'smooth' });
  }, [activeHref]);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!href.startsWith('#')) return; // let browser navigate normally
    e.preventDefault();
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
    setActiveHref(href);
  }

  return (
    <div className="border-b border-pitch-rule bg-pitch-white overflow-x-auto" ref={scrollRef}>
      <div className="flex gap-1.5 px-[18px] py-2.5 w-max min-w-full">
        {items.map((item) => {
          const isActive = activeHref === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              data-href={item.href}
              onClick={(e) => handleClick(e, item.href)}
              className={`font-sans text-[11px] font-medium px-3 py-1.5 rounded-full border whitespace-nowrap ${
                isActive
                  ? 'bg-pitch-green border-pitch-green text-white shadow-sm'
                  : 'border-pitch-rule text-pitch-ink-light hover:border-pitch-green hover:text-pitch-green'
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

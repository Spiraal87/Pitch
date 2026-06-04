'use client';

import { useState, useRef, useEffect } from 'react';
import { useAskBarOffset } from '@/hooks/useAskBarOffset';

interface AskBarProps {
  placeholder?: string;
  context?: string;
}

const MAX_QUESTIONS = 10;
const SESSION_KEY = 'pitch_ask_count';

const SUGGESTIONS = [
  'Who should I watch?',
  "What's the group of death?",
  'Who are the favorites?',
];

// Render markdown bold/italic as real HTML
function FormattedAnswer({ text, loading }: { text: string; loading: boolean }) {
  // Split into paragraphs on double newlines, handle single newlines too
  const paragraphs = text.split(/\n\n+/).filter(Boolean);

  if (paragraphs.length === 0) {
    return (
      <p className="font-sans text-[13px] text-pitch-ink leading-[1.6]">
        {loading && <span className="animate-pulse text-pitch-ink-light">▋</span>}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {paragraphs.map((para, i) => {
        const isLast = i === paragraphs.length - 1;
        // Parse inline bold (**text**) and italic (*text*)
        const parts = para.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
        return (
          <p key={i} className="font-sans text-[13px] text-pitch-ink leading-[1.6]">
            {parts.map((part, j) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={j} className="font-medium text-pitch-ink">{part.slice(2, -2)}</strong>;
              }
              if (part.startsWith('*') && part.endsWith('*')) {
                return <em key={j}>{part.slice(1, -1)}</em>;
              }
              return part;
            })}
            {isLast && loading && <span className="animate-pulse text-pitch-ink-light ml-0.5">▋</span>}
          </p>
        );
      })}
    </div>
  );
}

export default function AskBar({
  placeholder = "Ask anything about the World Cup…",
  context,
}: AskBarProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [remaining, setRemaining] = useState(MAX_QUESTIONS);
  const inputRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const footerOffset = useAskBarOffset();
  const [barHeight, setBarHeight] = useState(160);

  useEffect(() => {
    if (!barRef.current) return;
    const obs = new ResizeObserver(() => {
      setBarHeight(barRef.current?.offsetHeight ?? 160);
    });
    obs.observe(barRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const stored = parseInt(sessionStorage.getItem(SESSION_KEY) ?? '0', 10);
    setRemaining(MAX_QUESTIONS - stored);
  }, []);

  async function handleAsk(q?: string) {
    const text = q ?? question;
    if (!text.trim() || loading || remaining <= 0) return;
    if (q) setQuestion(q);

    const used = parseInt(sessionStorage.getItem(SESSION_KEY) ?? '0', 10) + 1;
    sessionStorage.setItem(SESSION_KEY, String(used));
    setRemaining(MAX_QUESTIONS - used);

    setLoading(true);
    setAnswer('');
    setOpen(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, context }),
      });

      if (!res.ok || !res.body) {
        setAnswer('Sorry, something went wrong. Try again.');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamed = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        streamed += decoder.decode(value, { stream: true });
        setAnswer(streamed);
      }
    } catch {
      setAnswer('Sorry, something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAsk();
    if (e.key === 'Escape') setOpen(false);
  }

  return (
    <>
      {/* Answer overlay */}
      {open && (answer || loading) && (
        <div className="fixed inset-0 z-40 flex items-end" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-[640px] mx-auto px-[18px]"
            style={{ marginBottom: `${barHeight + footerOffset + 8}px` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-pitch-white border border-pitch-rule rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-[6px] h-[6px] rounded-full bg-pitch-green" />
                  <p className="font-sans text-[11px] uppercase tracking-[0.10em] text-pitch-green font-medium">
                    Pitch
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-pitch-ink-light text-sm hover:text-pitch-ink w-6 h-6 flex items-center justify-center rounded-full hover:bg-pitch-cream"
                >
                  ✕
                </button>
              </div>
              {question && (
                <p className="font-sans text-[11px] text-pitch-ink-light italic mb-3 pb-3 border-b border-pitch-rule">
                  {question}
                </p>
              )}
              <FormattedAnswer text={answer} loading={loading} />
            </div>
          </div>
        </div>
      )}

      {/* Fixed bar */}
      <div
        ref={barRef}
        className="fixed left-0 right-0 z-50 bg-pitch-cream border-t-2 border-pitch-green"
        style={{ bottom: `${footerOffset}px` }}
      >
        <div className="max-w-[640px] mx-auto px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">

          {/* Label + suggestions row */}
          {!open && remaining > 0 && (
            <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-0.5">
              <span className="font-sans text-[10px] uppercase tracking-[0.08em] text-pitch-ink-light whitespace-nowrap flex-shrink-0">
                Ask Pitch
              </span>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleAsk(s)}
                  className="font-sans text-[11px] text-pitch-green-mid border border-pitch-green-light bg-pitch-green-light/50 rounded-full px-3 py-1 whitespace-nowrap hover:bg-pitch-green-light hover:border-pitch-green flex-shrink-0"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Context label */}
          <p className="font-sans text-[11px] text-pitch-ink-light mb-2">
            Ask about teams, players, matches, and tournament strategy
          </p>

          {/* Input row */}
          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={remaining > 0 ? placeholder : 'No questions remaining this session'}
              disabled={remaining <= 0}
              className="flex-1 font-sans text-[13px] sm:text-[13px] bg-pitch-white border border-pitch-rule rounded-[20px] px-4 py-2.5 text-pitch-ink placeholder-pitch-ink-light focus:outline-none focus:border-pitch-green focus:ring-2 focus:ring-pitch-green/10 disabled:opacity-50"
              style={{ fontSize: '16px' }}
            />
            <button
              onClick={() => handleAsk()}
              disabled={!question.trim() || loading || remaining <= 0}
              className="font-sans text-[13px] font-medium bg-pitch-green text-white rounded-[20px] px-5 py-2.5 hover:bg-pitch-green-mid active:scale-95 disabled:opacity-40 whitespace-nowrap shadow-sm touch-action-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              {loading ? '…' : 'Ask'}
            </button>
          </div>

          {remaining < MAX_QUESTIONS && remaining > 0 && (
            <p className="font-sans text-[10px] text-pitch-ink-light mt-1.5 text-center">
              {remaining} question{remaining !== 1 ? 's' : ''} remaining
            </p>
          )}
        </div>
      </div>
    </>
  );
}

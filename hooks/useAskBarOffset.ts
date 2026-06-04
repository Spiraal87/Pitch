import { useEffect, useState } from 'react';

export function useAskBarOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    function update() {
      const footer = document.querySelector('footer');
      if (!footer) { setOffset(0); return; }

      const viewport = window.visualViewport;
      const viewportBottom = viewport
        ? viewport.offsetTop + viewport.height
        : window.innerHeight;
      const footerTop = footer.getBoundingClientRect().top;

      setOffset(footerTop < viewportBottom ? Math.max(0, viewportBottom - footerTop) : 0);
    }

    function debounceUpdate() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(update, 100);
    }

    window.addEventListener('scroll', debounceUpdate, { passive: true });
    window.addEventListener('resize', debounceUpdate);
    window.visualViewport?.addEventListener('scroll', debounceUpdate);
    window.visualViewport?.addEventListener('resize', debounceUpdate);
    update();

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', debounceUpdate);
      window.removeEventListener('resize', debounceUpdate);
      window.visualViewport?.removeEventListener('scroll', debounceUpdate);
      window.visualViewport?.removeEventListener('resize', debounceUpdate);
    };
  }, []);

  return offset;
}

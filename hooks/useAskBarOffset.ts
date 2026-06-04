import { useEffect, useState } from 'react';

export function useAskBarOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
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

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    window.visualViewport?.addEventListener('resize', update);
    update();

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);

  return offset;
}

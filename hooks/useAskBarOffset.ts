import { useEffect, useState } from 'react';

export function useAskBarOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    function update() {
      const footer = document.querySelector('footer');
      if (!footer) { setOffset(0); return; }

      const footerTop = footer.getBoundingClientRect().top;
      const vh = window.innerHeight;

      setOffset(footerTop < vh ? Math.max(0, vh - footerTop) : 0);
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return offset;
}

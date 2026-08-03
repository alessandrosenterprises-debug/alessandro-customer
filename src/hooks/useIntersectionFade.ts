import { useEffect, useRef, useState } from 'react';

export function useIntersectionFade<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (inView) return; // already visible

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (el) observer.unobserve(el);
        }
      });
    }, options ?? { threshold: 0.12 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref.current, inView, options]);

  return { ref, inView } as const;
}

import { useEffect, useRef, useState } from 'react';

/**
 * A hook that utilizes IntersectionObserver to trigger a boolean state
 * when an element scrolls into the viewport.
 * @param {Object} options - IntersectionObserver options (threshold, rootMargin, etc)
 * @returns {[boolean, React.RefObject]} - [isVisible, ref]
 */
export function useScrollReveal(options = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Optional: unobserve if you only want it to animate once
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options.threshold, options.rootMargin]);

  return [isVisible, ref];
}

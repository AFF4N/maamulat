import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopProps {
  threshold?: number;
}

export const ScrollToTop: React.FC<ScrollToTopProps> = ({ threshold = 250 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      onClick={handleScrollToTop}
      aria-label="Scroll back to top"
      title="Scroll to top"
      className={`group fixed bottom-6 right-4 sm:right-6 z-40 p-2.5 sm:p-3 rounded-full bg-white/90 dark:bg-ink-800/90 text-ink-700 dark:text-ink-200 hover:text-sage-700 dark:hover:text-sage-300 border border-paper-300 dark:border-ink-700 shadow-soft-lg hover:shadow-xl backdrop-blur-md transition-all duration-300 ease-out hover:scale-105 active:scale-95 standalone:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5] transition-transform duration-200 group-hover:-translate-y-0.5" />
    </button>
  );
};

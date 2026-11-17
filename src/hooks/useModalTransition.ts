import { useState, useEffect } from 'react';

let activeScrollLockCount = 0;
let prevHtmlOverflow = '';
let prevBodyOverflow = '';
let prevHtmlOverscroll = '';
let prevBodyOverscroll = '';

/**
 * Reference-counted scroll lock so nested modals/drawers prevent background
 * scrolling without unlocking prematurely when an inner modal closes.
 */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked || typeof document === 'undefined') return;

    if (activeScrollLockCount === 0) {
      const html = document.documentElement;
      const body = document.body;
      prevHtmlOverflow = html.style.overflow;
      prevBodyOverflow = body.style.overflow;
      prevHtmlOverscroll = html.style.overscrollBehavior;
      prevBodyOverscroll = body.style.overscrollBehavior;

      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
      html.style.overscrollBehavior = 'none';
      body.style.overscrollBehavior = 'none';
    }
    activeScrollLockCount += 1;

    return () => {
      activeScrollLockCount = Math.max(0, activeScrollLockCount - 1);
      if (activeScrollLockCount === 0) {
        const html = document.documentElement;
        const body = document.body;
        html.style.overflow = prevHtmlOverflow;
        body.style.overflow = prevBodyOverflow;
        html.style.overscrollBehavior = prevHtmlOverscroll;
        body.style.overscrollBehavior = prevBodyOverscroll;
      }
    };
  }, [locked]);
}

/**
 * Keeps a modal mounted long enough for its exit animation to play
 * and locks background page scrolling while the modal is visible.
 */
export function useModalTransition(isOpen: boolean, durationMs = 180) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      return;
    }

    if (!shouldRender) return;

    setIsClosing(true);
    const timer = window.setTimeout(() => {
      setShouldRender(false);
      setIsClosing(false);
    }, durationMs);

    return () => window.clearTimeout(timer);
  }, [isOpen, shouldRender, durationMs]);

  useBodyScrollLock(shouldRender);

  return { shouldRender, isClosing };
}


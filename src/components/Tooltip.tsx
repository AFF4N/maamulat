import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

export type TooltipPosition = 'above' | 'below' | 'left' | 'right';
export type TooltipAlign = 'left' | 'center' | 'right';

export interface TooltipProps {
  isOpen: boolean;
  onClose?: () => void;
  position?: TooltipPosition;
  align?: TooltipAlign;
  arrowPosition?: TooltipAlign;
  showCloseButton?: boolean;
  className?: string;
  usePortal?: boolean;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
  isOpen,
  onClose,
  position = 'above',
  align = 'center',
  arrowPosition = 'center',
  showCloseButton = false,
  className = '',
  usePortal = true,
  children,
}) => {
  const markerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; transform: string } | null>(null);

  // Recalculate fixed coordinates based on anchor element
  const updateCoords = () => {
    if (!markerRef.current) return;
    const anchor = markerRef.current.parentElement;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    let top = 0;
    let left = 0;
    let transform = '';

    if (position === 'above') {
      top = rect.top - 6;
      if (align === 'left') {
        left = rect.left;
        transform = 'translate(0, -100%)';
      } else if (align === 'right') {
        left = rect.right;
        transform = 'translate(-100%, -100%)';
      } else {
        left = rect.left + rect.width / 2;
        transform = 'translate(-50%, -100%)';
      }
    } else if (position === 'below') {
      top = rect.bottom + 6;
      if (align === 'left') {
        left = rect.left;
        transform = 'translate(0, 0)';
      } else if (align === 'right') {
        left = rect.right;
        transform = 'translate(-100%, 0)';
      } else {
        left = rect.left + rect.width / 2;
        transform = 'translate(-50%, 0)';
      }
    } else if (position === 'left') {
      top = rect.top + rect.height / 2;
      left = rect.left - 6;
      transform = 'translate(-100%, -50%)';
    } else if (position === 'right') {
      top = rect.top + rect.height / 2;
      left = rect.right + 6;
      transform = 'translate(0, -50%)';
    }

    setCoords({ top, left, transform });
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
    }
  }, [isOpen, position, align]);

  // Keep position synced on window scroll or resize
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updateCoords();
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, position, align]);

  // Handle outside click / touch
  useEffect(() => {
    if (!isOpen || !onClose) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(target) &&
        markerRef.current?.parentElement &&
        !markerRef.current.parentElement.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isOpen, onClose]);

  // Arrow position & styling
  let arrowClasses = 'absolute w-1.5 h-1.5 rotate-45 bg-slate-100 dark:bg-ink-800 ';
  if (position === 'above') {
    arrowClasses += '-bottom-1 border-r border-b border-slate-300 dark:border-ink-650 ';
    if (arrowPosition === 'left') arrowClasses += 'left-2.5';
    else if (arrowPosition === 'right') arrowClasses += 'right-2.5';
    else arrowClasses += 'left-1/2 -translate-x-1/2';
  } else if (position === 'below') {
    arrowClasses += '-top-1 border-l border-t border-slate-300 dark:border-ink-650 ';
    if (arrowPosition === 'left') arrowClasses += 'left-2.5';
    else if (arrowPosition === 'right') arrowClasses += 'right-2.5';
    else arrowClasses += 'left-1/2 -translate-x-1/2';
  } else if (position === 'left') {
    arrowClasses += '-right-1 top-1/2 -translate-y-1/2 border-t border-r border-slate-300 dark:border-ink-650';
  } else if (position === 'right') {
    arrowClasses += '-left-1 top-1/2 -translate-y-1/2 border-b border-l border-slate-300 dark:border-ink-650';
  }

  const tooltipElement = isOpen && coords ? (
    <div
      ref={tooltipRef}
      onClick={(e) => e.stopPropagation()}
      role="tooltip"
      style={
        usePortal
          ? {
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: coords.transform,
              zIndex: 9999,
            }
          : undefined
      }
      className={`p-1.5 px-2 rounded-xl bg-slate-100 dark:bg-ink-800 border border-slate-300 dark:border-ink-650 text-slate-800 dark:text-slate-100 text-[10px] leading-snug shadow-soft-md pointer-events-none ${
        !usePortal ? 'absolute z-50' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1">{children}</div>
        {showCloseButton && onClose && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-700 dark:text-ink-400 dark:hover:text-white text-xs leading-none ml-1 shrink-0 tap-bounce"
            aria-label="Close tooltip"
          >
            ×
          </button>
        )}
      </div>
      <span className={arrowClasses} />
    </div>
  ) : null;

  return (
    <>
      <span ref={markerRef} className="hidden" aria-hidden="true" />
      {usePortal && typeof document !== 'undefined'
        ? tooltipElement
          ? createPortal(tooltipElement, document.body)
          : null
        : tooltipElement}
    </>
  );
};

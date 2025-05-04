import React from 'react';

type DrawerDirection = 'top' | 'bottom' | 'left' | 'right' | null;
type AnyFunction = (...args: any) => any;

export const useScaleBackground = (isOpen: boolean, side: DrawerDirection) => {
  const timeoutIdRef = React.useRef<number | null>(null);
  const setBackgroundColorOnScale = true;
  const noBodyStyles = true;
  const [initialBackgroundColor, setInitialBackgroundColor] = React.useState<string | undefined>(
    undefined
  );
  const TRANSITIONS = {
    DURATION: 0.5,
    EASE: [0.32, 0.72, 0, 1],
  };
  const BORDER_RADIUS = 8;
  const WINDOW_TOP_OFFSET = 26;

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      setInitialBackgroundColor(document.body.style.backgroundColor);
    }
  }, []);

  function chain<T>(...fns: T[]) {
    return (...args: T extends AnyFunction ? Parameters<T> : never) => {
      for (const fn of fns) {
        if (typeof fn === 'function') {
          fn(...args);
        }
      }
    };
  }

  const noop = () => () => {};

  function assignStyle(
    element: HTMLElement | null | undefined,
    style: Partial<CSSStyleDeclaration>
  ) {
    if (!element) return () => {};

    const prevStyle = element.style.cssText;
    Object.assign(element.style, style);

    return () => {
      element.style.cssText = prevStyle;
    };
  }

  const isVertical = (direction: DrawerDirection) => {
    switch (direction) {
      case 'top':
      case 'bottom':
        return true;
      case 'left':
      case 'right':
        return false;
      default:
        return direction;
    }
  };

  function getScale() {
    return (window.innerWidth - WINDOW_TOP_OFFSET) / window.innerWidth;
  }

  React.useEffect(() => {
    if (isOpen) {
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
      const wrapper =
        (document.querySelector('[data-vaul-drawer-wrapper]') as HTMLElement) ||
        (document.querySelector('[vaul-drawer-wrapper]') as HTMLElement);

      if (!wrapper) return;

      chain(
        setBackgroundColorOnScale && !noBodyStyles
          ? assignStyle(document.body, { background: 'black' })
          : noop,
        assignStyle(wrapper, {
          transformOrigin: isVertical(side) ? 'top' : 'left',
          transitionProperty: 'transform, border-radius',
          transitionDuration: `${TRANSITIONS.DURATION}s`,
          transitionTimingFunction: `cubic-bezier(${TRANSITIONS.EASE.join(',')})`,
        })
      );

      const wrapperStylesCleanup = assignStyle(wrapper, {
        borderRadius: `${BORDER_RADIUS}px`,
        overflow: 'hidden',
        ...(isVertical(side)
          ? {
              transform: `scale(${getScale()}) translate3d(0, calc(env(safe-area-inset-top) + 14px), 0)`,
            }
          : {
              transform: `scale(${getScale()}) translate3d(calc(env(safe-area-inset-top) + 14px), 0, 0)`,
            }),
      });

      return () => {
        wrapperStylesCleanup();
        timeoutIdRef.current = window.setTimeout(() => {
          if (initialBackgroundColor) {
            document.body.style.background = initialBackgroundColor;
          } else {
            document.body.style.removeProperty('background');
          }
        }, TRANSITIONS.DURATION * 1000);
      };
    }
  }, [isOpen, initialBackgroundColor]);
};

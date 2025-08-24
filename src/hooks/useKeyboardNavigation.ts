import React, { useEffect } from 'react';

interface UseKeyboardNavigationProps<T> {
  items: T[];
  selectedItem: T | null;
  setSelectedItem: (item: T) => void;
  isEnabled: boolean;
  getItemId: (item: T) => string | number;
  autoSelectFirst?: boolean;
  getItemElement?: (item: T) => HTMLElement | null;
  scrollBehavior?: ScrollBehavior;
  hasMore?: boolean;
  requestMore?: () => void;
}

/**
 * Custom hook for keyboard navigation through a list of items
 * Supports up/down arrow keys with circular navigation
 *
 * @param items - Array of items to navigate through
 * @param selectedItem - Currently selected item
 * @param setSelectedItem - Function to update selected item
 * @param isEnabled - Whether keyboard navigation is enabled
 * @param getItemId - Function to get unique ID from an item for comparison
 * @param autoSelectFirst - Whether to auto-select first item when items change
 */
export const useKeyboardNavigation = <T>({
  items,
  selectedItem,
  setSelectedItem,
  isEnabled,
  getItemId,
  autoSelectFirst = true,
  getItemElement,
  scrollBehavior = 'smooth',
  hasMore = false,
  requestMore,
}: UseKeyboardNavigationProps<T>) => {
  const previousLengthRef = React.useRef<number>(items.length);
  const pendingAdvanceRef = React.useRef<boolean>(false);
  const shouldAutoScrollRef = React.useRef<boolean>(false);
  // Auto-select first item when enabled and items are available
  useEffect(() => {
    if (autoSelectFirst && isEnabled && items.length > 0 && !selectedItem) {
      setSelectedItem(items[0]);
    }
  }, [isEnabled, items, selectedItem, setSelectedItem, autoSelectFirst]);

  // Keyboard navigation effect
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();

        if (items.length === 0) return;

        const currentIndex = selectedItem
          ? items.findIndex((item) => getItemId(item) === getItemId(selectedItem))
          : -1;

        let newIndex: number;
        if (event.key === 'ArrowUp') {
          newIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
        } else {
          if (currentIndex >= items.length - 1) {
            if (hasMore && requestMore) {
              previousLengthRef.current = items.length;
              pendingAdvanceRef.current = true;
              shouldAutoScrollRef.current = true;
              requestMore();
              return;
            }
            newIndex = 0;
          } else {
            newIndex = currentIndex + 1;
          }
        }

        shouldAutoScrollRef.current = true;
        setSelectedItem(items[newIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, items, selectedItem, setSelectedItem, getItemId, hasMore, requestMore]);

  // Auto-scroll selected item into view when it changes due to keyboard/navigation
  useEffect(() => {
    if (!isEnabled || !selectedItem || !getItemElement) return;
    const element = getItemElement(selectedItem);
    if (shouldAutoScrollRef.current && element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ block: 'nearest', behavior: scrollBehavior });
      shouldAutoScrollRef.current = false;
    }
  }, [isEnabled, selectedItem, getItemElement, scrollBehavior]);

  useEffect(() => {
    if (!isEnabled) return;
    const prev = previousLengthRef.current;
    if (pendingAdvanceRef.current && items.length > prev) {
      const firstNew = items[prev];
      if (firstNew) {
        shouldAutoScrollRef.current = true;
        setSelectedItem(firstNew);
      }
      pendingAdvanceRef.current = false;
    }
    previousLengthRef.current = items.length;
  }, [isEnabled, items, setSelectedItem]);
};

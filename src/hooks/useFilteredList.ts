import { useCallback, useReducer } from 'react';

/**
 * Generic state for managing filtered lists
 */
interface FilteredListState<T> {
  allItems: T[];
  displayedItems: T[];
  activeFilter: string;
}

/**
 * Actions for the filtered list reducer
 */
type FilteredListAction<T> =
  | { type: 'SET_ITEMS'; payload: T[] }
  | { type: 'APPEND_ITEMS'; payload: T[] }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'RESET' };

/**
 * Configuration for filter functions
 */
interface FilterConfig<T> {
  [key: string]: (item: T) => boolean;
}

/**
 * Options for the useFilteredList hook
 */
interface UseFilteredListOptions<T> {
  /**
   * Filter configuration object where keys are filter names and values are filter functions
   * @example
   * {
   *   all: () => true,
   *   bookmarked: (item) => item.is_bookmarked,
   *   active: (item) => item.status === 'active'
   * }
   */
  filters: FilterConfig<T>;
  /**
   * Default filter to apply on initialization
   * @default 'all'
   */
  defaultFilter?: string;
}

/**
 * Return type for the useFilteredList hook
 */
interface UseFilteredListReturn<T> {
  /**
   * All items without any filtering
   */
  allItems: T[];
  /**
   * Items after applying the active filter
   */
  displayedItems: T[];
  /**
   * Currently active filter name
   */
  activeFilter: string;
  /**
   * Set or replace all items (typically used when loading first page)
   */
  setItems: (items: T[]) => void;
  /**
   * Append items to existing list (typically used for pagination)
   */
  appendItems: (items: T[]) => void;
  /**
   * Change the active filter
   */
  setFilter: (filterName: string) => void;
  /**
   * Reset to initial state (empty items, default filter)
   */
  reset: () => void;
}

/**
 * Custom hook for managing filtered lists with efficient state management
 *
 * @template T - The type of items in the list
 * @param options - Configuration options including filter functions and default filter
 * @returns Object containing state and methods to manage the filtered list
 *
 * @example
 * ```tsx
 * interface Community {
 *   id: number;
 *   name: string;
 *   is_bookmarked: boolean;
 * }
 *
 * const {
 *   displayedItems,
 *   setItems,
 *   setFilter,
 *   activeFilter
 * } = useFilteredList<Community>({
 *   filters: {
 *     all: () => true,
 *     bookmarked: (community) => community.is_bookmarked,
 *   },
 *   defaultFilter: 'all'
 * });
 *
 * // Load data
 * useEffect(() => {
 *   if (data) {
 *     setItems(data.items);
 *   }
 * }, [data]);
 *
 * // Render filtered items
 * return displayedItems.map(item => <Item key={item.id} {...item} />);
 * ```
 */
export function useFilteredList<T>({
  filters,
  defaultFilter = 'all',
}: UseFilteredListOptions<T>): UseFilteredListReturn<T> {
  // Validate that the default filter exists in filters config
  if (!filters[defaultFilter]) {
    console.warn(
      `Default filter "${defaultFilter}" not found in filters config. Using first available filter.`
    );
    defaultFilter = Object.keys(filters)[0] || 'all';
  }

  /**
   * Reducer function to manage filtered list state
   */
  const filteredListReducer = (
    state: FilteredListState<T>,
    action: FilteredListAction<T>
  ): FilteredListState<T> => {
    switch (action.type) {
      case 'SET_ITEMS': {
        const allItems = action.payload;
        const filterFn = filters[state.activeFilter] || (() => true);
        return {
          ...state,
          allItems,
          displayedItems: allItems.filter(filterFn),
        };
      }

      case 'APPEND_ITEMS': {
        const allItems = [...state.allItems, ...action.payload];
        const filterFn = filters[state.activeFilter] || (() => true);
        return {
          ...state,
          allItems,
          displayedItems: allItems.filter(filterFn),
        };
      }

      case 'SET_FILTER': {
        const filterFn = filters[action.payload] || (() => true);
        return {
          ...state,
          activeFilter: action.payload,
          displayedItems: state.allItems.filter(filterFn),
        };
      }

      case 'RESET': {
        return {
          allItems: [],
          displayedItems: [],
          activeFilter: defaultFilter,
        };
      }

      default:
        return state;
    }
  };

  // Initialize reducer with default state
  const [state, dispatch] = useReducer(filteredListReducer, {
    allItems: [],
    displayedItems: [],
    activeFilter: defaultFilter,
  });

  // Memoized action creators
  const setItems = useCallback((items: T[]) => {
    dispatch({ type: 'SET_ITEMS', payload: items });
  }, []);

  const appendItems = useCallback((items: T[]) => {
    dispatch({ type: 'APPEND_ITEMS', payload: items });
  }, []);

  const setFilter = useCallback(
    (filterName: string) => {
      if (!filters[filterName]) {
        console.warn(`Filter "${filterName}" not found in filters config. Ignoring.`);
        return;
      }
      dispatch({ type: 'SET_FILTER', payload: filterName });
    },
    [filters]
  );

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    allItems: state.allItems,
    displayedItems: state.displayedItems,
    activeFilter: state.activeFilter,
    setItems,
    appendItems,
    setFilter,
    reset,
  };
}

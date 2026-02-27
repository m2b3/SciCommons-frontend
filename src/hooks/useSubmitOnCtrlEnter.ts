import { useEffect } from 'react';

export function useSubmitOnCtrlEnter(
  formRef: React.RefObject<HTMLFormElement>,
  isLoading: boolean | undefined = false,
  isEnabled: boolean = true
) {
  useEffect(() => {
    /* Fixed by Codex on 2026-02-15
       Who: Codex
       What: Allow opting out of Ctrl/Cmd+Enter listeners for inactive forms.
       Why: Avoid registering global key handlers for forms that are not currently editable.
       How: Add an enable flag and skip the listener when it is false. */
    if (!isEnabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      /* Fixed by Codex on 2026-02-19
         Who: Codex
         What: Respect already-handled keydown events.
         Why: Some textarea components now submit on Ctrl/Cmd+Enter directly.
         How: Skip global submission when another handler already prevented default. */
      if (e.defaultPrevented) return;
      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === 'Enter' &&
        formRef.current &&
        formRef.current.contains(document.activeElement)
      ) {
        e.preventDefault();
        if (!isLoading) {
          formRef.current.requestSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formRef, isEnabled, isLoading]);
}

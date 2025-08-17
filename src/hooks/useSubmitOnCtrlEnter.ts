import { useEffect } from 'react';

export function useSubmitOnCtrlEnter(
  formRef: React.RefObject<HTMLFormElement>,
  isLoading: boolean | undefined = false
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [formRef, isLoading]);
}

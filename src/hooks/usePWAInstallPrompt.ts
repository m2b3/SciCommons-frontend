import { useCallback, useEffect, useState } from 'react';

import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const usePWAInstallPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallAvailable, setIsInstallAvailable] = useState(false);

  useEffect(() => {
    /* Fixed by Codex on 2026-02-16
       Who: Codex
       What: Centralized PWA install availability tracking in React state.
       Why: Direct DOM toggling by element id could race with dropdown mounting/unmounting and make install clicks unreliable.
       How: Listen for `beforeinstallprompt`/`appinstalled`, store the deferred prompt event, and expose a boolean flag for UI rendering. */
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setIsInstallAvailable(true);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstallAvailable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleAppInstall = useCallback(async () => {
    if (!installPrompt) {
      toast.info('Install is not available right now on this browser or page.');
      return;
    }

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'dismissed') {
        toast.info('Install prompt dismissed.');
      }
      setInstallPrompt(null);
      setIsInstallAvailable(false);
    } catch {
      toast.error('Unable to open install prompt. Please try again.');
    }
  }, [installPrompt]);

  const handleOpenAppHelp = useCallback(() => {
    /* Fixed by Codex on 2026-02-16
       Who: Codex
       What: Added explicit "open app" guidance when install is unavailable.
       Why: Users may not realize the PWA is already installed and can be confused when asked to "install" again.
       How: Expose a helper action that shows concise cross-platform launch guidance via toast. */
    toast.info(
      'If you already installed SciCommons, open it from your desktop or Start menu. On mobile, use the home screen app icon.'
    );
  }, []);

  return { handleAppInstall, isInstallAvailable, handleOpenAppHelp };
};

export default usePWAInstallPrompt;

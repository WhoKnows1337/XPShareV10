import { useEffect } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';

/**
 * Hook to warn users about unsaved changes when they try to leave the page
 * Uses browser's beforeunload event for external navigation (tab close, browser back)
 *
 * For internal navigation (like "Neu anfangen" button), use UnsavedChangesModal directly
 * in the component that triggers the navigation.
 */
export function useUnsavedChangesWarning() {
  const { isDraft, currentStep } = useSubmitFlowStore();

  useEffect(() => {
    // Only warn if there's actually draft content
    const hasUnsavedChanges = isDraft && currentStep > 1;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        // Modern browsers show a generic message, not custom text
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDraft, currentStep]);
}

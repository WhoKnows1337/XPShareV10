import { useEffect, useRef } from 'react';
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

  // Use refs to ensure event handler always has current values
  // This prevents closure issues when isDraft is set to false right before navigation
  const isDraftRef = useRef(isDraft);
  const currentStepRef = useRef(currentStep);

  // Update refs whenever state changes
  useEffect(() => {
    isDraftRef.current = isDraft;
    currentStepRef.current = currentStep;
  }, [isDraft, currentStep]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Use refs to get live values instead of captured closure values
      const hasUnsavedChanges = isDraftRef.current && currentStepRef.current > 1;

      if (hasUnsavedChanges) {
        // Modern browsers show a generic message, not custom text
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // Empty deps: listener is only registered once, but uses refs for live values
}

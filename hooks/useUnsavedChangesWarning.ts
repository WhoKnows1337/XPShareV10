import { useEffect, useRef } from 'react';
import { useSubmitFlowStore } from '@/lib/stores/submitFlowStore';

/**
 * Hook to warn users about unsaved changes when they try to leave the page
 * Uses browser's beforeunload event for external navigation (tab close, browser back)
 *
 * ⚠️ DISABLED: This hook was causing too many false positives, showing the browser
 * warning dialog even for internal navigation (clicking "Next" button).
 *
 * The draft auto-save feature is sufficient protection against data loss.
 * Users can always resume their draft from localStorage.
 *
 * For internal navigation (like "Neu anfangen" button), use UnsavedChangesModal directly
 * in the component that triggers the navigation.
 */
export function useUnsavedChangesWarning() {
  // Hook is now disabled - no-op
  // Keeping the hook structure in case we need to re-enable it later
  return;
}

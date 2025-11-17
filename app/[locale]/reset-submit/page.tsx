'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

/**
 * Emergency Reset Page for Submit Flow
 *
 * Use this page if you're stuck on an error screen or the submit flow
 * has corrupted state. This will clear all localStorage data for the
 * submit flow and reset it to a clean state.
 *
 * Navigate to: /reset-submit
 */
export default function ResetSubmitPage() {
  const router = useRouter();
  const [hasReset, setHasReset] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = () => {
    try {
      // Clear submit flow localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('submit-flow-storage');
        console.log('[Reset] Cleared submit-flow-storage from localStorage');
      }

      setHasReset(true);
      setShowConfirm(false);

      // Auto-redirect to submit page after 2 seconds
      setTimeout(() => {
        router.push('/submit');
      }, 2000);
    } catch (error) {
      console.error('[Reset] Error clearing localStorage:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        {/* Back Button */}
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-observatory-gold transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Submit
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-observatory-gold/20 border border-observatory-gold/30 flex items-center justify-center">
              <RefreshCw className="w-10 h-10 text-observatory-gold" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Reset Submit Flow
            </h1>
            <p className="text-slate-400">
              Emergency reset for corrupted submit flow state
            </p>
          </div>

          {/* Info Alert */}
          {!hasReset && !showConfirm && (
            <Alert className="border-yellow-500/50 bg-yellow-950/20">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <AlertTitle className="text-yellow-400">
                About This Reset
              </AlertTitle>
              <AlertDescription className="text-yellow-300 space-y-2 mt-2">
                <p>
                  This tool will clear all saved data from your current submit flow, including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Story text and enhanced text</li>
                  <li>AI analysis results and attributes</li>
                  <li>Title, category, tags, and metadata</li>
                  <li>Uploaded media references</li>
                  <li>Witnesses and external links</li>
                  <li>Draft saves</li>
                </ul>
                <p className="text-xs mt-3 border-t border-yellow-500/30 pt-3">
                  <strong>Note:</strong> Uploaded files in R2 storage will NOT be deleted. They will be cleaned up automatically after 24 hours if not published.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Confirmation State */}
          {showConfirm && !hasReset && (
            <Alert variant="destructive" className="border-red-500/50 bg-red-950/20">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-red-400">
                Confirm Reset
              </AlertTitle>
              <AlertDescription className="text-red-300">
                Are you sure? All unsaved data will be lost. This cannot be undone.
              </AlertDescription>
            </Alert>
          )}

          {/* Success State */}
          {hasReset && (
            <Alert className="border-green-500/50 bg-green-950/20">
              <Check className="h-4 w-4 text-green-400" />
              <AlertTitle className="text-green-400">
                Reset Successful!
              </AlertTitle>
              <AlertDescription className="text-green-300">
                <p>Submit flow state has been cleared. Redirecting to submit page...</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          {!hasReset && (
            <div className="flex gap-3 justify-center pt-4">
              {!showConfirm ? (
                <>
                  <Button
                    onClick={() => setShowConfirm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Submit Flow
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/submit')}
                    className="bg-slate-900/50 hover:bg-slate-800 border-slate-700"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleReset}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Confirm Reset
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirm(false)}
                    className="bg-slate-900/50 hover:bg-slate-800 border-slate-700"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Help Text */}
          {!hasReset && (
            <div className="pt-6 border-t border-slate-700/50 text-center">
              <p className="text-sm text-slate-400">
                Use this reset if you're stuck on an error screen or experiencing issues with the submit flow.
              </p>
              <p className="text-xs text-slate-500 mt-2">
                If problems persist after reset, please contact support or check the browser console for errors.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { DocumentPreview, type DocumentPreviewProps } from '../DocumentPreview';

interface DocumentsTabProps {
  documents: DocumentPreviewProps[];
}

/**
 * Documents Tab Component
 * Displays PDF and document files with preview/download
 */
export function DocumentsTab({ documents }: DocumentsTabProps) {
  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-muted-foreground space-y-2">
          <FileText className="h-12 w-12 mx-auto opacity-20" />
          <p className="text-sm">No documents attached</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc, index) => (
        <motion.div
          key={doc.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <DocumentPreview {...doc} />
        </motion.div>
      ))}
    </div>
  );
}

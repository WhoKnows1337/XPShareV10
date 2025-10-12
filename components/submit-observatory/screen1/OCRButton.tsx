'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { OCRModal } from './OCRModal';

interface OCRButtonProps {
  onTextExtracted: (text: string) => void;
}

export function OCRButton({ onTextExtracted }: OCRButtonProps) {
  const t = useTranslations('submit.screen1.ocr');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTextExtracted = (text: string) => {
    onTextExtracted(text);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-5 py-3 rounded-lg
                   bg-text-primary/5 border border-text-primary/20 text-text-secondary
                   font-mono text-sm font-medium tracking-wide
                   transition-all duration-200
                   hover:bg-text-primary/8 hover:border-text-primary/30 hover:scale-[1.02]"
      >
        <FileText className="w-4 h-4" />
        <span>{t('button', '📄 Notiz einscannen')}</span>
      </button>

      {isModalOpen && (
        <OCRModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onTextExtracted={handleTextExtracted}
        />
      )}
    </>
  );
}

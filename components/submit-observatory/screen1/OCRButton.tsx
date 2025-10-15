'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { OCRModal } from './OCRModal';
import { Button } from '@/components/ui/button';

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
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        <FileText className="w-3 h-3" />
        {t('button')}
      </Button>

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

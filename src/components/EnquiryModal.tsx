import { useEffect } from 'react';
import { EnquiryFormCard } from './EnquiryFormCard';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EnquiryModal({ isOpen, onClose }: EnquiryModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-modal-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#040615]/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[980px] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <EnquiryFormCard onClose={onClose} headingId="enquiry-modal-heading" />
      </div>
    </div>
  );
}

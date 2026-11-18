import { useEffect, useState } from 'react';
import { Download, X, ZoomIn, ZoomOut } from 'lucide-react';
import { RESUME_INFO } from '../data/portfolio';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  const [zoomed, setZoomed] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setZoomed(false);
    setDownloadError(null);

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

  const handleDownload = async () => {
    if (downloading) return;
    setDownloadError(null);
    setDownloading(true);
    try {
      const response = await fetch(RESUME_INFO.pdfSrc, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF (${response.status})`);
      }
      const buffer = await response.arrayBuffer();
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = RESUME_INFO.downloadFilename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      setDownloadError('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#1e0b36]/65 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[960px] max-h-[95vh] flex flex-col rounded-2xl bg-white border border-purple-200/80 shadow-[0_32px_90px_-16px_rgba(30,11,54,0.45)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-purple-200/60 bg-[#fbf9ff] shrink-0">
          <div className="min-w-0">
            <h2
              id="resume-modal-title"
              className="text-sm sm:text-base font-bold tracking-tight text-[#4c0b7b] truncate"
            >
              Siddartha Reddy — Resume
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              aria-pressed={zoomed}
              className="inline-flex items-center gap-1.5 px-3 min-h-[40px] text-xs font-medium text-[#4c0b7b] bg-white hover:bg-[#f7f3ff] border border-purple-200/90 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e24aa]"
            >
              {zoomed ? (
                <>
                  <ZoomOut className="w-3.5 h-3.5 text-[#8e24aa]" aria-hidden="true" />
                  <span className="hidden sm:inline">Fit page</span>
                </>
              ) : (
                <>
                  <ZoomIn className="w-3.5 h-3.5 text-[#8e24aa]" aria-hidden="true" />
                  <span className="hidden sm:inline">Zoom in</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 min-h-[40px] text-xs sm:text-sm font-semibold text-white bg-[#4c0b7b] hover:bg-[#6a15a8] disabled:opacity-65 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8e24aa]"
            >
              <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{downloading ? 'Preparing...' : 'Download PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close resume viewer"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-[#4c0b7b] hover:bg-purple-100/70 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#8e24aa]"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {downloadError && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-xs text-red-700 text-center shrink-0">
            {downloadError}
          </div>
        )}

        <div
          className={`flex-1 bg-[#f7f3ff] p-2 sm:p-4 flex justify-center ${
            zoomed ? 'overflow-auto items-start' : 'overflow-hidden items-center'
          }`}
        >
          <div
            className={`rounded-xl overflow-hidden bg-white border border-purple-200/70 shadow-sm ${
              zoomed ? 'w-full max-w-[860px]' : 'inline-flex items-center justify-center max-w-full max-h-full'
            }`}
          >
            <img
              src={RESUME_INFO.imageSrc}
              alt="Siddartha Reddy — Resume"
              draggable={false}
              referrerPolicy="no-referrer"
              style={
                zoomed
                  ? undefined
                  : {
                      maxHeight: 'calc(95vh - 96px)',
                      width: 'auto',
                      height: 'auto',
                      maxWidth: '100%',
                    }
              }
              className={`block select-none ${zoomed ? 'w-full h-auto object-contain' : 'object-contain'}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

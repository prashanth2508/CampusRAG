import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText, 
  Check, 
  Sparkles,
  Maximize2
} from 'lucide-react';

const ImageLightboxModal = ({ 
  isOpen = false, 
  onClose, 
  src, 
  alt = 'Official Diagram', 
  pageNum = 1, 
  docId = null,
  onOpenPDF = null
}) => {
  const [zoom, setZoom] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setZoom(1);
      setDownloadSuccess(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  const handleSaveImage = async (e) => {
    e.stopPropagation();
    setDownloading(true);
    try {
      // Determine clean filename
      const cleanTitle = (alt || 'academic-diagram')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const filename = `${cleanTitle}-page-${pageNum}.png`;

      // Fetch blob and trigger download
      const response = await fetch(src);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to download diagram image:', err);
      // Fallback: open in new tab with download param
      window.open(`${src}?download=true`, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  const modal = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-5xl h-[90vh] bg-[var(--surface)] rounded-[26px] shadow-2xl border border-[var(--line-strong)] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3.5 border-b border-[var(--line)] bg-[var(--muted)]/50 gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--lime-soft)] text-[#6d8434] flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0 max-w-[140px] sm:max-w-md">
              <h3 className="text-xs sm:text-sm font-semibold text-[var(--ink)] truncate">
                {alt || 'Academic Diagram Viewer'}
              </h3>
              <p className="text-[10px] text-[var(--ink-soft)] font-mono truncate">
                Page {pageNum} • Notes Extract
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-[var(--paper)] rounded-full border border-[var(--line)] text-xs">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="p-1 hover:text-[var(--ink)] text-[var(--ink-soft)] disabled:opacity-40 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] px-1.5 text-[var(--ink)] min-w-[42px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="p-1 hover:text-[var(--ink)] text-[var(--ink-soft)] disabled:opacity-40 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="p-1 hover:text-[var(--ink)] text-[var(--ink-soft)] cursor-pointer border-l border-[var(--line)] pl-1.5 ml-0.5"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Save / Download Image Button */}
            <button
              type="button"
              onClick={handleSaveImage}
              disabled={downloading}
              className="btn-moss px-3 sm:px-3.5 py-1.5 text-xs font-semibold inline-flex items-center gap-1 sm:gap-1.5 shadow-sm cursor-pointer"
              title="Save image to your computer"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Save<span className="hidden sm:inline"> Image</span></span>
                </>
              )}
            </button>

            {/* View Full Page in PDF Button */}
            {onOpenPDF && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPDF({ documentId: docId, documentName: alt, page: pageNum });
                }}
                className="btn-pill-outline hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-pointer"
                title="View in full PDF document"
              >
                <FileText className="w-3 h-3 text-[#6d8434]" />
                <span>View in PDF</span>
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
              title="Close Viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Canvas Frame */}
        <div className="flex-1 overflow-auto bg-[#0a0d0c] dark:bg-[#050807] flex items-center justify-center p-4 sm:p-8 select-none">
          <img
            src={src}
            alt={alt}
            style={{ 
              transform: `scale(${zoom})`, 
              transition: 'transform 0.15s ease-out',
              maxWidth: zoom <= 1 ? '100%' : 'none',
              maxHeight: zoom <= 1 ? '75vh' : 'none'
            }}
            className="object-contain rounded-xl shadow-2xl mx-auto border border-white/10"
          />
        </div>

        {/* Footer Hint */}
        <div className="px-5 py-2.5 border-t border-[var(--line)] bg-[var(--muted)]/40 flex items-center justify-between text-[11px] text-[var(--ink-soft)] font-mono">
          <span>Click outside or press <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--line)] text-[10px]">Esc</kbd> to close</span>
          <span className="hidden sm:inline">Official Academic Notes Extract</span>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default ImageLightboxModal;


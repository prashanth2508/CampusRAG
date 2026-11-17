import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, FileText } from 'lucide-react';
import { documentAPI } from '../services/api';

const PDFViewerModal = ({ isOpen = true, onClose, source, fileUrl: directUrl, fileName: directName, page: directPage }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (isOpen === false) return null;

  const docName = directName || source?.documentName || 'Academic Document';
  const docPage = directPage || source?.page || 1;
  const pdfUrl = directUrl || (source?.documentId ? documentAPI.getPDFUrl(source.documentId) : null);

  const modal = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-sm"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-4xl h-[92vh] sm:h-[86vh] bg-[var(--surface)] rounded-2xl sm:rounded-[26px] shadow-2xl border border-[var(--line)] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-2.5 sm:py-3.5 border-b border-[var(--line)] bg-[var(--muted)]/40 gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[var(--lime-soft)] text-[#6d8434] flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0 max-w-[150px] sm:max-w-md">
              <h3 className="text-xs sm:text-sm font-semibold text-[var(--ink)] truncate">
                {docName}
              </h3>
              <p className="text-[10px] text-[var(--ink-soft)] font-mono truncate">
                Page {docPage} {source?.module ? `• ${source.module}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-pill-outline flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium cursor-pointer"
              >
                <ExternalLink className="w-3 h-3 text-[#6d8434]" />
                <span className="hidden sm:inline">Open in Tab</span>
                <span className="sm:hidden">Tab</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Embedded Frame Body */}
        <div className="flex-1 bg-[var(--paper)] relative">
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#page=${docPage}`}
              title={docName}
              className="w-full h-full border-none"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[var(--ink-soft)] p-6 text-center space-y-2">
              <FileText className="w-10 h-10 opacity-30 text-[#6d8434]" />
              <p className="text-xs font-medium text-[var(--ink)]">PDF Preview Unavailable</p>
              <p className="text-[11px] text-[var(--ink-soft)] max-w-sm">
                Document: {docName} (Page {docPage})
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default PDFViewerModal;

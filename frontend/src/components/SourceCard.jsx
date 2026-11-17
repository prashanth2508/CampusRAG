import React from 'react';
import { FileText, Eye, Layers, RotateCcw } from 'lucide-react';

const SourceCard = ({ source, onViewPDF }) => {
  return (
    <div className="flex flex-col justify-between p-3.5 bg-[var(--surface)] shadow-[0_0_0_1px_var(--line)] rounded-2xl text-xs space-y-2.5 transition-all hover:shadow-[0_15px_30px_-15px_rgba(22,49,92,0.2),0_0_0_1px_var(--line-strong)]">
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 rounded-full bg-[var(--lime-soft)] text-[#6d8434] shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <h4 className="font-semibold text-[var(--ink)] truncate" title={source.documentName}>
              {source.documentName}
            </h4>
          </div>
          {source.score && (
            <span className="px-2 py-0.5 font-mono text-[10px] text-[#6d8434] dark:text-[#b8c460] bg-[var(--lime-soft)] rounded-full shrink-0 font-bold">
              {Math.round(source.score * 100)}% match
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[var(--ink-soft)] mb-2">
          <span className="font-mono bg-[var(--muted)] px-2 py-0.5 rounded-full text-[10px] font-semibold text-[var(--ink)]">
            Page {source.page}
          </span>
          {source.module && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-[var(--ink-soft)]">
              <Layers className="w-2.5 h-2.5" />
              {source.module}
            </span>
          )}
        </div>

        {source.excerpt && (
          <p className="text-[11px] text-[var(--ink-soft)] line-clamp-2 leading-relaxed bg-[var(--muted)]/40 p-2.5 rounded-xl border border-[var(--line)] italic">
            "{source.excerpt}"
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between">
        <span className="text-[10px] text-[var(--ink-soft)] font-mono">
          Strict Syllabus Grounding
        </span>
        <button
          onClick={() => onViewPDF(source)}
          className="btn-moss px-3 py-1 text-[11px] font-medium inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Replay Page {source.page}</span>
        </button>
      </div>
    </div>
  );
};

export default SourceCard;

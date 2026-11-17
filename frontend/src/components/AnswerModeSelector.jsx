import React from 'react';
import { Sparkles, FileText, Zap, BookOpen, HelpCircle } from 'lucide-react';

const modes = [
  {
    id: 'simple',
    label: 'Simple',
    icon: Sparkles,
    description: 'Beginner-friendly explanation in plain language.'
  },
  {
    id: '5marks',
    label: '5-Mark',
    icon: FileText,
    description: 'Structured 5-6 points for 5-mark university exam questions.'
  },
  {
    id: 'exam',
    label: '10-Mark',
    icon: FileText,
    description: 'Structured 10-mark format (Definition, Architecture, Points, Flowchart, Advantages, Summary).'
  },
  {
    id: 'short',
    label: 'Short',
    icon: Zap,
    description: 'Concise summary for fast revision.'
  },
  {
    id: 'detailed',
    label: 'In Detail',
    icon: BookOpen,
    description: 'Comprehensive, deep breakdown with thorough technical depth.'
  },
  {
    id: 'viva',
    label: 'Viva Prep',
    icon: HelpCircle,
    description: 'Viva voce oral exam prep with expected Q&As.'
  }
];

const AnswerModeSelector = ({ activeMode = 'detailed', onChangeMode }) => {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-[var(--muted)]/60 rounded-full border border-[var(--line)] max-w-full overflow-x-auto no-scrollbar shrink-0">
      {modes.map((m) => {
        const Icon = m.icon;
        const isSelected = activeMode === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChangeMode(m.id)}
            title={m.description}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              isSelected
                ? 'bg-[var(--lime-soft)] text-[var(--pill-ink)] shadow-[inset_0_0_0_1.5px_#6d8434] font-semibold'
                : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
            }`}
          >
            <Icon className={`w-3 h-3 ${isSelected ? 'text-[#6d8434]' : 'text-[var(--ink-soft)]'}`} />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default AnswerModeSelector;

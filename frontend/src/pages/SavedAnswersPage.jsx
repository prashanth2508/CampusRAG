import React from 'react';
import { BookMarked, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SavedAnswersPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-16 space-y-6 animate-fade-in text-[var(--ink)]">
      <div className="space-y-1">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)]">
          Saved Revision Answers
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-soft)]">
          Bookmarked 10-mark explanations, viva voce Q&As, and textbook citations for fast exam revision.
        </p>
      </div>

      <div className="courseit-card p-12 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-[var(--lime-soft)] text-[#6d8434] flex items-center justify-center">
          <BookMarked className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-[var(--ink)]">
            No Bookmarked Answers Yet
          </h2>
          <p className="text-xs text-[var(--ink-soft)] max-w-sm mx-auto">
            When reviewing responses in AI Chat or Study Room, bookmark high-yield exam answers here for quick reference before finals.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-2">
          <Link
            to="/chat"
            className="btn-moss px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open AI Assistant</span>
          </Link>
          <Link
            to="/study-room"
            className="btn-pill-outline px-4 py-2.5 text-xs font-medium inline-flex items-center gap-1.5"
          >
            <span>Visit Study Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SavedAnswersPage;

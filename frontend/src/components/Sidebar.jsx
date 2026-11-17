import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  BookMarked, 
  FolderTree, 
  LayoutDashboard, 
  FilePlus, 
  Layers,
  Sparkles,
  Search,
  BookOpen,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ 
  chats = [], 
  activeChatId, 
  onNewChat, 
  onDeleteChat, 
  onClearChats,
  isOpen = false,
  onClose
}) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleChatSelect = (id) => {
    navigate(`/chat/${id}`);
    if (onClose) onClose();
  };

  const handleNew = () => {
    onNewChat();
    if (onClose) onClose();
  };

  const content = (
    <>
      {/* Top Header / Action Bar */}
      <div className="p-3.5 border-b border-[var(--line)] flex items-center justify-between gap-2">
        <button
          onClick={handleNew}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 btn-moss text-xs font-semibold shadow-sm cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Conversation</span>
        </button>

        {/* Mobile close button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--muted)] cursor-pointer"
            title="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Navigation & Recent Chats */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3.5 space-y-5">
        
        {/* Navigation Group */}
        <div>
          <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-[var(--ink-soft)] font-bold">
            {isAdmin ? 'Admin Workspace' : 'Academic Hub'}
          </span>
          <nav className="mt-1.5 space-y-0.5">
            {isAdmin ? (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => onClose && onClose()}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--muted)] rounded-xl transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
                  <span>Overview</span>
                </Link>
                <Link
                  to="/admin/documents"
                  onClick={() => onClose && onClose()}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--muted)] rounded-xl transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
                  <span>Documents</span>
                </Link>
                <Link
                  to="/admin/upload"
                  onClick={() => onClose && onClose()}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--muted)] rounded-xl transition-colors"
                >
                  <FilePlus className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
                  <span>Upload PDF</span>
                </Link>
                <Link
                  to="/admin/academic"
                  onClick={() => onClose && onClose()}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--muted)] rounded-xl transition-colors"
                >
                  <FolderTree className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
                  <span>Structure</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  onClick={() => onClose && onClose()}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--muted)] rounded-xl transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#6d8434]" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/chat"
                  onClick={() => onClose && onClose()}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--muted)] rounded-xl transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#6d8434]" />
                  <span>AI Assistant</span>
                </Link>
                <Link
                  to="/search"
                  onClick={() => onClose && onClose()}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--muted)] rounded-xl transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
                  <span>Repository</span>
                </Link>
                <Link
                  to="/saved-answers"
                  onClick={() => onClose && onClose()}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--muted)] rounded-xl transition-colors"
                >
                  <BookMarked className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
                  <span>Saved 10-Mark Answers</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Recent Conversations List */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-soft)] font-bold">
              Recent Threads
            </span>
            {chats.length > 0 && onClearChats && (
              <button
                onClick={onClearChats}
                title="Clear all conversations"
                className="text-[10px] text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-0.5">
            {chats.length === 0 ? (
              <div className="px-2.5 py-4 text-center">
                <p className="text-[11px] text-[var(--ink-soft)]">No active chats</p>
                <p className="text-[10px] text-[var(--ink-soft)] mt-0.5">Start a new query above</p>
              </div>
            ) : (
              chats.map((c) => {
                const isActive = c.id === activeChatId;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleChatSelect(c.id)}
                    className={`group relative flex items-center justify-between px-2.5 py-2 text-xs rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[var(--lime-soft)] text-[var(--pill-ink)] font-semibold'
                        : 'text-[var(--ink)] hover:bg-[var(--muted)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-6">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#6d8434]' : 'text-[var(--ink-soft)]'}`} />
                      <span className="truncate">{c.title || 'Untitled Session'}</span>
                    </div>

                    {onDeleteChat && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(c.id);
                        }}
                        title="Delete chat"
                        className="opacity-0 group-hover:opacity-100 p-1 text-[var(--ink-soft)] hover:text-rose-500 transition-all rounded cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[var(--line)] text-center text-[10px] font-mono text-[var(--ink-soft)]">
        CampusRAG Engine v1.0
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 h-full bg-[var(--sidebar)] border-r border-[var(--line)] flex-col select-none shrink-0">
        {content}
      </aside>

      {/* Mobile Off-Canvas Drawer */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[var(--sidebar)] border-r border-[var(--line)] flex flex-col select-none shadow-2xl md:hidden animate-fade-in">
            {content}
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;

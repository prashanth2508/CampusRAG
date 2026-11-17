import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  RotateCcw, 
  FileText, 
  Sparkles, 
  CornerDownLeft,
  Download,
  ZoomIn,
  PanelLeft,
  Menu
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AcademicSelector from '../components/AcademicSelector';
import AnswerModeSelector from '../components/AnswerModeSelector';
import SourceCard from '../components/SourceCard';
import PDFViewerModal from '../components/PDFViewerModal';
import ImageLightboxModal from '../components/ImageLightboxModal';
import ConfirmModal from '../components/ConfirmModal';
import { chatAPI, ragAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ChatPage = () => {
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  // Context filters
  const [department, setDepartment] = useState('CSE');
  const [semester, setSemester] = useState('5');
  const [subject, setSubject] = useState('Database Management System');
  const [module, setModule] = useState('Module 3');
  const [mode, setMode] = useState('detailed');

  // Copy & PDF Modal state
  const [copiedId, setCopiedId] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Diagram Lightbox Viewer state
  const [lightboxData, setLightboxData] = useState({
    isOpen: false,
    src: '',
    alt: '',
    pageNum: 1,
    docId: null
  });

  // Mobile Drawer Sidebar State
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadChatList();
  }, []);

  const loadChatList = async () => {
    try {
      const res = await chatAPI.getChats();
      setChats(res.data);
    } catch (err) {
      console.error("Failed to load chat list:", err);
    }
  };

  useEffect(() => {
    if (chatId) {
      loadChatDetails(chatId);
    } else {
      setActiveChat(null);
      setMessages([]);
    }

    if (location.state?.initialQuestion) {
      const initQ = location.state.initialQuestion;
      const initDept = location.state.department || 'CSE';
      const initSem = location.state.semester || '5';
      const initSubj = location.state.subject || 'Database Management System';
      const initMod = location.state.module || 'Module 3';
      const initMode = location.state.mode || 'detailed';

      setDepartment(initDept);
      setSemester(initSem);
      setSubject(initSubj);
      setModule(initMod);
      setMode(initMode);

      handleSendQuery(initQ, chatId, initDept, initSem, initSubj, initMod, initMode);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const loadChatDetails = async (id) => {
    try {
      const res = await chatAPI.getChat(id);
      setActiveChat(res.data);
      setMessages(res.data.messages || []);
      if (res.data.department) setDepartment(res.data.department);
      if (res.data.semester) setSemester(res.data.semester);
      if (res.data.subject) setSubject(res.data.subject);
      if (res.data.module) setModule(res.data.module);
    } catch (err) {
      console.error("Failed to load chat details:", err);
    }
  };

  const handleNewChat = async () => {
    try {
      const res = await chatAPI.createChat({
        title: `New ${subject} Chat`,
        department,
        semester,
        subject,
        module
      });
      loadChatList();
      navigate(`/chat/${res.data.id}`);
    } catch (err) {
      console.error("Failed to create new chat:", err);
    }
  };

  const handleDeleteChat = async (id) => {
    try {
      await chatAPI.deleteChat(id);
      if (chatId === id) {
        navigate('/chat');
      }
      loadChatList();
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  const handleClearAllChats = async () => {
    try {
      await chatAPI.clearChats();
      setChats([]);
      setMessages([]);
      navigate('/chat');
    } catch (err) {
      console.error("Failed to clear chats:", err);
    }
  };

  const handleSendQuery = async (
    qText = null,
    targetChatId = null,
    customDept = null,
    customSem = null,
    customSubj = null,
    customMod = null,
    customMode = null
  ) => {
    const textToSend = qText || inputQuestion;
    if (!textToSend.trim() || loading) return;

    const currentChatId = targetChatId || chatId;
    const deptToUse = customDept || department;
    const semToUse = customSem || semester;
    const subjToUse = customSubj || subject;
    const modToUse = customMod || module;
    const modeToUse = customMode || mode;

    setInputQuestion('');

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const savedGeminiKey = localStorage.getItem('campusrag_gemini_key');
      const res = await ragAPI.query({
        question: textToSend,
        department: deptToUse,
        semester: semToUse,
        subject: subjToUse,
        module: modToUse,
        mode: modeToUse,
        chatId: currentChatId,
        geminiApiKey: savedGeminiKey || undefined
      });

      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: res.data.answer,
        sources: res.data.sources || [],
        mode: res.data.mode,
        createdAt: new Date().toISOString()
      };

      setMessages((prev) => [...prev, botMsg]);
      if (!currentChatId && res.data.chatId) {
        navigate(`/chat/${res.data.chatId}`, { replace: true });
      }
      loadChatList();
    } catch (err) {
      console.error("RAG Query Failed:", err);
      const errorMsg = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        content: "I couldn't find sufficient information about this topic in the college knowledge base.",
        sources: [],
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerate = () => {
    if (messages.length < 2) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      handleSendQuery(lastUserMsg.content);
    }
  };

  const openViewPDF = (source) => {
    setSelectedSource(source);
    setPdfModalOpen(true);
  };

  const handleDownloadDiagram = async (e, src, alt, pageNum) => {
    e.stopPropagation();
    try {
      const cleanTitle = (alt || 'academic-diagram')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const filename = `${cleanTitle}-page-${pageNum || 1}.png`;

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
    } catch (err) {
      console.error('Failed to download diagram image:', err);
      window.open(`${src}?download=true`, '_blank');
    }
  };

  return (
    <div className="flex h-screen pt-16 sm:pt-20 bg-[var(--paper)] text-[var(--ink)] overflow-hidden select-text relative">
      
      {/* Minimalist Left Sidebar (Desktop Persistent + Mobile Drawer) */}
      <Sidebar
        chats={chats}
        activeChatId={chatId}
        onNewChat={handleNewChat}
        onDeleteChat={(id) => setConfirmDeleteId(id)}
        onClearChats={handleClearAllChats}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Chat Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        
        {/* Top Context Filter Strip - Responsive Header */}
        <div className="px-3 sm:px-6 py-2 sm:py-2.5 border-b border-[var(--line)] bg-[var(--surface)]/80 backdrop-blur-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 shrink-0">
          
          <div className="flex items-center gap-2 min-w-0 overflow-x-auto no-scrollbar">
            {/* Mobile Open Sidebar Button */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--surface)] text-[var(--ink)] shadow-[0_0_0_1px_var(--line)] hover:bg-[var(--muted)] cursor-pointer shrink-0"
              title="Open threads & chats"
            >
              <PanelLeft className="w-3.5 h-3.5 text-[#6d8434]" />
              <span>Threads</span>
              {chats.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[var(--lime-soft)] text-[var(--pill-ink)] text-[10px] font-bold flex items-center justify-center">
                  {chats.length}
                </span>
              )}
            </button>

            <AcademicSelector
              department={department}
              setDepartment={setDepartment}
              semester={semester}
              setSemester={setSemester}
              subject={subject}
              setSubject={setSubject}
              module={module}
              setModule={setModule}
              compact={true}
            />
          </div>

          <div className="overflow-x-auto no-scrollbar shrink-0">
            <AnswerModeSelector activeMode={mode} onChangeMode={setMode} />
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-4 py-16 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-[#101512] dark:bg-[#f1f3ea] text-[#fbfbf7] dark:text-[#0e1311] flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-[#b8c460] dark:text-[#576b27]" />
              </div>
              
              <div className="space-y-1.5">
                <h2 className="text-base font-semibold text-[var(--ink)]">
                  Academic Thread Ready
                </h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--muted)] text-[var(--ink-soft)] text-xs font-mono">
                  {department} • Sem {semester} • {subject}
                </div>
                <p className="text-xs text-[var(--ink-soft)] max-w-xs mx-auto pt-2">
                  Ask any question from official college notes. Answers are generated instantly and grounded in your syllabus.
                </p>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 max-w-3xl mx-auto ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Assistant Monogram */}
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-1 shadow-2xs">
                    CR
                  </div>
                )}

                <div className={`space-y-2.5 max-w-[94%] sm:max-w-[88%] ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  
                  {/* Bubble */}
                  <div
                    className={`rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-4 py-2.5 shadow-2xs'
                        : 'bg-white dark:bg-[#0f131c] text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-white/[0.07] p-4 sm:p-5 shadow-2xs'
                    }`}
                  >
                    {m.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    ) : (
                      <div className="prose-minimal text-xs sm:text-sm space-y-2 text-[var(--ink)]">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <div className="mb-2.5 leading-relaxed">{children}</div>,
                            img: ({ src, alt }) => {
                              // Extract docId and pageNum from src if present
                              const match = src?.match(/\/documents\/([^\/]+)\/diagram\/(\d+)/);
                              const docId = match ? match[1] : null;
                              const pageNum = match ? parseInt(match[2], 10) : 1;

                              return (
                                <div className="my-3.5 rounded-2xl courseit-card border border-[var(--line-strong)] overflow-hidden shadow-sm">
                                  {/* Header bar */}
                                  <div className="flex items-center justify-between px-3.5 py-2.5 bg-[var(--muted)]/40 border-b border-[var(--line)] text-[11px] font-mono">
                                    <span className="flex items-center gap-1.5 font-semibold text-[var(--ink)] truncate max-w-[50%]">
                                      <span className="w-2 h-2 rounded-full bg-[#6d8434] animate-pulse shrink-0" />
                                      {alt || 'Academic Diagram'}
                                    </span>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="text-[10px] uppercase font-bold text-[#6d8434] dark:text-[#b8c460] bg-[var(--lime-soft)] px-2 py-0.5 rounded-full">
                                        Page {pageNum}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => handleDownloadDiagram(e, src, alt, pageNum)}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)] hover:border-[#6d8434] hover:text-[#6d8434] transition-colors shadow-2xs cursor-pointer"
                                        title="Save diagram image"
                                      >
                                        <Download className="w-3 h-3 text-[#6d8434]" />
                                        <span>Save Image</span>
                                      </button>
                                      {docId && (
                                        <button
                                          type="button"
                                          onClick={() => openViewPDF({ documentId: docId, documentName: alt || 'Official Notes', page: pageNum })}
                                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-lg text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                                          title="View in full PDF"
                                        >
                                          <FileText className="w-3 h-3" />
                                          <span className="hidden sm:inline">PDF</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  {/* Clickable Image Viewer Area: views directly inside website modal */}
                                  <div 
                                    onClick={() => {
                                      setLightboxData({
                                        isOpen: true,
                                        src,
                                        alt: alt || 'Academic Diagram',
                                        pageNum,
                                        docId
                                      });
                                    }}
                                    className="p-3 bg-white/70 dark:bg-black/40 flex flex-col items-center justify-center cursor-zoom-in group relative select-none"
                                    title="Click to view diagram directly in website viewer"
                                  >
                                    <img
                                      src={src}
                                      alt={alt || 'Official Diagram'}
                                      className="max-h-80 w-auto object-contain rounded-lg transition-transform duration-200 group-hover:scale-[1.01]"
                                      loading="lazy"
                                    />
                                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-xs text-white text-[11px] font-medium flex items-center gap-1.5 opacity-90 group-hover:opacity-100 shadow-md transition-opacity">
                                      <ZoomIn className="w-3.5 h-3.5 text-[#b8c460]" />
                                      <span>Click to View in Full Size</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            },
                            pre: ({ children }) => (
                              <pre className="p-4 my-3 rounded-2xl bg-[#0e1411] dark:bg-[#070b09] text-[#e3ecd2] font-mono text-xs overflow-x-auto border border-[#6d8434]/30 leading-relaxed shadow-inner">
                                {children}
                              </pre>
                            )
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {/* Action Bar */}
                  {m.role === 'assistant' && (
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                      <button
                        onClick={() => handleCopy(m.content, m.id)}
                        className="flex items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleRegenerate}
                        className="flex items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Regenerate</span>
                      </button>
                    </div>
                  )}

                </div>

                {/* User Avatar */}
                {m.role === 'user' && (
                  <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-white/[0.08] text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-semibold shrink-0 mt-1">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-3 max-w-3xl mx-auto animate-fade-in">
              <div className="w-6 h-6 rounded-md bg-[#101512] dark:bg-[#f1f3ea] text-[#fbfbf7] dark:text-[#0e1311] flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-1 shadow-xs">
                CR
              </div>
              <div className="px-4 py-2.5 rounded-full courseit-card flex items-center gap-2 shadow-sm border border-[var(--line)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6d8434] dark:bg-[#b8c460] animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#6d8434] dark:bg-[#b8c460] animate-pulse [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#6d8434] dark:bg-[#b8c460] animate-pulse [animation-delay:0.4s]" />
                <span className="text-xs text-[var(--ink-soft)] font-medium ml-1">
                  Synthesizing answer from syllabus notes...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating CourseIt Input Bar */}
        <div className="p-2.5 sm:p-4 border-t border-[var(--line)] bg-[var(--surface)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="max-w-3xl mx-auto flex items-center courseit-card p-1.5 shadow-[0_0_0_1px_var(--line)]"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder={`Ask anything from ${subject} (${module})...`}
              disabled={loading}
              className="flex-1 bg-transparent text-xs sm:text-sm text-[var(--ink)] placeholder-[var(--ink-soft)] outline-none py-1.5 pl-3"
            />
            <button
              type="submit"
              disabled={loading || !inputQuestion.trim()}
              className="btn-moss w-8 h-8 rounded-full flex items-center justify-center shrink-0 disabled:opacity-40 shadow-sm cursor-pointer mr-1"
              title="Send"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>

      {/* PDF View Modal */}
      <PDFViewerModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        source={selectedSource}
      />

      {/* Image Lightbox Modal for Diagram Viewing */}
      <ImageLightboxModal
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData(prev => ({ ...prev, isOpen: false }))}
        src={lightboxData.src}
        alt={lightboxData.alt}
        pageNum={lightboxData.pageNum}
        docId={lightboxData.docId}
        onOpenPDF={(data) => openViewPDF(data)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => handleDeleteChat(confirmDeleteId)}
        title="Delete Thread"
        message="Are you sure you want to delete this conversation thread?"
      />

    </div>
  );
};

export default ChatPage;

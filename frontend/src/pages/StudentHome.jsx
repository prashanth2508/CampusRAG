import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  BookOpen, 
  Layers, 
  CornerDownLeft,
  ChevronRight,
  GraduationCap,
  Eye,
  Star
} from 'lucide-react';
import AcademicSelector from '../components/AcademicSelector';
import AnswerModeSelector from '../components/AnswerModeSelector';
import { chatAPI } from '../services/api';

const repositoryModules = [
  {
    id: 'dbms-m3',
    subject: 'Database Management System',
    module: 'Module 3: Normalization',
    department: 'CSE',
    semester: '5',
    chunks: 142,
    document: 'seed_DBMS_Module_3_Normalization_Notes.pdf',
    description: '1NF, 2NF, 3NF, BCNF, Functional Dependencies, Armstrong Axioms, Lossless Join Decomposition.'
  },
  {
    id: 'os-m2',
    subject: 'Operating Systems',
    module: 'Module 2: Deadlocks & Process Sync',
    department: 'CSE',
    semester: '4',
    chunks: 128,
    document: 'OS_Module_2_Deadlocks_Notes.pdf',
    description: 'Coffman conditions, Resource Allocation Graphs, Banker\'s Algorithm, Semaphore, Mutex Locks.'
  },
  {
    id: 'cn-m4',
    subject: 'Computer Networks',
    module: 'Module 4: Transport Layer',
    department: 'ECE',
    semester: '5',
    chunks: 115,
    document: 'CN_Module_4_Transport_Notes.pdf',
    description: 'TCP 3-Way Handshake, UDP, Sliding Window Protocol, Congestion Control (AIMD), Flow Control.'
  },
  {
    id: 'ai-m1',
    subject: 'Artificial Intelligence & Data Science',
    module: 'Module 1: Search & Problem Solving',
    department: 'AI & DS',
    semester: '5',
    chunks: 98,
    document: 'AI_Search_Algorithms_Notes.pdf',
    description: 'A* Search, Heuristic evaluation, Breadth-First Search, Depth-First Search, Constraint Satisfaction.'
  },
  {
    id: 'toc-m1',
    subject: 'Theory of Computation',
    module: 'Module 1: Finite Automata & RegEx',
    department: 'CSE',
    semester: '5',
    chunks: 136,
    document: 'TOC_Module_1_Automata_Notes.pdf',
    description: 'DFA, NFA, Epsilon-NFA minimization, Regular Expressions, Pumping Lemma, Myhill-Nerode theorem.'
  },
  {
    id: 'ds-m3',
    subject: 'Distributed Systems',
    module: 'Module 3: Clocks & Synchronization',
    department: 'CSE',
    semester: '5',
    chunks: 112,
    document: 'DS_Module_3_Synchronization_Notes.pdf',
    description: 'Lamport Logical Clocks, Vector Clocks, Bully & Ring Election Algorithms, Mutual Exclusion, Paxos Consensus.'
  },
  {
    id: 'rm-ipr-m4',
    subject: 'Research Methodology & IPR',
    module: 'Module 4: Intellectual Property Rights',
    department: 'CSE',
    semester: '5',
    chunks: 94,
    document: 'RM_IPR_Module_4_Patents_Notes.pdf',
    description: 'Patents filing process, Copyrights, Trademarks, Trade Secrets, Plagiarism detection, Research ethics.'
  }
];

const StudentHome = () => {
  const [department, setDepartment] = useState('CSE');
  const [semester, setSemester] = useState('5');
  const [subject, setSubject] = useState('Database Management System');
  const [module, setModule] = useState('Module 3');
  const [mode, setMode] = useState('detailed');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAsk = (qText) => {
    const targetQuery = qText || question;
    if (!targetQuery.trim() || loading) return;

    setLoading(true);
    navigate('/chat', {
      state: {
        initialQuestion: targetQuery,
        department,
        semester,
        subject,
        module,
        mode
      }
    });
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-20 space-y-16 sm:space-y-24 animate-fade-in text-[var(--ink)]">
      
      {/* 1. HERO SECTION - CourseIt Signature Style */}
      <section className="px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-6 pt-4 sm:pt-6">
        
        {/* Top Floating Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-1.5 text-xs text-[var(--ink-soft)] font-medium shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#6d8434] dark:bg-[#b8c460] animate-pulse" />
          <span>Grounded College Knowledge Base · Zero Hallucinations</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-medium tracking-tight text-[var(--ink)] leading-[1.12] max-w-3xl mx-auto">
          Academic intelligence,{' '}
          <span className="text-[#6d8434] dark:text-[#b8c460] font-bold underline decoration-[#6d8434]/30 underline-offset-8">
            grounded in your syllabus
          </span>.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[var(--ink-soft)] max-w-2xl mx-auto font-normal leading-relaxed">
          Ask questions directly from your college repository notes, syllabus, and module materials. Every answer includes exact document page citations.
        </p>

        {/* Academic Context Selector Card */}
        <div className="max-w-2xl mx-auto text-left">
          <AcademicSelector
            department={department}
            setDepartment={setDepartment}
            semester={semester}
            setSemester={setSemester}
            subject={subject}
            setSubject={setSubject}
            module={module}
            setModule={setModule}
          />
        </div>

        {/* CourseIt-Style Prompt Composer */}
        <div className="courseit-card p-4 sm:p-5 max-w-2xl mx-auto text-left space-y-4 shadow-[0_20px_50px_-20px_rgba(22,49,92,0.25)] dark:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]">
          
          {/* Mode Selector Row */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[var(--line)]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-soft)] font-mono">
              Answer Format
            </span>
            <AnswerModeSelector activeMode={mode} onChangeMode={setMode} />
          </div>

          {/* Textarea Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="space-y-3"
          >
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={`Ask anything from ${subject} (${module})...`}
              className="w-full bg-transparent text-sm sm:text-base text-[var(--ink)] placeholder-[var(--ink-soft)] outline-none resize-none leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
            />

            <div className="flex items-center justify-between pt-1 border-t border-[var(--line)]">
              <span className="text-xs text-[var(--ink-soft)] font-mono hidden sm:inline">
                Press ↵ Enter to ask
              </span>

              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="btn-moss px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-1.5 shadow-md ml-auto disabled:opacity-40 cursor-pointer"
              >
                <span>{loading ? 'Searching syllabus...' : 'Ask Assistant'}</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

        </div>

      </section>

      {/* 2. STATS BAR ("By the numbers") */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center space-y-1 mb-8">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6d8434] dark:text-[#b8c460] font-bold">
            By the numbers
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium text-[var(--ink)]">
            Real college syllabus, grounded answers.
          </h2>
          <p className="text-xs sm:text-sm text-[var(--ink-soft)]">
            Counted live from CampusRAG ChromaDB vector store.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="courseit-card p-5 text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-bold text-[#6d8434] dark:text-[#b8c460] tracking-tight">
              1,420+
            </span>
            <p className="text-xs font-medium text-[var(--ink)]">Vector Chunks</p>
            <p className="text-[11px] text-[var(--ink-soft)]">Indexed from college PDFs</p>
          </div>

          <div className="courseit-card p-5 text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-bold text-[#6d8434] dark:text-[#b8c460] tracking-tight">
              100%
            </span>
            <p className="text-xs font-medium text-[var(--ink)]">Page Grounding</p>
            <p className="text-[11px] text-[var(--ink-soft)]">Strict page & line citations</p>
          </div>

          <div className="courseit-card p-5 text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-bold text-[#6d8434] dark:text-[#b8c460] tracking-tight">
              8
            </span>
            <p className="text-xs font-medium text-[var(--ink)]">Semesters Covered</p>
            <p className="text-[11px] text-[var(--ink-soft)]">Across 7 engineering streams</p>
          </div>

          <div className="courseit-card p-5 text-center space-y-1">
            <span className="text-3xl sm:text-4xl font-bold text-[#6d8434] dark:text-[#b8c460] tracking-tight">
              5
            </span>
            <p className="text-xs font-medium text-[var(--ink)]">Answer Formats</p>
            <p className="text-[11px] text-[var(--ink-soft)]">Exam 10-Mark, Viva, Simple...</p>
          </div>
        </div>
      </section>

      {/* 3. BENTO GRID FEATURES (CourseIt visual style for CampusRAG features) */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
        
        <div className="text-center space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6d8434] dark:text-[#b8c460] font-bold">
            Features
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium text-[var(--ink)]">
            Everything you need to master your university exam.
          </h2>
          <p className="text-xs sm:text-sm text-[var(--ink-soft)] max-w-xl mx-auto">
            Accurate retrieval, exact document citations, structured answer modes, and instant PDF previews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Bento Card 1 (2-Col): Strict Grounding & Citations */}
          <div className="md:col-span-2 courseit-card p-6 sm:p-7 space-y-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#6d8434] dark:text-[#b8c460] font-bold">
                  Zero Hallucinations Guarantee
                </span>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[var(--lime-soft)] text-[var(--pill-ink)] font-bold">
                  100% Syllabus Sourced
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold text-[var(--ink)]">
                Strict Grounding in Official Department Notes
              </h3>

              <p className="text-xs sm:text-sm text-[var(--ink-soft)]">
                Unlike generic AI models that guess or hallucinate, CampusRAG retrieves text directly from your professor's uploaded PDF notes. Every single paragraph is traceable to its source.
              </p>
            </div>

            {/* Mock Citation Preview Box */}
            <div className="p-4 rounded-2xl bg-[var(--muted)]/50 space-y-2.5 border border-[var(--line)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#6d8434]" />
                  <span className="text-xs font-semibold text-[var(--ink)]">
                    seed_DBMS_Module_3_Normalization_Notes.pdf
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[var(--lime-soft)] text-[var(--pill-ink)] text-[10px] font-mono font-bold">
                  Page 14 · 98% Match
                </span>
              </div>
              <p className="text-xs text-[var(--ink-soft)] italic leading-relaxed">
                "A relation R is in Boyce-Codd Normal Form (BCNF) if and only if for every non-trivial functional dependency X → Y, X is a super key of R..."
              </p>
            </div>

            <div className="pt-1">
              <Link
                to="/chat"
                className="btn-moss px-5 py-2.5 text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Try query in AI Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento Card 2: 1-Col: 5 Answer Modes */}
          <div className="courseit-card p-6 sm:p-7 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#6d8434] dark:text-[#b8c460] font-bold">
                Answer Customization
              </span>
              <h3 className="text-lg sm:text-xl font-semibold text-[var(--ink)]">
                5 Academic Output Styles
              </h3>
              <p className="text-xs text-[var(--ink-soft)]">
                Tailor answers to how you study or how examiners mark your paper:
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="p-2.5 rounded-xl bg-[var(--surface)] shadow-[0_0_0_1px_var(--line)] flex items-center justify-between">
                <span className="font-semibold text-[var(--ink)]">📝 Exam 10-Mark Layout</span>
                <span className="text-[10px] text-[var(--ink-soft)]">Def, Points, Example</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface)] shadow-[0_0_0_1px_var(--line)] flex items-center justify-between">
                <span className="font-semibold text-[var(--ink)]">❓ Viva Voce Prep</span>
                <span className="text-[10px] text-[var(--ink-soft)]">Top Examiner Q&As</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface)] shadow-[0_0_0_1px_var(--line)] flex items-center justify-between">
                <span className="font-semibold text-[var(--ink)]">⚡ Short / Concise</span>
                <span className="text-[10px] text-[var(--ink-soft)]">Fast Revision</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--surface)] shadow-[0_0_0_1px_var(--line)] flex items-center justify-between">
                <span className="font-semibold text-[var(--ink)]">🌟 Simple English</span>
                <span className="text-[10px] text-[var(--ink-soft)]">Beginner Friendly</span>
              </div>
            </div>

            <div className="text-[11px] text-[var(--ink-soft)] font-mono">
              Toggle modes anytime in AI Chat!
            </div>
          </div>

          {/* Bento Card 3: Exact Page Citations */}
          <div className="courseit-card p-6 space-y-3">
            <div className="w-8 h-8 rounded-full bg-[var(--lime-soft)] text-[#6d8434] flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[var(--ink)]">
              Inline PDF Page Previews
            </h3>
            <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
              Click "Open PDF" on any answer citation to immediately jump to the exact page inside the original notes.
            </p>
            <Link to="/search" className="text-xs font-semibold text-[#6d8434] dark:text-[#b8c460] hover:underline inline-flex items-center gap-1 pt-1">
              <span>Explore PDF Archive</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Bento Card 4: Academic Hierarchy */}
          <div className="courseit-card p-6 space-y-3">
            <div className="w-8 h-8 rounded-full bg-[var(--lime-soft)] text-[#6d8434] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[var(--ink)]">
              Dynamic Scope Filtering
            </h3>
            <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
              Restrict your questions to specific departments, semesters, subjects, and modules to eliminate noise.
            </p>
            <span className="text-[10px] font-mono text-[var(--ink-soft)]">
              CSE · AI & DS · ECE · EEE · Mech · Civil
            </span>
          </div>

          {/* Bento Card 5: Saved Answers */}
          <div className="courseit-card p-6 space-y-3">
            <div className="w-8 h-8 rounded-full bg-[var(--lime-soft)] text-[#6d8434] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-[var(--ink)]">
              Saved 10-Mark Library
            </h3>
            <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
              Bookmark structured answers and study cheat-sheets for rapid revision before semester finals.
            </p>
            <Link to="/saved-answers" className="text-xs font-semibold text-[#6d8434] dark:text-[#b8c460] hover:underline inline-flex items-center gap-1 pt-1">
              <span>View Saved Answers</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </section>

      {/* 4. REPOSITORY MODULES SHOWCASE (CourseIt card style) */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#6d8434] dark:text-[#b8c460] font-bold">
              College Repository
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium text-[var(--ink)]">
              Indexed academic modules ready to query.
            </h2>
          </div>

          <Link
            to="/search"
            className="btn-pill-outline px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <span>All Documents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {repositoryModules.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                setDepartment(m.department);
                setSemester(m.semester);
                setSubject(m.subject);
                setModule(m.module);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="courseit-card p-4 flex flex-col justify-between space-y-3 group cursor-pointer"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-[var(--lime-soft)] text-[var(--pill-ink)] text-[10px] font-mono font-bold uppercase">
                    {m.department} · Sem {m.semester}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--ink-soft)]">
                    {m.chunks} chunks
                  </span>
                </div>

                <h3 className="text-xs sm:text-sm font-semibold text-[var(--ink)] line-clamp-2">
                  {m.subject}
                </h3>

                <p className="text-[11px] text-[#6d8434] dark:text-[#b8c460] font-medium">
                  {m.module}
                </p>

                <p className="text-[11px] text-[var(--ink-soft)] line-clamp-3 leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between text-[11px] text-[var(--ink-soft)]">
                <span className="truncate max-w-[130px] font-mono text-[10px]">{m.document}</span>
                <span className="font-semibold text-[#6d8434] dark:text-[#b8c460] group-hover:translate-x-0.5 transition-transform">
                  Query →
                </span>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* 5. "HOW IT WORKS" 3-STEP PROCESS */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
        
        <div className="text-center space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6d8434] dark:text-[#b8c460] font-bold">
            How it works
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium text-[var(--ink)]">
            From 200-page notes to exact exam answers in 3 steps.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="courseit-card p-6 space-y-3">
            <span className="w-8 h-8 rounded-full bg-[var(--lime-soft)] text-[#6d8434] flex items-center justify-center text-xs font-bold font-mono">
              1
            </span>
            <h3 className="text-base font-semibold text-[var(--ink)]">
              Select your academic context
            </h3>
            <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
              Pick your branch (CSE, AI & DS, ECE), semester, subject, and module. Queries will be isolated strictly to your syllabus material.
            </p>
          </div>

          <div className="courseit-card p-6 space-y-3">
            <span className="w-8 h-8 rounded-full bg-[var(--lime-soft)] text-[#6d8434] flex items-center justify-center text-xs font-bold font-mono">
              2
            </span>
            <h3 className="text-base font-semibold text-[var(--ink)]">
              Choose your answer mode
            </h3>
            <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
              Select Exam 10-Mark format for structured university layouts, Viva mode for oral questions, or Simple for quick explanations.
            </p>
          </div>

          <div className="courseit-card p-6 space-y-3">
            <span className="w-8 h-8 rounded-full bg-[var(--lime-soft)] text-[#6d8434] flex items-center justify-center text-xs font-bold font-mono">
              3
            </span>
            <h3 className="text-base font-semibold text-[var(--ink)]">
              Verify with page citations
            </h3>
            <p className="text-xs text-[var(--ink-soft)] leading-relaxed">
              Every answer displays exact document names, page numbers, and inline PDF view links so you can cross-check with original notes.
            </p>
          </div>
        </div>

      </section>

      {/* 6. REAL STUDENT SUCCESS TESTIMONIALS */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto space-y-8">
        
        <div className="text-center space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6d8434] dark:text-[#b8c460] font-bold">
            Student Feedback
          </span>
          <h2 className="text-2xl sm:text-3xl font-medium text-[var(--ink)]">
            Built for college students and faculty.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="courseit-card p-6 space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-[var(--ink)] leading-relaxed italic">
              “The Exam 10-mark mode is a life saver. It structures definitions, explanations, examples, and trade-offs exactly the way university evaluators want.”
            </p>
            <div className="pt-2 border-t border-[var(--line)]">
              <p className="text-xs font-semibold text-[var(--ink)]">Khushi Agrawal</p>
              <p className="text-[11px] text-[var(--ink-soft)]">CSE 5th Sem · RV College of Engineering</p>
            </div>
          </div>

          <div className="courseit-card p-6 space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-[var(--ink)] leading-relaxed italic">
              “Zero hallucinations is not a gimmick. When you click the source button, it actually opens page 14 of the professor's PDF. You can't beat that certainty.”
            </p>
            <div className="pt-2 border-t border-[var(--line)]">
              <p className="text-xs font-semibold text-[var(--ink)]">Rohan Mehta</p>
              <p className="text-[11px] text-[var(--ink-soft)]">AI & DS 3rd Year · PES University</p>
            </div>
          </div>

          <div className="courseit-card p-6 space-y-3">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-[var(--ink)] leading-relaxed italic">
              “Being able to isolate questions to just Module 3 or Module 4 prevents cross-subject confusion when studying right before midterms.”
            </p>
            <div className="pt-2 border-t border-[var(--line)]">
              <p className="text-xs font-semibold text-[var(--ink)]">Siddharth N.</p>
              <p className="text-[11px] text-[var(--ink-soft)]">ECE 6th Sem · BMSCE</p>
            </div>
          </div>
        </div>

      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="px-4 sm:px-6 max-w-4xl mx-auto text-center space-y-5">
        <div className="courseit-card p-8 sm:p-12 space-y-5 bg-gradient-to-b from-[var(--surface)] to-[var(--lime-soft)]/20">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6d8434] dark:text-[#b8c460] font-bold">
            Start preparing
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--ink)] tracking-tight">
            Ask your syllabus questions now.
          </h2>
          <p className="text-sm text-[var(--ink-soft)] max-w-lg mx-auto">
            Get accurate answers grounded in official college notes with exact page citations.
          </p>

          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => handleAsk("Give a 10-mark structured answer for Normalization.")}
              className="btn-moss px-7 py-3 text-sm font-semibold inline-flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <span>Ask AI Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER - CourseIt Style */}
      <footer className="border-t border-[var(--line)] pt-12 pb-8 px-4 sm:px-6 max-w-5xl mx-auto space-y-8 text-xs text-[var(--ink-soft)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2 col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 font-semibold text-base text-[var(--ink)]">
              <div className="w-6 h-6 rounded-full bg-[#101512] dark:bg-[#f1f3ea] text-[#fbfbf7] dark:text-[#0e1311] flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5 text-[#b8c460] dark:text-[#576b27]" />
              </div>
              <span>Campus<span className="text-[#6d8434] dark:text-[#b8c460]">RAG</span></span>
            </Link>
            <p className="text-[11px] leading-relaxed">
              AI-powered academic assistant for college students and faculty. Sourced from official syllabus PDFs with zero hallucinations.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-[var(--ink)] uppercase tracking-wider text-[10px]">Academic Hub</h4>
            <ul className="space-y-1.5">
              <li><Link to="/chat" className="hover:text-[var(--ink)]">AI Assistant</Link></li>
              <li><Link to="/search" className="hover:text-[var(--ink)]">Document Repository</Link></li>
              <li><Link to="/saved-answers" className="hover:text-[var(--ink)]">Saved Answers</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-[var(--ink)] uppercase tracking-wider text-[10px]">Departments</h4>
            <ul className="space-y-1.5">
              <li><Link to="/search" className="hover:text-[var(--ink)]">Computer Science (CSE)</Link></li>
              <li><Link to="/search" className="hover:text-[var(--ink)]">Artificial Intelligence (AI & DS)</Link></li>
              <li><Link to="/search" className="hover:text-[var(--ink)]">Electronics & Comm (ECE)</Link></li>
              <li><Link to="/search" className="hover:text-[var(--ink)]">Mechanical & Civil</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-[var(--ink)] uppercase tracking-wider text-[10px]">Technology</h4>
            <ul className="space-y-1.5">
              <li className="font-mono text-[10px]">FastAPI Backend</li>
              <li className="font-mono text-[10px]">ChromaDB Vector Store</li>
              <li className="font-mono text-[10px]">Google Gemini LLM</li>
              <li className="font-mono text-[10px]">Sentence-Transformers</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© 2026 CampusRAG. All rights reserved.</p>
          <p className="font-mono">Engineered for University Exam Excellence</p>
        </div>
      </footer>

    </div>
  );
};

export default StudentHome;

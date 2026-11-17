import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X, 
  ChevronDown, 
  Files, 
  Search, 
  Trash2, 
  Loader2,
  Sparkles,
  Layers
} from 'lucide-react';
import { academicAPI, documentAPI } from '../services/api';

const DEFAULT_SUBJECTS = [
  { 
    name: 'Database Management System', 
    code: 'DBMS', 
    modules: ['Module 1: ER & Relational Model', 'Module 2: SQL & Relational Algebra', 'Module 3: Normalization & BCNF', 'Module 4: Transactions & Concurrency', 'Module 5: Indexing & Storage Engine'] 
  },
  { 
    name: 'Operating Systems', 
    code: 'OS', 
    modules: ['Module 1: OS Structures & Processes', 'Module 2: Threads & CPU Scheduling', 'Module 3: Synchronization & Deadlocks', 'Module 4: Memory Management & Paging', 'Module 5: File Systems & I/O Systems'] 
  },
  { 
    name: 'Computer Networks', 
    code: 'CN', 
    modules: ['Module 1: Physical Layer & Architectures', 'Module 2: Data Link Layer & MAC Protocols', 'Module 3: Network Layer & Routing Algorithms', 'Module 4: Transport Layer (TCP/UDP)', 'Module 5: Application Layer (DNS, HTTP)'] 
  },
  { 
    name: 'Software Engineering', 
    code: 'SE', 
    modules: ['Module 1: Software Development Life Cycle', 'Module 2: Requirement Analysis & SRS', 'Module 3: System Design & Architecture', 'Module 4: Software Testing & QA', 'Module 5: Agile Methodologies & DevOps'] 
  },
  { 
    name: 'Theory of Computation', 
    code: 'TOC', 
    modules: ['Module 1: Finite Automata (DFA/NFA)', 'Module 2: Regular Expressions & Languages', 'Module 3: Context-Free Grammars (CFG)', 'Module 4: Pushdown Automata (PDA)', 'Module 5: Turing Machines & Decidability'] 
  },
  { 
    name: 'Distributed Systems', 
    code: 'DS', 
    modules: ['Module 1: Characterization & System Models', 'Module 2: Interprocess Communication & RPC', 'Module 3: Synchronization, Clocks & Election', 'Module 4: Replication & Consistency', 'Module 5: Fault Tolerance & Distributed Files'] 
  },
  { 
    name: 'Research Methodology & IPR', 
    code: 'RM_IPR', 
    modules: ['Module 1: Research Problem Formulation', 'Module 2: Research Design & Literature Review', 'Module 3: Data Analysis & Statistical Testing', 'Module 4: Intellectual Property Rights (IPR)', 'Module 5: Patents, Copyrights & Ethics'] 
  },
  {
    name: 'Data Structures & Algorithms',
    code: 'DSA',
    modules: ['Module 1: Arrays, Stacks & Queues', 'Module 2: Trees & Binary Search Trees', 'Module 3: Graphs & Shortest Paths', 'Module 4: Sorting & Searching', 'Module 5: Dynamic Programming']
  },
  {
    name: 'Design & Analysis of Algorithms',
    code: 'DAA',
    modules: ['Module 1: Asymptotic Analysis & Recurrences', 'Module 2: Divide & Conquer', 'Module 3: Greedy Algorithms', 'Module 4: Dynamic Programming & Graphs', 'Module 5: NP-Completeness']
  },
  {
    name: 'Artificial Intelligence & Machine Learning',
    code: 'AIML',
    modules: ['Module 1: Search Algorithms & Agents', 'Module 2: Supervised Learning & Regression', 'Module 3: Classification & Decision Trees', 'Module 4: Neural Networks & Deep Learning', 'Module 5: Evaluation & Optimization']
  }
];

const UploadDocument = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [semester, setSemester] = useState('5');
  const [subject, setSubject] = useState('Database Management System');
  const [customSubject, setCustomSubject] = useState('');
  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [module, setModule] = useState('Module 1');
  const [documentType, setDocumentType] = useState('Notes');
  const [academicYear, setAcademicYear] = useState('2025-2026');
  const [description, setDescription] = useState('');

  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [modulesList, setModulesList] = useState(DEFAULT_SUBJECTS[0].modules);

  // Search filter inside selected files when 100+ files are uploaded
  const [fileFilter, setFileFilter] = useState('');

  // Uploading state
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(null); // { current, total, name, percent, successCount, duplicateCount, failCount }
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Load departments
  useEffect(() => {
    const loadDepts = async () => {
      try {
        const res = await academicAPI.getDepartments();
        if (res.data && res.data.length > 0) {
          setDepartments(res.data);
        } else {
          setDepartments([
            { code: 'CSE', name: 'Computer Science & Engineering' },
            { code: 'AI & DS', name: 'Artificial Intelligence & Data Science' },
            { code: 'CSBS', name: 'Computer Science & Business Systems' },
            { code: 'ECE', name: 'Electronics & Communication' },
            { code: 'EEE', name: 'Electrical & Electronics' },
            { code: 'Mechanical', name: 'Mechanical Engineering' },
            { code: 'Civil', name: 'Civil Engineering' }
          ]);
        }
      } catch (err) {
        console.error("Failed to load departments:", err);
        setDepartments([
          { code: 'CSE', name: 'Computer Science & Engineering' },
          { code: 'AI & DS', name: 'Artificial Intelligence & Data Science' },
          { code: 'CSBS', name: 'Computer Science & Business Systems' },
          { code: 'ECE', name: 'Electronics & Communication' },
          { code: 'EEE', name: 'Electrical & Electronics' },
          { code: 'Mechanical', name: 'Mechanical Engineering' },
          { code: 'Civil', name: 'Civil Engineering' }
        ]);
      }
    };
    loadDepts();
  }, []);

  // Load subjects dynamically or fallback
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const res = await academicAPI.getSubjects(department, semester);
        if (res.data && res.data.length > 0) {
          // Merge unique with default subjects
          const merged = [...res.data];
          DEFAULT_SUBJECTS.forEach((def) => {
            if (!merged.some(m => m.name.toLowerCase() === def.name.toLowerCase() || m.code === def.code)) {
              merged.push(def);
            }
          });
          setSubjects(merged);
          
          if (!isCustomSubject) {
            const foundCurrent = merged.find(s => s.name === subject);
            if (foundCurrent) {
              setModulesList(foundCurrent.modules || ['Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5']);
            } else {
              setSubject(merged[0].name);
              setModulesList(merged[0].modules || ['Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5']);
              setModule(merged[0].modules?.[0] || 'Module 1');
            }
          }
        } else {
          setSubjects(DEFAULT_SUBJECTS);
          if (!isCustomSubject) {
            const foundCurrent = DEFAULT_SUBJECTS.find(s => s.name === subject);
            if (foundCurrent) {
              setModulesList(foundCurrent.modules);
            } else {
              setSubject(DEFAULT_SUBJECTS[0].name);
              setModulesList(DEFAULT_SUBJECTS[0].modules);
              setModule(DEFAULT_SUBJECTS[0].modules[0]);
            }
          }
        }
      } catch (err) {
        console.warn("Using offline subjects catalog:", err);
        setSubjects(DEFAULT_SUBJECTS);
      }
    };
    loadSubjects();
  }, [department, semester]);

  const handleSubjectChange = (val) => {
    if (val === '__CUSTOM__') {
      setIsCustomSubject(true);
      setSubject('');
      setModulesList(['Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5']);
      setModule('Module 1');
    } else {
      setIsCustomSubject(false);
      setSubject(val);
      const found = subjects.find(s => s.name === val);
      if (found && found.modules) {
        setModulesList(found.modules);
        setModule(found.modules[0] || 'Module 1');
      } else {
        setModulesList(['Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5']);
        setModule('Module 1');
      }
    }
  };

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const validPdfs = [];
    let invalidFound = false;

    selectedFiles.forEach((f) => {
      if (f.name.toLowerCase().endsWith('.pdf')) {
        validPdfs.push(f);
      } else {
        invalidFound = true;
      }
    });

    if (invalidFound) {
      setError("Only PDF documents (.pdf) are supported. Non-PDF files were omitted.");
    } else {
      setError(null);
    }

    if (validPdfs.length > 0) {
      setFiles((prev) => {
        const combined = [...prev, ...validPdfs];
        // Deduplicate by name and size
        const unique = [];
        const seen = new Set();
        combined.forEach((item) => {
          const key = `${item.name}-${item.size}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(item);
          }
        });
        return unique;
      });

      if (validPdfs.length === 1 && !name) {
        const cleanTitle = validPdfs[0].name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
        setName(cleanTitle);
      }
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setFiles([]);
    setName('');
  };

  // Filtered files for search
  const filteredFiles = useMemo(() => {
    if (!fileFilter.trim()) return files;
    const q = fileFilter.toLowerCase();
    return files.filter(f => f.name.toLowerCase().includes(q));
  }, [files, fileFilter]);

  // High-performance batch upload with concurrency pool
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length) {
      setError("Please select at least one PDF document to upload.");
      return;
    }

    const effectiveSubject = isCustomSubject ? customSubject.trim() : subject;
    if (!effectiveSubject) {
      setError("Please specify a Subject name for the documents.");
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    let completed = 0;
    let successCount = 0;
    let duplicateCount = 0;
    let failCount = 0;
    const errors = [];

    const total = files.length;
    const CONCURRENCY = 4; // 4 concurrent uploads for optimal throughput
    let currentIndex = 0;

    const uploadWorker = async () => {
      while (currentIndex < files.length) {
        const idx = currentIndex++;
        const currentFile = files[idx];
        const docTitle = files.length === 1 && name.trim()
          ? name.trim()
          : currentFile.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");

        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('name', docTitle);
        formData.append('department', department);
        formData.append('semester', semester);
        formData.append('subject', effectiveSubject);
        formData.append('module', module);
        formData.append('documentType', documentType);
        formData.append('academicYear', academicYear);
        formData.append('description', description);

        try {
          await documentAPI.uploadDocument(formData);
          successCount++;
        } catch (err) {
          const detail = err.response?.data?.detail || err.message || "Upload error";
          if (detail.toLowerCase().includes("duplicate")) {
            duplicateCount++;
          } else {
            failCount++;
            errors.push(`${currentFile.name}: ${detail}`);
          }
        } finally {
          completed++;
          setProgress({
            current: completed,
            total,
            name: currentFile.name,
            percent: Math.round((completed / total) * 100),
            successCount,
            duplicateCount,
            failCount
          });
        }
      }
    };

    // Run workers in parallel
    const workers = [];
    for (let w = 0; w < Math.min(CONCURRENCY, files.length); w++) {
      workers.push(uploadWorker());
    }
    await Promise.all(workers);

    setUploading(false);

    if (failCount > 0) {
      setError(`Uploaded ${successCount}/${total} PDFs. (${duplicateCount} duplicates skipped, ${failCount} failed):\n${errors.slice(0, 5).join('\n')}`);
    } else {
      const summaryMsg = duplicateCount > 0
        ? `Successfully ingested ${successCount} PDFs! (${duplicateCount} duplicate PDFs skipped). Vectors indexed.`
        : `Successfully uploaded and queued ${successCount} PDF${successCount > 1 ? 's' : ''} for ChromaDB indexing!`;
      setMessage(summaryMsg);
      setTimeout(() => {
        navigate('/admin/documents');
      }, 1600);
    }
  };

  const totalSizeMb = (files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(2);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 space-y-6 text-[var(--ink)]">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--lime-soft)] text-[var(--pill-ink)] text-xs font-semibold">
          <Upload className="w-3.5 h-3.5" />
          <span>High-Capacity Batch PDF Ingestion</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)]">
          Upload Academic Materials (100+ PDFs)
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-soft)]">
          Upload 1 or 100+ syllabus notes, textbooks, question papers, or research papers. Vector embeddings will be extracted automatically.
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-[var(--ok-bg)] border border-[#6d8434]/20 rounded-2xl flex items-center gap-2 text-xs text-[var(--ok-fg)] font-medium animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-[var(--err-bg)] border border-rose-300 dark:border-rose-900/30 rounded-2xl flex items-center gap-2 text-xs text-[var(--err-fg)] font-medium animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="whitespace-pre-line">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="courseit-card p-6 sm:p-7 space-y-6">
        
        {/* Drop Zone */}
        <div className="border border-dashed border-[var(--line-strong)] hover:border-[#6d8434] rounded-2xl p-7 text-center bg-[var(--paper)] transition-all cursor-pointer relative group">
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFilesChange}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
          />
          <div className="space-y-2 pointer-events-none">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--surface)] text-[#6d8434] dark:text-[#b8c460] flex items-center justify-center shadow-sm">
              <Files className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-[var(--ink)]">
                Click or drag & drop 100+ PDFs here
              </p>
              <p className="text-[11px] text-[var(--ink-soft)] mt-0.5 font-mono">
                Bulk upload supported • Select 1 to 200+ files simultaneously
              </p>
            </div>
          </div>
        </div>

        {/* Selected Files Preview List */}
        {files.length > 0 && (
          <div className="space-y-3 p-4 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <span className="font-semibold text-[var(--ink)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#6d8434]" />
                Selected Documents ({files.length})
                <span className="text-[11px] text-[var(--ink-soft)] font-mono font-normal">
                  • Total {totalSizeMb} MB
                </span>
              </span>
              <button
                type="button"
                onClick={clearAllFiles}
                disabled={uploading}
                className="text-[11px] text-rose-500 hover:underline cursor-pointer font-medium disabled:opacity-50"
              >
                Clear all ({files.length})
              </button>
            </div>

            {/* Quick search if > 5 files selected */}
            {files.length > 5 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={fileFilter}
                  onChange={(e) => setFileFilter(e.target.value)}
                  placeholder={`Search among ${files.length} selected PDFs...`}
                  className="w-full pl-8 pr-3 py-1.5 bg-[var(--surface)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] placeholder-[var(--ink-soft)] outline-none"
                />
              </div>
            )}

            {/* Scrollable file list */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {filteredFiles.map((f, idx) => (
                <div
                  key={`${f.name}-${idx}`}
                  className="flex items-center justify-between p-2 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-xs min-w-0"
                >
                  <div className="flex items-center gap-2 min-w-0 truncate pr-2">
                    <span className="w-5 h-5 rounded-md bg-[var(--lime-soft)] text-[var(--pill-ink)] flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-[var(--ink)] truncate min-w-0">
                      {f.name}
                    </span>
                    <span className="text-[10px] text-[var(--ink-soft)] font-mono shrink-0">
                      ({(f.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    disabled={uploading}
                    className="p-1 rounded-md text-[var(--ink-soft)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                    title="Remove from batch"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Document Title (only if 1 file is selected) */}
          {files.length <= 1 && (
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
                Document Title
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. DBMS Module 3 - Normalization & BCNF Notes"
                className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] outline-none focus:border-[#6d8434] transition-all"
              />
            </div>
          )}

          {/* Department Selection */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
              Department
            </label>
            <div className="relative">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full appearance-none px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] outline-none cursor-pointer"
              >
                {departments.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} - {d.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-[var(--ink-soft)] absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Semester Selection */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
              Semester
            </label>
            <div className="relative">
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full appearance-none px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] outline-none cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s.toString()}>Semester {s}</option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-[var(--ink-soft)] absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Subject Selection (With Always-Visible Options & Custom Option) */}
          <div className="space-y-1 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
                Subject
              </label>
              <button
                type="button"
                onClick={() => handleSubjectChange(isCustomSubject ? subjects[0]?.name : '__CUSTOM__')}
                className="text-[10px] text-[#6d8434] dark:text-[#b8c460] hover:underline cursor-pointer font-medium"
              >
                {isCustomSubject ? 'Choose from list' : '+ Add custom subject name'}
              </button>
            </div>

            {!isCustomSubject ? (
              <div className="relative">
                <select
                  value={subject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full appearance-none px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] outline-none cursor-pointer pr-8"
                >
                  {subjects.map((s) => (
                    <option key={s.id || s.code || s.name} value={s.name}>
                      {s.name} ({s.code || 'SUBJ'})
                    </option>
                  ))}
                  <option value="__CUSTOM__">+ Other / Custom Subject</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[var(--ink-soft)] absolute right-2.5 top-3 pointer-events-none" />
              </div>
            ) : (
              <div className="space-y-1">
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Enter full subject name (e.g. Theory of Computation, Embedded Systems)"
                  className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] outline-none focus:border-[#6d8434]"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Module Selection */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
              Module / Unit
            </label>
            <div className="relative">
              <select
                value={module}
                onChange={(e) => setModule(e.target.value)}
                className="w-full appearance-none px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] outline-none cursor-pointer"
              >
                {modulesList.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-[var(--ink-soft)] absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Document Type Selection */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
              Document Type
            </label>
            <div className="relative">
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full appearance-none px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] outline-none cursor-pointer"
              >
                <option value="Notes">Notes</option>
                <option value="Syllabus">Syllabus</option>
                <option value="Question Paper">Question Paper</option>
                <option value="Reference Material">Reference Material</option>
                <option value="Assignment">Assignment</option>
                <option value="Lab Manual">Lab Manual</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[var(--ink-soft)] absolute right-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Academic Year */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
              Academic Year
            </label>
            <input
              type="text"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2025-2026"
              className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] outline-none focus:border-[#6d8434] transition-all"
            />
          </div>

          {/* Description */}
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of syllabus or topics covered in this batch..."
              className="w-full px-3 py-2 bg-[var(--paper)] border border-[var(--line)] rounded-xl text-xs text-[var(--ink)] outline-none focus:border-[#6d8434] transition-all resize-none"
            />
          </div>

        </div>

        {/* Live Upload Progress */}
        {uploading && progress && (
          <div className="space-y-2.5 p-4 rounded-2xl bg-[var(--lime-soft)] border border-[#6d8434]/20 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--pill-ink)]">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin text-[#6d8434]" />
                Uploading Batch: {progress.current} / {progress.total} PDFs ({progress.percent}%)
              </span>
              <span className="font-mono text-[11px]">
                {progress.successCount} Indexed {progress.duplicateCount > 0 ? `• ${progress.duplicateCount} Duplicates` : ''}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden">
              <div 
                className="h-full bg-[#6d8434] transition-all duration-300 rounded-full"
                style={{ width: `${progress.percent}%` }}
              />
            </div>

            <p className="text-[11px] text-[var(--ink-soft)] font-mono truncate">
              Current: {progress.name}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => navigate('/admin/documents')}
            className="btn-pill-outline px-4 py-2 text-xs font-semibold"
            disabled={uploading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={uploading || files.length === 0}
            className="btn-moss px-6 py-2.5 text-xs font-semibold inline-flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Ingesting Batch ({progress?.current || 0}/{files.length})...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>
                  {files.length > 1 ? `Upload ${files.length} PDFs` : 'Upload Document'}
                </span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default UploadDocument;

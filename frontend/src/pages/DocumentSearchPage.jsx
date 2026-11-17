import React, { useState, useEffect } from 'react';
import { Search, FileText, Eye, ChevronDown } from 'lucide-react';
import { documentAPI } from '../services/api';
import PDFViewerModal from '../components/PDFViewerModal';

const DocumentSearchPage = () => {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All Departments');
  const [semester, setSemester] = useState('All Semesters');
  const [documentType, setDocumentType] = useState('All Types');
  const [loading, setLoading] = useState(true);

  const [selectedSource, setSelectedSource] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  useEffect(() => {
    loadDocs();
  }, [department, semester, documentType]);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const res = await documentAPI.getDocuments({
        department: department !== 'All Departments' ? department : undefined,
        semester: semester !== 'All Semesters' ? semester : undefined,
        documentType: documentType !== 'All Types' ? documentType : undefined,
        search: search || undefined
      });
      setDocuments(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDocs();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-16 space-y-8 animate-fade-in text-[var(--ink)]">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--lime-soft)] text-[var(--pill-ink)] text-xs font-medium">
          <FileText className="w-3.5 h-3.5" />
          <span>Academic Knowledge Repository</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)]">
          Search College Notes & Syllabus
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-soft)]">
          Search indexed department PDFs, lecture notes, syllabus, and module materials with exact page citations.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="courseit-card p-5 space-y-3">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--ink-soft)] absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword, topic, or document name..."
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs text-[var(--ink)] placeholder-[var(--ink-soft)] outline-none focus:border-[#6d8434] transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="relative">
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full appearance-none px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="All Departments" className="bg-white dark:bg-[#121620]">All Departments</option>
                <option value="CSE" className="bg-white dark:bg-[#121620]">CSE</option>
                <option value="AI & DS" className="bg-white dark:bg-[#121620]">AI & DS</option>
                <option value="CSBS" className="bg-white dark:bg-[#121620]">CSBS</option>
                <option value="ECE" className="bg-white dark:bg-[#121620]">ECE</option>
                <option value="EEE" className="bg-white dark:bg-[#121620]">EEE</option>
                <option value="Mechanical" className="bg-white dark:bg-[#121620]">Mechanical</option>
                <option value="Civil" className="bg-white dark:bg-[#121620]">Civil</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full appearance-none px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="All Semesters" className="bg-white dark:bg-[#121620]">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s.toString()} className="bg-white dark:bg-[#121620]">Sem {s}</option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full appearance-none px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="All Types" className="bg-white dark:bg-[#121620]">All Doc Types</option>
                <option value="Notes" className="bg-white dark:bg-[#121620]">Notes</option>
                <option value="Syllabus" className="bg-white dark:bg-[#121620]">Syllabus</option>
                <option value="Question Paper" className="bg-white dark:bg-[#121620]">Question Paper</option>
                <option value="Reference Material" className="bg-white dark:bg-[#121620]">Reference Material</option>
                <option value="Assignment" className="bg-white dark:bg-[#121620]">Assignment</option>
                <option value="Lab Manual" className="bg-white dark:bg-[#121620]">Lab Manual</option>
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </form>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 font-mono">
            Searching repository...
          </div>
        ) : documents.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 font-mono">
            No academic documents found.
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="courseit-card p-5 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="p-1 rounded-full bg-[var(--lime-soft)] text-[#6d8434]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="px-2.5 py-0.5 bg-[var(--lime-soft)] text-[var(--pill-ink)] font-mono text-[10px] rounded-full font-bold">
                    {doc.documentType}
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-[var(--ink)] text-sm leading-snug line-clamp-2">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-[var(--ink-soft)] line-clamp-2 mt-1">
                    {doc.description || "Official college academic document."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-[var(--ink-soft)] pt-1">
                  <span className="bg-[var(--muted)] px-2 py-0.5 rounded-full">
                    {doc.department} • Sem {doc.semester}
                  </span>
                  <span className="bg-[var(--muted)] px-2 py-0.5 rounded-full truncate max-w-[130px]">
                    {doc.subject}
                  </span>
                  <span className="bg-[var(--muted)] px-2 py-0.5 rounded-full">
                    {doc.module}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--ink-soft)] font-mono">
                  {doc.chunkCount} vector chunks
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSource({
                      documentName: doc.originalFileName || doc.name,
                      documentId: doc.id,
                      page: 1,
                      module: doc.module
                    });
                    setPdfModalOpen(true);
                  }}
                  className="btn-moss px-3 py-1 text-xs font-medium inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View PDF</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PDF View Modal */}
      <PDFViewerModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        source={selectedSource}
      />

    </div>
  );
};

export default DocumentSearchPage;

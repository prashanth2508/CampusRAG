import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  PlusCircle, 
  Trash2, 
  RefreshCw, 
  Eye, 
  ChevronDown,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import PDFViewerModal from '../components/PDFViewerModal';
import { documentAPI } from '../services/api';

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All Departments');
  const [semester, setSemester] = useState('All Semesters');
  const [documentType, setDocumentType] = useState('All Types');

  // Modals state
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmBatchDelete, setConfirmBatchDelete] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    loadDocuments();
  }, [department, semester, documentType]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentAPI.getDocuments({
        department: department !== 'All Departments' ? department : undefined,
        semester: semester !== 'All Semesters' ? semester : undefined,
        documentType: documentType !== 'All Types' ? documentType : undefined,
        search: search || undefined
      });
      setDocuments(res.data);
      // Remove any selected IDs that are no longer in documents
      setSelectedIds(prev => prev.filter(id => res.data.some(d => d.id === id)));
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadDocuments();
  };

  const handleReprocess = async (id) => {
    try {
      await documentAPI.reprocessDocument(id);
      loadDocuments();
    } catch (err) {
      console.error("Failed to trigger reprocess:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await documentAPI.deleteDocument(id);
      setSelectedIds(prev => prev.filter(item => item !== id));
      loadDocuments();
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  const handleBatchDelete = async () => {
    if (!selectedIds.length) return;
    try {
      await documentAPI.batchDeleteDocuments(selectedIds);
      setSelectedIds([]);
      loadDocuments();
    } catch (err) {
      console.error("Failed to batch delete documents:", err);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === documents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(documents.map(d => d.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Processed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 whitespace-nowrap">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            Processed
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 animate-pulse whitespace-nowrap">
            <span className="w-1 h-1 rounded-full bg-amber-500" />
            Processing
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-500/20 whitespace-nowrap">
            <span className="w-1 h-1 rounded-full bg-rose-500" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-white/[0.04] whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 space-y-6 text-[var(--ink)]">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--lime-soft)] text-[var(--pill-ink)] text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            <span>Repository Index</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)]">
            Document Repository
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-soft)]">
            Manage academic PDFs, track vector extraction, and trigger re-embedding.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setConfirmBatchDelete(true)}
              className="px-3.5 py-2 rounded-full text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <Link
            to="/admin/upload"
            className="btn-moss px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Upload PDF</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#0f131c] p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-2">
          
          <div className="relative w-full sm:flex-1 min-w-[160px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search document name, original file, or topic..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none"
            />
          </div>

          <div className="relative flex-1 min-w-[130px]">
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

          <div className="relative flex-1 min-w-[100px]">
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full appearance-none px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="All Semesters" className="bg-white dark:bg-[#121620]">All Sems</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s.toString()} className="bg-white dark:bg-[#121620]">Sem {s}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <div className="relative flex-1 min-w-[110px]">
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full appearance-none px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="All Types" className="bg-white dark:bg-[#121620]">All Types</option>
              <option value="Notes" className="bg-white dark:bg-[#121620]">Notes</option>
              <option value="Syllabus" className="bg-white dark:bg-[#121620]">Syllabus</option>
              <option value="Question Paper" className="bg-white dark:bg-[#121620]">Question Paper</option>
              <option value="Reference Material" className="bg-white dark:bg-[#121620]">Reference Material</option>
              <option value="Assignment" className="bg-white dark:bg-[#121620]">Assignment</option>
              <option value="Lab Manual" className="bg-white dark:bg-[#121620]">Lab Manual</option>
              <option value="Other" className="bg-white dark:bg-[#121620]">Other</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <button
            type="submit"
            className="px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-xl text-xs font-medium hover:opacity-90 transition-opacity ml-auto sm:ml-0"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="sm:hidden px-3 py-1.5 bg-[var(--muted)]/50 rounded-xl text-[10px] text-[var(--ink-soft)] font-mono flex items-center justify-between">
        <span>👉 Swipe table sideways to see details & actions</span>
        <span>Scroll ➔</span>
      </div>

      {/* Document Table */}
      <div className="bg-white dark:bg-[#0f131c] rounded-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.06] text-[10px] font-mono text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-white/[0.01]">
                <th className="px-4 py-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="p-1 hover:text-[var(--ink)] transition-colors cursor-pointer"
                    title={selectedIds.length === documents.length ? "Deselect All" : "Select All"}
                  >
                    {documents.length > 0 && selectedIds.length === documents.length ? (
                      <CheckSquare className="w-3.5 h-3.5 text-[#6d8434]" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="px-4 py-3">Document Title</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Subject & Module</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-5 py-3 text-right whitespace-nowrap w-28 shrink-0">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-xs text-slate-400 font-mono">
                    Loading repository records...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-xs text-slate-400 font-mono">
                    No documents matching the criteria.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => {
                  const isSelected = selectedIds.includes(doc.id);
                  return (
                    <tr 
                      key={doc.id} 
                      className={`hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors ${
                        isSelected ? 'bg-[var(--lime-soft)]/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(doc.id)}
                          className="w-3.5 h-3.5 rounded accent-[#6d8434] cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 shrink-0">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white truncate max-w-xs">{doc.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono truncate">{doc.originalFileName}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {doc.department} • Sem {doc.semester}
                      </td>

                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        <p className="font-medium text-slate-900 dark:text-white truncate max-w-[150px]">{doc.subject}</p>
                        <span className="text-[10px] font-mono text-slate-400 truncate block">{doc.module}</span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="space-y-0.5">
                          {getStatusBadge(doc.status)}
                          {doc.status === 'Processed' && (
                            <p className="text-[10px] text-slate-400 font-mono">
                              {doc.chunkCount} chunks
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Recent'}
                      </td>

                      <td className="px-5 py-3 text-right whitespace-nowrap align-middle shrink-0">
                        <div className="inline-flex items-center justify-end gap-1.5 flex-nowrap shrink-0">
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
                            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-md transition-colors shrink-0 cursor-pointer"
                            title="View PDF"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReprocess(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-md transition-colors shrink-0 cursor-pointer"
                            title="Reprocess Vector Embeddings"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition-colors shrink-0 cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF View Modal */}
      <PDFViewerModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        source={selectedSource}
      />

      {/* Single Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => handleDelete(confirmDeleteId)}
        title="Delete Document"
        message="Are you sure you want to remove this document and its associated vectors from the knowledge base?"
      />

      {/* Batch Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmBatchDelete}
        onClose={() => setConfirmBatchDelete(false)}
        onConfirm={handleBatchDelete}
        title={`Delete ${selectedIds.length} Document${selectedIds.length > 1 ? 's' : ''}`}
        message={`Are you sure you want to delete ${selectedIds.length} selected document(s)? All corresponding vector chunks will also be purged from ChromaDB.`}
      />

    </div>
  );
};

export default DocumentManagement;

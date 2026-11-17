import React, { useState, useEffect } from 'react';
import { Building2, BookOpen, Plus, Trash2, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
import { academicAPI } from '../services/api';

const AcademicManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // New department form
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');

  // New subject form
  const [subjName, setSubjName] = useState('');
  const [subjCode, setSubjCode] = useState('');
  const [subjDeptCode, setSubjDeptCode] = useState('CSE');
  const [subjSem, setSubjSem] = useState('5');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [deptRes, subjRes] = await Promise.all([
        academicAPI.getDepartments(),
        academicAPI.getSubjects()
      ]);
      setDepartments(deptRes.data);
      setSubjects(subjRes.data);
    } catch (err) {
      console.error("Failed to load academic structure:", err);
    }
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await academicAPI.createDepartment({ name: deptName, code: deptCode });
      setMessage(`Department "${deptCode}" added successfully.`);
      setDeptName('');
      setDeptCode('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add department.");
    }
  };

  const handleDeleteDept = async (id) => {
    try {
      await academicAPI.deleteDepartment(id);
      loadData();
    } catch (err) {
      setError("Failed to delete department.");
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await academicAPI.createSubject({
        name: subjName,
        code: subjCode,
        departmentCode: subjDeptCode,
        semester: subjSem,
        modules: ['Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5']
      });
      setMessage(`Subject "${subjCode}" added successfully.`);
      setSubjName('');
      setSubjCode('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add subject.");
    }
  };

  const handleDeleteSubject = async (id) => {
    try {
      await academicAPI.deleteSubject(id);
      loadData();
    } catch (err) {
      setError("Failed to delete subject.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-16 space-y-6 animate-fade-in text-[var(--ink)]">
      
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--lime-soft)] text-[var(--pill-ink)] text-xs font-semibold">
          <Building2 className="w-3.5 h-3.5" />
          <span>Curriculum Taxonomy</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)]">
          Academic Structure
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-soft)]">
          Manage dynamic departments, semester subjects, and module taxonomy.
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-[var(--ok-bg)] border border-[#6d8434]/20 rounded-2xl flex items-center gap-2 text-xs text-[var(--ok-fg)] font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-[var(--err-bg)] border border-rose-300 dark:border-rose-900/30 rounded-2xl flex items-center gap-2 text-xs text-[var(--err-fg)] font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Departments Column */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0f131c] p-5 rounded-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-sm space-y-3.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              Add Department
            </h2>
            <form onSubmit={handleAddDept} className="space-y-2.5">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-500">Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI & DS"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-500">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & Data Science"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-medium rounded-xl text-xs hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Department</span>
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-[#0f131c] p-4 rounded-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-sm space-y-2">
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Departments ({departments.length})
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04] max-h-60 overflow-y-auto">
              {departments.map((d) => (
                <div key={d.id || d.code} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-slate-900 dark:text-white">{d.code}</span>
                    <p className="text-[10px] text-slate-400 truncate">{d.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteDept(d.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subjects Column */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0f131c] p-5 rounded-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-sm space-y-3.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              Add Subject
            </h2>
            <form onSubmit={handleAddSubject} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-500">Dept</label>
                  <div className="relative">
                    <select
                      value={subjDeptCode}
                      onChange={(e) => setSubjDeptCode(e.target.value)}
                      className="w-full appearance-none px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      {departments.map(d => <option key={d.code} value={d.code} className="bg-white dark:bg-[#121620]">{d.code}</option>)}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-500">Semester</label>
                  <div className="relative">
                    <select
                      value={subjSem}
                      onChange={(e) => setSubjSem(e.target.value)}
                      className="w-full appearance-none px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s.toString()} className="bg-white dark:bg-[#121620]">Sem {s}</option>)}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-500">Subject Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DBMS"
                  value={subjCode}
                  onChange={(e) => setSubjCode(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-500">Full Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Management System"
                  value={subjName}
                  onChange={(e) => setSubjName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-medium rounded-xl text-xs hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Subject</span>
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-[#0f131c] p-4 rounded-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-sm space-y-2">
            <h3 className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Registered Subjects ({subjects.length})
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04] max-h-60 overflow-y-auto">
              {subjects.map((s) => (
                <div key={s.id || s.code} className="py-2 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-slate-900 dark:text-white">{s.code} — {s.name}</span>
                    <p className="text-[10px] text-slate-400 font-mono">{s.departmentCode} • Sem {s.semester}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubject(s.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AcademicManagement;

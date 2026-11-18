import React, { useEffect, useState } from 'react';
import { BookOpen, Layers, GraduationCap, Building2, ChevronDown } from 'lucide-react';
import { academicAPI } from '../services/api';

const AcademicSelector = ({
  department,
  setDepartment,
  semester,
  setSemester,
  subject,
  setSubject,
  module,
  setModule,
  compact = false
}) => {
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [modules, setModules] = useState(['Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5']);

  const semestersList = ['1', '2', '3', '4', '5', '6', '7', '8'];

  useEffect(() => {
    const loadDepts = async () => {
      try {
        const res = await academicAPI.getDepartments();
        if (res.data && res.data.length > 0) {
          setDepartments(res.data);
          if (!department) {
            setDepartment(res.data[0].code);
          }
        } else {
          setDepartments([
            { code: 'CSE', name: 'Computer Science & Engineering' },
            { code: 'AI & DS', name: 'Artificial Intelligence & Data Science' },
            { code: 'ECE', name: 'Electronics & Communication Engineering' },
            { code: 'EEE', name: 'Electrical Engineering' }
          ]);
        }
      } catch (err) {
        console.error("Failed to load departments:", err);
      }
    };
    loadDepts();
  }, []);

  useEffect(() => {
    const loadSubjects = async () => {
      if (!department || !semester) return;
      try {
        const res = await academicAPI.getSubjects(department, semester);
        if (res.data && res.data.length > 0) {
          setSubjects(res.data);
          const exists = res.data.some(s => s.name === subject) || subject === 'All Subjects';
          if (!exists) {
            setSubject('All Subjects');
            setModules(['All Modules', 'Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5']);
            setModule('All Modules');
          }
        } else {
          const fallbackList = [
            { name: 'Theory of Computation', code: 'TOC' },
            { name: 'Database Management System', code: 'DBMS' },
            { name: 'Computer Networks', code: 'CN' },
            { name: 'Software Engineering', code: 'SE' },
            { name: 'Distributed Systems', code: 'DS' },
            { name: 'Research Methodology & IPR', code: 'RM_IPR' },
            { name: 'Operating Systems', code: 'OS' }
          ];
          setSubjects(fallbackList);
          if (!subject) setSubject('All Subjects');
        }
      } catch (err) {
        console.error("Failed to load subjects:", err);
      }
    };
    loadSubjects();
  }, [department, semester]);

  const handleSubjectChange = (e) => {
    const selectedSubjName = e.target.value;
    setSubject(selectedSubjName);
    if (selectedSubjName === 'All Subjects') {
      setModules(['All Modules', 'Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5']);
      setModule('All Modules');
      return;
    }
    const found = subjects.find(s => s.name === selectedSubjName);
    if (found && found.modules && found.modules.length > 0) {
      setModules(found.modules);
      setModule(found.modules[0] || 'Module 1');
    } else {
      setModules(['All Modules', 'Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5']);
      setModule('All Modules');
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 p-1 bg-[var(--muted)]/60 rounded-2xl sm:rounded-full text-xs font-medium border border-[var(--line)] max-w-full overflow-x-auto no-scrollbar shrink-0">
        {/* Department */}
        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-[var(--surface)] rounded-full text-[var(--ink)] shadow-[0_0_0_1px_var(--line)] shrink-0">
          <Building2 className="w-3 h-3 text-[#6d8434]" />
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="bg-transparent font-medium cursor-pointer outline-none text-xs"
          >
            {departments.map((d) => (
              <option key={d.code} value={d.code}>{d.code}</option>
            ))}
          </select>
        </div>

        {/* Semester */}
        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-[var(--surface)] rounded-full text-[var(--ink)] shadow-[0_0_0_1px_var(--line)] shrink-0">
          <GraduationCap className="w-3 h-3 text-[#6d8434]" />
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="bg-transparent font-medium cursor-pointer outline-none text-xs"
          >
            {semestersList.map((s) => (
              <option key={s} value={s}>Sem {s}</option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-[var(--surface)] rounded-full text-[var(--ink)] shadow-[0_0_0_1px_var(--line)] max-w-[140px] sm:max-w-[180px] shrink-0">
          <BookOpen className="w-3 h-3 text-[#6d8434] shrink-0" />
          <select
            value={subject}
            onChange={handleSubjectChange}
            className="bg-transparent font-medium cursor-pointer outline-none text-xs truncate w-full"
          >
            <option value="All Subjects">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id || s.code} value={s.name}>{s.code || s.name}</option>
            ))}
          </select>
        </div>

        {/* Module */}
        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-[var(--surface)] rounded-full text-[var(--ink)] shadow-[0_0_0_1px_var(--line)] shrink-0">
          <Layers className="w-3 h-3 text-[#6d8434]" />
          <select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="bg-transparent font-medium cursor-pointer outline-none text-xs"
          >
            <option value="All Modules">All Modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="courseit-card p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#6d8434] dark:bg-[#b8c460]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ink)]">
            Academic Scope Filter
          </span>
        </div>
        <span className="text-xs text-[var(--ink-soft)] font-mono">
          {department} • Sem {semester}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Department */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
            Department
          </label>
          <div className="relative">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs font-medium text-[var(--ink)] outline-none hover:border-[#6d8434] transition-colors cursor-pointer"
            >
              {departments.map((d) => (
                <option key={d.code} value={d.code}>{d.code} — {d.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Semester */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
            Semester
          </label>
          <div className="relative">
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs font-medium text-[var(--ink)] outline-none hover:border-[#6d8434] transition-colors cursor-pointer"
            >
              {semestersList.map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
            Subject
          </label>
          <div className="relative">
            <select
              value={subject}
              onChange={handleSubjectChange}
              className="w-full appearance-none px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs font-medium text-[var(--ink)] outline-none hover:border-[#6d8434] transition-colors cursor-pointer truncate pr-8"
            >
              <option value="All Subjects">All Subjects (Auto-Detect Across All Notes)</option>
              {subjects.map((s) => (
                <option key={s.id || s.code} value={s.name}>{s.name} ({s.code})</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>

        {/* Module */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium text-[var(--ink-soft)]">
            Module
          </label>
          <div className="relative">
            <select
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full text-xs font-medium text-[var(--ink)] outline-none hover:border-[#6d8434] transition-colors cursor-pointer"
            >
              <option value="All Modules">All Modules</option>
              {modules.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--ink-soft)] absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicSelector;

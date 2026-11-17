import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Building2, 
  BookOpen, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  PlusCircle, 
  FolderTree, 
  RefreshCw,
  Layers,
  ArrowUpRight,
  LayoutDashboard
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { statsAPI } from '../services/api';

const COLORS = ['#6d8434', '#b8c460', '#4861b5', '#7d93e0', '#f0b47c', '#c9d57a'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await statsAPI.getDashboardStats();
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = stats?.metrics || {
    totalDocuments: 0,
    totalDepartments: 0,
    totalSubjects: 0,
    totalStudents: 0,
    processedDocuments: 0,
    processingErrors: 0,
    inProcessingQueue: 0
  };

  const deptData = stats?.charts?.byDepartment || [];
  const semData = stats?.charts?.bySemester || [];

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 space-y-8 animate-fade-in text-[var(--ink)]">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--lime-soft)] text-[var(--pill-ink)] text-xs font-semibold">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Admin Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--ink)]">
            Administration & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[var(--ink-soft)]">
            Monitor academic PDF ingestion status, department distribution, and RAG knowledge metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardStats}
            className="w-9 h-9 rounded-full flex items-center justify-center btn-pill-outline cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[var(--ink-soft)] ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/admin/upload"
            className="btn-moss px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Upload PDF</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="courseit-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[var(--ink-soft)]">
            <FileText className="w-4 h-4 text-[#6d8434]" />
            <span className="text-[10px] font-mono uppercase text-[var(--ink-soft)]">Docs</span>
          </div>
          <p className="text-2xl font-bold text-[var(--ink)] font-mono">{metrics.totalDocuments}</p>
          <p className="text-[10px] text-[var(--ink-soft)] truncate">Uploaded PDFs</p>
        </div>

        <div className="courseit-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[var(--ink-soft)]">
            <Building2 className="w-4 h-4 text-[#6d8434]" />
            <span className="text-[10px] font-mono uppercase text-[var(--ink-soft)]">Depts</span>
          </div>
          <p className="text-2xl font-bold text-[var(--ink)] font-mono">{metrics.totalDepartments}</p>
          <p className="text-[10px] text-[var(--ink-soft)] truncate">Departments</p>
        </div>

        <div className="courseit-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[var(--ink-soft)]">
            <BookOpen className="w-4 h-4 text-[#6d8434]" />
            <span className="text-[10px] font-mono uppercase text-[var(--ink-soft)]">Subjects</span>
          </div>
          <p className="text-2xl font-bold text-[var(--ink)] font-mono">{metrics.totalSubjects}</p>
          <p className="text-[10px] text-[var(--ink-soft)] truncate">Registered</p>
        </div>

        <div className="courseit-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[var(--ink-soft)]">
            <Users className="w-4 h-4 text-[#6d8434]" />
            <span className="text-[10px] font-mono uppercase text-[var(--ink-soft)]">Users</span>
          </div>
          <p className="text-2xl font-bold text-[var(--ink)] font-mono">{metrics.totalStudents}</p>
          <p className="text-[10px] text-[var(--ink-soft)] truncate">Students</p>
        </div>

        <div className="courseit-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[var(--ink-soft)]">
            <CheckCircle className="w-4 h-4 text-[#6d8434]" />
            <span className="text-[10px] font-mono uppercase text-[var(--ink-soft)]">Vectors</span>
          </div>
          <p className="text-2xl font-bold text-[var(--ink)] font-mono">{metrics.processedDocuments}</p>
          <p className="text-[10px] text-[var(--ink-soft)] truncate">ChromaDB Chunks</p>
        </div>

        <div className="courseit-card p-4 space-y-1">
          <div className="flex items-center justify-between text-[var(--ink-soft)]">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-mono uppercase text-[var(--ink-soft)]">Status</span>
          </div>
          <p className="text-2xl font-bold text-[var(--ink)] font-mono">{metrics.processingErrors}</p>
          <p className="text-[10px] text-[var(--ink-soft)] truncate">Errors</p>
        </div>

      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Department Distribution Bar Chart */}
        <div className="courseit-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-[var(--ink)] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#6d8434]" />
              Documents by Department
            </h3>
          </div>
          <div className="h-56">
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData}>
                  <XAxis dataKey="department" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)', borderRadius: '16px', color: 'var(--ink)', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#6d8434" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">No chart data</div>
            )}
          </div>
        </div>

        {/* Semester Distribution Pie Chart */}
        <div className="courseit-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs text-[var(--ink)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#6d8434]" />
              Documents by Semester
            </h3>
          </div>
          <div className="h-56 flex items-center justify-center">
            {semData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={semData}
                    dataKey="count"
                    nameKey="semester"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ semester, count }) => `Sem ${semester}: ${count}`}
                  >
                    {semData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#262f40', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">No semester distribution data</div>
            )}
          </div>
        </div>

      </div>

      {/* Navigation Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <Link
          to="/admin/upload"
          className="courseit-card p-4.5 space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <PlusCircle className="w-4 h-4 text-[#6d8434] dark:text-[#b8c460]" />
            <ArrowUpRight className="w-3.5 h-3.5 text-[var(--ink-soft)] opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
          <h4 className="text-xs font-semibold text-[var(--ink)]">Upload Material (Batch PDF)</h4>
          <p className="text-[11px] text-[var(--ink-soft)]">Upload notes, syllabus, question papers with academic tags.</p>
        </Link>

        <Link
          to="/admin/documents"
          className="courseit-card p-4.5 space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <FileText className="w-4 h-4 text-[#6d8434] dark:text-[#b8c460]" />
            <ArrowUpRight className="w-3.5 h-3.5 text-[var(--ink-soft)] opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
          <h4 className="text-xs font-semibold text-[var(--ink)]">Repository Table</h4>
          <p className="text-[11px] text-[var(--ink-soft)]">View, preview PDF, reprocess vector chunks, or manage documents.</p>
        </Link>

        <Link
          to="/admin/academic"
          className="courseit-card p-4.5 space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <FolderTree className="w-4 h-4 text-[#6d8434] dark:text-[#b8c460]" />
            <ArrowUpRight className="w-3.5 h-3.5 text-[var(--ink-soft)] opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
          <h4 className="text-xs font-semibold text-[var(--ink)]">Departments & Subjects</h4>
          <p className="text-[11px] text-[var(--ink-soft)]">Configure curriculum, semesters, and modules.</p>
        </Link>
      </div>

    </div>
  );
};

export default AdminDashboard;

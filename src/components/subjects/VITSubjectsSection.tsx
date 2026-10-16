import React, { useState, useMemo } from 'react';
import { useApp, getYearForSemester, getSemestersForYear, SemesterStat } from '../../context/AppContext';
import { AcademicSubject, CollegeYear, SemesterNumber, CourseCategory } from '../../types';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Award,
  Search,
  Filter,
  X,
  Check,
  User,
  Clock,
  FileText,
  Target,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Sliders,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export const VITSubjectsSection: React.FC = () => {
  const {
    allSubjects,
    semesterSubjects,
    selectedYear,
    selectedSemester,
    setSelectedYear,
    setSelectedSemester,
    addSubject,
    updateSubject,
    deleteSubject,
    toggleSubjectGoal,
    semesterCredits,
    semesterAttendance,
    semesterGpa,
    allSemestersStats,
    profile,
    setProfileModalOpen,
    calculatedCgpa,
    cgpaGap,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'safe' | 'warning' | 'completed-goals'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [transcriptModalOpen, setTranscriptModalOpen] = useState(false);

  // Form state for Add/Edit
  const [formData, setFormData] = useState<Omit<AcademicSubject, 'id'>>({
    semesterNumber: selectedSemester,
    name: '',
    courseCode: '',
    credits: 4,
    category: 'Core Discipline',
    facultyName: '',
    attendancePercentage: 85,
    classesAttended: 17,
    totalClasses: 20,
    grade: 'In Progress',
    gradePoint: undefined,
    assessmentMarks: {
      cat1: 40,
      cat2: 42,
      da: 28,
      labMarks: 45,
      assignmentScore: 25,
    },
    examDates: {
      cat1Date: '',
      cat2Date: '',
      fatDate: '',
      finalExamDate: '',
      assignmentDueDate: '',
    },
    studyGoal: '',
    goalCompleted: false,
    color: 'indigo',
  });

  const categories: CourseCategory[] = [
    'Core Foundation',
    'Core Discipline',
    'Professional Elective',
    'Open Elective',
    'Lab / Practical',
    'Project Work',
    'Humanities & Communication',
  ];

  const subjectsNeedingAttention = useMemo(() => {
    return semesterSubjects.filter((s) => s.attendancePercentage < 75);
  }, [semesterSubjects]);

  // Filtered subjects list for current semester
  const filteredSubjects = useMemo(() => {
    return semesterSubjects.filter((subject) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        subject.name.toLowerCase().includes(q) ||
        subject.courseCode.toLowerCase().includes(q) ||
        subject.facultyName.toLowerCase().includes(q) ||
        (subject.category && subject.category.toLowerCase().includes(q)) ||
        subject.studyGoal.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (selectedCategory !== 'all' && subject.category !== selectedCategory) {
        return false;
      }

      if (filterType === 'safe') return subject.attendancePercentage >= 75;
      if (filterType === 'warning') return subject.attendancePercentage < 75;
      if (filterType === 'completed-goals') return subject.goalCompleted;
      return true;
    });
  }, [semesterSubjects, searchQuery, filterType, selectedCategory]);

  const handleOpenAdd = () => {
    setFormData({
      semesterNumber: selectedSemester,
      name: '',
      courseCode: '',
      credits: 4,
      category: 'Core Discipline',
      facultyName: '',
      attendancePercentage: 85,
      classesAttended: 17,
      totalClasses: 20,
      grade: 'In Progress',
      gradePoint: undefined,
      assessmentMarks: {
        cat1: 40,
        cat2: 42,
        da: 28,
        labMarks: 45,
        assignmentScore: 25,
      },
      examDates: {
        cat1Date: '',
        cat2Date: '',
        fatDate: '',
        finalExamDate: '',
        assignmentDueDate: '',
      },
      studyGoal: '',
      goalCompleted: false,
      color: 'indigo',
    });
    setEditingSubjectId(null);
    setModalMode('add');
  };

  const handleOpenEdit = (subject: AcademicSubject) => {
    setFormData({
      semesterNumber: subject.semesterNumber || selectedSemester,
      name: subject.name,
      courseCode: subject.courseCode,
      credits: subject.credits,
      category: subject.category || 'Core Discipline',
      facultyName: subject.facultyName,
      attendancePercentage: subject.attendancePercentage,
      classesAttended: subject.classesAttended || Math.round((subject.attendancePercentage / 100) * 20),
      totalClasses: subject.totalClasses || 20,
      grade: subject.grade || 'In Progress',
      gradePoint: subject.gradePoint,
      assessmentMarks: {
        cat1: subject.assessmentMarks?.cat1 ?? 0,
        cat2: subject.assessmentMarks?.cat2 ?? 0,
        da: subject.assessmentMarks?.da ?? 0,
        labMarks: subject.assessmentMarks?.labMarks ?? 0,
        assignmentScore: subject.assessmentMarks?.assignmentScore ?? 0,
      },
      examDates: {
        cat1Date: subject.examDates?.cat1Date || '',
        cat2Date: subject.examDates?.cat2Date || '',
        fatDate: subject.examDates?.fatDate || subject.examDates?.finalExamDate || '',
        finalExamDate: subject.examDates?.finalExamDate || subject.examDates?.fatDate || '',
        assignmentDueDate: subject.examDates?.assignmentDueDate || '',
      },
      studyGoal: subject.studyGoal || '',
      goalCompleted: subject.goalCompleted || false,
      color: subject.color || 'indigo',
    });
    setEditingSubjectId(subject.id);
    setModalMode('edit');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.courseCode.trim()) return;

    // Recalculate attendance % accurately if attended & total given
    const total = Number(formData.totalClasses) || 1;
    const attended = Math.min(total, Number(formData.classesAttended) || 0);
    const calculatedAttendance = Math.round((attended / total) * 100);

    const payload = {
      ...formData,
      semesterNumber: formData.semesterNumber || selectedSemester,
      name: formData.name.trim(),
      courseCode: formData.courseCode.trim().toUpperCase(),
      facultyName: formData.facultyName.trim(),
      credits: Number(formData.credits) || 3,
      classesAttended: attended,
      totalClasses: total,
      attendancePercentage: calculatedAttendance,
      studyGoal: formData.studyGoal.trim(),
    };

    if (modalMode === 'add') {
      addSubject(payload);
    } else if (modalMode === 'edit' && editingSubjectId) {
      updateSubject(editingSubjectId, payload);
    }

    setModalMode(null);
    setEditingSubjectId(null);
  };

  const handleDelete = (subject: AcademicSubject) => {
    if (window.confirm(`Are you sure you want to remove "${subject.courseCode} - ${subject.name}" from Semester ${subject.semesterNumber}?`)) {
      deleteSubject(subject.id);
    }
  };

  const colorStyles: Record<string, { bg: string; text: string; border: string; badge: string }> = {
    indigo: {
      bg: 'bg-indigo-50/70 dark:bg-indigo-950/30',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200/80 dark:border-indigo-800/60',
      badge: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300',
    },
    emerald: {
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200/80 dark:border-emerald-800/60',
      badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
    },
    amber: {
      bg: 'bg-amber-50/70 dark:bg-amber-950/30',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200/80 dark:border-amber-800/60',
      badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
    },
    rose: {
      bg: 'bg-rose-50/70 dark:bg-rose-950/30',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-200/80 dark:border-rose-800/60',
      badge: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300',
    },
    sky: {
      bg: 'bg-sky-50/70 dark:bg-sky-950/30',
      text: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-200/80 dark:border-sky-800/60',
      badge: 'bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300',
    },
    violet: {
      bg: 'bg-violet-50/70 dark:bg-violet-950/30',
      text: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-200/80 dark:border-violet-800/60',
      badge: 'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300',
    },
  };

  const years: { year: CollegeYear; label: string; semesters: [SemesterNumber, SemesterNumber] }[] = [
    { year: 1, label: '1st Year', semesters: [1, 2] },
    { year: 2, label: '2nd Year', semesters: [3, 4] },
    { year: 3, label: '3rd Year', semesters: [5, 6] },
    { year: 4, label: '4th Year', semesters: [7, 8] },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Header with 4-Year & 8-Semester Switching */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <span>{profile.university || 'Undergraduate College'}</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span>4-Year Degree Track (Semesters 1 – 8)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-2.5">
              <GraduationCap className="w-7 h-7 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Academic Curriculum & Semester Management</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Switch seamlessly across all 4 college years and 8 independent semesters. Manage course credits, attendance, continuous assessments, and grades.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <button
              onClick={() => setTranscriptModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
              <span>8-Semester Overview</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject to Sem {selectedSemester}</span>
            </button>
          </div>
        </div>

        {/* 4-Year Level Switcher Tabs */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Select College Year (1st – 4th Year)</span>
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active: <strong className="text-indigo-600 dark:text-indigo-400">Year {selectedYear} · Semester {selectedSemester}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {years.map((y) => {
              const isYearActive = selectedYear === y.year;
              const sem1Count = allSubjects.filter((s) => s.semesterNumber === y.semesters[0]).length;
              const sem2Count = allSubjects.filter((s) => s.semesterNumber === y.semesters[1]).length;

              return (
                <button
                  key={y.year}
                  type="button"
                  onClick={() => setSelectedYear(y.year)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer group ${
                    isYearActive
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-sm'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold ${
                        isYearActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {y.label}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isYearActive
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      Sem {y.semesters[0]}–{y.semesters[1]}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {sem1Count + sem2Count} Total Courses Enrolled
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 8-Semester Quick Ribbon */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Semester Switcher (1 – 8)
            </span>
            <span className="text-[11px] text-slate-400">
              Each semester retains independent subjects and grades
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {([1, 2, 3, 4, 5, 6, 7, 8] as SemesterNumber[]).map((semNum) => {
              const isSelected = selectedSemester === semNum;
              const semSubjs = allSubjects.filter((s) => s.semesterNumber === semNum);
              const totalCreds = semSubjs.reduce((acc, s) => acc + (s.credits || 0), 0);
              const yr = getYearForSemester(semNum);

              return (
                <button
                  key={semNum}
                  type="button"
                  onClick={() => setSelectedSemester(semNum)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold scale-[1.02]'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    Y{yr}
                  </span>
                  <span className="text-sm font-extrabold font-mono leading-none my-0.5">
                    Sem {semNum}
                  </span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>
                    {semSubjs.length} sub · {totalCreds}c
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Semester Performance KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Semester Enrolled Subjects */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Semester {selectedSemester} Subjects</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {semesterSubjects.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">courses in Sem {selectedSemester}</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 truncate">
            Year {selectedYear} · independent curriculum
          </p>
        </div>

        {/* Metric 2: Semester Registered Credits */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Semester Credits</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {semesterCredits}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">credits enrolled</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 truncate">
            Degree requirement credit load
          </p>
        </div>

        {/* Metric 3: Semester Attendance */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Average Attendance</span>
            {semesterAttendance >= 75 ? (
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                semesterAttendance >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {semesterAttendance}%
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {semesterAttendance >= 75 ? 'Safe (≥75%)' : 'Shortage'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 truncate">
            {subjectsNeedingAttention.length === 0 ? 'All subjects meet 75% threshold' : `${subjectsNeedingAttention.length} subject(s) require attendance`}
          </p>
        </div>

        {/* Metric 4: Semester GPA & Cumulative CGPA */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Semester GPA & CGPA</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {semesterGpa !== null ? semesterGpa.toFixed(2) : 'Active'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              / CGPA: <strong className="text-indigo-600 dark:text-indigo-400">{profile.currentCgpa.toFixed(2)}</strong>
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            <span>Target: {profile.targetCgpa.toFixed(2)}</span>
            <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
              {cgpaGap > 0 ? `+${cgpaGap.toFixed(2)} gap` : 'Met 🎯'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search Sem ${selectedSemester} subjects, codes, faculty...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category Dropdown Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 lg:pt-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All ({semesterSubjects.length})
          </button>
          <button
            onClick={() => setFilterType('safe')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              filterType === 'safe'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Safe Attendance (≥75%)
          </button>
          <button
            onClick={() => setFilterType('warning')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              filterType === 'warning'
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Attendance Warning
          </button>
          <button
            onClick={() => setFilterType('completed-goals')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              filterType === 'completed-goals'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Goals Met 🎯
          </button>
        </div>
      </div>

      {/* Subjects Grid for Selected Semester */}
      {filteredSubjects.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredSubjects.map((subject) => {
            const styles = colorStyles[subject.color] || colorStyles.indigo;
            const isSafe = subject.attendancePercentage >= 75;

            return (
              <div
                key={subject.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all space-y-4 group"
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold ${styles.badge}`}>
                        {subject.courseCode}
                      </span>
                      {subject.category && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {subject.category}
                        </span>
                      )}
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 font-mono">
                        {subject.credits} Credits
                      </span>
                      {subject.grade && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            subject.grade === 'S' || subject.grade === 'A'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : subject.grade === 'In Progress'
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          Grade: {subject.grade}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight">
                      {subject.name}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{subject.facultyName || 'Faculty not assigned'}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(subject)}
                      className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Subject Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(subject)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Attendance Gauge */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Attendance</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSafe
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {isSafe ? 'Eligible for Exams (≥75%)' : 'Attendance Shortage (<75%)'}
                      </span>
                    </div>
                    <div className="font-mono text-slate-600 dark:text-slate-300 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {subject.classesAttended ?? 0}
                      </span>
                      <span> / {subject.totalClasses ?? 0}</span>
                      <span className="ml-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                        ({subject.attendancePercentage}%)
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSafe ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, subject.attendancePercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Continuous Assessments & Marks */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Continuous Assessments & Marks
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">CAT-1 (50)</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        {subject.assessmentMarks?.cat1 ?? '—'}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">CAT-2 (50)</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        {subject.assessmentMarks?.cat2 ?? '—'}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">DA / Quiz (30)</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        {subject.assessmentMarks?.da ?? '—'}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Lab / Assgn</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">
                        {subject.assessmentMarks?.labMarks || subject.assessmentMarks?.assignmentScore || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Exam Dates & Deadlines */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>CAT-1: {subject.examDates?.cat1Date || 'TBD'}</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-violet-500" />
                    <span>CAT-2: {subject.examDates?.cat2Date || 'TBD'}</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    <span>FAT / Final: {subject.examDates?.fatDate || subject.examDates?.finalExamDate || 'TBD'}</span>
                  </div>
                </div>

                {/* Personal Study Goal with Interactive Goal Tracking */}
                {subject.studyGoal && (
                  <div
                    onClick={() => toggleSubjectGoal(subject.id)}
                    className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                      subject.goalCompleted
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200'
                        : 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-200 hover:border-indigo-300'
                    }`}
                    title="Click to toggle goal completion status"
                  >
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
                    >
                      {subject.goalCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </button>
                    <div className="flex-1 leading-snug">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] uppercase tracking-wider block mb-0.5 opacity-75">
                          Personal Study Goal
                        </span>
                        <span className="text-[10px] font-bold font-mono">
                          {subject.goalCompleted ? 'Completed ✓' : 'In Progress'}
                        </span>
                      </div>
                      <p className={subject.goalCompleted ? 'line-through opacity-80' : ''}>
                        {subject.studyGoal}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <GraduationCap className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No subjects found for Semester {selectedSemester}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'all' || filterType !== 'all'
              ? 'Try modifying your search query or reset the filter.'
              : `Semester ${selectedSemester} currently has no registered subjects. Add courses for Year ${selectedYear}.`}
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            Add Subject to Sem {selectedSemester}
          </button>
        </div>
      )}

      {/* 8-Semester Transcript & Progression Overview Modal */}
      {transcriptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans">
                    8-Semester Degree Progression & Transcript
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Comprehensive overview of all 4 college years and cumulative CGPA
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTranscriptModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              {/* CGPA Summary Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-slate-50 to-emerald-50 dark:from-indigo-950/40 dark:via-slate-800/40 dark:to-emerald-950/30 border border-indigo-200/70 dark:border-indigo-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Cumulative Academic Record
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                      {profile.currentCgpa.toFixed(2)}
                    </span>
                    <span className="text-xs font-mono text-slate-500">/ Target: {profile.targetCgpa.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTranscriptModalOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Adjust Target CGPA
                  </button>
                </div>
              </div>

              {/* 8-Semesters Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Semester</th>
                      <th className="py-3 px-4">Academic Year</th>
                      <th className="py-3 px-4">Subjects</th>
                      <th className="py-3 px-4">Credits</th>
                      <th className="py-3 px-4">Avg Attendance</th>
                      <th className="py-3 px-4">Semester GPA</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {allSemestersStats.map((stat) => (
                      <tr
                        key={stat.semesterNumber}
                        className={`transition-colors ${
                          stat.isCurrent
                            ? 'bg-indigo-50/60 dark:bg-indigo-950/30 font-semibold'
                            : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 font-bold font-mono">
                            <span>Semester {stat.semesterNumber}</span>
                            {stat.isCurrent && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-600 text-white font-bold">
                                Active
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                          Year {stat.year} ({stat.year === 1 ? '1st' : stat.year === 2 ? '2nd' : stat.year === 3 ? '3rd' : '4th'} Yr)
                        </td>
                        <td className="py-3 px-4 font-mono">{stat.subjectCount} courses</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {stat.totalCredits}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span
                            className={
                              stat.avgAttendance >= 75
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }
                          >
                            {stat.avgAttendance}%
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">
                          {stat.gpa !== null ? (
                            <span className="text-emerald-600 dark:text-emerald-400">{stat.gpa.toFixed(2)}</span>
                          ) : (
                            <span className="text-slate-400 font-normal">In Progress</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedSemester(stat.semesterNumber);
                              setTranscriptModalOpen(false);
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors cursor-pointer"
                          >
                            Switch to Sem
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans">
                    {modalMode === 'add' ? `Add Subject to Semester ${formData.semesterNumber}` : 'Edit Subject Curriculum & Grades'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Year {getYearForSemester(formData.semesterNumber as SemesterNumber)} · Semester {formData.semesterNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              {/* Semester Assignment */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Academic Semester
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {([1, 2, 3, 4, 5, 6, 7, 8] as SemesterNumber[]).map((sem) => (
                    <button
                      key={sem}
                      type="button"
                      onClick={() => setFormData({ ...formData, semesterNumber: sem })}
                      className={`py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        formData.semesterNumber === sem
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      Sem {sem}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Title & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Operating Systems / Artificial Intelligence"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CSE2004"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
                  />
                </div>
              </div>

              {/* Category, Credits, Faculty */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CourseCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty Name
                  </label>
                  <input
                    type="text"
                    placeholder="Prof. / Dr."
                    value={formData.facultyName}
                    onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Grading & GPA Integration */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Grading & Academic Performance
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Letter Grade
                    </label>
                    <select
                      value={formData.grade}
                      onChange={(e) => {
                        const gr = e.target.value;
                        const pts: Record<string, number | undefined> = {
                          S: 10,
                          A: 9,
                          B: 8,
                          C: 7,
                          D: 6,
                          E: 5,
                          F: 0,
                          'In Progress': undefined,
                        };
                        setFormData({
                          ...formData,
                          grade: gr,
                          gradePoint: pts[gr],
                        });
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                    >
                      <option value="In Progress">In Progress (Active Semester)</option>
                      <option value="S">S Grade (10.0)</option>
                      <option value="A">A Grade (9.0)</option>
                      <option value="B">B Grade (8.0)</option>
                      <option value="C">C Grade (7.0)</option>
                      <option value="D">D Grade (6.0)</option>
                      <option value="E">E Grade (5.0)</option>
                      <option value="F">F Grade (0.0)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Grade Point (0.0 – 10.0 scale)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="Auto or manual point"
                      value={formData.gradePoint ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gradePoint: e.target.value === '' ? undefined : Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Attendance Tracker */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Attendance Tracking (75% Rule)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Classes Attended
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.classesAttended}
                      onChange={(e) => setFormData({ ...formData, classesAttended: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Total Classes Held
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.totalClasses}
                      onChange={(e) => setFormData({ ...formData, totalClasses: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Assessment Marks */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Continuous Assessment Marks
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">CAT-1 (/50)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.assessmentMarks?.cat1 ?? 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assessmentMarks: {
                            ...formData.assessmentMarks,
                            cat1: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">CAT-2 (/50)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.assessmentMarks?.cat2 ?? 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assessmentMarks: {
                            ...formData.assessmentMarks,
                            cat2: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">DA / Quiz (/30)</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={formData.assessmentMarks?.da ?? 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assessmentMarks: {
                            ...formData.assessmentMarks,
                            da: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Lab / Assgn</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.assessmentMarks?.labMarks ?? 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          assessmentMarks: {
                            ...formData.assessmentMarks,
                            labMarks: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full px-2 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Exam Dates & Deadlines */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    CAT-1 Exam Date
                  </label>
                  <input
                    type="date"
                    value={formData.examDates?.cat1Date || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        examDates: { ...formData.examDates, cat1Date: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    CAT-2 Exam Date
                  </label>
                  <input
                    type="date"
                    value={formData.examDates?.cat2Date || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        examDates: { ...formData.examDates, cat2Date: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    FAT / Final Exam Date
                  </label>
                  <input
                    type="date"
                    value={formData.examDates?.fatDate || formData.examDates?.finalExamDate || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        examDates: {
                          ...formData.examDates,
                          fatDate: e.target.value,
                          finalExamDate: e.target.value,
                        },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Assignment Due Date */}
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Assignment / Project Submission Deadline
                </label>
                <input
                  type="date"
                  value={formData.examDates?.assignmentDueDate || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      examDates: { ...formData.examDates, assignmentDueDate: e.target.value },
                    })
                  }
                  className="w-full sm:w-1/2 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                />
              </div>

              {/* Personal Study Goal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Personal Study Goal & Milestones
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Master balanced binary search trees, Dijkstra graphs, and dynamic programming."
                  value={formData.studyGoal}
                  onChange={(e) => setFormData({ ...formData, studyGoal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Color Accent */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Color Tag
                </label>
                <div className="flex items-center gap-2">
                  {(['indigo', 'emerald', 'amber', 'rose', 'sky', 'violet'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-6 h-6 rounded-full capitalize transition-transform cursor-pointer ${
                        formData.color === c ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : ''
                      } ${
                        c === 'indigo'
                          ? 'bg-indigo-600'
                          : c === 'emerald'
                          ? 'bg-emerald-600'
                          : c === 'amber'
                          ? 'bg-amber-600'
                          : c === 'rose'
                          ? 'bg-rose-600'
                          : c === 'sky'
                          ? 'bg-sky-600'
                          : 'bg-violet-600'
                      }`}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{modalMode === 'add' ? 'Add Subject' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

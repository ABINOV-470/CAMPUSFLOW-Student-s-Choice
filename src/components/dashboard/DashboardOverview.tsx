import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AnimatedCard, AnimatedCardContainer } from '../common/AnimatedCard';
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  MapPin,
  ChevronRight,
  TrendingUp,
  Play,
  Award,
  Plus,
  Flame,
  Check,
  GraduationCap,
  Target,
  Sliders,
  ShieldCheck,
  BookOpen,
  Layers,
  CalendarCheck,
  AlertCircle,
  Briefcase,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const {
    profile,
    currentDayName,
    todayClasses,
    tasks,
    toggleTask,
    addTask,
    events,
    toggleEventRegistration,
    clubs,
    todayFocusMinutes,
    vitSubjects,
    allSubjects,
    semesterSubjects,
    selectedYear,
    selectedSemester,
    setSelectedYear,
    setSelectedSemester,
    semesterCredits,
    semesterAttendance,
    semesterGpa,
    cgpaGap,
    overallAttendanceRate,
    setProfileModalOpen,
    setActiveTab,
  } = useApp();

  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskCourse, setQuickTaskCourse] = useState('CSE2001');

  // Time-based greeting
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate current time string "HH:MM"
  const now = new Date();
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedCount = tasks.filter((t) => t.completed).length;
  const urgentTasks = pendingTasks.filter((t) => t.priority === 'urgent' || t.priority === 'high');
  const featuredEvent = events.find((e) => e.featured) || events[0];

  // Daily study progress percentage
  const studyProgress = Math.min(100, Math.round((todayFocusMinutes / profile.dailyStudyGoalMinutes) * 100));

  // Upcoming exams for the selected semester
  const semesterExams = useMemo(() => {
    const list: { courseCode: string; subjectName: string; examName: string; date: string }[] = [];
    semesterSubjects.forEach((s) => {
      if (s.examDates?.cat1Date) {
        list.push({ courseCode: s.courseCode, subjectName: s.name, examName: 'CAT-1', date: s.examDates.cat1Date });
      }
      if (s.examDates?.cat2Date) {
        list.push({ courseCode: s.courseCode, subjectName: s.name, examName: 'CAT-2', date: s.examDates.cat2Date });
      }
      const fat = s.examDates?.fatDate || s.examDates?.finalExamDate;
      if (fat) {
        list.push({ courseCode: s.courseCode, subjectName: s.name, examName: 'Final Exam / FAT', date: fat });
      }
    });
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [semesterSubjects]);

  // Assignments / Deadlines related to the semester's subjects
  const semesterAssignments = useMemo(() => {
    const list: { courseCode: string; subjectName: string; title: string; dueDate: string }[] = [];
    semesterSubjects.forEach((s) => {
      if (s.examDates?.assignmentDueDate) {
        list.push({
          courseCode: s.courseCode,
          subjectName: s.name,
          title: `${s.courseCode} Digital Assignment Submission`,
          dueDate: s.examDates.assignmentDueDate,
        });
      }
    });
    return list;
  }, [semesterSubjects]);

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    addTask({
      title: quickTaskTitle.trim(),
      courseCode: quickTaskCourse,
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      priority: 'medium',
      tags: ['Study'],
      estimatedMinutes: 45,
    });
    setQuickTaskTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner with Campus Quad Visual */}
      <AnimatedCard index={0} enableHoverEffect={false} className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl shadow-slate-950/10 group">
        <img
          src={profile.bannerUrl}
          alt="Campus Quad"
          className="absolute inset-0 w-full h-full object-cover opacity-30 filter brightness-90 contrast-105 group-hover:scale-105 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />

        <div className="relative z-10 p-6 sm:p-8 lg:p-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2.5">
            <span>{profile.university}</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="font-bold text-white bg-indigo-500/30 px-2 py-0.5 rounded border border-indigo-400/40">
              Year {selectedYear} · Semester {selectedSemester}
            </span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="text-slate-300 font-normal capitalize">{todayFormatted}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 font-sans">
            {greeting}, {profile.name.split(' ')[0]}.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6 max-w-xl">
            You are viewing <span className="font-semibold text-white">Semester {selectedSemester}</span> with <span className="font-semibold text-white">{semesterSubjects.length} enrolled courses</span> ({semesterCredits} credits) and <span className="font-semibold text-white">{pendingTasks.length} pending deliverables</span>.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('timer')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs transition-all shadow-md active:scale-[0.98] hover:shadow-indigo-500/10 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current text-indigo-600" />
              <span>Start Study Sprint</span>
            </button>
            <button
              onClick={() => setActiveTab('timetable')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium text-xs backdrop-blur-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>View Full Timetable</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10 text-xs text-slate-300 ml-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>4-Day Study Streak</span>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* 4 Key Metrics Overview Cards */}
      <AnimatedCardContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Classes Today */}
        <AnimatedCard
          onClick={() => setActiveTab('timetable')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700/60 shadow-sm transition-colors duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Classes Today</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-transform group-hover:scale-105">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
              {todayClasses.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {currentDayName === 'Sat' || currentDayName === 'Sun' ? 'Mon preview' : currentDayName}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">
            {todayClasses.length > 0
              ? `Next: ${todayClasses[0].courseCode} at ${todayClasses[0].startTime}`
              : 'No scheduled classes today'}
          </p>
        </AnimatedCard>

        {/* Metric 2: Pending Tasks */}
        <AnimatedCard
          onClick={() => setActiveTab('tasks')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-rose-300 dark:hover:border-rose-700/60 shadow-sm transition-colors duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Deliverables</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-transform group-hover:scale-105">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
              {pendingTasks.length}
            </span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              {urgentTasks.length} urgent
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">
            {urgentTasks.length > 0 ? urgentTasks[0].title : 'All high priority tasks completed'}
          </p>
        </AnimatedCard>

        {/* Metric 3: Focus Study Time */}
        <AnimatedCard
          onClick={() => setActiveTab('timer')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-300 dark:hover:border-amber-700/60 shadow-sm transition-colors duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Study Focus Today</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-transform group-hover:scale-105">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
              {todayFocusMinutes}m
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              / {profile.dailyStudyGoalMinutes}m goal
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${studyProgress}%` }}
            />
          </div>
        </AnimatedCard>

        {/* Metric 4: Academic CGPA & Milestone */}
        <AnimatedCard
          onClick={() => setProfileModalOpen(true)}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700/60 shadow-sm transition-colors duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">CGPA Standing & Target</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-105">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {profile.currentCgpa.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              / Target: <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">{profile.targetCgpa.toFixed(2)}</strong>
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              {cgpaGap > 0 ? `+${cgpaGap.toFixed(2)} needed` : 'Goal met! 🎯'}
            </span>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-0.5">
              <span>Tune</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </AnimatedCard>
      </AnimatedCardContainer>

      {/* Academic Milestone, 4-Year/8-Semester Hub & CGPA Progress */}
      <AnimatedCard enableHoverEffect={false} className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white via-indigo-50/20 to-slate-50 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
        {/* Hub Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-[11px] font-bold">
                College Degree Workspace
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                4-Year Degree · Semesters 1 – 8
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Academic Management, CGPA & Semester Track</span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('coach')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-all cursor-pointer shadow-xs"
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>CGPA Coach</span>
            </button>
            <button
              onClick={() => setActiveTab('career')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 text-violet-700 dark:text-violet-300 text-xs font-semibold hover:bg-violet-100 transition-all cursor-pointer shadow-xs"
            >
              <Briefcase className="w-3.5 h-3.5 text-violet-500" />
              <span>Career Roadmap</span>
            </button>
            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>Edit Goals</span>
            </button>
            <button
              onClick={() => setActiveTab('subjects')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>All 8 Semesters</span>
            </button>
          </div>
        </div>

        {/* Year & Semester Selector Tabs */}
        <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>Active Semester View</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Viewing: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">Year {selectedYear} · Semester {selectedSemester}</strong>
            </span>
          </div>

          {/* 8-Semester Interactive Switcher */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((sem) => {
              const isSelected = selectedSemester === sem;
              const subCount = allSubjects.filter((s) => s.semesterNumber === sem).length;
              const yr = sem <= 2 ? 1 : sem <= 4 ? 2 : sem <= 6 ? 3 : 4;
              return (
                <button
                  key={sem}
                  type="button"
                  onClick={() => setSelectedSemester(sem)}
                  className={`p-2 rounded-xl text-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold scale-[1.02]'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                  }`}
                >
                  <span className={`text-[9px] uppercase font-semibold block ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    Y{yr}
                  </span>
                  <span className="text-xs font-mono font-bold block">
                    Sem {sem}
                  </span>
                  <span className={`text-[10px] font-mono block ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {subCount} subj
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CGPA Progress & Numerical Gap Visual Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          {/* Current CGPA */}
          <div className="md:col-span-3 space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Current CGPA
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {profile.currentCgpa.toFixed(2)}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-400">/ 10.00</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Cumulative score across semesters
            </span>
          </div>

          {/* Visual Progress Bar & Gap */}
          <div className="md:col-span-6 space-y-2 px-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Target Progress: <strong className="text-slate-900 dark:text-white font-mono">{Math.min(100, Math.round((profile.currentCgpa / profile.targetCgpa) * 100))}%</strong>
              </span>
              {cgpaGap > 0 ? (
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60">
                  +{cgpaGap.toFixed(2)} CGPA gap
                </span>
              ) : (
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60">
                  Target Met! 🎯
                </span>
              )}
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-700/80 rounded-full h-3 overflow-hidden flex">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, Math.round((profile.currentCgpa / profile.targetCgpa) * 100)))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>0.00</span>
              <span>10.00 Target Goal</span>
              <span>10.00</span>
            </div>
          </div>

          {/* Target CGPA */}
          <div className="md:col-span-3 space-y-1 md:text-right">
            <div className="flex items-center md:justify-end gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Target CGPA
              </span>
            </div>
            <div className="flex items-baseline md:justify-end gap-1.5">
              <span className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
                {profile.targetCgpa.toFixed(2)}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-400">/ 10.00</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
              Aspirational graduation goal
            </span>
          </div>
        </div>

        {/* 3-Column Semester Spotlight: Relevant Subjects, Upcoming Exams, and Pending Assignments */}
        <AnimatedCardContainer className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Card 1: Relevant Subjects for Selected Semester */}
          <AnimatedCard className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Sem {selectedSemester} Courses ({semesterSubjects.length})</span>
              </span>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {semesterCredits} Credits
              </span>
            </div>

            {/* Attendance pill */}
            <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">Semester Attendance:</span>
              <span
                className={`font-mono font-bold ${
                  semesterAttendance >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {semesterAttendance}% {semesterAttendance >= 75 ? '✓ (Safe)' : '⚠ (Shortage)'}
              </span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {semesterSubjects.map((subj) => (
                <div
                  key={subj.id}
                  onClick={() => setActiveTab('subjects')}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-400 transition-colors cursor-pointer group flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {subj.courseCode}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {subj.credits}c
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {subj.name}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                      subj.attendancePercentage >= 75
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {subj.attendancePercentage}%
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('subjects')}
              className="w-full py-1.5 text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1"
            >
              <span>Manage Semester {selectedSemester} Subjects</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </AnimatedCard>

          {/* Card 2: Upcoming Exams for Selected Semester */}
          <AnimatedCard className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                <span>Upcoming Semester Exams</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {semesterExams.length} Scheduled
              </span>
            </div>

            {semesterExams.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {semesterExams.slice(0, 4).map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                          {ex.examName}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {ex.courseCode}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate mt-0.5">
                        {ex.subjectName}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 block">
                        {ex.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                No exam dates recorded for Semester {selectedSemester}.
              </div>
            )}
          </AnimatedCard>

          {/* Card 3: Pending Assignments & Deliverables */}
          <AnimatedCard className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                <span>Assignments & Deadlines</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {pendingTasks.length} pending
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {semesterAssignments.length > 0 ? (
                semesterAssignments.slice(0, 3).map((a, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        {a.courseCode} Assignment
                      </span>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        {a.subjectName}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 shrink-0">
                      Due {a.dueDate}
                    </span>
                  </div>
                ))
              ) : null}

              {pendingTasks.slice(0, 2).map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2 cursor-pointer hover:border-slate-300"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      {task.courseCode}
                    </span>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                      {task.title}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {task.dueDate}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('tasks')}
              className="w-full py-1.5 text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1"
            >
              <span>View Tasks Planner</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </AnimatedCard>
        </AnimatedCardContainer>
      </AnimatedCard>

      {/* Main Grid: Today's Schedule + High Priority Tasks */}
      <AnimatedCardContainer className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Class Schedule (7 cols) */}
        <AnimatedCard enableHoverEffect={false} className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans">
                  Today's Schedule
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {currentDayName === 'Sat' || currentDayName === 'Sun' ? 'Monday Preview' : todayFormatted}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('timetable')}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group"
              >
                <span>Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {todayClasses.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <CalendarClock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  No classes scheduled for today
                </p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Take advantage of this study block or add extra labs to your calendar.
                </p>
                <button
                  onClick={() => setActiveTab('timetable')}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-100 transition-colors"
                >
                  Add a Class
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayClasses.map((cls, idx) => {
                  // Check if in session
                  const isCurrent =
                    currentTimeStr >= cls.startTime && currentTimeStr <= cls.endTime;

                  return (
                    <div
                      key={cls.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                        isCurrent
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 shadow-sm'
                          : 'border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                            {cls.courseCode}
                          </span>
                          <span className="text-slate-400 dark:text-slate-500">·</span>
                          <span className="text-slate-600 dark:text-slate-300">{cls.type}</span>
                          <span className="text-slate-400 dark:text-slate-500">·</span>
                          <span className="text-slate-500 dark:text-slate-400 truncate">{cls.instructor}</span>
                          {isCurrent && (
                            <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/80 px-2 py-0.2 rounded-md">
                              In Session Now
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1 truncate">
                          {cls.courseName}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{cls.room}, {cls.building}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                          {cls.startTime} - {cls.endTime}
                        </div>
                        <span className="inline-block mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-700">
                          Slot #{idx + 1}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{todayClasses.length} lecture & lab hours scheduled</span>
            <button
              onClick={() => setActiveTab('timetable')}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Open week grid
            </button>
          </div>
        </AnimatedCard>

        {/* Right Column: High Priority Tasks Checklist (5 cols) */}
        <AnimatedCard enableHoverEffect={false} className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans">
                  Priority Tasks
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Due soon or requires immediate focus
                </p>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
              >
                View all ({tasks.length})
              </button>
            </div>

            {/* Quick add inline bar */}
            <form onSubmit={handleQuickAddTask} className="flex items-center gap-2 mb-3">
              <input
                type="text"
                placeholder="Quick add assignment..."
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!quickTaskTitle.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-colors"
                title="Add task"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="space-y-2">
              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                    task.completed
                      ? 'bg-slate-50/40 dark:bg-slate-800/20 border-slate-200/50 dark:border-slate-800/60'
                      : 'border-slate-200/70 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTask(task.id);
                    }}
                    className="mt-0.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0"
                    aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium leading-snug transition-colors ${
                        task.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                        {task.courseCode}
                      </span>
                      <span>·</span>
                      <span className="tabular-nums">Due {task.dueDate}</span>
                      {task.priority === 'urgent' && (
                        <>
                          <span>·</span>
                          <span className="text-rose-600 dark:text-rose-400 font-semibold">Urgent</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              <strong className="text-slate-900 dark:text-slate-200 tabular-nums">{completedCount}</strong> of{' '}
              <strong className="text-slate-900 dark:text-slate-200 tabular-nums">{tasks.length}</strong> tasks completed
            </span>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 group"
            >
              <span>Manage all</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </AnimatedCard>
      </AnimatedCardContainer>

      {/* Featured Event Spotlight + Campus Club Quick Discovery */}
      <AnimatedCardContainer className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Featured Event Card */}
        {featuredEvent && (
          <AnimatedCard enableHoverEffect={false} className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm flex flex-col md:flex-row group hover:shadow-md transition-shadow">
            <div className="md:w-5/12 relative h-48 md:h-auto bg-slate-900 overflow-hidden">
              {featuredEvent.imageUrl ? (
                <img
                  src={featuredEvent.imageUrl}
                  alt={featuredEvent.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-950 text-indigo-400">
                  <Calendar className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-semibold">
                Featured Event
              </div>
            </div>

            <div className="md:w-7/12 p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">
                  <span>{featuredEvent.category}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 dark:text-slate-400">{featuredEvent.organizer}</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 font-sans">
                  {featuredEvent.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {featuredEvent.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{featuredEvent.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{featuredEvent.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-900 dark:text-slate-200 tabular-nums">{featuredEvent.spotsLeft}</strong> spots remaining
                </span>
                <button
                  onClick={() => toggleEventRegistration(featuredEvent.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                    featuredEvent.registered
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30'
                  }`}
                >
                  {featuredEvent.registered ? 'Registered ✓' : 'Register for Event'}
                </button>
              </div>
            </div>
          </AnimatedCard>
        )}

        {/* Club Spotlight (4 cols) */}
        <AnimatedCard enableHoverEffect={false} className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans">
                Student Organizations
              </h3>
              <button
                onClick={() => setActiveTab('clubs')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Explore all
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Connect with fellow students, collaborate on engineering rovers, or join design critiques.
            </p>

            <div className="space-y-3">
              {clubs.slice(0, 2).map((club) => (
                <div
                  key={club.id}
                  onClick={() => setActiveTab('clubs')}
                  className="p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      {club.category}
                    </span>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {club.memberCount} members
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {club.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {club.tagline}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('clubs')}
            className="w-full mt-4 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center"
          >
            Browse All {clubs.length} Student Clubs
          </button>
        </AnimatedCard>
      </AnimatedCardContainer>
    </div>
  );
};

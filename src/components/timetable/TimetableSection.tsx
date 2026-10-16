import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DayOfWeek, TimetableClass, ClassType, StudySession, StudySessionType, Priority } from '../../types';
import { validateTimeRange } from '../../utils/timetableScheduler';
import {
  Plus,
  Trash2,
  MapPin,
  Clock,
  User,
  Calendar,
  Grid,
  List,
  Search,
  BookOpen,
  X,
  Check,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
  Sliders,
  Filter,
  CheckCircle2,
  Circle,
  Briefcase,
  Layers,
  CalendarClock,
  Edit3,
} from 'lucide-react';

export const TimetableSection: React.FC = () => {
  const {
    timetable,
    addClass,
    updateClass,
    deleteClass,
    studySessions,
    addStudySession,
    updateStudySession,
    deleteStudySession,
    toggleStudySessionCompleted,
    generateStudyPlan,
    replanMissedStudySessions,
    currentDayName,
    semesterSubjects,
    profile,
    setProfileModalOpen,
    selectedSemester,
  } = useApp();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(
    currentDayName === 'Sun' || currentDayName === 'Sat' ? 'Mon' : currentDayName
  );
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [filterMode, setFilterMode] = useState<'all' | 'classes' | 'study'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isAddStudyModalOpen, setIsAddStudyModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);

  // Form state for adding college class
  const [classForm, setClassForm] = useState({
    courseCode: '',
    courseName: '',
    instructor: '',
    room: '',
    building: '',
    dayOfWeek: selectedDay,
    startTime: '09:00',
    endTime: '10:30',
    type: 'Lecture' as ClassType,
    color: 'indigo' as TimetableClass['color'],
    notes: '',
  });

  // Form state for manual study session
  const [studyForm, setStudyForm] = useState({
    courseCode: semesterSubjects[0]?.courseCode || 'CSE2001',
    subjectName: semesterSubjects[0]?.name || 'Data Structures',
    dayOfWeek: selectedDay,
    startTime: '16:00',
    endTime: '17:15',
    sessionType: 'Revision' as StudySessionType,
    priority: 'high' as Priority,
    rationale: 'Personal revision and practice problems',
  });

  const days: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Handle submit add class
  const handleSubmitClass = (e: React.FormEvent) => {
    e.preventDefault();
    const val = validateTimeRange(classForm.startTime, classForm.endTime);
    if (!val.valid) {
      setTimeError(val.error || 'Invalid class timings');
      return;
    }
    if (!classForm.courseCode.trim() || !classForm.courseName.trim()) return;

    addClass({
      courseCode: classForm.courseCode.trim().toUpperCase(),
      courseName: classForm.courseName.trim(),
      instructor: classForm.instructor.trim() || 'Staff Faculty',
      room: classForm.room.trim() || 'Hall TBA',
      building: classForm.building.trim() || 'Campus Center',
      dayOfWeek: classForm.dayOfWeek,
      startTime: classForm.startTime,
      endTime: classForm.endTime,
      type: classForm.type,
      color: classForm.color,
      notes: classForm.notes.trim() || undefined,
    });

    setIsAddClassModalOpen(false);
    setTimeError(null);
  };

  // Handle submit add study session
  const handleSubmitStudySession = (e: React.FormEvent) => {
    e.preventDefault();
    const val = validateTimeRange(studyForm.startTime, studyForm.endTime);
    if (!val.valid) {
      setTimeError(val.error || 'Invalid session timings');
      return;
    }

    const [sh, sm] = studyForm.startTime.split(':').map(Number);
    const [eh, em] = studyForm.endTime.split(':').map(Number);
    const duration = (eh * 60 + em) - (sh * 60 + sm);

    addStudySession({
      courseCode: studyForm.courseCode,
      subjectName: studyForm.subjectName,
      dayOfWeek: studyForm.dayOfWeek,
      startTime: studyForm.startTime,
      endTime: studyForm.endTime,
      durationMinutes: duration,
      sessionType: studyForm.sessionType,
      priority: studyForm.priority,
      completed: false,
      isAiGenerated: false,
      rationale: studyForm.rationale.trim() || 'Scheduled study session',
    });

    setIsAddStudyModalOpen(false);
    setTimeError(null);
  };

  // Save session edits
  const handleSaveSessionEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    const val = validateTimeRange(editingSession.startTime, editingSession.endTime);
    if (!val.valid) {
      setTimeError(val.error || 'Invalid session timings');
      return;
    }

    const [sh, sm] = editingSession.startTime.split(':').map(Number);
    const [eh, em] = editingSession.endTime.split(':').map(Number);
    const duration = (eh * 60 + em) - (sh * 60 + sm);

    updateStudySession(editingSession.id, {
      ...editingSession,
      durationMinutes: duration,
    });
    setEditingSession(null);
    setTimeError(null);
  };

  // Filter day items
  const dayClasses = useMemo(() => {
    return timetable
      .filter((c) => c.dayOfWeek === selectedDay)
      .filter(
        (c) =>
          !searchQuery ||
          c.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [timetable, selectedDay, searchQuery]);

  const dayStudySessions = useMemo(() => {
    return studySessions
      .filter((s) => s.dayOfWeek === selectedDay)
      .filter(
        (s) =>
          !searchQuery ||
          s.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.rationale && s.rationale.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  }, [studySessions, selectedDay, searchQuery]);

  // Combined timeline for selected day
  type TimelineItem =
    | { kind: 'class'; data: TimetableClass; startTime: string }
    | { kind: 'study'; data: StudySession; startTime: string };

  const dayTimeline: TimelineItem[] = useMemo(() => {
    const list: TimelineItem[] = [];
    if (filterMode === 'all' || filterMode === 'classes') {
      dayClasses.forEach((c) => list.push({ kind: 'class', data: c, startTime: c.startTime }));
    }
    if (filterMode === 'all' || filterMode === 'study') {
      dayStudySessions.forEach((s) => list.push({ kind: 'study', data: s, startTime: s.startTime }));
    }
    return list.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [dayClasses, dayStudySessions, filterMode]);

  // Session type badges
  const sessionTypeBadges: Record<StudySessionType, { bg: string; text: string }> = {
    'Revision': { bg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300', text: 'Revision' },
    'Exam Prep': { bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300', text: 'Exam Prep' },
    'Assignment / Project': { bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300', text: 'Assignment' },
    'Career Learning': { bg: 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300', text: 'Career Skill' },
    'Practice Problems': { bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300', text: 'Problem Set' },
    'Class': { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700', text: 'Class' },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & AI Scheduler Actions */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <CalendarClock className="w-4 h-4" />
              <span>Smart Timetable & Spaced Revision Planner</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
              Schedule & AI Study Plan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Preserves your official college classes and automatically schedules conflict-free revision, exam prep, and {profile.targetRole || 'career'} milestones.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={replanMissedStudySessions}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              title="Reschedules incomplete sessions to upcoming free slots"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-500" />
              <span>Replan Missed</span>
            </button>

            <button
              onClick={generateStudyPlan}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 active:scale-98 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>Generate Smart Study Plan</span>
            </button>

            <button
              onClick={() => setIsAddClassModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:border-slate-300 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Add Class</span>
            </button>
          </div>
        </div>

        {/* Study Preferences Summary Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Scheduler Constraints:</span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              Max: {profile.maxDailyStudyHours || 4}h/day
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300">
              Break: {profile.studyBreakDurationMinutes || 15}m
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
              Career: {profile.weeklyCareerHours || 6}h/week
            </span>
          </div>

          <button
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <Sliders className="w-3 h-3" />
            <span>Customize Timing Windows</span>
          </button>
        </div>

        {/* 7-Day Day Selector Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px]">
              Select Day of Week
            </span>
            <div className="flex items-center gap-2">
              {/* Filter mode pill */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filterMode === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  All ({dayTimeline.length})
                </button>
                <button
                  onClick={() => setFilterMode('classes')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filterMode === 'classes'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Classes ({dayClasses.length})
                </button>
                <button
                  onClick={() => setFilterMode('study')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    filterMode === 'study'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Study Plan ({dayStudySessions.length})
                </button>
              </div>

              {/* View mode toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px]">
                <button
                  onClick={() => setViewMode('day')}
                  className={`p-1 rounded-md ${
                    viewMode === 'day' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                  }`}
                  title="Daily Timeline View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`p-1 rounded-md ${
                    viewMode === 'week' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                  }`}
                  title="Weekly Grid View"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = currentDayName === day;
              const classCount = timetable.filter((c) => c.dayOfWeek === day).length;
              const studyCount = studySessions.filter((s) => s.dayOfWeek === day).length;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`p-2.5 sm:p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold scale-[1.02]'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                  }`}
                >
                  <span className={`text-[10px] uppercase font-bold block ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {day}
                  </span>
                  <span className="text-sm font-mono font-extrabold block my-0.5">
                    {isToday ? 'Today' : day}
                  </span>
                  <span className={`text-[10px] font-mono block ${isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {classCount}c · {studyCount}s
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search and Quick Add Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search classes, topics, or faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-end">
          <button
            onClick={() => setIsAddStudyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Study Block</span>
          </button>
        </div>
      </div>

      {/* Main View: Day Timeline or Week Grid */}
      {viewMode === 'day' ? (
        <div className="space-y-3">
          {dayTimeline.length > 0 ? (
            <div className="space-y-3">
              {dayTimeline.map((item, idx) => {
                if (item.kind === 'class') {
                  const c = item.data;
                  return (
                    <div
                      key={`class-${c.id}`}
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-slate-300"
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        {/* Time slot indicator */}
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-center shrink-0 min-w-20">
                          <span className="text-xs font-extrabold block">{c.startTime}</span>
                          <span className="text-[10px] text-indigo-500/80 block">{c.endTime}</span>
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                              {c.courseCode}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {c.type}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              College Class
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {c.courseName}
                          </h4>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{c.instructor}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{c.room}, {c.building}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => deleteClass(c.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete Class"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                } else {
                  const s = item.data;
                  const badge = sessionTypeBadges[s.sessionType] || sessionTypeBadges['Revision'];
                  return (
                    <div
                      key={`study-${s.id}`}
                      className={`p-4 sm:p-5 rounded-2xl border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                        s.completed
                          ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-70'
                          : 'bg-white dark:bg-slate-900 border-indigo-200/80 dark:border-indigo-900/60 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        {/* Time slot indicator */}
                        <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-mono text-center shrink-0 min-w-20">
                          <span className="text-xs font-extrabold block">{s.startTime}</span>
                          <span className="text-[10px] text-violet-500/80 block">{s.endTime}</span>
                          <span className="text-[9px] text-slate-400 font-sans block">{s.durationMinutes}m</span>
                        </div>

                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-violet-600 dark:text-violet-400">
                              {s.courseCode}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg}`}>
                              {badge.text}
                            </span>
                            {s.isAiGenerated && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>Smart Plan</span>
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                s.priority === 'urgent'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                  : s.priority === 'high'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {s.priority}
                            </span>
                          </div>

                          <h4 className={`text-sm font-bold text-slate-900 dark:text-white truncate ${s.completed ? 'line-through text-slate-400' : ''}`}>
                            {s.subjectName}
                          </h4>

                          {s.rationale && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <span className="text-indigo-500 font-semibold shrink-0">Rationale:</span>
                              <span className="truncate">{s.rationale}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Toggle completed checkbox */}
                        <button
                          type="button"
                          onClick={() => toggleStudySessionCompleted(s.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            s.completed
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {s.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4 text-slate-400" />}
                          <span>{s.completed ? 'Completed' : 'Mark Done'}</span>
                        </button>

                        <button
                          onClick={() => setEditingSession(s)}
                          className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                          title="Edit Session"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => deleteStudySession(s.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete Session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No activities scheduled for {selectedDay}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Click "Generate Smart Study Plan" to distribute revision slots, or add your classes manually.
                </p>
              </div>
              <button
                onClick={generateStudyPlan}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Schedule {selectedDay}</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Week Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {days.map((day) => {
            const wClasses = timetable.filter((c) => c.dayOfWeek === day);
            const wStudy = studySessions.filter((s) => s.dayOfWeek === day);

            return (
              <div
                key={day}
                onClick={() => {
                  setSelectedDay(day);
                  setViewMode('day');
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-60 ${
                  selectedDay === day
                    ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-400 dark:border-indigo-700'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200">
                      {day}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {wClasses.length + wStudy.length} events
                    </span>
                  </div>

                  {/* Classes Mini Pill */}
                  <div className="space-y-1">
                    {wClasses.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-[10px]"
                      >
                        <span className="font-mono font-bold text-indigo-700 dark:text-indigo-300 block truncate">
                          {c.startTime} {c.courseCode}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Study Sessions Mini Pill */}
                  <div className="space-y-1">
                    {wStudy.slice(0, 3).map((s) => (
                      <div
                        key={s.id}
                        className={`p-1.5 rounded-lg border text-[10px] ${
                          s.completed
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'
                            : 'bg-violet-50 dark:bg-violet-950/40 border-violet-100 dark:border-violet-900/40 text-violet-700 dark:text-violet-300'
                        }`}
                      >
                        <span className="font-mono font-bold block truncate">
                          {s.startTime} {s.courseCode}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-2 block text-center">
                  Open Day Timeline →
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD COLLEGE CLASS */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Official College Class
              </h3>
              <button onClick={() => setIsAddClassModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {timeError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{timeError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitClass} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE2001"
                    value={classForm.courseCode}
                    onChange={(e) => setClassForm({ ...classForm, courseCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Class Type</label>
                  <select
                    value={classForm.type}
                    onChange={(e) => setClassForm({ ...classForm, type: e.target.value as ClassType })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab / Practical</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Workshop">Workshop</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  value={classForm.courseName}
                  onChange={(e) => setClassForm({ ...classForm, courseName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Day</label>
                  <select
                    value={classForm.dayOfWeek}
                    onChange={(e) => setClassForm({ ...classForm, dayOfWeek: e.target.value as DayOfWeek })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Start Time</label>
                  <input
                    type="time"
                    required
                    value={classForm.startTime}
                    onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">End Time</label>
                  <input
                    type="time"
                    required
                    value={classForm.endTime}
                    onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Room / Hall</label>
                  <input
                    type="text"
                    placeholder="e.g. SJT-412"
                    value={classForm.room}
                    onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Faculty Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Prof. Rajesh Khanna"
                    value={classForm.instructor}
                    onChange={(e) => setClassForm({ ...classForm, instructor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD STUDY BLOCK */}
      {isAddStudyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Schedule Study / Revision Block</span>
              </h3>
              <button onClick={() => setIsAddStudyModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {timeError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{timeError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitStudySession} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Select Subject</label>
                <select
                  value={studyForm.courseCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    const found = semesterSubjects.find((s) => s.courseCode === code);
                    setStudyForm({
                      ...studyForm,
                      courseCode: code,
                      subjectName: found?.name || code,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                >
                  {semesterSubjects.map((s) => (
                    <option key={s.id} value={s.courseCode}>
                      {s.courseCode} - {s.name}
                    </option>
                  ))}
                  <option value="CAREER">Career Learning & Projects</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Session Type</label>
                  <select
                    value={studyForm.sessionType}
                    onChange={(e) => setStudyForm({ ...studyForm, sessionType: e.target.value as StudySessionType })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  >
                    <option value="Revision">Revision</option>
                    <option value="Exam Prep">Exam Preparation</option>
                    <option value="Practice Problems">Practice Problems</option>
                    <option value="Assignment / Project">Assignment / Project</option>
                    <option value="Career Learning">Career Learning</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    value={studyForm.priority}
                    onChange={(e) => setStudyForm({ ...studyForm, priority: e.target.value as Priority })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Day</label>
                  <select
                    value={studyForm.dayOfWeek}
                    onChange={(e) => setStudyForm({ ...studyForm, dayOfWeek: e.target.value as DayOfWeek })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Start Time</label>
                  <input
                    type="time"
                    required
                    value={studyForm.startTime}
                    onChange={(e) => setStudyForm({ ...studyForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">End Time</label>
                  <input
                    type="time"
                    required
                    value={studyForm.endTime}
                    onChange={(e) => setStudyForm({ ...studyForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Goal / Rationale</label>
                <input
                  type="text"
                  placeholder="e.g. Master graph search algorithms before Friday test"
                  value={studyForm.rationale}
                  onChange={(e) => setStudyForm({ ...studyForm, rationale: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddStudyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT STUDY BLOCK */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Study Session
              </h3>
              <button onClick={() => setEditingSession(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {timeError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{timeError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSessionEdit} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Day</label>
                  <select
                    value={editingSession.dayOfWeek}
                    onChange={(e) => setEditingSession({ ...editingSession, dayOfWeek: e.target.value as DayOfWeek })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Start Time</label>
                  <input
                    type="time"
                    required
                    value={editingSession.startTime}
                    onChange={(e) => setEditingSession({ ...editingSession, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">End Time</label>
                  <input
                    type="time"
                    required
                    value={editingSession.endTime}
                    onChange={(e) => setEditingSession({ ...editingSession, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rationale / Goal</label>
                <input
                  type="text"
                  value={editingSession.rationale || ''}
                  onChange={(e) => setEditingSession({ ...editingSession, rationale: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Update Timing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

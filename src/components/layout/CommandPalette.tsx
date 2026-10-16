import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Calendar, CheckSquare, Users, Sparkles, X, ArrowRight, Clock, GraduationCap } from 'lucide-react';
import { ActiveTab } from '../../types';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveTab,
    timetable,
    tasks,
    events,
    clubs,
    vitSubjects,
    toggleDarkMode,
    setProfileModalOpen,
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const handleSelect = (action: () => void) => {
    action();
    setCommandPaletteOpen(false);
  };

  const cleanQ = query.toLowerCase().trim();

  // Filter items
  const matchedSubjects = vitSubjects.filter(
    (s) =>
      s.courseCode.toLowerCase().includes(cleanQ) ||
      s.name.toLowerCase().includes(cleanQ) ||
      s.facultyName.toLowerCase().includes(cleanQ)
  ).slice(0, 3);

  const matchedClasses = timetable.filter(
    (c) =>
      c.courseCode.toLowerCase().includes(cleanQ) ||
      c.courseName.toLowerCase().includes(cleanQ) ||
      c.instructor.toLowerCase().includes(cleanQ)
  ).slice(0, 3);

  const matchedTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(cleanQ) ||
      t.courseCode.toLowerCase().includes(cleanQ)
  ).slice(0, 3);

  const matchedEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(cleanQ) ||
      e.category.toLowerCase().includes(cleanQ) ||
      e.location.toLowerCase().includes(cleanQ)
  ).slice(0, 3);

  const matchedClubs = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(cleanQ) ||
      c.category.toLowerCase().includes(cleanQ) ||
      c.tags.some((t) => t.toLowerCase().includes(cleanQ))
  ).slice(0, 3);

  const quickNavigations: { label: string; tab: ActiveTab; icon: React.ReactNode }[] = [
    { label: 'Go to Dashboard', tab: 'dashboard', icon: <Sparkles className="w-4 h-4 text-indigo-500" /> },
    { label: 'Smart Timetable & Planner', tab: 'timetable', icon: <Calendar className="w-4 h-4 text-sky-500" /> },
    { label: 'Personalized CGPA Coach', tab: 'coach', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
    { label: 'Career Readiness & Skills Advisor', tab: 'career', icon: <Sparkles className="w-4 h-4 text-indigo-500" /> },
    { label: 'Unified Student AI Advisor', tab: 'advisor', icon: <Sparkles className="w-4 h-4 text-violet-500" /> },
    { label: 'Curriculum & Semester Subjects', tab: 'subjects', icon: <GraduationCap className="w-4 h-4 text-emerald-500" /> },
    { label: 'Manage Tasks & Deadlines', tab: 'tasks', icon: <CheckSquare className="w-4 h-4 text-teal-500" /> },
    { label: 'Start Study Focus Timer', tab: 'timer', icon: <Clock className="w-4 h-4 text-amber-500" /> },
    { label: 'Explore Campus Events', tab: 'events', icon: <Calendar className="w-4 h-4 text-purple-500" /> },
    { label: 'Browse Student Clubs', tab: 'clubs', icon: <Users className="w-4 h-4 text-rose-500" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, course code, task, event, or club..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {/* Quick Actions if query empty or matching navigation */}
          {cleanQ === '' && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Navigation & Quick Actions
              </div>
              <div className="mt-1 space-y-0.5">
                {quickNavigations.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSelect(() => setActiveTab(item.tab))}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
                <button
                  onClick={() => handleSelect(toggleDarkMode)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Toggle Light / Dark Mode</span>
                  </div>
                </button>
                <button
                  onClick={() => handleSelect(() => setProfileModalOpen(true))}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span>Edit Student Profile & Preferences</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Matched VIT Subjects */}
          {matchedSubjects.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                VIT Subjects ({matchedSubjects.length})
              </div>
              <div className="mt-1 space-y-0.5">
                {matchedSubjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(() => setActiveTab('subjects'))}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                        {s.courseCode}
                      </span>
                      <span className="truncate text-slate-900 dark:text-slate-100">{s.name}</span>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0 font-mono">
                      {s.credits} Credits · {s.attendancePercentage}% att.
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Classes */}
          {matchedClasses.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Classes ({matchedClasses.length})
              </div>
              <div className="mt-1 space-y-0.5">
                {matchedClasses.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(() => setActiveTab('timetable'))}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono text-xs">
                        {c.courseCode}
                      </span>
                      <span className="truncate text-slate-900 dark:text-slate-100">{c.courseName}</span>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0 tabular-nums">
                      {c.dayOfWeek} · {c.startTime}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Tasks */}
          {matchedTasks.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Tasks ({matchedTasks.length})
              </div>
              <div className="mt-1 space-y-0.5">
                {matchedTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(() => setActiveTab('tasks'))}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-xs font-medium text-slate-500 font-mono">{t.courseCode}</span>
                      <span className={`truncate ${t.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {t.title}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0 tabular-nums">Due {t.dueDate}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Events */}
          {matchedEvents.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Events ({matchedEvents.length})
              </div>
              <div className="mt-1 space-y-0.5">
                {matchedEvents.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => handleSelect(() => setActiveTab('events'))}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-xs text-purple-600 dark:text-purple-400">{e.category}</span>
                      <span className="truncate text-slate-900 dark:text-slate-100">{e.title}</span>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">{e.date}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Clubs */}
          {matchedClubs.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Clubs ({matchedClubs.length})
              </div>
              <div className="mt-1 space-y-0.5">
                {matchedClubs.map((cl) => (
                  <button
                    key={cl.id}
                    onClick={() => handleSelect(() => setActiveTab('clubs'))}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="truncate text-slate-900 dark:text-slate-100 font-medium">{cl.name}</span>
                      <span className="text-xs text-slate-400 truncate">{cl.category}</span>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0 tabular-nums">{cl.memberCount} members</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty search state */}
          {cleanQ !== '' &&
            matchedClasses.length === 0 &&
            matchedTasks.length === 0 &&
            matchedEvents.length === 0 &&
            matchedClubs.length === 0 && (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                No matching results found for "{query}".
              </div>
            )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500">
          <span>Use search to quickly jump to any section or schedule</span>
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="hover:text-slate-600 dark:hover:text-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Moon,
  Sun,
  Menu,
  Clock,
  Sparkles,
  Sliders,
  GraduationCap,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    activeTab,
    setActiveTab,
    darkMode,
    toggleDarkMode,
    setCommandPaletteOpen,
    setProfileModalOpen,
    profile,
    todayFocusMinutes,
  } = useApp();

  const tabTitles: Record<string, string> = {
    dashboard: 'Dashboard Overview',
    timetable: 'Class Schedule & Timetable',
    subjects: 'Semester Subjects & Curriculum',
    coach: 'Personalized CGPA Coach',
    career: 'Career Readiness & Skills Advisor',
    advisor: 'Unified Student AI Advisor',
    tasks: 'Tasks & Assignment Tracker',
    timer: 'Study Focus Timer',
    events: 'Campus Events & Workshops',
    clubs: 'Student Clubs & Organizations',
    analytics: 'Productivity & Habits Analytics',
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      {/* Left zone: Brand & Section Context */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-50 font-sans">
              CampusFlow
            </span>
            <span className="hidden sm:inline-block text-xs font-medium text-slate-400 dark:text-slate-500">
              /
            </span>
            <span className="hidden sm:inline-block text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
              {tabTitles[activeTab] || 'Dashboard'}
            </span>
          </div>
        </div>
      </div>

      {/* Middle zone: Interactive Command & Search Bar */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden md:flex items-center justify-between w-72 lg:w-96 px-3.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs group cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
          <span className="truncate">Search timetable, tasks, events, clubs...</span>
        </div>
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
          ⌘K
        </kbd>
      </button>

      {/* Right zone: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Mobile search button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Study Timer Quick Indicator */}
        <button
          onClick={() => setActiveTab('timer')}
          title="Study focus logged today"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40 text-xs font-medium hover:bg-indigo-100/70 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span className="tabular-nums font-mono font-semibold">{todayFocusMinutes}m</span>
          <span className="hidden lg:inline text-indigo-600/80 dark:text-indigo-400/80">focus today</span>
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Profile Settings Trigger */}
        <button
          onClick={() => setProfileModalOpen(true)}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group cursor-pointer min-h-[44px]"
          title="Student Profile & Settings"
        >
          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-slate-200 ring-1 ring-slate-200 dark:ring-slate-700 shrink-0">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-[10px] font-bold text-white uppercase">
                {profile.name ? profile.name.slice(0, 2) : 'ST'}
              </div>
            )}
          </div>
          <span className="hidden md:inline-block text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
            {profile.name.split(' ')[0]}
          </span>
          <Sliders className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
        </button>
      </div>
    </header>
  );
};

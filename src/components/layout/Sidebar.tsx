import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  CalendarClock,
  CheckSquare,
  Timer,
  CalendarDays,
  Compass,
  BarChart3,
  X,
  RotateCcw,
  Sparkles,
  BookOpen,
  GraduationCap,
  Award,
  Briefcase,
  Bot,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const {
    activeTab,
    setActiveTab,
    todayClasses,
    pendingTasksCount,
    myEventsCount,
    profile,
    setProfileModalOpen,
    resetToDemoData,
    vitSubjects,
    cgpaGap,
  } = useApp();

  interface NavItem {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }

  const academicItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'timetable',
      label: 'Smart Timetable',
      icon: CalendarClock,
      badge: todayClasses.length > 0 ? `${todayClasses.length} today` : undefined,
      badgeColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60',
    },
    {
      id: 'subjects',
      label: 'Semester Subjects',
      icon: GraduationCap,
      badge: vitSubjects.length > 0 ? `${vitSubjects.length}` : undefined,
      badgeColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      id: 'coach',
      label: 'CGPA Coach',
      icon: Award,
      badge: cgpaGap > 0 ? `+${cgpaGap.toFixed(2)}` : 'Target 🎯',
      badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
    },
  ];

  const workflowItems: NavItem[] = [
    {
      id: 'advisor',
      label: 'Student AI Advisor',
      icon: Sparkles,
      badge: 'Grounded',
      badgeColor: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 font-bold',
    },
    {
      id: 'career',
      label: 'Career Readiness',
      icon: Briefcase,
    },
    {
      id: 'tasks',
      label: 'Tasks & Planner',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      badgeColor: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60',
    },
    {
      id: 'timer',
      label: 'Focus Timer',
      icon: Timer,
    },
  ];

  const campusItems: NavItem[] = [
    {
      id: 'events',
      label: 'Campus Events',
      icon: CalendarDays,
      badge: myEventsCount > 0 ? `${myEventsCount} RSVP` : undefined,
      badgeColor: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60',
    },
    {
      id: 'clubs',
      label: 'Clubs & Orgs',
      icon: Compass,
    },
    {
      id: 'analytics',
      label: 'Productivity Stats',
      icon: BarChart3,
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="space-y-1">
      <div className="px-3 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {title}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group cursor-pointer ${
              isActive
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-700/80 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                  item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white font-sans">
                CampusFlow
              </h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                Student Life & Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
          {renderNavGroup('Academic Track', academicItems)}
          {renderNavGroup('Productivity & Career', workflowItems)}
          {renderNavGroup('Campus Community', campusItems)}
        </div>

        {/* Student card & footer actions */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
          {/* Student Profile Quick summary */}
          <div
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-xs group"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-200 shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
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
                <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white font-bold text-xs uppercase font-mono">
                  {profile.name.slice(0, 2)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {profile.name}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {profile.degree} · Sem {profile.currentSemester}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">CGPA</span>
              <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                {profile.currentCgpa.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Reset Demo Data link */}
          <button
            onClick={resetToDemoData}
            className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>
    </>
  );
};

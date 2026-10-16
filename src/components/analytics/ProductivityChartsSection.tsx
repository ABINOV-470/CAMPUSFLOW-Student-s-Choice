import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  Calendar,
  Flame,
  ArrowUpRight,
  BookOpen,
  PieChart,
} from 'lucide-react';

export const ProductivityChartsSection: React.FC = () => {
  const { studyLogs, tasks, profile } = useApp();

  const [period, setPeriod] = useState<'thisWeek' | 'lastWeek'>('thisWeek');
  const [hoveredDay, setHoveredDay] = useState<{ day: string; minutes: number; tasks: number } | null>(null);

  // Days of week
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Calculate daily data based on period
  const dailyMetrics = useMemo(() => {
    // Current week baseline
    const baseThisWeek = [
      { day: 'Mon', minutes: 120, tasks: 3 },
      { day: 'Tue', minutes: 145, tasks: 4 },
      { day: 'Wed', minutes: 95, tasks: 2 },
      { day: 'Thu', minutes: 160, tasks: 5 },
      { day: 'Fri', minutes: 110, tasks: 3 },
      { day: 'Sat', minutes: 75, tasks: 1 },
      { day: 'Sun', minutes: 90, tasks: 2 },
    ];

    const baseLastWeek = [
      { day: 'Mon', minutes: 100, tasks: 2 },
      { day: 'Tue', minutes: 130, tasks: 3 },
      { day: 'Wed', minutes: 110, tasks: 3 },
      { day: 'Thu', minutes: 140, tasks: 4 },
      { day: 'Fri', minutes: 85, tasks: 2 },
      { day: 'Sat', minutes: 60, tasks: 1 },
      { day: 'Sun', minutes: 80, tasks: 2 },
    ];

    const data = period === 'thisWeek' ? [...baseThisWeek] : [...baseLastWeek];

    // Inject any today's dynamic logs into the current day for real-time reactivity
    if (period === 'thisWeek') {
      const todayDayIndex = new Date().getDay(); // 0 is Sun
      const dayMap: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };
      const todaySlot = dayMap[todayDayIndex] ?? 3;

      // Sum all logs for today
      const todayIso = new Date().toISOString().split('T')[0];
      const todayMins = studyLogs
        .filter((l) => l.date === todayIso)
        .reduce((sum, l) => sum + l.minutes, 0);

      if (todayMins > 0) {
        data[todaySlot].minutes = todayMins;
      }
    }

    return data;
  }, [period, studyLogs]);

  const maxMinutes = Math.max(...dailyMetrics.map((d) => d.minutes), 180);
  const totalMinutes = dailyMetrics.reduce((sum, d) => sum + d.minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const totalTasksDone = dailyMetrics.reduce((sum, d) => sum + d.tasks, 0);
  const avgDailyMinutes = Math.round(totalMinutes / 7);

  // Subject distribution
  const subjectBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      'CS 301': 280,
      'PHYS 202': 210,
      'MATH 310': 180,
      'DES 180': 120,
      'COG 220': 105,
    };

    // Add recent study logs
    studyLogs.forEach((l) => {
      counts[l.subject] = (counts[l.subject] || 0) + l.minutes;
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts)
      .map(([subject, mins]) => ({
        subject,
        mins,
        percent: Math.round((mins / total) * 100),
      }))
      .sort((a, b) => b.mins - a.mins);
  }, [studyLogs]);

  const colorPalette: Record<string, string> = {
    'CS 301': '#6366f1',
    'PHYS 202': '#0ea5e9',
    'MATH 310': '#10b981',
    'DES 180': '#f43f5e',
    'COG 220': '#8b5cf6',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            Weekly Productivity & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual breakdown of study focus hours, task velocity, and course distribution.
          </p>
        </div>

        {/* Period toggle */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setPeriod('thisWeek')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              period === 'thisWeek'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setPeriod('lastWeek')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              period === 'lastWeek'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Last Week
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Focus Time</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {totalHours} hrs
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+14%</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Across {dailyMetrics.length} recorded study days
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Daily Average</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {avgDailyMinutes} min
            </span>
            <span className="text-xs text-slate-400 font-mono">/ day</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Target: {profile.dailyStudyGoalMinutes} min/day
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Assignments Completed</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {totalTasksDone}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              94% on-time
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            0 overdue assignments this cycle
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Peak Productivity</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              Thursday
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            10:00 AM - 1:00 PM best focus window
          </p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Study Hours Interactive Bar Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans">
                Daily Focus Minutes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hover over bars to inspect minutes logged and assignments submitted.
              </p>
            </div>
            {hoveredDay && (
              <div className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 font-mono animate-in fade-in">
                {hoveredDay.day}: <strong>{hoveredDay.minutes} mins</strong> ({hoveredDay.tasks} tasks)
              </div>
            )}
          </div>

          {/* SVG Bar Visualization */}
          <div className="relative h-64 w-full">
            {/* Horizontal guideline ticks */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] font-mono text-slate-400">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-1">180m</div>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-1">120m (Goal)</div>
              <div className="border-b border-slate-100 dark:border-slate-800 pb-1">60m</div>
              <div className="border-b border-slate-200 dark:border-slate-700 pb-1">0m</div>
            </div>

            {/* Bars container */}
            <div className="absolute inset-0 pt-4 pb-6 flex items-end justify-around gap-2 px-6">
              {dailyMetrics.map((item) => {
                const heightPercent = Math.min(100, Math.round((item.minutes / maxMinutes) * 100));
                const isGoalMet = item.minutes >= profile.dailyStudyGoalMinutes;
                const isHovered = hoveredDay?.day === item.day;

                return (
                  <div
                    key={item.day}
                    onMouseEnter={() => setHoveredDay(item)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    {/* Tooltip value on hover */}
                    <span
                      className={`text-[10px] font-mono font-bold transition-opacity mb-1 tabular-nums ${
                        isHovered ? 'opacity-100 text-indigo-600 dark:text-indigo-400' : 'opacity-0'
                      }`}
                    >
                      {item.minutes}m
                    </span>

                    {/* Bar Pill */}
                    <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800/80 rounded-t-xl overflow-hidden flex items-end h-full">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-300 ${
                          isGoalMet
                            ? 'bg-gradient-to-t from-indigo-600 to-indigo-500'
                            : 'bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-600 dark:to-slate-500'
                        } ${isHovered ? 'brightness-110 shadow-lg scale-y-[1.02] origin-bottom' : ''}`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>

                    {/* Day label */}
                    <span
                      className={`text-xs font-semibold mt-2 transition-colors ${
                        isHovered
                          ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-indigo-600" />
                <span>Goal met (≥120m)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-slate-400 dark:bg-slate-600" />
                <span>Under goal</span>
              </div>
            </div>
            <span>Weekly Target: 840 mins</span>
          </div>
        </div>

        {/* Subject Breakdown Distribution (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans">
                Focus by Subject
              </h3>
              <PieChart className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Course distribution of study logs recorded this semester.
            </p>

            {/* Stacked Bar Overview */}
            <div className="w-full h-3 rounded-full overflow-hidden flex mb-6">
              {subjectBreakdown.map((item) => (
                <div
                  key={item.subject}
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: colorPalette[item.subject] || '#6366f1',
                  }}
                  title={`${item.subject}: ${item.percent}%`}
                />
              ))}
            </div>

            {/* Breakdown List */}
            <div className="space-y-3">
              {subjectBreakdown.map((item) => (
                <div key={item.subject} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: colorPalette[item.subject] || '#6366f1' }}
                    />
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {item.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums font-mono">
                      {item.mins}m
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums w-8 text-right">
                      {item.percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Weighted balance matches exam schedule priorities.
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  RotateCw,
  Sliders,
  AlertTriangle,
  Play,
  Check,
  ShieldAlert,
  Brain,
  Calendar,
  Award,
  ChevronRight,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { AnimatedCard } from '../common/AnimatedCard';

export const NextBestActionSection: React.FC = () => {
  const {
    nextBestAction,
    nextBestActionsList,
    currentActionIndex,
    skipNextAction,
    completeNextAction,
    startNextActionSession,
    setExamRescueModalOpen,
    setActiveTab,
    gamification,
  } = useApp();

  const [feedbackGiven, setFeedbackGiven] = useState(false);

  if (!nextBestAction) return null;

  const priorityStyles = {
    urgent: {
      badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      border: 'border-rose-300 dark:border-rose-800/80',
      accentGlow: 'from-rose-500/10 via-transparent to-transparent',
    },
    high: {
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      border: 'border-amber-300 dark:border-amber-800/80',
      accentGlow: 'from-amber-500/10 via-transparent to-transparent',
    },
    medium: {
      badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      border: 'border-indigo-300 dark:border-indigo-800/80',
      accentGlow: 'from-indigo-500/10 via-transparent to-transparent',
    },
  }[nextBestAction.priority];

  const getActionIcon = () => {
    switch (nextBestAction.actionType) {
      case 'exam_prep':
        return <Calendar className="w-5 h-5 text-amber-500" />;
      case 'urgent_task':
        return <CheckCircle2 className="w-5 h-5 text-rose-500" />;
      case 'weak_topic_recall':
        return <Brain className="w-5 h-5 text-indigo-500" />;
      case 'cgpa_boost':
        return <Award className="w-5 h-5 text-emerald-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-violet-500" />;
    }
  };

  const totalActions = nextBestActionsList.length;
  const currentActionNum = (currentActionIndex % totalActions) + 1;

  return (
    <AnimatedCard
      enableHoverEffect={false}
      className={`relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border ${priorityStyles.border} p-5 sm:p-6 shadow-sm shadow-slate-200/50 dark:shadow-none transition-all duration-300`}
    >
      {/* Background soft accent gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${priorityStyles.accentGlow} pointer-events-none`}
      />

      {/* Top Banner Row */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                AI Next Best Action
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Action {currentActionNum} of {totalActions}
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Personalized from exams, assignment deadlines, weak topics & target CGPA
            </p>
          </div>
        </div>

        {/* Action Skip & Cycle */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={skipNextAction}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Cycle to next prioritized recommendation"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Skip for Now</span>
          </button>

          <button
            onClick={() => setExamRescueModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/70 dark:bg-indigo-950/60 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
            title="Open Exam Rescue Planner"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Exam Rescue Mode</span>
            <span className="sm:hidden">Rescue</span>
          </button>
        </div>
      </div>

      {/* Main Recommendation Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        {/* Left Column: Action Details & Rationale (8 cols) */}
        <div className="lg:col-span-8 space-y-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${priorityStyles.badge}`}
            >
              {nextBestAction.priority} Priority
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
              {nextBestAction.courseCode || 'Academics'}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{nextBestAction.estimatedMinutes} mins allocated</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shrink-0">
              {getActionIcon()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans leading-snug">
                {nextBestAction.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {nextBestAction.subtitle}
              </p>
            </div>
          </div>

          {/* Rationale Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              <span>Why this is recommended now:</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {nextBestAction.rationale}
            </p>

            {/* Context Data Points */}
            <div className="flex flex-wrap items-center gap-2 pt-1.5">
              {nextBestAction.dataPoints.map((dp, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-mono text-slate-600 dark:text-slate-300"
                >
                  {dp}
                </span>
              ))}
            </div>
          </div>

          {/* Missing data notification if any */}
          {nextBestAction.missingDataPrompt && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Missing calibration data: </span>
                <span>{nextBestAction.missingDataPrompt.message}</span>
              </div>
              <button
                onClick={() => setActiveTab('learning')}
                className="px-2.5 py-1 rounded-lg bg-amber-200/70 dark:bg-amber-900/80 text-[11px] font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-300 transition-colors shrink-0"
              >
                Calibrate Now
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Action Controls & XP (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-slate-800/80 dark:via-slate-900 dark:to-indigo-950/30 border border-indigo-100 dark:border-slate-800 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Reward on Completion
              </span>
              <div className="flex items-center gap-1 font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>+50 XP</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
              Completing this action directly updates your study progress and adaptive mastery map.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {/* Primary Action Button */}
            <button
              onClick={startNextActionSession}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start {nextBestAction.estimatedMinutes}m Session</span>
            </button>

            {/* Mark Complete Button */}
            <button
              onClick={completeNextAction}
              className="w-full py-2 px-3 rounded-xl border border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/60 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark as Completed (+50 XP)</span>
            </button>

            {/* Adjust plan link */}
            <button
              onClick={() => setActiveTab('timetable')}
              className="w-full py-1.5 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-1"
            >
              <Sliders className="w-3 h-3" />
              <span>Adjust in Weekly Planner</span>
            </button>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
};

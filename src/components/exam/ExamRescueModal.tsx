import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  ShieldAlert,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  RotateCw,
  Trash2,
  BookOpen,
  ArrowRight,
  Flame,
  Check,
  AlertCircle,
  Layers,
} from 'lucide-react';

export const ExamRescueModal: React.FC = () => {
  const {
    examRescueModalOpen,
    setExamRescueModalOpen,
    examRescuePlan,
    generateExamRescuePlan,
    toggleRescueBlockCompleted,
    reorganizeExamRescuePlan,
    clearRescuePlan,
    semesterSubjects,
    topics,
  } = useApp();

  const [examName, setExamName] = useState('CAT-1 Continuous Assessment');
  const [targetDate, setTargetDate] = useState('2026-11-04');
  const [selectedCodes, setSelectedCodes] = useState<string[]>(['CSE2001', 'MAT2001', 'ECE2001']);
  const [dailyHours, setDailyHours] = useState<number>(3.5);

  if (!examRescueModalOpen) return null;

  const handleToggleSubject = (code: string) => {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleGenerate = () => {
    if (selectedCodes.length === 0) return;
    generateExamRescuePlan({
      examName,
      targetExamDate: targetDate,
      subjectCodes: selectedCodes,
      dailyStudyHours: dailyHours,
    });
  };

  const completedBlocksCount = examRescuePlan?.blocks.filter((b) => b.completed).length || 0;
  const totalBlocksCount = examRescuePlan?.blocks.length || 0;
  const progressPercent = totalBlocksCount > 0 ? Math.round((completedBlocksCount / totalBlocksCount) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Exam Rescue Mode</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                  Targeted Revision
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Crash-course planner prioritizing weak topics, active recall & non-overlapping slots
              </p>
            </div>
          </div>

          <button
            onClick={() => setExamRescueModalOpen(false)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Active Plan Dashboard if one exists */}
          {examRescuePlan ? (
            <div className="space-y-5">
              {/* Active Plan Summary Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent border border-amber-300/80 dark:border-amber-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 font-mono uppercase tracking-wider">
                      Active Rescue Plan
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Target: {examRescuePlan.targetExamDate}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {examRescuePlan.examName} ({examRescuePlan.daysRemaining} days left)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Allocated {examRescuePlan.dailyStudyHours}h daily across {examRescuePlan.subjectCodes.join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={reorganizeExamRescuePlan}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Reschedule any uncompleted past blocks"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Reorganize</span>
                  </button>
                  <button
                    onClick={clearRescuePlan}
                    className="p-2 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                    title="Clear current plan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    Rescue Study Blocks Completed
                  </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                    {completedBlocksCount} / {totalBlocksCount} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Scheduled Blocks List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Prioritized Study & Problem Sessions
                </h4>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {examRescuePlan.blocks.map((block) => (
                    <div
                      key={block.id}
                      onClick={() => toggleRescueBlockCompleted(block.id)}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        block.completed
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 opacity-80'
                          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button className="shrink-0 text-slate-400 hover:text-emerald-500">
                          {block.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                              {block.courseCode}
                            </span>
                            <span className="text-[10px] text-slate-400">·</span>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              {block.dayLabel} ({block.startTime} - {block.endTime})
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.2 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                              {block.blockType}
                            </span>
                          </div>
                          <p
                            className={`text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5 ${
                              block.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                            }`}
                          >
                            {block.topicName}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono text-slate-400">{block.durationMinutes}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate new plan button */}
              <div className="pt-2">
                <button
                  onClick={clearRescuePlan}
                  className="w-full py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:border-slate-400 transition-colors"
                >
                  Configure a Different Exam Rescue Plan
                </button>
              </div>
            </div>
          ) : (
            /* Configure New Plan Form */
            <div className="space-y-5">
              {/* Exam Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Exam / Assessment
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { name: 'CAT-1 Assessment', date: '2026-11-04' },
                    { name: 'CAT-2 Assessment', date: '2026-12-08' },
                    { name: 'FAT Semester Final', date: '2027-01-15' },
                  ].map((ex) => (
                    <button
                      key={ex.name}
                      type="button"
                      onClick={() => {
                        setExamName(ex.name);
                        setTargetDate(ex.date);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        examName === ex.name
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">
                        {ex.name}
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {ex.date}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date & Daily Study Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Exam Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Daily Dedicated Prep Hours: <strong className="text-indigo-600">{dailyHours}h / day</strong>
                  </label>
                  <input
                    type="range"
                    min="1.5"
                    max="6"
                    step="0.5"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>1.5h</span>
                    <span>3.5h (Recommended)</span>
                    <span>6h</span>
                  </div>
                </div>
              </div>

              {/* Subjects to prioritize */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Subjects to Prioritize in Rescue Schedule
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {semesterSubjects.map((subj) => {
                    const isSelected = selectedCodes.includes(subj.courseCode);
                    const weakCount = topics.filter(
                      (t) => t.courseCode === subj.courseCode && t.confidence === 'Low'
                    ).length;

                    return (
                      <div
                        key={subj.id}
                        onClick={() => handleToggleSubject(subj.courseCode)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/50'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                              {subj.courseCode}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({subj.credits}c)
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                            {subj.name}
                          </p>
                          {weakCount > 0 && (
                            <span className="inline-block mt-1 text-[10px] font-mono font-semibold text-amber-600 dark:text-amber-400">
                              ⚠️ {weakCount} weak topic{weakCount > 1 ? 's' : ''} flagged
                            </span>
                          )}
                        </div>

                        <div className="shrink-0">
                          {isSelected ? (
                            <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={selectedCodes.length === 0}
                className="w-full py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                <span>Generate Optimized Exam Rescue Schedule (+60 XP)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

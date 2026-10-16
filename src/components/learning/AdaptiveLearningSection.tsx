import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Brain,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Search,
  Filter,
  Layers,
  ChevronRight,
  BookOpen,
  Edit3,
  Award,
  HelpCircle,
  Play,
  Check,
  X,
  TrendingUp,
} from 'lucide-react';
import { TopicMastery } from '../../types';
import { AnimatedCard, AnimatedCardContainer } from '../common/AnimatedCard';

export const AdaptiveLearningSection: React.FC = () => {
  const {
    topics,
    updateTopicMastery,
    addTopic,
    recordQuizScore,
    recordRevisionCompleted,
    awardXP,
    semesterSubjects,
    setActiveTab,
  } = useApp();

  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Interactive Quiz / Flashcard State
  const [activeQuizTopic, setActiveQuizTopic] = useState<TopicMastery | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Edit Topic Modal State
  const [editingTopic, setEditingTopic] = useState<TopicMastery | null>(null);
  const [editConfidence, setEditConfidence] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [editAccuracy, setEditAccuracy] = useState<number | ''>('');
  const [editStatus, setEditStatus] = useState<'needs_focus' | 'reviewing' | 'mastered'>('reviewing');

  // Filtered Topics
  const filteredTopics = topics.filter((t) => {
    if (selectedCourseFilter !== 'all' && t.courseCode !== selectedCourseFilter) return false;
    if (selectedStatusFilter !== 'all' && t.status !== selectedStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.topicName.toLowerCase().includes(q) ||
        t.courseCode.toLowerCase().includes(q) ||
        t.courseName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Analytics Stats
  const totalTopics = topics.length;
  const masteredCount = topics.filter((t) => t.status === 'mastered').length;
  const reviewingCount = topics.filter((t) => t.status === 'reviewing').length;
  const needsFocusCount = topics.filter((t) => t.status === 'needs_focus').length;
  const masteryPercentage = totalTopics > 0 ? Math.round((masteredCount / totalTopics) * 100) : 0;

  // Weak Topics Priority List
  const weakTopics = topics.filter(
    (t) => t.status === 'needs_focus' || t.confidence === 'Low' || (t.quizAccuracy !== null && t.quizAccuracy < 65)
  );

  const handleOpenEdit = (t: TopicMastery) => {
    setEditingTopic(t);
    setEditConfidence(t.confidence);
    setEditAccuracy(t.quizAccuracy ?? '');
    setEditStatus(t.status);
  };

  const handleSaveEdit = () => {
    if (!editingTopic) return;
    updateTopicMastery(editingTopic.id, {
      confidence: editConfidence,
      quizAccuracy: editAccuracy === '' ? null : Number(editAccuracy),
      status: editStatus,
    });
    setEditingTopic(null);
  };

  const handleStartQuiz = (topic: TopicMastery) => {
    setActiveQuizTopic(topic);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
    setShowHint(false);
  };

  const handleSubmitQuiz = () => {
    if (!activeQuizTopic || selectedQuizOption === null) return;
    setQuizSubmitted(true);
    const isCorrect = selectedQuizOption === (activeQuizTopic.sampleQuestion?.correctIndex ?? 0);
    const score = isCorrect ? 100 : 40;
    recordQuizScore(activeQuizTopic.id, score);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-lg shadow-indigo-950/20">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-400/20">
              Adaptive Intelligence Engine
            </span>
            <span className="text-xs text-indigo-300/80">· Spaced Repetition (SM-2)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-sans">
            Subject Mastery & Weak-Topic Recall
          </h1>
          <p className="text-xs text-indigo-200/80 max-w-xl">
            Track concept-level confidence, quiz accuracy, and automated revision intervals. Correct any inaccurate rating or practice active recall on weak subjects.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 shrink-0">
          <div className="text-center px-2">
            <span className="block text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {masteryPercentage}%
            </span>
            <span className="text-[10px] text-slate-300 font-medium">Syllabus Mastered</span>
          </div>
          <div className="w-px h-8 bg-white/20" />
          <div className="text-center px-2">
            <span className="block text-xl font-bold font-mono text-amber-400 tabular-nums">
              {needsFocusCount}
            </span>
            <span className="text-[10px] text-slate-300 font-medium">Needs Focus</span>
          </div>
        </div>
      </div>

      {/* 4 Summary Stats Cards */}
      <AnimatedCardContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatedCard className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Tracked Topics</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {totalTopics}
            </span>
            <span className="text-xs text-slate-500">concepts</span>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Mastered Concepts</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {masteredCount}
            </span>
            <span className="text-xs text-slate-500">high accuracy</span>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400">In Spaced Review</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
              {reviewingCount}
            </span>
            <span className="text-xs text-slate-500">scheduled</span>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <span className="text-xs font-medium text-rose-600 dark:text-rose-400">High Priority Weak Topics</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
              {needsFocusCount}
            </span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">needs recall</span>
          </div>
        </AnimatedCard>
      </AnimatedCardContainer>

      {/* Weak Topic Priority List */}
      {weakTopics.length > 0 && (
        <AnimatedCard className="p-5 sm:p-6 rounded-3xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-sans uppercase tracking-wider">
                Priority Weak Topics (Action Required Before CAT/FAT)
              </h3>
            </div>
            <span className="text-xs font-mono font-semibold text-rose-600 dark:text-rose-400">
              {weakTopics.length} vulnerable concepts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {weakTopics.map((wt) => (
              <div
                key={wt.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/60 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {wt.courseCode}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      Confidence: {wt.confidence}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {wt.topicName}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    {wt.quizAccuracy !== null ? `Quiz Accuracy: ${wt.quizAccuracy}%` : 'Unassessed Diagnostic'}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleStartQuiz(wt)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Active Recall</span>
                  </button>
                  <button
                    onClick={() => handleOpenEdit(wt)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Correct assessment / notes"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>
      )}

      {/* Subject Mastery Heatmap & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Subject Mastery Heatmap
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Courses</option>
              {semesterSubjects.map((s) => (
                <option key={s.id} value={s.courseCode}>
                  {s.courseCode} ({s.name})
                </option>
              ))}
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Statuses</option>
              <option value="needs_focus">Needs Focus</option>
              <option value="reviewing">In Review</option>
              <option value="mastered">Mastered</option>
            </select>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTopics.map((topic) => {
            const statusConfig = {
              mastered: {
                badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
                border: 'border-emerald-200 dark:border-emerald-800/80',
                indicator: 'bg-emerald-500',
              },
              reviewing: {
                badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
                border: 'border-amber-200 dark:border-amber-800/80',
                indicator: 'bg-amber-500',
              },
              needs_focus: {
                badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300',
                border: 'border-rose-200 dark:border-rose-800/80',
                indicator: 'bg-rose-500',
              },
            }[topic.status];

            return (
              <AnimatedCard
                key={topic.id}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border ${statusConfig.border} shadow-sm space-y-3 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {topic.courseCode}
                      </span>
                      <span className="text-[10px] text-slate-400">·</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Stage {topic.spacedRepetitionStage}/5
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusConfig.badge}`}
                    >
                      {topic.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                    {topic.topicName}
                  </h4>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono">
                    <span>
                      Accuracy: <strong className="text-slate-900 dark:text-slate-100">{topic.quizAccuracy !== null ? `${topic.quizAccuracy}%` : '—'}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Conf: <strong className="text-slate-900 dark:text-slate-100">{topic.confidence}</strong>
                    </span>
                  </div>

                  {/* Key Concepts Preview */}
                  {topic.keyConcepts && topic.keyConcepts.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Core Concepts
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                        {topic.keyConcepts.join(' · ')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleStartQuiz(topic)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Practice / Quiz</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(topic)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
                    title="Edit progress and correct assessment"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      </div>

      {/* Interactive Active Recall & Practice Quiz Modal */}
      {activeQuizTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Active Recall: {activeQuizTopic.topicName}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeQuizTopic.courseCode} · Spaced Stage {activeQuizTopic.spacedRepetitionStage}/5
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveQuizTopic(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Question Card */}
            {activeQuizTopic.sampleQuestion ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                    Diagnostic Challenge
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                    {activeQuizTopic.sampleQuestion.question}
                  </p>
                </div>

                {/* Options list */}
                <div className="space-y-2">
                  {activeQuizTopic.sampleQuestion.options.map((opt, idx) => {
                    const isSelected = selectedQuizOption === idx;
                    const isCorrect = idx === activeQuizTopic.sampleQuestion?.correctIndex;

                    let btnClass = 'border-slate-200 dark:border-slate-800 hover:border-slate-300';
                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200';
                      } else if (isSelected) {
                        btnClass = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200';
                      }
                    } else if (isSelected) {
                      btnClass = 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-100';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={quizSubmitted}
                        onClick={() => setSelectedQuizOption(idx)}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${btnClass}`}
                      >
                        <span>{opt}</span>
                        {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>

                {/* Hint toggle */}
                {!quizSubmitted && activeQuizTopic.sampleQuestion.hint && (
                  <div>
                    <button
                      onClick={() => setShowHint((prev) => !prev)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{showHint ? 'Hide Hint' : 'Need a hint? (Socratic clue)'}</span>
                    </button>
                    {showHint && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 mt-1">
                        💡 {activeQuizTopic.sampleQuestion.hint}
                      </p>
                    )}
                  </div>
                )}

                {/* Explanation on submit */}
                {quizSubmitted && (
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/60 space-y-1.5">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                      Answer Explanation:
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {activeQuizTopic.sampleQuestion.explanation}
                    </p>
                  </div>
                )}

                {/* Submit button */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  {!quizSubmitted ? (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={selectedQuizOption === null}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Check Answer (+30 XP)
                    </button>
                  ) : (
                    <div className="w-full flex items-center gap-2">
                      <button
                        onClick={() => {
                          recordRevisionCompleted(activeQuizTopic.id, 'good');
                          setActiveQuizTopic(null);
                        }}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                      >
                        Advance Spaced Review (+25 XP)
                      </button>
                      <button
                        onClick={() => setActiveQuizTopic(null)}
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Fallback flashcard review if no multiple choice */
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Active Recall Question
                  </span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Explain {activeQuizTopic.topicName} in your own words. What are its core bounds and invariants?
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      recordRevisionCompleted(activeQuizTopic.id, 'hard');
                      setActiveQuizTopic(null);
                    }}
                    className="flex-1 py-2 rounded-xl border border-rose-300 text-rose-600 text-xs font-semibold hover:bg-rose-50"
                  >
                    Hard (Review in 1d)
                  </button>
                  <button
                    onClick={() => {
                      recordRevisionCompleted(activeQuizTopic.id, 'good');
                      setActiveQuizTopic(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                  >
                    Good (Review in 4d)
                  </button>
                  <button
                    onClick={() => {
                      recordRevisionCompleted(activeQuizTopic.id, 'easy');
                      setActiveQuizTopic(null);
                    }}
                    className="flex-1 py-2 rounded-xl border border-emerald-300 text-emerald-600 text-xs font-semibold hover:bg-emerald-50"
                  >
                    Easy (Mastered)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Mastery & Assessment Modal */}
      {editingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Edit Progress: {editingTopic.topicName}
              </h3>
              <button
                onClick={() => setEditingTopic(null)}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confidence Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Low', 'Medium', 'High'] as const).map((conf) => (
                    <button
                      key={conf}
                      type="button"
                      onClick={() => setEditConfidence(conf)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        editConfidence === conf
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {conf}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Quiz Accuracy (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editAccuracy}
                  onChange={(e) => setEditAccuracy(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 75"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mastery Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="needs_focus">Needs Focus (Weak)</option>
                  <option value="reviewing">In Spaced Review</option>
                  <option value="mastered">Mastered</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditingTopic(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

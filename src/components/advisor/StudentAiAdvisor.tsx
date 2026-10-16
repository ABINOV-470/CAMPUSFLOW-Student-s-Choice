import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Send,
  RotateCcw,
  BookOpen,
  Award,
  Calendar,
  Briefcase,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

export const StudentAiAdvisor: React.FC = () => {
  const {
    profile,
    selectedYear,
    selectedSemester,
    semesterSubjects,
    timetable,
    studySessions,
    tasks,
    chatMessages,
    sendChatMessage,
    clearChatHistory,
    isAdvisorTyping,
    setActiveTab,
  } = useApp();

  const [inputPrompt, setInputPrompt] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAdvisorTyping]);

  const handleSend = async (text?: string) => {
    const toSend = text || inputPrompt;
    if (!toSend.trim() || isAdvisorTyping) return;
    setInputPrompt('');
    await sendChatMessage(toSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Find nearest exam
  const nearestExam = useMemo(() => {
    const list: { course: string; name: string; date: string }[] = [];
    semesterSubjects.forEach((s) => {
      if (s.examDates?.cat1Date) list.push({ course: s.courseCode, name: 'CAT-1', date: s.examDates.cat1Date });
      if (s.examDates?.cat2Date) list.push({ course: s.courseCode, name: 'CAT-2', date: s.examDates.cat2Date });
      if (s.examDates?.fatDate) list.push({ course: s.courseCode, name: 'FAT / Final', date: s.examDates.fatDate });
    });
    return list.sort((a, b) => a.date.localeCompare(b.date))[0];
  }, [semesterSubjects]);

  const quickPrompts = [
    { label: 'What should I study today?', icon: '🎯' },
    { label: 'Which subject needs more attention?', icon: '⚠️' },
    { label: 'How should I prepare for my next exam?', icon: '📝' },
    { label: 'Am I following my weekly timetable?', icon: '📅' },
    { label: 'What should I learn next for my chosen career?', icon: '🚀' },
    { label: 'How can I balance academics and industry skills?', icon: '⚖️' },
  ];

  return (
    <div className="space-y-6">
      {/* Advisor Header & Live Context Status */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Unified Student Intelligence Hub</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
              Student AI Advisor
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Connected directly to your active semester subjects, live attendance, continuous assessment marks, timetable slots, and chosen career track.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChatHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </button>
          </div>
        </div>

        {/* Live Connected Context Ribbon */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-700 dark:text-slate-300">
            <span className="font-bold flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Context:</span>
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              Year {selectedYear} · Sem {selectedSemester} ({semesterSubjects.length} courses)
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              CGPA: {profile.currentCgpa.toFixed(2)}
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              Target: {profile.targetCgpa.toFixed(2)}
            </span>
            {nearestExam && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="text-rose-600 dark:text-rose-400 font-medium">
                  Next Exam: {nearestExam.course} ({nearestExam.date})
                </span>
              </>
            )}
          </div>

          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
            Track: {profile.targetRole || 'Software Development'}
          </span>
        </div>
      </div>

      {/* Main Chat Feed Container */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col h-[600px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {chatMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2 max-w-[85%]">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/60 rounded-tl-xs whitespace-pre-line'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Action Suggestion Chips if provided */}
                  {!isUser && msg.actionSuggestions && msg.actionSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.actionSuggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(sug)}
                          className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer shadow-xs active:scale-98"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 block px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {isAdvisorTyping && (
            <div className="flex gap-3 max-w-md">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 text-xs text-slate-500 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1">Analyzing semester marks & timetable...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts Ribbon */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 overflow-x-auto flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Quick Inquiries:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p.label)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 text-xs font-semibold whitespace-nowrap transition-colors shadow-xs active:scale-95 cursor-pointer"
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0">
          <input
            type="text"
            placeholder="Ask about your schedule, upcoming exams, CGPA goal, or career skills..."
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAdvisorTyping}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputPrompt.trim() || isAdvisorTyping}
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

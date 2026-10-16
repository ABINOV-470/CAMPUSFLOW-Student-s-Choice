import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  BookOpen,
  CheckCircle2,
  Flame,
  Award,
  SlidersHorizontal,
  Plus,
} from 'lucide-react';

export const StudyTimerSection: React.FC = () => {
  const { profile, todayFocusMinutes, addStudyLog, studyLogs, timetable } = useApp();

  // Mode and duration settings
  const [mode, setMode] = useState<'pomodoro' | 'deep' | 'sprint' | 'break' | 'custom'>('pomodoro');
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(timetable[0]?.courseCode || 'CS 301');
  const [sessionNotes, setSessionNotes] = useState('');
  const [customMinutesInput, setCustomMinutesInput] = useState(30);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const timerRef = useRef<number | null>(null);

  // Play synthesized gentle chime using Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35); // A5

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.4);
    } catch {
      // Audio might be blocked if user hasn't interacted, ignore gracefully
    }
  };

  // Timer tick
  useEffect(() => {
    if (isActive && secondsRemaining > 0) {
      timerRef.current = window.setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isActive && secondsRemaining === 0) {
      setIsActive(false);
      playChime();

      // If it wasn't a break, credit the minutes
      if (mode !== 'break') {
        const completedMinutes = Math.max(1, Math.round(totalSeconds / 60));
        const todayIso = new Date().toISOString().split('T')[0];
        addStudyLog({
          date: todayIso,
          minutes: completedMinutes,
          subject: selectedSubject,
          mode: 'pomodoro',
          notes: sessionNotes || 'Study interval completed.',
        });
        setSessionNotes('');
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, secondsRemaining]);

  // Mode switcher
  const handleSelectMode = (newMode: 'pomodoro' | 'deep' | 'sprint' | 'break' | 'custom') => {
    setIsActive(false);
    setShowCustomInput(false);
    setMode(newMode);
    let sec = 25 * 60;
    if (newMode === 'deep') sec = 50 * 60;
    if (newMode === 'sprint') sec = 15 * 60;
    if (newMode === 'break') sec = 5 * 60;
    if (newMode === 'custom') {
      sec = customMinutesInput * 60;
      setShowCustomInput(true);
    }
    setTotalSeconds(sec);
    setSecondsRemaining(sec);
  };

  const handleApplyCustomMinutes = (mins: number) => {
    const validMins = Math.max(1, Math.min(180, mins));
    setCustomMinutesInput(validMins);
    setTotalSeconds(validMins * 60);
    setSecondsRemaining(validMins * 60);
    setIsActive(false);
  };

  const toggleTimer = () => {
    setIsActive((prev) => !prev);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsRemaining(totalSeconds);
  };

  // Manual log session button
  const handleLogManualSession = () => {
    const elapsedSeconds = totalSeconds - secondsRemaining;
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
    const todayIso = new Date().toISOString().split('T')[0];

    addStudyLog({
      date: todayIso,
      minutes: elapsedMinutes,
      subject: selectedSubject,
      mode: 'pomodoro',
      notes: sessionNotes || 'Focused sprint log.',
    });

    resetTimer();
    setSessionNotes('');
  };

  // Format time MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Calculate circular progress
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100 : 0;

  // Today's completed study sessions
  const todayIso = new Date().toISOString().split('T')[0];
  const todaySessions = studyLogs.filter((l) => l.date === todayIso);

  // Subject options
  const courseOptions = Array.from(new Set(timetable.map((c) => c.courseCode)));
  if (!courseOptions.includes('CS 301')) courseOptions.unshift('CS 301');
  if (!courseOptions.includes('PHYS 202')) courseOptions.push('PHYS 202');
  if (!courseOptions.includes('General Review')) courseOptions.push('General Review');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            Study Focus Timer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deep work intervals with automated study logging and subject attribution.
          </p>
        </div>

        {/* Audio notification toggle */}
        <button
          onClick={() => setSoundEnabled((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 self-start sm:self-auto transition-colors cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-500" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
          <span>{soundEnabled ? 'Chime Enabled' : 'Muted'}</span>
        </button>
      </div>

      {/* Main Focus Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: The Circular Timer Deck (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm flex flex-col items-center justify-between">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-slate-700/60 w-full max-w-md justify-between">
            <button
              onClick={() => handleSelectMode('pomodoro')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'pomodoro'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              25m Focus
            </button>
            <button
              onClick={() => handleSelectMode('deep')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'deep'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              50m Deep
            </button>
            <button
              onClick={() => handleSelectMode('sprint')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'sprint'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              15m Sprint
            </button>
            <button
              onClick={() => handleSelectMode('break')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'break'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              5m Break
            </button>
            <button
              onClick={() => handleSelectMode('custom')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                mode === 'custom'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Custom
            </button>
          </div>

          {/* Custom Duration Bar if custom selected */}
          {mode === 'custom' && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-medium">Minutes:</span>
              <input
                type="number"
                min="1"
                max="180"
                value={customMinutesInput}
                onChange={(e) => handleApplyCustomMinutes(Number(e.target.value))}
                className="w-16 px-2 py-1 text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              />
              <span className="text-xs text-slate-400">(1-180m)</span>
            </div>
          )}

          {/* Circular Countdown Ring */}
          <div className="relative my-8 w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* Ambient subtle glow when active */}
            {isActive && (
              <div className="absolute inset-4 rounded-full bg-indigo-500/15 blur-xl pointer-events-none animate-subtle-glow" />
            )}

            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Background track */}
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-100 dark:stroke-slate-800 fill-none"
                strokeWidth="5"
              />
              {/* Animated Progress Arc */}
              <circle
                cx="50"
                cy="50"
                r="42"
                className={`fill-none transition-all duration-300 ${
                  mode === 'break' ? 'stroke-emerald-500' : 'stroke-indigo-600 dark:stroke-indigo-500'
                }`}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="264"
                strokeDashoffset={264 * (1 - progressPercent / 100)}
              />
            </svg>

            {/* Inner digits */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
                {formattedTime}
              </span>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                  {selectedSubject}
                </span>
                <span>·</span>
                <span>{isActive ? 'Timer Active' : 'Paused'}</span>
              </div>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="flex items-center gap-3 w-full max-w-xs">
            <button
              onClick={resetTimer}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reset Timer"
              aria-label="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTimer}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer ${
                isActive
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
              }`}
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>{secondsRemaining === totalSeconds ? 'Start Focus Session' : 'Resume Session'}</span>
                </>
              )}
            </button>
          </div>

          {/* Log early button */}
          {secondsRemaining < totalSeconds && (
            <button
              onClick={handleLogManualSession}
              className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Log elapsed focus time early ({Math.max(1, Math.round((totalSeconds - secondsRemaining) / 60))} mins)
            </button>
          )}
        </div>

        {/* Right: Subject Settings & Daily Goal Progress (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target Goal & Streak Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Daily Study Target
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                <Flame className="w-4 h-4" />
                <span>4-Day Active Streak</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                {todayFocusMinutes}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                / {profile.dailyStudyGoalMinutes} mins target
              </span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((todayFocusMinutes / profile.dailyStudyGoalMinutes) * 100))}%`,
                }}
              />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {todayFocusMinutes >= profile.dailyStudyGoalMinutes
                ? "Daily goal reached! You've logged productive hours today."
                : `Need ${profile.dailyStudyGoalMinutes - todayFocusMinutes} more minutes today to hit your ${profile.dailyStudyGoalMinutes}-minute target.`}
            </p>
          </div>

          {/* Session Configuration Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">
              Focus Attribution
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Active Subject / Course
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              >
                {courseOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Session Objective Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Read chapter 6 or finish questions 1-5"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Today's Logged Sessions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Today's Sessions ({todaySessions.length})
              </h3>
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {todayFocusMinutes}m Total
              </span>
            </div>

            {todaySessions.length === 0 ? (
              <div className="py-6 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Clock className="w-6 h-6 mx-auto mb-1 text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-medium">No focus sessions recorded yet today</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Start a 25-minute sprint above to begin logging.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {todaySessions.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {log.subject}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 truncate max-w-[140px]">
                          {log.notes || 'Focus Interval'}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0 tabular-nums">
                      +{log.minutes}m
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

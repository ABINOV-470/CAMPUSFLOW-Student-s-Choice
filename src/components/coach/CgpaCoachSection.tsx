import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AcademicSubject, Priority, SubjectDifficulty } from '../../types';
import {
  Award,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  Sliders,
  ChevronRight,
  Info,
  Check,
  X,
  HelpCircle,
  BarChart3,
  Flame,
  ShieldCheck,
  Layers,
} from 'lucide-react';

export const CgpaCoachSection: React.FC = () => {
  const {
    profile,
    selectedYear,
    selectedSemester,
    setSelectedSemester,
    semesterSubjects,
    allSubjects,
    semesterCredits,
    semesterAttendance,
    semesterGpa,
    calculatedCgpa,
    cgpaGap,
    setProfileModalOpen,
    setActiveTab,
    todayFocusMinutes,
    addStudySession,
    addToast,
  } = useApp();

  // Dismissed suggestion IDs
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  // Accepted suggestion IDs
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<string[]>([]);

  // Weekly goals state
  const [weeklyGoals, setWeeklyGoals] = useState<{ id: string; title: string; completed: boolean }[]>([
    { id: 'g1', title: 'Complete 2 full mock papers for CAT-1 examinations', completed: false },
    { id: 'g2', title: 'Maintain attendance above 80% across all 4-credit courses', completed: true },
    { id: 'g3', title: 'Log 8 hours of deep focus study sessions on timer', completed: false },
    { id: 'g4', title: 'Submit Digital Assignment & Lab code before Friday deadline', completed: false },
  ]);

  // Grade projector state: maps subjectId to simulated grade
  const [projectedGrades, setProjectedGrades] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    semesterSubjects.forEach((s) => {
      init[s.id] = s.grade && s.grade !== 'In Progress' ? s.grade : 'A';
    });
    return init;
  });

  const gradePoints: Record<string, number> = {
    'S': 10,
    'A': 9,
    'B': 8,
    'C': 7,
    'D': 6,
    'E': 5,
    'F': 0,
  };

  // Toggle goal completion
  const handleToggleGoal = (id: string) => {
    setWeeklyGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const next = !g.completed;
          if (next) addToast('Goal Achieved! 🎯', 'Weekly academic milestone completed.');
          return { ...g, completed: next };
        }
        return g;
      })
    );
  };

  // Calculate projected Semester GPA
  const projectedSemesterGpa = useMemo(() => {
    if (semesterSubjects.length === 0) return null;
    let totalPoints = 0;
    let totalCreds = 0;

    semesterSubjects.forEach((s) => {
      const g = projectedGrades[s.id] || 'A';
      const pt = gradePoints[g] ?? 9;
      totalPoints += (s.credits || 0) * pt;
      totalCreds += (s.credits || 0);
    });

    return totalCreds > 0 ? Number((totalPoints / totalCreds).toFixed(2)) : null;
  }, [semesterSubjects, projectedGrades]);

  // Subject Vulnerability Matrix
  const subjectAssessments = useMemo(() => {
    return semesterSubjects.map((subj) => {
      let riskScore = 0;
      const issues: string[] = [];
      const strengths: string[] = [];

      // Attendance check
      if (subj.attendancePercentage < 75) {
        riskScore += 40;
        issues.push(`Attendance at ${subj.attendancePercentage}% is below the mandatory 75% threshold.`);
      } else if (subj.attendancePercentage < 80) {
        riskScore += 15;
        issues.push(`Attendance at ${subj.attendancePercentage}% is borderline safe.`);
      } else {
        strengths.push(`Solid attendance at ${subj.attendancePercentage}%.`);
      }

      // Assessment marks check
      const cat1 = subj.assessmentMarks?.cat1;
      const cat2 = subj.assessmentMarks?.cat2;
      if (cat1 !== undefined) {
        if (cat1 < 38) {
          riskScore += 25;
          issues.push(`CAT-1 score (${cat1}/50) needs boost for S/A grade.`);
        } else {
          strengths.push(`Strong CAT-1 standing (${cat1}/50).`);
        }
      }

      // Difficulty
      if (subj.difficulty === 'Critical' || subj.difficulty === 'Hard') {
        riskScore += 20;
        issues.push(`Student classified as ${subj.difficulty} difficulty.`);
      }

      // Credit weighting
      if (subj.credits >= 4) {
        riskScore += 10;
      }

      const status: 'Needs Attention' | 'Moderate' | 'Safe' =
        riskScore >= 45 ? 'Needs Attention' : riskScore >= 20 ? 'Moderate' : 'Safe';

      return {
        subject: subj,
        riskScore,
        status,
        issues,
        strengths,
      };
    }).sort((a, b) => b.riskScore - a.riskScore);
  }, [semesterSubjects]);

  // Actionable recommendations
  interface Recommendation {
    id: string;
    title: string;
    action: string;
    courseCode: string;
    priority: Priority;
    rationale: string;
    whyMade: string;
  }

  const recommendations: Recommendation[] = useMemo(() => {
    const list: Recommendation[] = [];

    // 1. Identify lowest attendance subject
    const lowestAtt = [...semesterSubjects].sort((a, b) => a.attendancePercentage - b.attendancePercentage)[0];
    if (lowestAtt && lowestAtt.attendancePercentage < 80) {
      list.push({
        id: `rec-att-${lowestAtt.id}`,
        title: `Boost Attendance in ${lowestAtt.courseCode}`,
        action: `Attend all next 4 lectures without absence`,
        courseCode: lowestAtt.courseCode,
        priority: lowestAtt.attendancePercentage < 75 ? 'urgent' : 'high',
        rationale: `Current attendance is ${lowestAtt.attendancePercentage}%. 4 consecutive attended classes will elevate your standing to ~82%.`,
        whyMade: `Institutional policy mandates 75% attendance for final exam eligibility. Falling below 75% risks exam debarment.`,
      });
    }

    // 2. Identify highest credit subject with upcoming CAT
    const highCreditSubj = semesterSubjects.find((s) => s.credits >= 4 && (s.examDates?.cat1Date || s.examDates?.cat2Date));
    if (highCreditSubj) {
      const examDate = highCreditSubj.examDates?.cat1Date || highCreditSubj.examDates?.cat2Date;
      list.push({
        id: `rec-exam-${highCreditSubj.id}`,
        title: `Exam Drill: ${highCreditSubj.courseCode} (${highCreditSubj.credits} Credits)`,
        action: `Solve 2 previous question papers this Thursday`,
        courseCode: highCreditSubj.courseCode,
        priority: 'urgent',
        rationale: `Scheduled exam on ${examDate}. 4-credit courses carry double the GPA weight of 2-credit subjects.`,
        whyMade: `Securing an S Grade (10.0) in a 4-credit course provides 40 grade points, which is the fastest mathematical path to closing your +${cgpaGap.toFixed(2)} CGPA gap.`,
      });
    }

    // 3. Digital assignment deadline
    const pendingDA = semesterSubjects.find((s) => s.assessmentMarks?.da && s.assessmentMarks.da < 28);
    if (pendingDA) {
      list.push({
        id: `rec-da-${pendingDA.id}`,
        title: `Digital Assignment Polish: ${pendingDA.courseCode}`,
        action: `Review and submit assignment rubrics`,
        courseCode: pendingDA.courseCode,
        priority: 'medium',
        rationale: `Digital assignments and quizzes account for 30% of total internal marks.`,
        whyMade: `Full marks in continuous digital assignments provide an essential safety net before the comprehensive final assessment (FAT).`,
      });
    }

    // 4. Daily focus habit
    list.push({
      id: 'rec-daily-timer',
      title: 'Maintain 90m Spaced Revision Rhythm',
      action: 'Use the CampusFlow Pomodoro Timer for 2 sessions daily',
      courseCode: 'ALL',
      priority: 'medium',
      rationale: `You logged ${todayFocusMinutes}m of focus today towards your ${profile.dailyStudyGoalMinutes}m goal.`,
      whyMade: `Empirical study habits research shows that distributed 45-minute sessions outperform 4-hour weekend cramming in long-term retention by 28%.`,
    });

    return list.filter((r) => !dismissedSuggestions.includes(r.id));
  }, [semesterSubjects, cgpaGap, todayFocusMinutes, profile.dailyStudyGoalMinutes, dismissedSuggestions]);

  const handleAcceptRecommendation = (rec: Recommendation) => {
    setAcceptedSuggestions((prev) => [...prev, rec.id]);
    // Schedule a study block automatically for this recommendation
    if (rec.courseCode !== 'ALL') {
      addStudySession({
        courseCode: rec.courseCode,
        subjectName: rec.title,
        dayOfWeek: 'Fri',
        startTime: '16:00',
        endTime: '17:15',
        durationMinutes: 75,
        sessionType: 'Revision',
        priority: rec.priority,
        completed: false,
        isAiGenerated: true,
        rationale: rec.rationale,
      });
    }
    addToast('Recommendation Accepted! 📅', `Scheduled dedicated session for "${rec.title}" on Friday.`);
  };

  const handleDismissRecommendation = (recId: string) => {
    setDismissedSuggestions((prev) => [...prev, recId]);
    addToast('Suggestion Dismissed', 'Recommendation removed from your active review.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & CGPA Target Overview */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Award className="w-4 h-4" />
              <span>Academic Performance & Strategic Grade Coaching</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-2.5">
              <span>Personalized CGPA Coach</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Analyzes actual entered marks, attendance, credits weighting, and exam schedules to deliver achievable daily study recommendations without linear assumptions.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Adjust Target Goal</span>
            </button>
          </div>
        </div>

        {/* 3 Metrics Cards: Current CGPA, Target CGPA, Gap & Realistic Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Current CGPA */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Current CGPA Standing
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {profile.currentCgpa.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 10.00</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">
              Cumulative score across all evaluated courses
            </span>
          </div>

          {/* Target CGPA */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Aspirational Target
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                {profile.targetCgpa.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 10.00</span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">
              Configured graduation milestone goal
            </span>
          </div>

          {/* Numerical Gap & Status */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Target Delta (Gap)
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-extrabold font-mono ${
                  cgpaGap <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {cgpaGap > 0 ? `+${cgpaGap.toFixed(2)}` : '0.00'}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {cgpaGap <= 0 ? 'Goal Exceeded! 🎯' : 'points needed'}
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">
              {cgpaGap > 0 ? 'Achievable via S/A grades in 4-credit courses' : 'Target reached. Maintain consistency!'}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Cumulative CGPA Trajectory: <strong className="font-mono">{Math.min(100, Math.round((profile.currentCgpa / profile.targetCgpa) * 100))}%</strong>
            </span>
            <span className="text-[11px] text-slate-400">
              Semester {selectedSemester} Registered: {semesterCredits} Credits · Avg Attendance: {semesterAttendance}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((profile.currentCgpa / profile.targetCgpa) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Actionable Recommendations & Subject Vulnerability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recommendations (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Recommended Study Actions (This Week)</span>
            </h3>
            <span className="text-xs text-slate-400">
              {recommendations.length} Actionable Insights
            </span>
          </div>

          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec) => {
                const isAccepted = acceptedSuggestions.includes(rec.id);
                return (
                  <div
                    key={rec.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-all hover:border-indigo-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {rec.courseCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              rec.priority === 'urgent'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {rec.priority} Priority
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {rec.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isAccepted ? (
                          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accepted</span>
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAcceptRecommendation(rec)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                              title="Accept and add study session to schedule"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => handleDismissRecommendation(rec.id)}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                              title="Dismiss recommendation"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1.5 text-xs">
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        {rec.rationale}
                      </p>
                      <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50 flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span><strong>Why this recommendation:</strong> {rec.whyMade}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              No pending recommendations. All active courses are in excellent standing!
            </div>
          )}

          {/* Achievable Weekly Academic Goals */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Achievable Weekly Academic Goals</span>
              </h4>
              <span className="text-xs font-mono text-slate-400">
                {weeklyGoals.filter((g) => g.completed).length}/{weeklyGoals.length} done
              </span>
            </div>

            <div className="space-y-2">
              {weeklyGoals.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => handleToggleGoal(goal.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    goal.completed
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        goal.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {goal.completed && <Check className="w-3 h-3" />}
                    </div>
                    <span
                      className={`text-xs font-medium truncate ${
                        goal.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {goal.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Subject Vulnerability & GPA Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Subject Performance & Vulnerability Matrix */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Subject Vulnerability Matrix</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                Sem {selectedSemester} ({semesterSubjects.length} courses)
              </span>
            </div>

            <div className="space-y-2.5">
              {subjectAssessments.map(({ subject, status, issues, strengths }) => (
                <div
                  key={subject.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {subject.courseCode}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1.5 font-mono">
                        ({subject.credits} Credits)
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        status === 'Needs Attention'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : status === 'Moderate'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {subject.name} · Attendance: <strong className={subject.attendancePercentage < 75 ? 'text-rose-600' : 'text-emerald-600'}>{subject.attendancePercentage}%</strong>
                  </p>

                  {issues.length > 0 && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400">
                      ⚠ {issues[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Semester GPA Projector */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  <span>Semester GPA Projector</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Simulate expected course grades to project semester GPA
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block">Projected GPA</span>
                <span className="text-xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                  {projectedSemesterGpa ? projectedSemesterGpa.toFixed(2) : '—'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {semesterSubjects.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block truncate">
                      {s.courseCode} ({s.credits}c)
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {s.name}
                    </span>
                  </div>

                  <select
                    value={projectedGrades[s.id] || 'A'}
                    onChange={(e) =>
                      setProjectedGrades({ ...projectedGrades, [s.id]: e.target.value })
                    }
                    className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400"
                  >
                    <option value="S">S (10)</option>
                    <option value="A">A (9)</option>
                    <option value="B">B (8)</option>
                    <option value="C">C (7)</option>
                    <option value="D">D (6)</option>
                    <option value="E">E (5)</option>
                    <option value="F">F (0)</option>
                  </select>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 italic">
              *Estimates based on standard 10-point relative grading scale. Not a guaranteed future CGPA.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

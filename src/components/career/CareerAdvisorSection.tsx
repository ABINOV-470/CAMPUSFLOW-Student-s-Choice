import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CAREER_PATHS } from '../../data/careerData';
import { CareerPath } from '../../types';
import {
  Briefcase,
  Sparkles,
  CheckCircle2,
  Circle,
  ExternalLink,
  Code,
  Terminal,
  BookOpen,
  GitBranch,
  Layers,
  Award,
  Clock,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Check,
  FolderGit2,
  Users,
  Compass,
} from 'lucide-react';

export const CareerAdvisorSection: React.FC = () => {
  const { profile, updateProfile, addToast, setActiveTab } = useApp();

  // Selected career path ID
  const [selectedPathId, setSelectedPathId] = useState<string>(() => {
    const found = CAREER_PATHS.find((p) => p.title.toLowerCase().includes((profile.targetRole || '').toLowerCase()));
    return found ? found.id : 'fullstack-web';
  });

  // Track completed skills locally
  const [completedSkills, setCompletedSkills] = useState<Record<string, boolean>>({});

  const currentPath: CareerPath =
    CAREER_PATHS.find((p) => p.id === selectedPathId) || CAREER_PATHS[0];

  const handleToggleSkill = (skillId: string, skillName: string) => {
    setCompletedSkills((prev) => {
      const nextVal = !prev[skillId];
      if (nextVal) {
        addToast('Skill Mastered! 🚀', `Marked "${skillName}" as completed.`);
      }
      return { ...prev, [skillId]: nextVal };
    });
  };

  const completedSkillCount = currentPath.essentialSkills.filter((s) => completedSkills[s.id]).length;
  const skillProgress = Math.round((completedSkillCount / currentPath.essentialSkills.length) * 100);

  const handleSetPrimaryCareer = () => {
    updateProfile({ targetRole: currentPath.title });
    addToast('Career Path Set as Primary', `Your timetable and AI advisor are now aligned with ${currentPath.title}.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <Compass className="w-4 h-4" />
              <span>Industry Readiness & Tech Roadmap</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-2.5">
              <span>Career Readiness Advisor</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Curated skill trees, verified job-market insights, GitHub portfolio milestones, and structured 12-week roadmaps tailored for college students.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            {profile.targetRole === currentPath.title ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Active Target Role</span>
              </span>
            ) : (
              <button
                onClick={handleSetPrimaryCareer}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Set as My Target Role</span>
              </button>
            )}
          </div>
        </div>

        {/* 8 Career Paths Switcher Tabs */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Select Engineering Career Track
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CAREER_PATHS.map((path) => {
              const isSelected = selectedPathId === path.id;
              return (
                <button
                  key={path.id}
                  onClick={() => setSelectedPathId(path.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span className={`text-[10px] uppercase font-bold block ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                    {path.category}
                  </span>
                  <span className={`text-xs font-bold block truncate mt-0.5 ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                    {path.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Career Path Overview & Verified Market Data */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Details, Skills & Projects (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Path Header Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono">
                {currentPath.category}
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
                {currentPath.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {currentPath.description}
              </p>
            </div>

            {/* Verified Market Demand Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Market Demand & Opportunity</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Checked: {currentPath.sourceCheckedDate}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                {currentPath.marketDemand}
              </p>
              <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                Source: {currentPath.demandSource}
              </p>
            </div>

            {/* Languages & Frameworks Chips */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Recommended Languages & Core Stack:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {currentPath.recommendedLanguages.map((lang) => (
                  <span
                    key={lang}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono text-xs font-bold"
                  >
                    {lang}
                  </span>
                ))}
                {currentPath.frameworksAndTools.map((tool) => (
                  <span
                    key={tool}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Essential Skills Progression Checklist */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>Essential Skills in Learning Order</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Step-by-step ordered progression from fundamentals to advanced competency
                </p>
              </div>

              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {completedSkillCount}/{currentPath.essentialSkills.length} ({skillProgress}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${skillProgress}%` }}
              />
            </div>

            <div className="space-y-2">
              {currentPath.essentialSkills.map((skill, idx) => {
                const isDone = !!completedSkills[skill.id];
                return (
                  <div
                    key={skill.id}
                    onClick={() => handleToggleSkill(skill.id, skill.name)}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isDone
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="font-mono text-xs font-bold text-slate-400 w-5 shrink-0">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isDone && <Check className="w-3 h-3" />}
                      </div>
                      <span
                        className={`text-xs font-medium truncate ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {skill.name}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                        skill.level === 'Fundamental'
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          : skill.level === 'Intermediate'
                          ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                          : 'bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300'
                      }`}
                    >
                      {skill.level}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Beginner-Friendly Projects & Portfolio Milestones */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-indigo-500" />
                  <span>Portfolio Projects & GitHub Milestones</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Build production-grade repositories showcasing verified skills to recruiters
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {currentPath.starterProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                        {proj.difficulty} Blueprint
                      </span>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                        {proj.title}
                      </h5>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {proj.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                      <span>GitHub Milestones:</span>
                    </span>
                    <ul className="space-y-1 pl-4 list-disc text-xs text-slate-600 dark:text-slate-400">
                      {proj.githubMilestones.map((m, mIdx) => (
                        <li key={mIdx}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: 12-Week Roadmap & Interview Prep (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 12-Week Learning Roadmap */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <span>12-Week Structured Learning Roadmap</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Paced milestones designed for {profile.weeklyCareerHours || 6} hours weekly commitment
              </p>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {currentPath.weeklyRoadmap.map((item) => (
                <div
                  key={item.week}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Week {item.week}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {item.phase}
                    </span>
                  </div>

                  <h5 className="font-bold text-slate-800 dark:text-slate-200">
                    {item.focus}
                  </h5>

                  <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block">Deliverables:</span>
                    {item.deliverables.map((d, dIdx) => (
                      <span key={dIdx} className="block pl-2 border-l border-indigo-400">
                        • {d}
                      </span>
                    ))}
                  </div>

                  <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span><strong>Soft Skill:</strong> {item.softSkill}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Prep & Practice Problems */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>Interview Preparation & Practice</span>
              </h4>
              <p className="text-[11px] text-slate-400">
                Technical topics and communication strategies for campus placements
              </p>
            </div>

            <div className="space-y-3">
              {currentPath.interviewPrep.map((prep, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    {prep.category}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {prep.topics.map((top) => (
                      <span
                        key={top}
                        className="px-2 py-0.5 rounded text-[11px] bg-white dark:bg-slate-800 border text-slate-600 dark:text-slate-300"
                      >
                        {top}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 italic">
                    💡 Tip: {prep.tips}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

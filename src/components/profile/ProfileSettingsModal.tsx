import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ImageCropperModal } from './ImageCropperModal';
import { AccentColor, StudyTimePreference } from '../../types';
import {
  X,
  Check,
  RotateCcw,
  User,
  GraduationCap,
  Award,
  Clock,
  Upload,
  Trash2,
  TrendingUp,
  Target,
  Sparkles,
  AlertCircle,
  BookOpen,
  Briefcase,
  Palette,
  Sliders,
  Calendar,
  Layers,
} from 'lucide-react';

export const ProfileSettingsModal: React.FC = () => {
  const {
    profileModalOpen,
    setProfileModalOpen,
    profile,
    updateProfile,
    updateProfileImage,
    removeProfileImage,
    resetToDemoData,
    addToast,
    accentColor,
    setAccentColor,
    selectedYear,
    selectedSemester,
    setSelectedSemester,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state initialized from profile
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    bio: profile.bio || '',
    university: profile.university,
    major: profile.major,
    degree: profile.degree || 'B.Tech',
    branch: profile.branch || 'Computer Science & Engineering',
    year: profile.year,
    semester: profile.semester,
    studentId: profile.studentId,
    currentCgpa: profile.currentCgpa ?? 8.85,
    targetCgpa: profile.targetCgpa ?? 9.30,
    dailyStudyGoalMinutes: profile.dailyStudyGoalMinutes || 120,
    academicGoals: profile.academicGoals || '',
    studyPriorityFocus: profile.studyPriorityFocus || '',
    targetRole: profile.targetRole || 'Software & Full-Stack Web Development',
    skillsExperienceLevel: profile.skillsExperienceLevel || 'Intermediate',
    weeklyCareerHours: profile.weeklyCareerHours || 6,
    preferredStudyTimes: profile.preferredStudyTimes || (['Morning', 'Evening', 'Night'] as StudyTimePreference[]),
    studyBreakDurationMinutes: profile.studyBreakDurationMinutes || 15,
    maxDailyStudyHours: profile.maxDailyStudyHours || 4,
  });

  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'academic' | 'career' | 'preferences'>('general');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Image Cropper modal state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);

  // Synchronize when modal opens
  useEffect(() => {
    if (profileModalOpen) {
      setFormData({
        name: profile.name,
        email: profile.email,
        bio: profile.bio || '',
        university: profile.university,
        major: profile.major,
        degree: profile.degree || 'B.Tech',
        branch: profile.branch || 'Computer Science & Engineering',
        year: profile.year,
        semester: profile.semester,
        studentId: profile.studentId,
        currentCgpa: profile.currentCgpa ?? 8.85,
        targetCgpa: profile.targetCgpa ?? 9.30,
        dailyStudyGoalMinutes: profile.dailyStudyGoalMinutes || 120,
        academicGoals: profile.academicGoals || '',
        studyPriorityFocus: profile.studyPriorityFocus || '',
        targetRole: profile.targetRole || 'Software & Full-Stack Web Development',
        skillsExperienceLevel: profile.skillsExperienceLevel || 'Intermediate',
        weeklyCareerHours: profile.weeklyCareerHours || 6,
        preferredStudyTimes: profile.preferredStudyTimes || ['Morning', 'Evening', 'Night'],
        studyBreakDurationMinutes: profile.studyBreakDurationMinutes || 15,
        maxDailyStudyHours: profile.maxDailyStudyHours || 4,
      });
      setValidationError(null);
    }
  }, [profileModalOpen, profile]);

  if (!profileModalOpen) return null;

  // Process chosen device file into cropper
  const handleSelectDeviceFile = (file: File) => {
    if (!file.type.match(/^image\/(png|jpe?g|webp)$/i)) {
      addToast('Invalid Image Format', 'Please upload a PNG, JPEG, or WebP photo.', 'warning');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      addToast('File Too Large', 'Please select an image under 12MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setRawImageSrc(dataUrl);
        setCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSelectDeviceFile(file);
    }
  };

  const handleSaveCroppedAvatar = async (croppedDataUrl: string) => {
    await updateProfileImage(croppedDataUrl);
  };

  const handleRemovePhoto = async () => {
    await removeProfileImage();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Real-time CGPA calculations
  const curCgpaNum = Number(formData.currentCgpa);
  const tgtCgpaNum = Number(formData.targetCgpa);
  const gap = +(tgtCgpaNum - curCgpaNum).toFixed(2);
  const progressPercent = tgtCgpaNum > 0
    ? Math.min(100, Math.max(0, Math.round((curCgpaNum / tgtCgpaNum) * 100)))
    : 0;

  // Study time preference toggle
  const toggleStudyTime = (time: StudyTimePreference) => {
    setFormData((prev) => {
      const exists = prev.preferredStudyTimes.includes(time);
      const next = exists
        ? prev.preferredStudyTimes.filter((t) => t !== time)
        : [...prev.preferredStudyTimes, time];
      return { ...prev, preferredStudyTimes: next.length > 0 ? next : [time] };
    });
  };

  // Accent Colors list
  const accentColors: { id: AccentColor; name: string; bg: string; border: string }[] = [
    { id: 'indigo', name: 'Indigo Aura', bg: 'bg-indigo-600', border: 'border-indigo-600' },
    { id: 'emerald', name: 'Emerald Forest', bg: 'bg-emerald-600', border: 'border-emerald-600' },
    { id: 'violet', name: 'Electric Violet', bg: 'bg-violet-600', border: 'border-violet-600' },
    { id: 'sky', name: 'Ocean Sky', bg: 'bg-sky-600', border: 'border-sky-600' },
    { id: 'rose', name: 'Crimson Rose', bg: 'bg-rose-600', border: 'border-rose-600' },
    { id: 'amber', name: 'Sunset Amber', bg: 'bg-amber-600', border: 'border-amber-600' },
  ];

  // Career Roles
  const careerRoles = [
    'Software & Full-Stack Web Development',
    'AI & Machine Learning Engineering',
    'Data Analytics & Data Engineering',
    'Cybersecurity & Network Defense',
    'Cloud Computing & DevOps Engineering',
    'Mobile Application Development',
    'Embedded Systems & IoT Engineering',
    'UI/UX Product Design & Frontend Engineering',
  ];

  // Form submission with strict validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setValidationError('Student name cannot be empty.');
      return;
    }

    if (isNaN(curCgpaNum) || curCgpaNum < 0 || curCgpaNum > 10) {
      setValidationError('Current CGPA must be a valid number between 0.00 and 10.00.');
      return;
    }
    if (isNaN(tgtCgpaNum) || tgtCgpaNum < 1 || tgtCgpaNum > 10) {
      setValidationError('Target CGPA must be set between 1.00 and 10.00.');
      return;
    }

    setValidationError(null);

    updateProfile({
      name: formData.name.trim(),
      email: formData.email.trim(),
      bio: formData.bio.trim(),
      university: formData.university.trim(),
      major: formData.major.trim(),
      degree: formData.degree.trim(),
      branch: formData.branch.trim(),
      studentId: formData.studentId.trim(),
      currentCgpa: Number(curCgpaNum.toFixed(2)),
      targetCgpa: Number(tgtCgpaNum.toFixed(2)),
      dailyStudyGoalMinutes: Number(formData.dailyStudyGoalMinutes) || 120,
      academicGoals: formData.academicGoals.trim(),
      studyPriorityFocus: formData.studyPriorityFocus.trim(),
      targetRole: formData.targetRole,
      skillsExperienceLevel: formData.skillsExperienceLevel as any,
      weeklyCareerHours: Number(formData.weeklyCareerHours) || 6,
      preferredStudyTimes: formData.preferredStudyTimes,
      studyBreakDurationMinutes: Number(formData.studyBreakDurationMinutes) || 15,
      maxDailyStudyHours: Number(formData.maxDailyStudyHours) || 4,
    });

    setProfileModalOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div
          className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-sans">
                  Student Profile & Academic Settings
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customizable profile, photo cropper, CGPA targets, and study preferences
                </p>
              </div>
            </div>

            <button
              onClick={() => setProfileModalOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 overflow-x-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveSettingsTab('general')}
              className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeSettingsTab === 'general'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Identity & Avatar</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSettingsTab('academic')}
              className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeSettingsTab === 'academic'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>CGPA & Academic Goals</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSettingsTab('career')}
              className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeSettingsTab === 'career'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Career & Industry Skills</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSettingsTab('preferences')}
              className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeSettingsTab === 'preferences'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Themes & Study Schedule</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
            {validationError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* TAB 1: GENERAL & AVATAR CROPPER */}
            {activeSettingsTab === 'general' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Photo Management Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Avatar Display */}
                    <div className="relative group shrink-0">
                      <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        {profile.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
                            {formData.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Photo Action Buttons */}
                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          Profile Photograph
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Upload directly from your device (PNG, JPG, WebP). Reposition, crop, and zoom to frame.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload & Crop Image</span>
                        </button>

                        {profile.avatarUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setRawImageSrc(profile.avatarUrl);
                              setCropperOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Adjust Crop</span>
                          </button>
                        )}

                        {profile.avatarUrl && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Identity Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Profile Bio & Description
                    </label>
                    <textarea
                      rows={2}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="e.g. 2nd Year CSE undergraduate interested in distributed systems, full-stack architectures, and AI."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      University / College Name
                    </label>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Student Registration ID
                    </label>
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Degree & Major
                    </label>
                    <input
                      type="text"
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Branch / Specialization
                    </label>
                    <input
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CGPA & ACADEMIC GOALS */}
            {activeSettingsTab === 'academic' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* CGPA Progress Summary Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-white dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-900/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      <span>CGPA Achievement Track (0.00 – 10.00 Scale)</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      {progressPercent}% towards goal
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                        Current CGPA
                      </span>
                      <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                        {curCgpaNum.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                        Target CGPA
                      </span>
                      <span className="text-2xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                        {tgtCgpaNum.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>0.00 Minimum</span>
                      <span>Gap: {gap > 0 ? `+${gap.toFixed(2)} points needed` : 'Target Achieved! 🎯'}</span>
                      <span>10.00 Maximum</span>
                    </div>
                  </div>
                </div>

                {/* CGPA Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Current CGPA (0.00 – 10.00)
                      </label>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {curCgpaNum.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={formData.currentCgpa}
                      onChange={(e) => setFormData({ ...formData, currentCgpa: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold text-slate-900 dark:text-white"
                    />
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={formData.currentCgpa}
                      onChange={(e) => setFormData({ ...formData, currentCgpa: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Target CGPA (1.00 – 10.00)
                      </label>
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {tgtCgpaNum.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      max="10"
                      value={formData.targetCgpa}
                      onChange={(e) => setFormData({ ...formData, targetCgpa: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold text-slate-900 dark:text-white"
                    />
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.1"
                      value={formData.targetCgpa}
                      onChange={(e) => setFormData({ ...formData, targetCgpa: Number(e.target.value) })}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>

                {/* Academic Goals text area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Personal Academic Goals
                  </label>
                  <textarea
                    rows={2}
                    value={formData.academicGoals}
                    onChange={(e) => setFormData({ ...formData, academicGoals: e.target.value })}
                    placeholder="e.g. Secure S Grades in Core Algorithms and Database Systems, achieve 9.0+ semester GPA."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Current Study Priority Focus
                  </label>
                  <input
                    type="text"
                    value={formData.studyPriorityFocus}
                    onChange={(e) => setFormData({ ...formData, studyPriorityFocus: e.target.value })}
                    placeholder="e.g. Data Structures tree traversals & continuous assessment mock tests."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: CAREER & INDUSTRY READINESS */}
            {activeSettingsTab === 'career' && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Career Path / Engineering Role
                  </label>
                  <select
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {careerRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Self-Assessed Experience Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setFormData({ ...formData, skillsExperienceLevel: lvl })}
                          className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                            formData.skillsExperienceLevel === lvl
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Weekly Career Skill Allocation (Hours)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="2"
                        max="20"
                        step="1"
                        value={formData.weeklyCareerHours}
                        onChange={(e) => setFormData({ ...formData, weeklyCareerHours: Number(e.target.value) })}
                        className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400 w-12 text-right">
                        {formData.weeklyCareerHours}h/wk
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>How this powers CampusFlow:</span>
                  </span>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300">
                    Your chosen career track will automatically populate the Career Readiness roadmap, slot dedicated skill sessions into your Timetable, and guide the Unified Student AI Advisor.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: THEMES & STUDY PREFERENCES */}
            {activeSettingsTab === 'preferences' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Accent Color Customizer */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-indigo-500" />
                    <span>Custom Accent Color Theme</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {accentColors.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setAccentColor(acc.id)}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          accentColor === acc.id
                            ? 'bg-slate-100 dark:bg-slate-800 border-indigo-500 ring-2 ring-indigo-500/30'
                            : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full ${acc.bg} shadow-sm`} />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {acc.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Study Time Windows */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    <span>Preferred Study Time Windows</span>
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    The Smart Timetable planner schedules revision and career sessions inside these chosen windows:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(
                      [
                        { id: 'Morning', label: 'Morning', time: '07:00 – 09:00' },
                        { id: 'Afternoon', label: 'Afternoon', time: '14:00 – 17:00' },
                        { id: 'Evening', label: 'Evening', time: '17:30 – 20:00' },
                        { id: 'Night', label: 'Night', time: '20:30 – 23:00' },
                      ] as const
                    ).map((win) => {
                      const isSel = formData.preferredStudyTimes.includes(win.id);
                      return (
                        <button
                          key={win.id}
                          type="button"
                          onClick={() => toggleStudyTime(win.id)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            isSel
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span className="text-xs block">{win.label}</span>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            {win.time}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Break and Daily Limits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Break Duration Between Sessions
                    </label>
                    <select
                      value={formData.studyBreakDurationMinutes}
                      onChange={(e) => setFormData({ ...formData, studyBreakDurationMinutes: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value={10}>10 Minutes (Quick Stretch)</option>
                      <option value={15}>15 Minutes (Standard Pomodoro Break)</option>
                      <option value={30}>30 Minutes (Deep Rest)</option>
                      <option value={45}>45 Minutes (Extended Meal Break)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Maximum Daily Study Limit (Hours)
                    </label>
                    <select
                      value={formData.maxDailyStudyHours}
                      onChange={(e) => setFormData({ ...formData, maxDailyStudyHours: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value={2}>2 Hours / day (Light Focus)</option>
                      <option value={3}>3 Hours / day (Balanced Pace)</option>
                      <option value={4}>4 Hours / day (Standard Academic)</option>
                      <option value={6}>6 Hours / day (Intense Exam Mode)</option>
                    </select>
                  </div>
                </div>

                {/* Reset to Clean Demo State */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Restore Demo Data
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Reset all curriculum courses, timetable, and study sessions to default
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Reset all demo academic courses, timetable, and profile data?')) {
                        resetToDemoData();
                        setProfileModalOpen(false);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Data</span>
                  </button>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 active:scale-98 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save All Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Interactive Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={rawImageSrc}
        onClose={() => setCropperOpen(false)}
        onSaveCrop={handleSaveCroppedAvatar}
        onReplaceFile={handleSelectDeviceFile}
        onRemovePhoto={handleRemovePhoto}
      />
    </>
  );
};

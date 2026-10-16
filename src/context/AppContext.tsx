import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  StudentProfile,
  AcademicSubject,
  VITSubject,
  TimetableClass,
  StudySession,
  Task,
  CampusEvent,
  Club,
  StudySessionLog,
  NotificationToast,
  ActiveTab,
  DayOfWeek,
  CollegeYear,
  SemesterNumber,
  AccentColor,
  ChatMessage,
  TopicMastery,
  NextAction,
  ExamRescueBlock,
  ExamRescuePlan,
  GamificationProfile,
} from '../types';
import {
  INITIAL_PROFILE,
  INITIAL_ACADEMIC_SUBJECTS,
  INITIAL_CLASSES,
  INITIAL_TASKS,
  INITIAL_EVENTS,
  INITIAL_CLUBS,
  INITIAL_STUDY_LOGS,
  INITIAL_TOPIC_MASTERY,
  INITIAL_GAMIFICATION,
} from '../data/initialData';
import { saveAvatarToDb, getAvatarFromDb, deleteAvatarFromDb } from '../utils/imageDb';
import { generateWeeklyStudyPlan, replanMissedSessions } from '../utils/timetableScheduler';

export function getYearForSemester(sem: SemesterNumber): CollegeYear {
  if (sem <= 2) return 1;
  if (sem <= 4) return 2;
  if (sem <= 6) return 3;
  return 4;
}

export function getSemestersForYear(year: CollegeYear): [SemesterNumber, SemesterNumber] {
  if (year === 1) return [1, 2];
  if (year === 2) return [3, 4];
  if (year === 3) return [5, 6];
  return [7, 8];
}

export function parseGradePoint(grade?: string, explicitPoint?: number): number | undefined {
  if (explicitPoint !== undefined && !isNaN(explicitPoint) && explicitPoint >= 0 && explicitPoint <= 10) {
    return explicitPoint;
  }
  if (!grade) return undefined;
  const upper = grade.trim().toUpperCase();
  switch (upper) {
    case 'S':
    case 'O':
    case 'A+':
      return 10;
    case 'A':
      return 9;
    case 'B+':
    case 'B':
      return 8;
    case 'C+':
    case 'C':
      return 7;
    case 'D':
      return 6;
    case 'E':
      return 5;
    case 'F':
    case 'RA':
      return 0;
    default:
      return undefined;
  }
}

export interface SemesterStat {
  semesterNumber: SemesterNumber;
  year: CollegeYear;
  subjectCount: number;
  totalCredits: number;
  avgAttendance: number;
  gpa: number | null;
  isCurrent: boolean;
}

interface AppContextType {
  profile: StudentProfile;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  updateProfileImage: (imageDataUrl: string) => Promise<void>;
  removeProfileImage: () => Promise<void>;
  
  // Year & Semester Management
  selectedYear: CollegeYear;
  selectedSemester: SemesterNumber;
  setSelectedYear: (year: CollegeYear) => void;
  setSelectedSemester: (sem: SemesterNumber) => void;

  // Subjects Management
  allSubjects: AcademicSubject[];
  semesterSubjects: AcademicSubject[];
  vitSubjects: AcademicSubject[]; // alias to semesterSubjects
  addSubject: (newSubj: Omit<AcademicSubject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<AcademicSubject>) => void;
  deleteSubject: (id: string) => void;
  toggleSubjectGoal: (id: string) => void;
  
  // Semester Performance Metrics & CGPA
  semesterCredits: number;
  semesterAttendance: number;
  semesterGpa: number | null;
  allSemestersStats: SemesterStat[];
  calculatedCgpa: number;

  // Timetable & Smart Study Planner
  timetable: TimetableClass[];
  addClass: (newClass: Omit<TimetableClass, 'id'>) => void;
  updateClass: (id: string, updates: Partial<TimetableClass>) => void;
  deleteClass: (id: string) => void;
  
  studySessions: StudySession[];
  addStudySession: (session: Omit<StudySession, 'id'>) => void;
  updateStudySession: (id: string, updates: Partial<StudySession>) => void;
  deleteStudySession: (id: string) => void;
  toggleStudySessionCompleted: (id: string) => void;
  generateStudyPlan: () => void;
  replanMissedStudySessions: () => void;
  
  // Tasks
  tasks: Task[];
  addTask: (newTask: Omit<Task, 'id' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  
  // Campus Events & Clubs
  events: CampusEvent[];
  toggleEventRegistration: (id: string) => void;
  
  clubs: Club[];
  toggleClubMembership: (id: string) => void;
  
  studyLogs: StudySessionLog[];
  addStudyLog: (log: Omit<StudySessionLog, 'id' | 'timestamp'>) => void;
  
  // AI Advisor Chat
  chatMessages: ChatMessage[];
  sendChatMessage: (content: string) => Promise<void>;
  clearChatHistory: () => void;
  isAdvisorTyping: boolean;

  // Navigation & Appearance
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  darkMode: boolean;
  toggleDarkMode: () => void;

  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  
  toasts: NotificationToast[];
  addToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  
  profileModalOpen: boolean;
  setProfileModalOpen: (open: boolean) => void;
  
  resetToDemoData: () => void;
  
  // Adaptive Learning & Topics
  topics: TopicMastery[];
  updateTopicMastery: (id: string, updates: Partial<TopicMastery>) => void;
  addTopic: (newTopic: Omit<TopicMastery, 'id'>) => void;
  recordQuizScore: (topicId: string, accuracy: number) => void;
  recordRevisionCompleted: (topicId: string, recallQuality: 'hard' | 'good' | 'easy') => void;

  // Next Best Action
  nextBestAction: NextAction | null;
  nextBestActionsList: NextAction[];
  currentActionIndex: number;
  skipNextAction: () => void;
  completeNextAction: () => void;
  startNextActionSession: () => void;

  // Exam Rescue Mode
  examRescuePlan: ExamRescuePlan | null;
  examRescueModalOpen: boolean;
  setExamRescueModalOpen: (open: boolean) => void;
  generateExamRescuePlan: (params: {
    examName: string;
    targetExamDate: string;
    subjectCodes: string[];
    dailyStudyHours: number;
  }) => void;
  toggleRescueBlockCompleted: (blockId: string) => void;
  reorganizeExamRescuePlan: () => void;
  clearRescuePlan: () => void;

  // Gamification & Motivation
  gamification: GamificationProfile;
  awardXP: (amount: number, reason: string) => void;

  // Computed helpers
  currentDayName: DayOfWeek;
  todayClasses: TimetableClass[];
  todayStudySessions: StudySession[];
  pendingTasksCount: number;
  todayFocusMinutes: number;
  myEventsCount: number;
  myClubsCount: number;
  cgpaGap: number;
  overallAttendanceRate: number;
}

const STORAGE_KEYS = {
  PROFILE: 'campusflow_profile_v2',
  ACADEMIC_SUBJECTS: 'campusflow_academic_subjects_v2',
  LEGACY_SUBJECTS: 'campusflow_vit_subjects_v1',
  SELECTED_SEMESTER: 'campusflow_selected_semester_v1',
  CLASSES: 'campusflow_classes_v1',
  STUDY_SESSIONS: 'campusflow_study_sessions_v2',
  TASKS: 'campusflow_tasks_v1',
  EVENTS: 'campusflow_events_v1',
  CLUBS: 'campusflow_clubs_v1',
  STUDY_LOGS: 'campusflow_studylogs_v1',
  DARK_MODE: 'campusflow_darkmode_v1',
  ACCENT_COLOR: 'campusflow_accent_color_v1',
  CHAT_MESSAGES: 'campusflow_chat_messages_v1',
  TOPIC_MASTERY: 'campusflow_topic_mastery_v2',
  EXAM_RESCUE: 'campusflow_exam_rescue_v2',
  GAMIFICATION: 'campusflow_gamification_v2',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayIndex = new Date().getDay();
  return days[dayIndex];
}

function getTodayIsoDate(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Accent Color State
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCENT_COLOR);
    if (saved && ['indigo', 'emerald', 'violet', 'sky', 'rose', 'amber'].includes(saved)) {
      return saved as AccentColor;
    }
    return 'indigo';
  });

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    localStorage.setItem(STORAGE_KEYS.ACCENT_COLOR, color);
    setProfile((prev) => ({ ...prev, accentColor: color }));
  };

  // Profile state with 0-10 CGPA scale and career fields
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE) || localStorage.getItem('campusflow_profile_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        const currentCgpa = parsed.currentCgpa !== undefined
          ? parsed.currentCgpa
          : (parsed.currentGpa && parsed.currentGpa <= 4.0 ? Math.min(10, +(parsed.currentGpa * 2.3).toFixed(2)) : 8.85);
        const targetCgpa = parsed.targetCgpa !== undefined
          ? parsed.targetCgpa
          : (parsed.targetGpa && parsed.targetGpa <= 4.0 ? Math.min(10, +(parsed.targetGpa * 2.35).toFixed(2)) : 9.30);

        return {
          ...INITIAL_PROFILE,
          ...parsed,
          bio: parsed.bio || 'Computer Science undergrad passionate about distributed systems and AI.',
          branch: parsed.branch || 'Computer Science & Engineering',
          targetRole: parsed.targetRole || 'Software & Full-Stack Web Development',
          careerInterests: parsed.careerInterests || ['Full-Stack', 'Cloud Infrastructure', 'System Design'],
          skillsExperienceLevel: parsed.skillsExperienceLevel || 'Intermediate',
          weeklyCareerHours: parsed.weeklyCareerHours || 6,
          preferredStudyTimes: parsed.preferredStudyTimes || ['Morning', 'Evening', 'Night'],
          studyBreakDurationMinutes: parsed.studyBreakDurationMinutes || 15,
          maxDailyStudyHours: parsed.maxDailyStudyHours || 4,
          currentYear: parsed.currentYear || 2,
          currentSemester: parsed.currentSemester || 3,
          currentCgpa,
          targetCgpa,
          currentGpa: currentCgpa,
          targetGpa: targetCgpa,
          accentColor: (parsed.accentColor as AccentColor) || 'indigo',
        };
      }
      return {
        ...INITIAL_PROFILE,
        bio: 'Computer Science undergrad passionate about distributed systems and AI.',
        branch: 'Computer Science & Engineering',
        targetRole: 'Software & Full-Stack Web Development',
        careerInterests: ['Full-Stack', 'Cloud Infrastructure', 'System Design'],
        skillsExperienceLevel: 'Intermediate',
        weeklyCareerHours: 6,
        preferredStudyTimes: ['Morning', 'Evening', 'Night'],
        studyBreakDurationMinutes: 15,
        maxDailyStudyHours: 4,
      };
    } catch {
      return INITIAL_PROFILE;
    }
  });

  // Load avatar image from IndexedDB on initial mount
  useEffect(() => {
    let isMounted = true;
    getAvatarFromDb().then((savedAvatar) => {
      if (isMounted && savedAvatar) {
        setProfile((prev) => ({
          ...prev,
          avatarUrl: savedAvatar,
        }));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Selected semester state (Semester 1 through 8)
  const [selectedSemester, setSelectedSemesterState] = useState<SemesterNumber>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_SEMESTER);
      if (saved) {
        const num = Number(saved);
        if (num >= 1 && num <= 8) return num as SemesterNumber;
      }
      return (profile.currentSemester as SemesterNumber) || 3;
    } catch {
      return 3;
    }
  });

  const selectedYear = useMemo(() => getYearForSemester(selectedSemester), [selectedSemester]);

  // All Academic Subjects across 8 semesters
  const [allSubjects, setAllSubjects] = useState<AcademicSubject[]>(() => {
    try {
      const savedV2 = localStorage.getItem(STORAGE_KEYS.ACADEMIC_SUBJECTS);
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      const savedV1 = localStorage.getItem(STORAGE_KEYS.LEGACY_SUBJECTS);
      if (savedV1) {
        const parsedV1 = JSON.parse(savedV1);
        if (Array.isArray(parsedV1) && parsedV1.length > 0) {
          const sem3Items = parsedV1.map((s) => ({
            ...s,
            semesterNumber: s.semesterNumber || 3,
            difficulty: s.difficulty || 'Medium',
            confidenceLevel: s.confidenceLevel || 'High',
          }));
          const otherSems = INITIAL_ACADEMIC_SUBJECTS.filter((s) => s.semesterNumber !== 3);
          return [...sem3Items, ...otherSems];
        }
      }
      return INITIAL_ACADEMIC_SUBJECTS;
    } catch {
      return INITIAL_ACADEMIC_SUBJECTS;
    }
  });

  // Active semester subjects
  const semesterSubjects = useMemo(() => {
    return allSubjects.filter((s) => s.semesterNumber === selectedSemester);
  }, [allSubjects, selectedSemester]);

  // Timetable state (College Classes)
  const [timetable, setTimetable] = useState<TimetableClass[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLASSES);
      return saved ? JSON.parse(saved) : INITIAL_CLASSES;
    } catch {
      return INITIAL_CLASSES;
    }
  });

  // Tasks state
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  // Campus Events & Clubs state
  const [events, setEvents] = useState<CampusEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [clubs, setClubs] = useState<Club[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLUBS);
      return saved ? JSON.parse(saved) : INITIAL_CLUBS;
    } catch {
      return INITIAL_CLUBS;
    }
  });

  // Study focus timer sessions
  const [studyLogs, setStudyLogs] = useState<StudySessionLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDY_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_STUDY_LOGS;
    } catch {
      return INITIAL_STUDY_LOGS;
    }
  });

  // Smart Study Sessions (Plan Generated)
  const [studySessions, setStudySessions] = useState<StudySession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Generate initial study plan based on default sem 3 subjects
      const initialSemSubjs = INITIAL_ACADEMIC_SUBJECTS.filter((s) => s.semesterNumber === 3);
      return generateWeeklyStudyPlan({
        subjects: initialSemSubjs,
        collegeClasses: INITIAL_CLASSES,
        tasks: INITIAL_TASKS,
        profile: INITIAL_PROFILE,
        weeklyCareerHours: 6,
        studyTimePreferences: ['Morning', 'Evening', 'Night'],
      });
    } catch {
      return [];
    }
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [toasts, setToasts] = useState<NotificationToast[]>([]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // AI Advisor Chat History
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return [
        {
          id: 'msg-welcome',
          role: 'assistant',
          content: `Hi ${profile.name.split(' ')[0]}! I'm your Unified Student AI Advisor. I have full context of your Year ${selectedYear} · Semester ${selectedSemester} courses (${semesterSubjects.length} enrolled), your current CGPA (${profile.currentCgpa.toFixed(2)} vs target ${profile.targetCgpa.toFixed(2)}), and upcoming exams. What would you like to focus on today?`,
          timestamp: Date.now(),
          category: 'general',
          actionSuggestions: [
            'What should I study today?',
            'Which subject needs more attention?',
            'How should I prepare for my next exam?',
            'What should I learn next for my chosen career?',
          ],
        },
      ];
    } catch {
      return [];
    }
  });
  const [isAdvisorTyping, setIsAdvisorTyping] = useState(false);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACADEMIC_SUBJECTS, JSON.stringify(allSubjects));
  }, [allSubjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_SEMESTER, String(selectedSemester));
  }, [selectedSemester]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(studySessions));
  }, [studySessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLUBS, JSON.stringify(clubs));
  }, [clubs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDY_LOGS, JSON.stringify(studyLogs));
  }, [studyLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Adaptive Learning Topics State
  const [topics, setTopics] = useState<TopicMastery[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TOPIC_MASTERY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_TOPIC_MASTERY;
  });

  // Exam Rescue Plan State
  const [examRescuePlan, setExamRescuePlan] = useState<ExamRescuePlan | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXAM_RESCUE);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null;
  });
  const [examRescueModalOpen, setExamRescueModalOpen] = useState(false);

  // Motivation & Gamification State
  const [gamification, setGamification] = useState<GamificationProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GAMIFICATION);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_GAMIFICATION;
  });

  // Next Best Action selection index
  const [currentActionIndex, setCurrentActionIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TOPIC_MASTERY, JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    if (examRescuePlan) {
      localStorage.setItem(STORAGE_KEYS.EXAM_RESCUE, JSON.stringify(examRescuePlan));
    } else {
      localStorage.removeItem(STORAGE_KEYS.EXAM_RESCUE);
    }
  }, [examRescuePlan]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GAMIFICATION, JSON.stringify(gamification));
  }, [gamification]);

  // Toast notifications
  const addToast = (
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'success'
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: NotificationToast = { id, title, message, type, timestamp: Date.now() };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Profile actions
  const updateProfile = (updates: Partial<StudentProfile>) => {
    setProfile((prev) => ({
      ...prev,
      ...updates,
      currentGpa: updates.currentCgpa ?? prev.currentCgpa,
      targetGpa: updates.targetCgpa ?? prev.targetCgpa,
    }));
    addToast('Profile Updated', 'Your student details and preferences have been saved.');
  };

  const updateProfileImage = async (imageDataUrl: string) => {
    await saveAvatarToDb(imageDataUrl);
    setProfile((prev) => ({ ...prev, avatarUrl: imageDataUrl }));
    addToast('Avatar Updated', 'Your cropped profile photo was saved successfully.');
  };

  const removeProfileImage = async () => {
    await deleteAvatarFromDb();
    setProfile((prev) => ({ ...prev, avatarUrl: '' }));
    addToast('Avatar Removed', 'Profile photo cleared. Default avatar active.', 'info');
  };

  // Year & Semester actions
  const setSelectedYear = (year: CollegeYear) => {
    const sems = getSemestersForYear(year);
    setSelectedSemesterState(sems[0]);
    addToast(`Switched to Year ${year}`, `Now viewing Semester ${sems[0]} curriculum.`, 'info');
  };

  const setSelectedSemester = (sem: SemesterNumber) => {
    setSelectedSemesterState(sem);
    const yr = getYearForSemester(sem);
    addToast(`Semester ${sem} Active`, `Loaded Year ${yr} curriculum and performance data.`, 'info');
  };

  // Subjects actions
  const addSubject = (newSubj: Omit<AcademicSubject, 'id'>) => {
    const id = `subj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const subject: AcademicSubject = {
      ...newSubj,
      id,
      semesterNumber: newSubj.semesterNumber || selectedSemester,
      difficulty: newSubj.difficulty || 'Medium',
      confidenceLevel: newSubj.confidenceLevel || 'High',
    };
    setAllSubjects((prev) => [...prev, subject]);
    addToast('Subject Added', `${subject.courseCode}: ${subject.name} added to Semester ${subject.semesterNumber}.`);
  };

  const updateSubject = (id: string, updates: Partial<AcademicSubject>) => {
    setAllSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    addToast('Subject Updated', 'Course curriculum, attendance, and assessment details saved.');
  };

  const deleteSubject = (id: string) => {
    const target = allSubjects.find((s) => s.id === id);
    setAllSubjects((prev) => prev.filter((s) => s.id !== id));
    addToast('Subject Removed', `${target?.courseCode || 'Subject'} deleted from curriculum.`, 'info');
  };

  const toggleSubjectGoal = (id: string) => {
    setAllSubjects((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextVal = !s.goalCompleted;
          if (nextVal) {
            addToast('Goal Milestone Achieved! 🎯', `Completed study goal for ${s.courseCode}.`);
          }
          return { ...s, goalCompleted: nextVal };
        }
        return s;
      })
    );
  };

  // Timetable Class actions
  const addClass = (newClass: Omit<TimetableClass, 'id'>) => {
    const id = `cls-${Date.now()}`;
    const item: TimetableClass = { ...newClass, id };
    setTimetable((prev) => [...prev, item]);
    addToast('Class Added', `${item.courseCode}: ${item.courseName} added to schedule.`);
  };

  const updateClass = (id: string, updates: Partial<TimetableClass>) => {
    setTimetable((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    addToast('Schedule Updated', 'Class details have been modified.');
  };

  const deleteClass = (id: string) => {
    const target = timetable.find((c) => c.id === id);
    setTimetable((prev) => prev.filter((c) => c.id !== id));
    addToast('Class Removed', `${target?.courseCode || 'Class'} deleted from timetable.`, 'info');
  };

  // Study Plan Session actions
  const addStudySession = (newSession: Omit<StudySession, 'id'>) => {
    const id = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const session: StudySession = { ...newSession, id };
    setStudySessions((prev) => [...prev, session]);
    addToast('Session Scheduled', `Added ${session.courseCode} ${session.sessionType} on ${session.dayOfWeek}.`);
  };

  const updateStudySession = (id: string, updates: Partial<StudySession>) => {
    setStudySessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    addToast('Study Plan Updated', 'Session timing and details adjusted.');
  };

  const deleteStudySession = (id: string) => {
    setStudySessions((prev) => prev.filter((s) => s.id !== id));
    addToast('Session Removed', 'Removed study session from weekly plan.', 'info');
  };

  const toggleStudySessionCompleted = (id: string) => {
    setStudySessions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextVal = !s.completed;
          if (nextVal) {
            addToast('Study Session Done! ⭐', `Completed ${s.durationMinutes}m revision for ${s.courseCode}.`);
            // Also log focus minutes to study logs
            addStudyLog({
              date: getTodayIsoDate(),
              minutes: s.durationMinutes,
              subject: s.courseCode,
              mode: 'custom',
              notes: s.rationale,
            });
          }
          return {
            ...s,
            completed: nextVal,
            completedAt: nextVal ? new Date().toISOString() : undefined,
          };
        }
        return s;
      })
    );
  };

  const generateStudyPlan = () => {
    const newPlan = generateWeeklyStudyPlan({
      subjects: semesterSubjects,
      collegeClasses: timetable,
      tasks,
      profile,
      weeklyCareerHours: profile.weeklyCareerHours || 6,
      studyTimePreferences: profile.preferredStudyTimes || ['Morning', 'Evening', 'Night'],
      breakMinutes: profile.studyBreakDurationMinutes || 15,
      maxDailyHours: profile.maxDailyStudyHours || 4,
    });

    setStudySessions(newPlan);
    addToast(
      'Smart Plan Generated! 📅',
      `Allocated ${newPlan.length} optimized sessions prioritizing upcoming exams, difficult subjects, and ${profile.targetRole || 'career'} milestones.`
    );
  };

  const replanMissedStudySessions = () => {
    const result = replanMissedSessions(studySessions, timetable, profile);
    setStudySessions(result.updatedSessions);
    if (result.replannedCount > 0) {
      addToast(
        'Sessions Replanned! 🔄',
        `Rescheduled ${result.replannedCount} pending session(s) into upcoming available slots.`
      );
    } else {
      addToast('All Caught Up! 🎉', 'No missed sessions detected in your plan.', 'info');
    }
  };

  // Tasks actions
  const addTask = (newTask: Omit<Task, 'id' | 'completed'>) => {
    const id = `task-${Date.now()}`;
    const task: Task = { ...newTask, id, completed: false };
    setTasks((prev) => [task, ...prev]);
    addToast('Task Created', `"${task.title}" added to your deliverables.`);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            addToast('Task Completed! 🎉', `"${t.title}" checked off.`);
          }
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    addToast('Task Deleted', `"${target?.title || 'Task'}" removed.`, 'info');
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    addToast('Task Updated', 'Assignment details updated.');
  };

  // Events actions
  const toggleEventRegistration = (id: string) => {
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === id) {
          const nextRegistered = !evt.registered;
          const nextSpots = nextRegistered
            ? Math.max(0, evt.spotsLeft - 1)
            : Math.min(evt.totalSpots, evt.spotsLeft + 1);
          if (nextRegistered) {
            addToast('RSVP Confirmed', `You are registered for ${evt.title}. Spot reserved!`);
          } else {
            addToast('Registration Cancelled', `Unregistered from ${evt.title}.`, 'info');
          }
          return {
            ...evt,
            registered: nextRegistered,
            spotsLeft: nextSpots,
          };
        }
        return evt;
      })
    );
  };

  // Clubs actions
  const toggleClubMembership = (id: string) => {
    setClubs((prev) =>
      prev.map((club) => {
        if (club.id === id) {
          const nextJoined = !club.joined;
          const nextCount = nextJoined ? club.memberCount + 1 : Math.max(0, club.memberCount - 1);
          if (nextJoined) {
            addToast('Joined Club', `Welcome to ${club.name}!`);
          } else {
            addToast('Left Club', `You are no longer a member of ${club.name}.`, 'info');
          }
          return {
            ...club,
            joined: nextJoined,
            memberCount: nextCount,
          };
        }
        return club;
      })
    );
  };

  // Study log action
  const addStudyLog = (log: Omit<StudySessionLog, 'id' | 'timestamp'>) => {
    const newLog: StudySessionLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
    };
    setStudyLogs((prev) => [newLog, ...prev]);
  };

  // AI Advisor Chat Actions
  const sendChatMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText.trim(),
      timestamp: Date.now(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsAdvisorTyping(true);

    try {
      // Prepare comprehensive student context
      const studentContext = {
        name: profile.name,
        university: profile.university,
        degree: profile.degree,
        year: selectedYear,
        semester: selectedSemester,
        currentCgpa: profile.currentCgpa,
        targetCgpa: profile.targetCgpa,
        academicGoals: profile.academicGoals,
        targetRole: profile.targetRole,
        weeklyCareerHours: profile.weeklyCareerHours,
        subjects: semesterSubjects.map((s) => ({
          code: s.courseCode,
          name: s.name,
          credits: s.credits,
          attendance: s.attendancePercentage,
          difficulty: s.difficulty || 'Medium',
          cat1: s.assessmentMarks?.cat1,
          cat2: s.assessmentMarks?.cat2,
          examDates: s.examDates,
        })),
        pendingTasks: tasks.filter((t) => !t.completed).map((t) => ({
          title: t.title,
          course: t.courseCode,
          due: t.dueDate,
          priority: t.priority,
        })),
        todayClasses: todayClasses.map((c) => ({
          code: c.courseCode,
          name: c.courseName,
          time: `${c.startTime} - ${c.endTime}`,
          room: c.room,
        })),
        studySessionsCount: studySessions.length,
        completedSessions: studySessions.filter((s) => s.completed).length,
      };

      // Call backend route
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userText,
          context: studentContext,
          history: chatMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: data.reply || 'Here is my personalized recommendation based on your academic profile.',
          timestamp: Date.now(),
          isAiGenerated: data.isAiGenerated !== false,
          actionSuggestions: data.actionSuggestions,
        };
        setChatMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error('Backend advisor service responded with status ' + response.status);
      }
    } catch (err) {
      console.warn('AI Advisor API call fell back to local inference', err);
      // Contextual local rule engine fallback
      const q = userText.toLowerCase();
      let reply = '';
      let suggestions: string[] = [];

      if (q.includes('what should i study today') || q.includes('study today')) {
        const lowestAttendance = [...semesterSubjects].sort((a, b) => a.attendancePercentage - b.attendancePercentage)[0];
        const upcomingExam = semesterSubjects.find((s) => s.examDates?.cat1Date || s.examDates?.cat2Date);
        reply = `Based on your Sem ${selectedSemester} records, here is your high-impact study plan for today:\n\n1. **${upcomingExam ? upcomingExam.courseCode : 'Data Structures'}**: Dedicate 60 mins to high-weight problem sets. Upcoming exams make this your highest priority.\n2. **${lowestAttendance ? lowestAttendance.courseCode : 'Core Subject'}**: Attendance is at ${lowestAttendance ? lowestAttendance.attendancePercentage : 85}%. Review recent lecture notes for 45 mins to stay confident.\n3. **Career Milestone**: Spend 45 mins on ${profile.targetRole || 'Full-Stack'} portfolio building.\n\n*Would you like me to auto-generate a slot in your timetable for these?*`;
        suggestions = ['Yes, schedule these sessions', 'Which subject needs more attention?', 'Show my upcoming exams'];
      } else if (q.includes('which subject needs more attention') || q.includes('attention')) {
        const urgent = semesterSubjects.filter((s) => s.attendancePercentage < 80 || s.difficulty === 'Critical' || s.difficulty === 'Hard');
        if (urgent.length > 0) {
          reply = `Here are the subjects that need your immediate attention:\n\n${urgent.map((s) => `• **${s.courseCode} (${s.name})**: Attendance is ${s.attendancePercentage}% (Threshold: 75%). Difficulty: ${s.difficulty || 'Hard'}. Continuous assessment target: ${s.studyGoal || 'Target S/A grade'}.`).join('\n')}\n\n**Actionable Advice**: Prioritize at least 3 spaced revision sessions this week to build mastery before CAT-2.`;
        } else {
          reply = `Great news! All your enrolled subjects for Semester ${selectedSemester} currently maintain safe attendance (≥80%) and on-track marks. Keep your momentum going by focusing on problem-solving practice and project deliverables.`;
        }
        suggestions = ['What should I study today?', 'How to prepare for my next exam?', 'Review my CGPA goal'];
      } else if (q.includes('next exam') || q.includes('exam')) {
        const examsList: { course: string; name: string; date: string }[] = [];
        semesterSubjects.forEach((s) => {
          if (s.examDates?.cat1Date) examsList.push({ course: s.courseCode, name: 'CAT-1', date: s.examDates.cat1Date });
          if (s.examDates?.cat2Date) examsList.push({ course: s.courseCode, name: 'CAT-2', date: s.examDates.cat2Date });
          if (s.examDates?.fatDate) examsList.push({ course: s.courseCode, name: 'FAT / Final', date: s.examDates.fatDate });
        });
        examsList.sort((a, b) => a.date.localeCompare(b.date));

        if (examsList.length > 0) {
          reply = `Here is your upcoming exam strategy:\n\n• **Immediate Target**: ${examsList[0].course} ${examsList[0].name} on **${examsList[0].date}**.\n\n**Recommended 3-Step Strategy**:\n1. Solve the last 3 years of question papers under timed conditions.\n2. Create a one-page formula sheet summarizing high-frequency derivations.\n3. Allocate 2 revision sessions in your timetable 3 days prior.`;
        } else {
          reply = `No upcoming exam dates are currently recorded for Semester ${selectedSemester}. You can input exam dates in the Subjects section so I can tailor specific revision milestones for you.`;
        }
        suggestions = ['What should I study today?', 'Check my weekly timetable', 'Career roadmap'];
      } else if (q.includes('career') || q.includes('learn next') || q.includes('industry')) {
        reply = `For your chosen track (**${profile.targetRole || 'Software & Full-Stack Web Development'}**):\n\n1. **Current Focus**: Build clean full-stack CRUD capabilities with TypeScript, React, and PostgreSQL.\n2. **Weekly Commitment**: Aim for ${profile.weeklyCareerHours || 6} hours split into two weekend project sprints.\n3. **Next Milestone**: Push an end-to-end portfolio project with automated GitHub Actions CI/CD to demonstrate industry readiness.`;
        suggestions = ['Open Career Readiness Advisor', 'How to balance academics & skills?', 'What should I study today?'];
      } else if (q.includes('balance') || q.includes('timetable')) {
        reply = `Here is how to maintain a sustainable balance between academics and industry skills:\n\n• **Weekdays (Mon-Thu)**: Focus 80% on college classes, lecture reviews, and pending lab assignments.\n• **Friday & Weekends**: Shift 60% of your focus to your career project lab and LeetCode / portfolio tasks.\n• **Daily Cap**: Keep your total study time within ${profile.maxDailyStudyHours || 4} hours to avoid burnout and preserve consistency.`;
        suggestions = ['Generate fresh study plan', 'What should I study today?', 'Review CGPA target'];
      } else {
        reply = `Thanks for asking, ${profile.name.split(' ')[0]}! Looking at your Semester ${selectedSemester} records (CGPA: ${profile.currentCgpa.toFixed(2)} / Target: ${profile.targetCgpa.toFixed(2)}):\n\nI recommend keeping a consistent rhythm of 45-minute focused blocks. Focus on subjects with upcoming exams first, then transition to your career milestones.`;
        suggestions = ['What should I study today?', 'Which subject needs more attention?', 'How to prepare for my next exam?'];
      }

      const assistantFallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
        isAiGenerated: false,
        actionSuggestions: suggestions,
      };
      setChatMessages((prev) => [...prev, assistantFallbackMsg]);
    } finally {
      setIsAdvisorTyping(false);
    }
  };

  const clearChatHistory = () => {
    setChatMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Chat history cleared. I'm ready with your active Semester ${selectedSemester} context. What would you like to explore?`,
        timestamp: Date.now(),
        actionSuggestions: [
          'What should I study today?',
          'Which subject needs more attention?',
          'How should I prepare for my next exam?',
          'What should I learn next for my chosen career?',
        ],
      },
    ]);
    addToast('Advisor Cleared', 'Conversation history was reset.', 'info');
  };

  // Reset to demo state
  const resetToDemoData = () => {
    setProfile(INITIAL_PROFILE);
    setAllSubjects(INITIAL_ACADEMIC_SUBJECTS);
    setSelectedSemesterState(3);
    setTimetable(INITIAL_CLASSES);
    setTasks(INITIAL_TASKS);
    setEvents(INITIAL_EVENTS);
    setClubs(INITIAL_CLUBS);
    setStudyLogs(INITIAL_STUDY_LOGS);
    setAccentColorState('indigo');

    const freshSessions = generateWeeklyStudyPlan({
      subjects: INITIAL_ACADEMIC_SUBJECTS.filter((s) => s.semesterNumber === 3),
      collegeClasses: INITIAL_CLASSES,
      tasks: INITIAL_TASKS,
      profile: INITIAL_PROFILE,
    });
    setStudySessions(freshSessions);

    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.ACADEMIC_SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_SEMESTER);
    localStorage.removeItem(STORAGE_KEYS.CLASSES);
    localStorage.removeItem(STORAGE_KEYS.STUDY_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.CLUBS);
    localStorage.removeItem(STORAGE_KEYS.STUDY_LOGS);
    localStorage.removeItem(STORAGE_KEYS.CHAT_MESSAGES);
    localStorage.removeItem(STORAGE_KEYS.TOPIC_MASTERY);
    localStorage.removeItem(STORAGE_KEYS.EXAM_RESCUE);
    localStorage.removeItem(STORAGE_KEYS.GAMIFICATION);
    setTopics(INITIAL_TOPIC_MASTERY);
    setExamRescuePlan(null);
    setGamification(INITIAL_GAMIFICATION);
    deleteAvatarFromDb();

    addToast('Demo Data Reset', 'Restored pristine 4-year curriculum, timetable, and study plan.', 'info');
  };

  // Adaptive Learning Actions
  const updateTopicMastery = (id: string, updates: Partial<TopicMastery>) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          if (updates.confidence === 'High' && (updated.quizAccuracy === null || updated.quizAccuracy >= 80)) {
            updated.status = 'mastered';
          } else if (updates.confidence === 'Low' || (updated.quizAccuracy !== null && updated.quizAccuracy < 65)) {
            updated.status = 'needs_focus';
          } else {
            updated.status = 'reviewing';
          }
          return updated;
        }
        return t;
      })
    );
    addToast('Topic Updated', 'Mastery ratings saved.');
  };

  const addTopic = (newTopic: Omit<TopicMastery, 'id'>) => {
    const id = `topic-${Date.now()}`;
    const topic: TopicMastery = { ...newTopic, id };
    setTopics((prev) => [...prev, topic]);
    addToast('Topic Added', `${topic.topicName} added to ${topic.courseCode} tracker.`);
  };

  const recordQuizScore = (topicId: string, accuracy: number) => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          const nextAttempts = (t.quizAttempts || 0) + 1;
          const newStatus = accuracy >= 80 ? 'mastered' : accuracy >= 65 ? 'reviewing' : 'needs_focus';
          const newConf = accuracy >= 80 ? 'High' : accuracy >= 65 ? 'Medium' : 'Low';
          return {
            ...t,
            quizAccuracy: accuracy,
            quizAttempts: nextAttempts,
            status: newStatus,
            confidence: newConf,
            lastRevisedDate: getTodayIsoDate(),
          };
        }
        return t;
      })
    );
    awardXP(30, 'Completed Topic Practice Quiz');
    setGamification((prev) => ({
      ...prev,
      completedQuizzesCount: prev.completedQuizzesCount + 1,
    }));
    addToast('Quiz Score Recorded 📝', `Scored ${accuracy}%. Topic calibration updated (+30 XP).`);
  };

  const recordRevisionCompleted = (topicId: string, recallQuality: 'hard' | 'good' | 'easy') => {
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          let nextStage = t.spacedRepetitionStage || 0;
          if (recallQuality === 'easy') nextStage = Math.min(5, nextStage + 2);
          else if (recallQuality === 'good') nextStage = Math.min(5, nextStage + 1);
          else nextStage = Math.max(1, nextStage - 1);

          const intervals = [1, 2, 4, 7, 14, 30];
          const daysToAdd = intervals[nextStage] || 3;
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + daysToAdd);
          const nextReviewDate = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;

          const newStatus = nextStage >= 4 ? 'mastered' : nextStage >= 2 ? 'reviewing' : 'needs_focus';
          const newConf = nextStage >= 4 ? 'High' : nextStage >= 2 ? 'Medium' : 'Low';

          return {
            ...t,
            lastRevisedDate: getTodayIsoDate(),
            spacedRepetitionStage: nextStage,
            nextReviewDate,
            status: newStatus,
            confidence: newConf,
          };
        }
        return t;
      })
    );
    awardXP(25, 'Completed Spaced Active Recall Session');
    setGamification((prev) => ({
      ...prev,
      completedRecallCount: prev.completedRecallCount + 1,
    }));
    addToast('Recall Logged! 🧠', `Interval updated (+25 XP). Next spaced review scheduled.`);
  };

  // Gamification Actions
  const awardXP = (amount: number, reason: string) => {
    setGamification((prev) => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 400) + 1;
      const leveledUp = newLevel > prev.level;
      if (leveledUp) {
        addToast('Level Up! 🏆', `You reached Level ${newLevel}! Consistent focus pays off.`, 'success');
      }
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
      };
    });
  };

  // Exam Rescue Plan Actions
  const generateExamRescuePlan = (params: {
    examName: string;
    targetExamDate: string;
    subjectCodes: string[];
    dailyStudyHours: number;
  }) => {
    const { examName, targetExamDate, subjectCodes, dailyStudyHours } = params;
    const today = new Date();
    const examD = new Date(targetExamDate);
    const diffTime = examD.getTime() - today.getTime();
    const daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const blocks: ExamRescueBlock[] = [];
    const blockTypes: ExamRescueBlock['blockType'][] = [
      'Concept Review',
      'Active Recall',
      'Problem Solving',
      'Practice Quiz',
    ];

    const targetTopics = topics.filter((t) => subjectCodes.includes(t.courseCode));
    const sortedTopics = [...targetTopics].sort((a, b) => {
      const confWeight = { Low: 0, Medium: 1, High: 2 };
      return confWeight[a.confidence] - confWeight[b.confidence];
    });

    let topicIdx = 0;
    const blocksPerDay = Math.min(4, Math.max(1, Math.round((dailyStudyHours * 60) / 50)));

    for (let dayOffset = 0; dayOffset < Math.min(daysRemaining, 14); dayOffset++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const dayLabel = dayOffset === 0 ? 'Today' : dayOffset === 1 ? 'Tomorrow' : currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      const startHours = [17, 18, 19, 20];
      for (let b = 0; b < blocksPerDay; b++) {
        const currentTopic = sortedTopics[topicIdx % Math.max(1, sortedTopics.length)];
        topicIdx++;

        const startH = startHours[b % startHours.length];
        const startStr = `${String(startH).padStart(2, '0')}:00`;
        const endStr = `${String(startH).padStart(2, '0')}:45`;

        blocks.push({
          id: `rescue-blk-${dateStr}-${b}-${Math.random().toString(36).substring(2, 6)}`,
          date: dateStr,
          dayLabel,
          startTime: startStr,
          endTime: endStr,
          durationMinutes: 45,
          courseCode: currentTopic ? currentTopic.courseCode : (subjectCodes[0] || 'CSE2001'),
          courseName: currentTopic ? currentTopic.courseName : 'Core Subject',
          topicName: currentTopic ? currentTopic.topicName : 'High Yield Review',
          blockType: blockTypes[b % blockTypes.length],
          completed: false,
          notes: `Prioritized via Exam Rescue Mode: Target CAT/FAT high-frequency problem sets.`,
        });
      }
    }

    const plan: ExamRescuePlan = {
      id: `rescue-plan-${Date.now()}`,
      examName,
      targetExamDate,
      daysRemaining,
      subjectCodes,
      dailyStudyHours,
      totalStudyHoursAllocated: +(dailyStudyHours * Math.min(daysRemaining, 14)).toFixed(1),
      blocks,
      createdAt: new Date().toISOString(),
    };

    setExamRescuePlan(plan);
    awardXP(60, `Activated Exam Rescue Mode for ${examName}`);
    addToast('Exam Rescue Plan Activated! 🛡️', `Generated ${blocks.length} focused study blocks over ${daysRemaining} days leading to ${examName}.`);
  };

  const reorganizeExamRescuePlan = () => {
    if (!examRescuePlan) return;
    const todayStr = getTodayIsoDate();
    const incompletePastBlocks = examRescuePlan.blocks.filter((b) => !b.completed && b.date < todayStr);

    const updatedBlocks = examRescuePlan.blocks.map((b) => {
      if (!b.completed && b.date < todayStr) {
        return {
          ...b,
          date: todayStr,
          dayLabel: 'Today (Rescheduled)',
        };
      }
      return b;
    });

    setExamRescuePlan({
      ...examRescuePlan,
      blocks: updatedBlocks,
    });

    addToast('Plan Reorganized! 🔄', `Rescheduled ${incompletePastBlocks.length} missed revision blocks into available slots.`);
  };

  const toggleRescueBlockCompleted = (blockId: string) => {
    if (!examRescuePlan) return;
    let newlyCompleted = false;
    const updatedBlocks = examRescuePlan.blocks.map((b) => {
      if (b.id === blockId) {
        newlyCompleted = !b.completed;
        return { ...b, completed: newlyCompleted };
      }
      return b;
    });

    setExamRescuePlan({
      ...examRescuePlan,
      blocks: updatedBlocks,
    });

    if (newlyCompleted) {
      awardXP(35, 'Completed Exam Rescue Study Block');
      addToast('Rescue Block Completed! 🎯', '+35 XP. You are one step closer to exam mastery.');
    }
  };

  const clearRescuePlan = () => {
    setExamRescuePlan(null);
    addToast('Rescue Plan Cleared', 'You can generate a new exam plan anytime.', 'info');
  };

  // Computed properties
  const currentDayName = useMemo(() => getTodayDayOfWeek(), []);

  const todayClasses = useMemo(() => {
    const activeDay = currentDayName === 'Sun' || currentDayName === 'Sat' ? 'Mon' : currentDayName;
    return timetable
      .filter((c) => c.dayOfWeek === activeDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [timetable, currentDayName]);

  const todayStudySessions = useMemo(() => {
    const activeDay = currentDayName === 'Sun' || currentDayName === 'Sat' ? 'Mon' : currentDayName;
    return studySessions
      .filter((s) => s.dayOfWeek === activeDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [studySessions, currentDayName]);

  const pendingTasksCount = useMemo(() => {
    return tasks.filter((t) => !t.completed).length;
  }, [tasks]);

  const todayFocusMinutes = useMemo(() => {
    const today = getTodayIsoDate();
    return studyLogs
      .filter((l) => l.date === today)
      .reduce((acc, curr) => acc + curr.minutes, 0);
  }, [studyLogs]);

  const myEventsCount = useMemo(() => {
    return events.filter((e) => e.registered).length;
  }, [events]);

  const myClubsCount = useMemo(() => {
    return clubs.filter((c) => c.joined).length;
  }, [clubs]);

  // Semester metrics for active selected semester
  const semesterCredits = useMemo(() => {
    return semesterSubjects.reduce((acc, s) => acc + (s.credits || 0), 0);
  }, [semesterSubjects]);

  const semesterAttendance = useMemo(() => {
    if (semesterSubjects.length === 0) return 0;
    const sum = semesterSubjects.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0);
    return Math.round(sum / semesterSubjects.length);
  }, [semesterSubjects]);

  const semesterGpa = useMemo(() => {
    const graded = semesterSubjects.filter((s) => {
      const gp = parseGradePoint(s.grade, s.gradePoint);
      return gp !== undefined && s.credits > 0;
    });
    if (graded.length === 0) return null;
    const totalPoints = graded.reduce((acc, s) => {
      const gp = parseGradePoint(s.grade, s.gradePoint) || 0;
      return acc + s.credits * gp;
    }, 0);
    const totalCredits = graded.reduce((acc, s) => acc + s.credits, 0);
    return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : null;
  }, [semesterSubjects]);

  const overallAttendanceRate = semesterAttendance;

  const allSemestersStats: SemesterStat[] = useMemo(() => {
    const sems: SemesterNumber[] = [1, 2, 3, 4, 5, 6, 7, 8];
    return sems.map((semNum) => {
      const subjs = allSubjects.filter((s) => s.semesterNumber === semNum);
      const totalCredits = subjs.reduce((acc, s) => acc + (s.credits || 0), 0);
      const avgAttendance = subjs.length > 0
        ? Math.round(subjs.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0) / subjs.length)
        : 0;
      const graded = subjs.filter((s) => {
        const gp = parseGradePoint(s.grade, s.gradePoint);
        return gp !== undefined && s.credits > 0;
      });
      let gpa: number | null = null;
      if (graded.length > 0) {
        const totalPoints = graded.reduce((acc, s) => {
          const gp = parseGradePoint(s.grade, s.gradePoint) || 0;
          return acc + s.credits * gp;
        }, 0);
        const gradedCredits = graded.reduce((acc, s) => acc + s.credits, 0);
        gpa = gradedCredits > 0 ? Number((totalPoints / gradedCredits).toFixed(2)) : null;
      }
      return {
        semesterNumber: semNum,
        year: getYearForSemester(semNum),
        subjectCount: subjs.length,
        totalCredits,
        avgAttendance,
        gpa,
        isCurrent: semNum === selectedSemester,
      };
    });
  }, [allSubjects, selectedSemester]);

  const calculatedCgpa = useMemo(() => {
    const allGraded = allSubjects.filter((s) => {
      const gp = parseGradePoint(s.grade, s.gradePoint);
      return gp !== undefined && s.credits > 0;
    });
    if (allGraded.length === 0) {
      return profile.currentCgpa ?? 8.85;
    }
    const totalPoints = allGraded.reduce((acc, s) => {
      const gp = parseGradePoint(s.grade, s.gradePoint) || 0;
      return acc + s.credits * gp;
    }, 0);
    const totalCredits = allGraded.reduce((acc, s) => acc + s.credits, 0);
    return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : (profile.currentCgpa ?? 8.85);
  }, [allSubjects, profile.currentCgpa]);

  const cgpaGap = useMemo(() => {
    const cur = profile.currentCgpa ?? calculatedCgpa ?? 8.85;
    const tgt = profile.targetCgpa ?? 9.30;
    return +(tgt - cur).toFixed(2);
  }, [profile.currentCgpa, profile.targetCgpa, calculatedCgpa]);

  // Next Best Action Recommendation Engine
  const nextBestActionsList: NextAction[] = useMemo(() => {
    const actions: NextAction[] = [];
    const todayStr = getTodayIsoDate();

    // A. Check for upcoming CAT/FAT exams within 21 days
    semesterSubjects.forEach((subj) => {
      const dates = subj.examDates;
      const upcomingExams = [
        { name: 'CAT-1 Assessment', date: dates.cat1Date },
        { name: 'CAT-2 Assessment', date: dates.cat2Date },
        { name: 'FAT Final Exam', date: dates.fatDate },
      ].filter((e) => e.date && e.date >= todayStr);

      upcomingExams.forEach((ex) => {
        const daysUntil = Math.ceil((new Date(ex.date!).getTime() - new Date(todayStr).getTime()) / (1000 * 3600 * 24));
        if (daysUntil <= 21) {
          const weakTopic = topics.find((t) => t.courseCode === subj.courseCode && (t.confidence === 'Low' || t.status === 'needs_focus'));
          actions.push({
            id: `exam-${subj.courseCode}-${ex.name}`,
            title: `Prepare for ${subj.courseCode} ${ex.name}`,
            subtitle: `${daysUntil} days left · ${subj.name}`,
            courseCode: subj.courseCode,
            courseName: subj.name,
            topicName: weakTopic ? weakTopic.topicName : undefined,
            actionType: 'exam_prep',
            priority: daysUntil <= 7 ? 'urgent' : 'high',
            estimatedMinutes: 45,
            rationale: `Upcoming ${ex.name} on ${ex.date}. Spaced preparation avoids last-minute cramming and improves long-term recall.`,
            dataPoints: [
              `Exam Date: ${ex.date} (${daysUntil}d away)`,
              `Current Internal Marks: ${subj.assessmentMarks.totalInternal ?? 50}/60`,
              `Attendance: ${subj.attendancePercentage}%`,
              weakTopic ? `Identified Weak Topic: ${weakTopic.topicName}` : 'All logged topics in fair standing',
            ],
            suggestedTab: 'timetable',
          });
        }
      });
    });

    // B. Check for high priority or urgent pending tasks
    const pendingTasksList = tasks.filter((t) => !t.completed);
    const urgentTasks = pendingTasksList.filter((t) => t.priority === 'urgent' || (t.dueDate && t.dueDate <= todayStr));
    urgentTasks.forEach((t) => {
      actions.push({
        id: `task-${t.id}`,
        title: `Complete Deliverable: ${t.title}`,
        subtitle: `Due ${t.dueDate || 'Soon'} · ${t.courseCode}`,
        courseCode: t.courseCode,
        actionType: 'urgent_task',
        priority: 'urgent',
        estimatedMinutes: t.estimatedMinutes || 35,
        rationale: `This assignment is marked as urgent and directly impacts your continuous digital assessment (DA) score.`,
        dataPoints: [
          `Due Date: ${t.dueDate || 'Today'}`,
          `Tags: ${t.tags.join(', ') || 'Coursework'}`,
          `Estimated Time: ${t.estimatedMinutes || 35} mins`,
        ],
        suggestedTab: 'tasks',
      });
    });

    // C. Weak Topics in Adaptive Learning (Confidence: Low or status: needs_focus)
    const weakTopics = topics.filter((t) => t.confidence === 'Low' || (t.quizAccuracy !== null && t.quizAccuracy < 65) || t.status === 'needs_focus');
    weakTopics.forEach((t) => {
      const hasQuizScore = t.quizAccuracy !== null;
      actions.push({
        id: `weak-${t.id}`,
        title: `Active Recall: ${t.topicName}`,
        subtitle: `${t.courseCode} · Low Confidence (${hasQuizScore ? `${t.quizAccuracy}% Quiz Accuracy` : 'Unassessed'})`,
        courseCode: t.courseCode,
        courseName: t.courseName,
        topicName: t.topicName,
        actionType: 'weak_topic_recall',
        priority: 'high',
        estimatedMinutes: 30,
        rationale: `Your current confidence in ${t.topicName} is Low. Engaging in active recall testing produces 2.5x higher retention than passive note re-reading.`,
        dataPoints: [
          `Confidence Rating: ${t.confidence}`,
          hasQuizScore ? `Last Quiz Score: ${t.quizAccuracy}% (${t.quizAttempts} attempts)` : 'No recorded quiz score yet',
          t.lastRevisedDate ? `Last Reviewed: ${t.lastRevisedDate}` : 'Never reviewed with spaced repetition',
        ],
        missingDataPrompt: !hasQuizScore ? {
          field: 'quiz_score',
          message: `Take a 3-question diagnostic quiz on ${t.topicName} to calibrate recommendations.`,
        } : undefined,
        suggestedTab: 'learning',
      });
    });

    // D. Spaced Repetition Due Today
    const dueReviews = topics.filter((t) => t.nextReviewDate && t.nextReviewDate <= todayStr && t.status !== 'mastered');
    dueReviews.forEach((t) => {
      if (!actions.some((a) => a.id === `weak-${t.id}`)) {
        actions.push({
          id: `sr-${t.id}`,
          title: `Spaced Revision: ${t.topicName}`,
          subtitle: `${t.courseCode} · Stage ${t.spacedRepetitionStage} Review Due`,
          courseCode: t.courseCode,
          courseName: t.courseName,
          topicName: t.topicName,
          actionType: 'weak_topic_recall',
          priority: 'medium',
          estimatedMinutes: 25,
          rationale: `Scheduled interval reached based on the forgetting curve. Reviewing now cements this topic into long-term memory.`,
          dataPoints: [
            `Stage: ${t.spacedRepetitionStage}/5`,
            `Status: ${t.status}`,
            `Last Reviewed: ${t.lastRevisedDate || 'Initial session'}`,
          ],
          suggestedTab: 'learning',
        });
      }
    });

    // E. CGPA Gap Recovery if gap > 0.2
    if (cgpaGap > 0.2) {
      const vulnerableSubject = [...semesterSubjects].sort((a, b) => a.attendancePercentage - b.attendancePercentage)[0];
      if (vulnerableSubject) {
        actions.push({
          id: `cgpa-recovery-${vulnerableSubject.courseCode}`,
          title: `Target CGPA Lift: ${vulnerableSubject.courseCode}`,
          subtitle: `Bridge +${cgpaGap.toFixed(2)} Gap to Reach ${profile.targetCgpa.toFixed(2)}`,
          courseCode: vulnerableSubject.courseCode,
          courseName: vulnerableSubject.name,
          actionType: 'cgpa_boost',
          priority: 'medium',
          estimatedMinutes: 40,
          rationale: `To reach your target CGPA of ${profile.targetCgpa.toFixed(2)}, maximizing marks in 4-credit courses like ${vulnerableSubject.courseCode} provides the highest mathematical leverage.`,
          dataPoints: [
            `Current CGPA: ${profile.currentCgpa.toFixed(2)}`,
            `Target CGPA: ${profile.targetCgpa.toFixed(2)}`,
            `Subject Credits: ${vulnerableSubject.credits} credits`,
            `Attendance: ${vulnerableSubject.attendancePercentage}%`,
          ],
          suggestedTab: 'coach',
        });
      }
    }

    // F. Career Milestone if no urgent action
    if (profile.targetRole) {
      actions.push({
        id: 'career-sprint',
        title: `Portfolio Milestone: ${profile.targetRole}`,
        subtitle: `${profile.weeklyCareerHours || 6}h weekly target · Skills Lab`,
        actionType: 'career_milestone',
        priority: 'medium',
        estimatedMinutes: 45,
        rationale: `Consistent weekly portfolio progression ensures you are interview-ready before campus placements.`,
        dataPoints: [
          `Target Track: ${profile.targetRole}`,
          `Weekly Target: ${profile.weeklyCareerHours || 6} hours`,
          `Skill Level: ${profile.skillsExperienceLevel || 'Intermediate'}`,
        ],
        suggestedTab: 'career',
      });
    }

    // Fallback if list is empty
    if (actions.length === 0) {
      actions.push({
        id: 'daily-review',
        title: 'Daily Curriculum Review & Problem Practice',
        subtitle: 'All immediate tasks and exam dates are on track!',
        actionType: 'exam_prep',
        priority: 'medium',
        estimatedMinutes: 30,
        rationale: 'No urgent deadlines or overdue topics detected. A short 30-minute review maintains your 4-day study streak and momentum.',
        dataPoints: ['All coursework up to date', 'Attendance healthy', 'Daily goal: 120m'],
        suggestedTab: 'timer',
      });
    }

    return actions;
  }, [semesterSubjects, tasks, topics, cgpaGap, profile]);

  const nextBestAction = useMemo(() => {
    if (nextBestActionsList.length === 0) return null;
    const index = currentActionIndex % nextBestActionsList.length;
    return nextBestActionsList[index];
  }, [nextBestActionsList, currentActionIndex]);

  const skipNextAction = () => {
    setCurrentActionIndex((prev) => (prev + 1) % Math.max(1, nextBestActionsList.length));
    addToast('Recommendation Skipped', 'Showing next prioritized action.', 'info');
  };

  const completeNextAction = () => {
    if (!nextBestAction) return;
    awardXP(50, `Completed Next Best Action: ${nextBestAction.title}`);
    addToast('Action Completed! 🌟', `+50 XP earned. Great job staying on top of your learning!`);
    if (nextBestAction.actionType === 'urgent_task' && nextBestAction.id.startsWith('task-')) {
      const taskId = nextBestAction.id.replace('task-', '');
      toggleTask(taskId);
    }
    if (nextBestAction.topicName) {
      const topic = topics.find((t) => t.topicName === nextBestAction.topicName);
      if (topic) {
        recordRevisionCompleted(topic.id, 'good');
      }
    }
    setCurrentActionIndex((prev) => (prev + 1) % Math.max(1, nextBestActionsList.length));
  };

  const startNextActionSession = () => {
    if (!nextBestAction) return;
    if (nextBestAction.suggestedTab) {
      setActiveTab(nextBestAction.suggestedTab);
    } else {
      setActiveTab('timer');
    }
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        updateProfile,
        updateProfileImage,
        removeProfileImage,
        selectedYear,
        selectedSemester,
        setSelectedYear,
        setSelectedSemester,
        allSubjects,
        semesterSubjects,
        vitSubjects: semesterSubjects,
        addSubject,
        updateSubject,
        deleteSubject,
        toggleSubjectGoal,
        semesterCredits,
        semesterAttendance,
        semesterGpa,
        allSemestersStats,
        calculatedCgpa,
        timetable,
        addClass,
        updateClass,
        deleteClass,
        studySessions,
        addStudySession,
        updateStudySession,
        deleteStudySession,
        toggleStudySessionCompleted,
        generateStudyPlan,
        replanMissedStudySessions,
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        updateTask,
        events,
        toggleEventRegistration,
        clubs,
        toggleClubMembership,
        studyLogs,
        addStudyLog,
        chatMessages,
        sendChatMessage,
        clearChatHistory,
        isAdvisorTyping,
        activeTab,
        setActiveTab,
        darkMode,
        toggleDarkMode,
        accentColor,
        setAccentColor,
        toasts,
        addToast,
        removeToast,
        commandPaletteOpen,
        setCommandPaletteOpen,
        profileModalOpen,
        setProfileModalOpen,
        resetToDemoData,
        currentDayName,
        todayClasses,
        todayStudySessions,
        pendingTasksCount,
        todayFocusMinutes,
        myEventsCount,
        myClubsCount,
        cgpaGap,
        overallAttendanceRate,

        // Adaptive Learning & Topics
        topics,
        updateTopicMastery,
        addTopic,
        recordQuizScore,
        recordRevisionCompleted,

        // Next Best Action
        nextBestAction,
        nextBestActionsList,
        currentActionIndex,
        skipNextAction,
        completeNextAction,
        startNextActionSession,

        // Exam Rescue Mode
        examRescuePlan,
        examRescueModalOpen,
        setExamRescueModalOpen,
        generateExamRescuePlan,
        toggleRescueBlockCompleted,
        reorganizeExamRescuePlan,
        clearRescuePlan,

        // Gamification
        gamification,
        awardXP,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

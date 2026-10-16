export type DayOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type ClassType = 'Lecture' | 'Lab' | 'Discussion' | 'Seminar' | 'Workshop';

export type CollegeYear = 1 | 2 | 3 | 4;
export type SemesterNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type AccentColor = 'indigo' | 'emerald' | 'violet' | 'sky' | 'rose' | 'amber';

export type CourseCategory =
  | 'Core Foundation'
  | 'Core Discipline'
  | 'Professional Elective'
  | 'Open Elective'
  | 'Lab / Practical'
  | 'Project Work'
  | 'Humanities & Communication';

export type SubjectDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Critical';
export type ConfidenceLevel = 'Low' | 'Medium' | 'High';

export type StudyTimePreference = 'Morning' | 'Afternoon' | 'Evening' | 'Night';

export interface StudentProfile {
  name: string;
  email: string;
  university: string;
  major: string;
  degree: string;
  branch?: string;
  year: string;
  semester: string;
  currentYear: CollegeYear;
  currentSemester: SemesterNumber;
  studentId: string;
  bio?: string;
  currentCgpa: number; // 0 to 10 scale
  targetCgpa: number;  // 1 to 10 scale
  currentGpa?: number; // legacy alias
  targetGpa?: number;  // legacy alias
  dailyStudyGoalMinutes: number;
  academicGoals?: string;
  studyPriorityFocus?: string;
  avatarUrl: string;
  bannerUrl: string;
  accentColor?: AccentColor;
  
  // Career Interests & Skill Readiness
  targetRole?: string;
  careerInterests?: string[];
  skillsExperienceLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  weeklyCareerHours?: number;
  
  // Timetable & Study Preferences
  preferredStudyTimes?: StudyTimePreference[];
  studyBreakDurationMinutes?: number;
  maxDailyStudyHours?: number;
}

export interface AcademicSubject {
  id: string;
  semesterNumber: SemesterNumber; // 1 through 8
  name: string;
  courseCode: string;
  credits: number;
  category?: CourseCategory;
  facultyName: string;
  attendancePercentage: number;
  classesAttended?: number;
  totalClasses?: number;
  difficulty?: SubjectDifficulty;
  confidenceLevel?: ConfidenceLevel;
  grade?: string; // e.g. 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'In Progress'
  gradePoint?: number; // 0 to 10 scale
  assessmentMarks: {
    cat1?: number; // Continuous Assessment Test 1 (out of 50 or 100)
    cat2?: number; // Continuous Assessment Test 2 (out of 50 or 100)
    da?: number;   // Digital assignments / quizzes
    labMarks?: number;
    assignmentScore?: number;
    totalInternal?: number;
  };
  examDates: {
    cat1Date?: string;
    cat2Date?: string;
    fatDate?: string;
    midtermDate?: string;
    finalExamDate?: string;
    assignmentDueDate?: string;
  };
  studyGoal: string;
  goalCompleted?: boolean;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';
}

// Backwards-compatible alias
export type VITSubject = AcademicSubject;

export interface TimetableClass {
  id: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  room: string;
  building: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  type: ClassType;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';
  notes?: string;
}

export type StudySessionType =
  | 'Revision'
  | 'Exam Prep'
  | 'Assignment / Project'
  | 'Career Learning'
  | 'Practice Problems'
  | 'Class';

export interface StudySession {
  id: string;
  subjectId?: string;
  courseCode: string;
  subjectName: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "14:00"
  endTime: string;   // "15:30"
  durationMinutes: number;
  sessionType: StudySessionType;
  priority: Priority;
  completed: boolean;
  completedAt?: string;
  isAiGenerated?: boolean;
  rationale?: string;
  relatedExamOrDeadline?: string;
  difficulty?: SubjectDifficulty;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  courseCode: string;
  dueDate: string; // "2026-10-18"
  dueTime?: string; // "23:59"
  priority: Priority;
  completed: boolean;
  completedAt?: string;
  tags: string[];
  estimatedMinutes?: number;
}

export type EventCategory = 'Academic' | 'Hackathon' | 'Social' | 'Career & Networking' | 'Sports & Wellness' | 'Arts & Culture';

export interface CampusEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string; // "Oct 24, 2026"
  isoDate: string; // "2026-10-24"
  time: string; // "6:00 PM - 9:00 PM"
  location: string;
  organizer: string;
  description: string;
  totalSpots: number;
  spotsLeft: number;
  registered: boolean;
  imageUrl?: string;
  featured?: boolean;
  speakers?: string[];
}

export type ClubCategory = 'Tech & Robotics' | 'Entrepreneurship' | 'Debate & Law' | 'Design & Media' | 'Music & Arts' | 'Sustainability';

export interface Club {
  id: string;
  name: string;
  category: ClubCategory;
  tagline: string;
  description: string;
  meetingSchedule: string;
  location: string;
  memberCount: number;
  joined: boolean;
  leads: string[];
  bannerImage?: string;
  contactEmail: string;
  tags: string[];
}

export interface StudySessionLog {
  id: string;
  date: string; // "YYYY-MM-DD"
  minutes: number;
  subject: string;
  mode: 'pomodoro' | 'stopwatch' | 'custom';
  timestamp: number;
  notes?: string;
}

export interface NotificationToast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
}

export interface CareerPath {
  id: string;
  title: string;
  category: string;
  description: string;
  marketDemand: string;
  demandSource: string;
  sourceCheckedDate: string;
  recommendedLanguages: string[];
  essentialSkills: {
    id: string;
    name: string;
    category: string;
    level: 'Fundamental' | 'Intermediate' | 'Advanced';
    completed?: boolean;
  }[];
  frameworksAndTools: string[];
  starterProjects: {
    id: string;
    title: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Capstone';
    techStack: string[];
    githubMilestones: string[];
  }[];
  interviewPrep: {
    category: string;
    topics: string[];
    tips: string;
  }[];
  weeklyRoadmap: {
    week: number;
    phase: string;
    focus: string;
    deliverables: string[];
    softSkill: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  category?: 'study' | 'cgpa' | 'exam' | 'timetable' | 'career' | 'general';
  isAiGenerated?: boolean;
  actionSuggestions?: string[];
}

export interface TopicMastery {
  id: string;
  semesterNumber: SemesterNumber;
  courseCode: string;
  courseName: string;
  topicName: string;
  confidence: 'Low' | 'Medium' | 'High';
  quizAccuracy: number | null; // e.g., 65 for 65%
  quizAttempts: number;
  lastRevisedDate: string | null; // YYYY-MM-DD
  spacedRepetitionStage: number; // 0 to 5 (0: new, 1: 1-day, 2: 3-day, 3: 7-day, 4: 14-day, 5: 30-day)
  nextReviewDate: string; // YYYY-MM-DD
  status: 'needs_focus' | 'reviewing' | 'mastered';
  keyConcepts: string[];
  sampleQuestion?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    hint: string;
  };
}

export interface NextAction {
  id: string;
  title: string;
  subtitle: string;
  courseCode?: string;
  courseName?: string;
  topicName?: string;
  actionType: 'exam_prep' | 'urgent_task' | 'weak_topic_recall' | 'quiz_practice' | 'cgpa_boost' | 'career_milestone';
  priority: 'urgent' | 'high' | 'medium';
  estimatedMinutes: number;
  rationale: string;
  dataPoints: string[];
  missingDataPrompt?: {
    field: string;
    message: string;
  };
  suggestedTab?: ActiveTab;
}

export interface ExamRescueBlock {
  id: string;
  date: string; // YYYY-MM-DD
  dayLabel: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  courseCode: string;
  courseName: string;
  topicName: string;
  blockType: 'Concept Review' | 'Active Recall' | 'Problem Solving' | 'Practice Quiz' | 'Rest / Break';
  completed: boolean;
  notes?: string;
}

export interface ExamRescuePlan {
  id: string;
  examName: string;
  targetExamDate: string; // YYYY-MM-DD
  daysRemaining: number;
  subjectCodes: string[];
  dailyStudyHours: number;
  totalStudyHoursAllocated: number;
  blocks: ExamRescueBlock[];
  createdAt: string;
}

export interface GamificationProfile {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  completedTasksCount: number;
  completedRecallCount: number;
  completedQuizzesCount: number;
  achievements: {
    id: string;
    title: string;
    description: string;
    badgeIcon: string;
    unlocked: boolean;
    unlockedAt?: string;
    progress: number;
    maxProgress: number;
  }[];
}

export type ActiveTab =
  | 'dashboard'
  | 'learning'
  | 'timetable'
  | 'subjects'
  | 'coach'
  | 'career'
  | 'advisor'
  | 'tasks'
  | 'events'
  | 'clubs'
  | 'timer'
  | 'analytics';

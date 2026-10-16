import {
  DayOfWeek,
  TimetableClass,
  AcademicSubject,
  Task,
  StudySession,
  StudyTimePreference,
  Priority,
  SubjectDifficulty,
  StudentProfile,
} from '../types';

interface TimeInterval {
  startMinutes: number; // minutes from 00:00
  endMinutes: number;
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function validateTimeRange(startTime: string, endTime: string): { valid: boolean; error?: string } {
  if (!startTime || !endTime) {
    return { valid: false, error: 'Both start and end time are required' };
  }
  const s = timeToMinutes(startTime);
  const e = timeToMinutes(endTime);
  if (isNaN(s) || isNaN(e)) {
    return { valid: false, error: 'Invalid time format (expected HH:MM)' };
  }
  if (e <= s) {
    return { valid: false, error: 'End time must be after start time' };
  }
  if (e - s < 20) {
    return { valid: false, error: 'Session must be at least 20 minutes long' };
  }
  if (e - s > 360) {
    return { valid: false, error: 'Single session cannot exceed 6 hours' };
  }
  return { valid: true };
}

/**
 * Returns available time windows on a given day avoiding college classes and existing fixed commitments
 */
function getAvailableSlotsForDay(
  dayClasses: TimetableClass[],
  preferredWindows: StudyTimePreference[],
  breakDuration: number
): TimeInterval[] {
  // Sort classes by start time
  const busyIntervals: TimeInterval[] = dayClasses
    .map((c) => ({
      startMinutes: timeToMinutes(c.startTime),
      endMinutes: timeToMinutes(c.endTime),
    }))
    .sort((a, b) => a.startMinutes - b.startMinutes);

  // Preferred window boundaries
  const windowRanges: Record<StudyTimePreference, TimeInterval> = {
    Morning: { startMinutes: 7 * 60, endMinutes: 9 * 60 },      // 07:00 - 09:00
    Afternoon: { startMinutes: 14 * 60, endMinutes: 17 * 60 },  // 14:00 - 17:00
    Evening: { startMinutes: 17 * 60 + 30, endMinutes: 20 * 60 }, // 17:30 - 20:00
    Night: { startMinutes: 20 * 60 + 30, endMinutes: 23 * 60 }, // 20:30 - 23:00
  };

  const candidateWindows = preferredWindows.length > 0
    ? preferredWindows.map((w) => windowRanges[w])
    : [
        windowRanges.Morning,
        windowRanges.Afternoon,
        windowRanges.Evening,
        windowRanges.Night,
      ];

  const available: TimeInterval[] = [];

  for (const win of candidateWindows) {
    let currentStart = win.startMinutes;

    for (const busy of busyIntervals) {
      // If busy is before window, continue
      if (busy.endMinutes <= currentStart) continue;
      // If busy is after window, break
      if (busy.startMinutes >= win.endMinutes) break;

      // Overlap with busy
      if (busy.startMinutes > currentStart + 40) {
        available.push({
          startMinutes: currentStart,
          endMinutes: Math.min(win.endMinutes, busy.startMinutes - breakDuration),
        });
      }
      currentStart = Math.max(currentStart, busy.endMinutes + breakDuration);
    }

    if (currentStart + 40 <= win.endMinutes) {
      available.push({
        startMinutes: currentStart,
        endMinutes: win.endMinutes,
      });
    }
  }

  // Filter out intervals that are too short (< 40 mins)
  return available.filter((inv) => inv.endMinutes - inv.startMinutes >= 40);
}

export interface TimetableGenerationOptions {
  subjects: AcademicSubject[];
  collegeClasses: TimetableClass[];
  tasks: Task[];
  profile: StudentProfile;
  weeklyCareerHours?: number;
  studyTimePreferences?: StudyTimePreference[];
  breakMinutes?: number;
  maxDailyHours?: number;
}

/**
 * Generate a personalized, conflict-free weekly study plan based on academic urgency,
 * upcoming exams, low attendance/marks, and career preparation.
 */
export function generateWeeklyStudyPlan(options: TimetableGenerationOptions): StudySession[] {
  const {
    subjects,
    collegeClasses,
    tasks,
    profile,
    weeklyCareerHours = profile.weeklyCareerHours || 5,
    studyTimePreferences = profile.preferredStudyTimes || ['Morning', 'Evening', 'Night'],
    breakMinutes = profile.studyBreakDurationMinutes || 15,
    maxDailyHours = profile.maxDailyStudyHours || 4,
  } = options;

  const days: DayOfWeek[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const generatedSessions: StudySession[] = [];

  // 1. Calculate urgency weights for each subject
  const now = new Date();
  const subjectWeights: {
    subject: AcademicSubject;
    weight: number;
    reasons: string[];
    priority: Priority;
    examDueSoon?: string;
  }[] = subjects.map((subj) => {
    let weight = 10;
    const reasons: string[] = [];
    let priority: Priority = 'medium';
    let examDueSoon: string | undefined;

    // Check credits
    if (subj.credits >= 4) {
      weight += 15;
      reasons.push(`${subj.credits}-credit major core`);
    }

    // Check attendance threshold (VIT 75% rule)
    if (subj.attendancePercentage < 75) {
      weight += 35;
      priority = 'urgent';
      reasons.push(`Low attendance (${subj.attendancePercentage}%) - Below 75% threshold`);
    } else if (subj.attendancePercentage < 80) {
      weight += 15;
      reasons.push(`Borderline attendance (${subj.attendancePercentage}%)`);
    }

    // Check internal assessment marks
    const cat1 = subj.assessmentMarks?.cat1;
    const cat2 = subj.assessmentMarks?.cat2;
    if (cat1 !== undefined && cat1 < 38) {
      weight += 20;
      if (priority !== 'urgent') priority = 'high';
      reasons.push(`Score improvement needed in CAT-1 (${cat1}/50)`);
    }
    if (cat2 !== undefined && cat2 < 40) {
      weight += 20;
      if (priority !== 'urgent') priority = 'high';
      reasons.push(`Score improvement needed in CAT-2 (${cat2}/50)`);
    }

    // Check upcoming exams in next 45 days
    const examDates = [
      { name: 'CAT-1', date: subj.examDates?.cat1Date },
      { name: 'CAT-2', date: subj.examDates?.cat2Date },
      { name: 'FAT / Final Exam', date: subj.examDates?.fatDate || subj.examDates?.finalExamDate },
    ].filter((e) => e.date);

    for (const ex of examDates) {
      const examTime = new Date(ex.date!).getTime();
      const diffDays = Math.ceil((examTime - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 35) {
        weight += Math.max(10, 50 - diffDays);
        priority = 'urgent';
        reasons.push(`Upcoming ${ex.name} on ${ex.date} (${diffDays} days away)`);
        examDueSoon = `${ex.name} on ${ex.date}`;
        break;
      }
    }

    // Check difficulty level
    if (subj.difficulty === 'Critical' || subj.difficulty === 'Hard') {
      weight += 25;
      if (priority !== 'urgent') priority = 'high';
      reasons.push(`Marked as ${subj.difficulty} difficulty by student`);
    }

    return { subject: subj, weight, reasons, priority, examDueSoon };
  });

  // Sort subjects by urgency weight descending
  subjectWeights.sort((a, b) => b.weight - a.weight);

  // 2. Track daily allocated study minutes to avoid burnout
  const maxDailyMinutes = maxDailyHours * 60;
  const dailyAllocatedMinutes: Record<DayOfWeek, number> = {
    Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0,
  };

  // 3. Distribute academic study sessions across the week
  let sessionCounter = 1;
  const distributedSubjectIndex: Record<string, number> = {};

  for (const item of subjectWeights) {
    const { subject, reasons, priority, examDueSoon } = item;
    // Determine number of sessions per week based on weight: 2 to 4 sessions
    const sessionCount = item.weight >= 60 ? 4 : item.weight >= 40 ? 3 : 2;

    for (let sIdx = 0; sIdx < sessionCount; sIdx++) {
      // Find optimal day that hasn't exceeded daily limit and doesn't already have this subject
      const preferredDayOrder: DayOfWeek[] = [
        'Mon', 'Wed', 'Fri', 'Sun', 'Tue', 'Thu', 'Sat',
      ];

      // Shift starting offset so subjects spread out
      const startOffset = (distributedSubjectIndex[subject.id] || 0) + sIdx * 2;
      let scheduled = false;

      for (let d = 0; d < 7; d++) {
        const day = preferredDayOrder[(startOffset + d) % 7];
        if (dailyAllocatedMinutes[day] >= maxDailyMinutes) continue;

        // Check if this subject already has a session on this day
        const alreadyOnDay = generatedSessions.some(
          (sess) => sess.dayOfWeek === day && sess.courseCode === subject.courseCode
        );
        if (alreadyOnDay && sIdx < 2) continue;

        // Find available slot on this day
        const dayClasses = collegeClasses.filter((c) => c.dayOfWeek === day);
        const freeSlots = getAvailableSlotsForDay(dayClasses, studyTimePreferences, breakMinutes);

        // Filter out slots that overlap with already scheduled generated sessions on this day
        const existingDaySessions = generatedSessions.filter((sess) => sess.dayOfWeek === day);
        const validSlot = freeSlots.find((slot) => {
          return !existingDaySessions.some((sess) => {
            const sessStart = timeToMinutes(sess.startTime);
            const sessEnd = timeToMinutes(sess.endTime);
            return (
              (slot.startMinutes < sessEnd && slot.endMinutes > sessStart)
            );
          });
        });

        if (validSlot) {
          // Duration: 50 to 90 minutes depending on urgency
          const targetDuration = item.weight >= 50 ? 75 : 55;
          const slotDuration = validSlot.endMinutes - validSlot.startMinutes;
          const sessionDuration = Math.min(targetDuration, slotDuration);

          const startStr = minutesToTime(validSlot.startMinutes);
          const endStr = minutesToTime(validSlot.startMinutes + sessionDuration);

          const sessionType = examDueSoon
            ? 'Exam Prep'
            : item.subject.difficulty === 'Critical'
            ? 'Practice Problems'
            : 'Revision';

          generatedSessions.push({
            id: `plan-session-${sessionCounter++}`,
            subjectId: subject.id,
            courseCode: subject.courseCode,
            subjectName: subject.name,
            dayOfWeek: day,
            startTime: startStr,
            endTime: endStr,
            durationMinutes: sessionDuration,
            sessionType,
            priority,
            completed: false,
            isAiGenerated: true,
            rationale: reasons.join(' · ') || 'Regular curriculum spaced repetition',
            relatedExamOrDeadline: examDueSoon,
            difficulty: subject.difficulty || 'Medium',
            color: subject.color || 'indigo',
          });

          dailyAllocatedMinutes[day] += sessionDuration;
          distributedSubjectIndex[subject.id] = (distributedSubjectIndex[subject.id] || 0) + 1;
          scheduled = true;
          break;
        }
      }
    }
  }

  // 4. Allocate Weekly Career-Learning Sessions (e.g. 2-3 sessions for Full-Stack / AI / DSA)
  const careerTargetMinutes = weeklyCareerHours * 60;
  let scheduledCareerMinutes = 0;
  const careerDays: DayOfWeek[] = ['Sat', 'Sun', 'Tue', 'Thu'];

  for (const cDay of careerDays) {
    if (scheduledCareerMinutes >= careerTargetMinutes) break;
    if (dailyAllocatedMinutes[cDay] + 60 > maxDailyMinutes) continue;

    const dayClasses = collegeClasses.filter((c) => c.dayOfWeek === cDay);
    const freeSlots = getAvailableSlotsForDay(dayClasses, studyTimePreferences, breakMinutes);
    const existingDaySessions = generatedSessions.filter((sess) => sess.dayOfWeek === cDay);

    const validSlot = freeSlots.find((slot) => {
      return !existingDaySessions.some((sess) => {
        const sessStart = timeToMinutes(sess.startTime);
        const sessEnd = timeToMinutes(sess.endTime);
        return slot.startMinutes < sessEnd && slot.endMinutes > sessStart;
      });
    });

    if (validSlot) {
      const duration = Math.min(90, validSlot.endMinutes - validSlot.startMinutes);
      if (duration >= 45) {
        const role = profile.targetRole || 'Software Development';
        generatedSessions.push({
          id: `plan-session-${sessionCounter++}`,
          courseCode: 'CAREER',
          subjectName: `${role}: Skills & Project Lab`,
          dayOfWeek: cDay,
          startTime: minutesToTime(validSlot.startMinutes),
          endTime: minutesToTime(validSlot.startMinutes + duration),
          durationMinutes: duration,
          sessionType: 'Career Learning',
          priority: 'high',
          completed: false,
          isAiGenerated: true,
          rationale: `Dedicated ${weeklyCareerHours}h weekly career milestone sprint: Portfolio build & interview prep`,
          color: 'violet',
        });

        scheduledCareerMinutes += duration;
        dailyAllocatedMinutes[cDay] += duration;
      }
    }
  }

  // 5. Connect Pending Assignment Deadlines from Tasks
  const pendingTasksWithCourse = tasks
    .filter((t) => !t.completed && t.courseCode)
    .slice(0, 3);

  for (const task of pendingTasksWithCourse) {
    // Find a weekday with available room
    const targetDay: DayOfWeek = 'Thu';
    const dayClasses = collegeClasses.filter((c) => c.dayOfWeek === targetDay);
    const freeSlots = getAvailableSlotsForDay(dayClasses, studyTimePreferences, breakMinutes);
    const existingDaySessions = generatedSessions.filter((sess) => sess.dayOfWeek === targetDay);

    const validSlot = freeSlots.find((slot) => {
      return !existingDaySessions.some((sess) => {
        const s = timeToMinutes(sess.startTime);
        const e = timeToMinutes(sess.endTime);
        return slot.startMinutes < e && slot.endMinutes > s;
      });
    });

    if (validSlot && validSlot.endMinutes - validSlot.startMinutes >= 45) {
      generatedSessions.push({
        id: `plan-session-${sessionCounter++}`,
        courseCode: task.courseCode,
        subjectName: task.title,
        dayOfWeek: targetDay,
        startTime: minutesToTime(validSlot.startMinutes),
        endTime: minutesToTime(validSlot.startMinutes + 60),
        durationMinutes: 60,
        sessionType: 'Assignment / Project',
        priority: task.priority === 'urgent' ? 'urgent' : 'high',
        completed: false,
        isAiGenerated: true,
        rationale: `Deadline approaching (${task.dueDate}): ${task.title}`,
        relatedExamOrDeadline: `Due on ${task.dueDate}`,
        color: 'amber',
      });
    }
  }

  // Sort sessions chronologically within each day
  return generatedSessions.sort((a, b) => {
    const dayOrder: Record<DayOfWeek, number> = {
      Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7,
    };
    if (dayOrder[a.dayOfWeek] !== dayOrder[b.dayOfWeek]) {
      return dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
    }
    return a.startTime.localeCompare(b.startTime);
  });
}

/**
 * Re-plan missed or uncompleted sessions into the next upcoming available time slots
 */
export function replanMissedSessions(
  currentSessions: StudySession[],
  collegeClasses: TimetableClass[],
  profile: StudentProfile
): { updatedSessions: StudySession[]; replannedCount: number } {
  const incompleteSessions = currentSessions.filter((s) => !s.completed);
  const completedSessions = currentSessions.filter((s) => s.completed);

  if (incompleteSessions.length === 0) {
    return { updatedSessions: currentSessions, replannedCount: 0 };
  }

  // Reshuffle uncompleted sessions across upcoming weekend / evening slots
  const days: DayOfWeek[] = ['Sat', 'Sun', 'Fri', 'Mon', 'Wed'];
  let replannedCount = 0;

  const adjustedIncomplete = incompleteSessions.map((sess, idx) => {
    const targetDay = days[idx % days.length];
    replannedCount++;
    return {
      ...sess,
      dayOfWeek: targetDay,
      rationale: `(Replanned) ${sess.rationale || 'Rescheduled catch-up session'}`,
    };
  });

  return {
    updatedSessions: [...completedSessions, ...adjustedIncomplete].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    ),
    replannedCount,
  };
}

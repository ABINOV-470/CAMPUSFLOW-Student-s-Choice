import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { CommandPalette } from './components/layout/CommandPalette';
import { ToastContainer } from './components/layout/ToastContainer';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { TimetableSection } from './components/timetable/TimetableSection';
import { TaskManagerSection } from './components/tasks/TaskManagerSection';
import { StudyTimerSection } from './components/timer/StudyTimerSection';
import { CampusEventsSection } from './components/events/CampusEventsSection';
import { ClubDiscoverySection } from './components/clubs/ClubDiscoverySection';
import { ProductivityChartsSection } from './components/analytics/ProductivityChartsSection';
import { VITSubjectsSection } from './components/subjects/VITSubjectsSection';
import { CgpaCoachSection } from './components/coach/CgpaCoachSection';
import { CareerAdvisorSection } from './components/career/CareerAdvisorSection';
import { StudentAiAdvisor } from './components/advisor/StudentAiAdvisor';
import { ProfileSettingsModal } from './components/profile/ProfileSettingsModal';
import { BookOpen, ShieldCheck, Heart, Sparkles, MessageSquare } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, profile } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors selection:bg-indigo-500/20 selection:text-indigo-600">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen min-w-0">
        {/* Top Navbar */}
        <Navbar onToggleSidebar={() => setMobileSidebarOpen(true)} />

        {/* Viewport content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'timetable' && <TimetableSection />}
          {activeTab === 'subjects' && <VITSubjectsSection />}
          {activeTab === 'coach' && <CgpaCoachSection />}
          {activeTab === 'career' && <CareerAdvisorSection />}
          {activeTab === 'advisor' && <StudentAiAdvisor />}
          {activeTab === 'tasks' && <TaskManagerSection />}
          {activeTab === 'timer' && <StudyTimerSection />}
          {activeTab === 'events' && <CampusEventsSection />}
          {activeTab === 'clubs' && <ClubDiscoverySection />}
          {activeTab === 'analytics' && <ProductivityChartsSection />}
        </main>

        {/* Floating AI Advisor Quick Launcher Button (visible when not on advisor tab) */}
        {activeTab !== 'advisor' && (
          <div className="fixed bottom-6 right-6 z-30">
            <button
              onClick={() => setActiveTab('advisor')}
              className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              title="Open Unified Student AI Advisor"
            >
              <div className="relative">
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-indigo-600"></span>
              </div>
              <span className="font-sans font-bold">Ask AI Advisor</span>
            </button>
          </div>
        )}

        {/* Clean Footer */}
        <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800/80 py-6 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-200">CampusFlow</span>
              <span>·</span>
              <span>Built for {profile.university} Students</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setActiveTab('timetable')}
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                Schedule & Planner
              </button>
              <button
                onClick={() => setActiveTab('coach')}
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium text-amber-600 dark:text-amber-400"
              >
                CGPA Coach
              </button>
              <button
                onClick={() => setActiveTab('career')}
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium text-indigo-600 dark:text-indigo-400"
              >
                Career Readiness
              </button>
              <button
                onClick={() => setActiveTab('advisor')}
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium text-violet-600 dark:text-violet-400"
              >
                AI Advisor
              </button>
              <button
                onClick={() => setActiveTab('subjects')}
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                Curriculum
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveTab('timer')}
                className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                Focus Timer
              </button>
            </div>

            <div className="text-[11px] text-slate-400 dark:text-slate-500">
              LocalStorage & IndexedDB Persistent
            </div>
          </div>
        </footer>
      </div>

      {/* Global Modals & Notifications */}
      <CommandPalette />
      <ToastContainer />
      <ProfileSettingsModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

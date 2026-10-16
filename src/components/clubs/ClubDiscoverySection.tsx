import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Club, ClubCategory } from '../../types';
import {
  Users,
  Search,
  Check,
  Calendar,
  MapPin,
  Mail,
  ExternalLink,
  X,
  Compass,
  Tag,
  RotateCcw,
} from 'lucide-react';

export const ClubDiscoverySection: React.FC = () => {
  const { clubs, toggleClubMembership } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<ClubCategory | 'All' | 'MyClubs'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeClubModal, setActiveClubModal] = useState<Club | null>(null);

  const categories: (ClubCategory | 'All' | 'MyClubs')[] = [
    'All',
    'MyClubs',
    'Tech & Robotics',
    'Entrepreneurship',
    'Design & Media',
    'Debate & Law',
    'Music & Arts',
    'Sustainability',
  ];

  const filteredClubs = useMemo(() => {
    return clubs
      .filter((c) => {
        if (selectedCategory === 'All') return true;
        if (selectedCategory === 'MyClubs') return c.joined;
        return c.category === selectedCategory;
      })
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.tagline.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
  }, [clubs, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            Student Clubs & Organizations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Discover student communities, attend weekly project meetings, and expand your network.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search clubs, topics, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count =
            cat === 'All'
              ? clubs.length
              : cat === 'MyClubs'
              ? clubs.filter((c) => c.joined).length
              : clubs.filter((c) => c.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <span>{cat === 'MyClubs' ? 'My Clubs' : cat}</span>
              <span
                className={`text-[11px] font-mono px-1.5 py-0.2 rounded-md ${
                  isSelected
                    ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Clubs Grid */}
      {filteredClubs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-12 text-center shadow-sm border-dashed">
          <Compass className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No clubs found
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try choosing another category or clearing your search term.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-4 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:bg-indigo-100"
          >
            Show All Organizations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <div
              key={club.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                {/* Banner or Header */}
                {club.bannerImage ? (
                  <div className="h-32 bg-slate-800 overflow-hidden relative group">
                    <img
                      src={club.bannerImage}
                      alt={club.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                    <div className="absolute bottom-2.5 left-3 text-[11px] font-bold text-white uppercase tracking-wider">
                      {club.category}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 pb-0 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {club.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      {club.memberCount} members
                    </span>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      onClick={() => setActiveClubModal(club)}
                      className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors font-sans"
                    >
                      {club.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1">
                    "{club.tagline}"
                  </p>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {club.description}
                  </p>

                  {/* Meeting info */}
                  <div className="space-y-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{club.meetingSchedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{club.location}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {club.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-5 pt-0 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button
                  onClick={() => setActiveClubModal(club)}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  View Details
                </button>

                <button
                  onClick={() => toggleClubMembership(club.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                    club.joined
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30'
                  }`}
                >
                  {club.joined ? 'Joined ✓' : 'Join Club'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Club Details Modal */}
      {activeClubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {activeClubModal.category}
              </span>
              <button
                onClick={() => setActiveClubModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-sans">
                  {activeClubModal.name}
                </h3>
                <p className="text-xs text-slate-500 italic mt-0.5">
                  "{activeClubModal.tagline}"
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeClubModal.description}
              </p>

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Regular Meetings</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {activeClubModal.meetingSchedule}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Meeting Room</span>
                  <strong className="text-slate-800 dark:text-slate-200 truncate block">
                    {activeClubModal.location}
                  </strong>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-1.5">
                  Club Leadership & Advisors:
                </span>
                <div className="space-y-1">
                  {activeClubModal.leads.map((lead) => (
                    <div
                      key={lead}
                      className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2"
                    >
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lead}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Contact: {activeClubModal.contactEmail}</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveClubModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    toggleClubMembership(activeClubModal.id);
                    setActiveClubModal({
                      ...activeClubModal,
                      joined: !activeClubModal.joined,
                      memberCount: activeClubModal.joined
                        ? activeClubModal.memberCount - 1
                        : activeClubModal.memberCount + 1,
                    });
                  }}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                    activeClubModal.joined
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30'
                  }`}
                >
                  {activeClubModal.joined ? 'Leave Club' : 'Join Organization'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

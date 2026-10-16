import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { CampusEvent, EventCategory } from '../../types';
import {
  Calendar,
  MapPin,
  Clock,
  Search,
  Filter,
  Check,
  Users,
  Share2,
  CalendarPlus,
  X,
  ExternalLink,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

export const CampusEventsSection: React.FC = () => {
  const { events, toggleEventRegistration, addToast } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'All' | 'MyRSVPs'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEventDetail, setActiveEventDetail] = useState<CampusEvent | null>(null);

  const categories: (EventCategory | 'All' | 'MyRSVPs')[] = [
    'All',
    'MyRSVPs',
    'Academic',
    'Hackathon',
    'Career & Networking',
    'Social',
    'Sports & Wellness',
    'Arts & Culture',
  ];

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        if (selectedCategory === 'All') return true;
        if (selectedCategory === 'MyRSVPs') return e.registered;
        return e.category === selectedCategory;
      })
      .filter((e) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q)
        );
      });
  }, [events, selectedCategory, searchQuery]);

  const handleExportCalendar = (event: CampusEvent) => {
    // Generate an .ics calendar file simulation
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//CampusFlow//Event//EN\nBEGIN:VEVENT\nSUMMARY:${event.title}\nDESCRIPTION:${event.description}\nLOCATION:${event.location}\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Calendar Exported', `"${event.title}" saved to your calendar file.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-sans">
            Campus Events & Activities
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Discover hackathons, guest seminars, career fairs, and student life workshops.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search events, speakers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
          />
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count =
            cat === 'All'
              ? events.length
              : cat === 'MyRSVPs'
              ? events.filter((e) => e.registered).length
              : events.filter((e) => e.category === cat).length;

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
              <span>{cat === 'MyRSVPs' ? 'My RSVPs' : cat}</span>
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

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-12 text-center shadow-sm border-dashed">
          <Calendar className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No events found
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try choosing another category or clearing your search query.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-4 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:bg-indigo-100"
          >
            Show All Events
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between group"
            >
              <div>
                {/* Event Image Cover */}
                <div className="relative h-44 bg-slate-800 overflow-hidden">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-900 to-indigo-950 text-indigo-400">
                      <Calendar className="w-10 h-10 opacity-40" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-semibold">
                    {event.category}
                  </div>

                  {event.registered && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>RSVP Confirmed</span>
                    </div>
                  )}
                </div>

                {/* Event Info */}
                <div className="p-5">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Organized by {event.organizer}
                  </div>

                  <h3
                    onClick={() => setActiveEventDetail(event)}
                    className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors line-clamp-1 font-sans"
                  >
                    {event.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="space-y-1.5 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Registration strip */}
              <div className="p-5 pt-0 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-900 dark:text-slate-200 tabular-nums">
                    {event.spotsLeft}
                  </strong>{' '}
                  spots left
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveEventDetail(event)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="View details & speakers"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleEventRegistration(event.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                      event.registered
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30'
                    }`}
                  >
                    {event.registered ? 'Cancel RSVP' : 'RSVP Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      {activeEventDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-48 bg-slate-800">
              {activeEventDetail.imageUrl ? (
                <img
                  src={activeEventDetail.imageUrl}
                  alt={activeEventDetail.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-950 text-indigo-400">
                  <Calendar className="w-12 h-12" />
                </div>
              )}
              <button
                onClick={() => setActiveEventDetail(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  {activeEventDetail.category} · {activeEventDetail.organizer}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 font-sans">
                  {activeEventDetail.title}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeEventDetail.description}
              </p>

              {activeEventDetail.speakers && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-1.5">
                    Featured Speakers & Mentors:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeEventDetail.speakers.map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">When</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {activeEventDetail.date} · {activeEventDetail.time}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Where</span>
                  <strong className="text-slate-800 dark:text-slate-200 truncate block">
                    {activeEventDetail.location}
                  </strong>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleExportCalendar(activeEventDetail)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <CalendarPlus className="w-4 h-4 text-slate-500" />
                  <span>Download .ICS</span>
                </button>

                <button
                  onClick={() => {
                    toggleEventRegistration(activeEventDetail.id);
                    setActiveEventDetail({
                      ...activeEventDetail,
                      registered: !activeEventDetail.registered,
                      spotsLeft: activeEventDetail.registered
                        ? activeEventDetail.spotsLeft + 1
                        : activeEventDetail.spotsLeft - 1,
                    });
                  }}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                    activeEventDetail.registered
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30'
                  }`}
                >
                  {activeEventDetail.registered ? 'Cancel RSVP' : 'Confirm Registration'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

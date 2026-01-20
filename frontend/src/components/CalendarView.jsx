import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, MapPin, Clock, Package, Leaf } from 'lucide-react';
import api from '../utils/api';

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [pickups, setPickups] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const hoverTimeoutRef = useRef(null);
  const role = localStorage.getItem("role") || "volunteer";

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const [pickupsRes, oppsRes] = await Promise.all([
        api.get('/pickups/my'),
        api.get('/opportunities')
      ]);

      setPickups(pickupsRes.data?.data || []);
      setOpportunities(Array.isArray(oppsRes.data) ? oppsRes.data : []);
    } catch (err) {
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;

    // Try standard Date parsing first (ISO format, etc.)
    const date = new Date(dateStr);
    if (!isNaN(date.getTime()) && dateStr.includes('-')) {
      return date;
    }

    // Try parsing formats like "Wed, Oct 3", "October 3", "Oct 3, 2024", etc.
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Try to extract month and day from various formats
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'];
    const monthAbbr = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    const lowerStr = dateStr.toLowerCase().trim();

    // Find month name or abbreviation
    let month = -1;
    for (let i = 0; i < monthNames.length; i++) {
      if (lowerStr.includes(monthNames[i]) || lowerStr.includes(monthAbbr[i])) {
        month = i;
        break;
      }
    }

    // Extract day number - look for standalone numbers (1-31)
    const dayMatches = dateStr.match(/\b([1-9]|[12][0-9]|3[01])\b/);
    if (dayMatches) {
      const day = parseInt(dayMatches[1]);
      // If we found a month, use it; otherwise use current month
      const finalMonth = month >= 0 ? month : currentMonth;
      // Try to extract year, default to current year
      const yearMatch = dateStr.match(/\b(20\d{2})\b/);
      const year = yearMatch ? parseInt(yearMatch[1]) : currentYear;

      const parsedDate = new Date(year, finalMonth, day);
      // Validate the date
      if (parsedDate.getDate() === day && parsedDate.getMonth() === finalMonth) {
        return parsedDate;
      }
    }

    // Last resort: try to parse as relative date like "Today", "Tomorrow"
    if (lowerStr.includes('today')) return new Date();
    if (lowerStr.includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    return null;
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    const events = [];

    // Check pickups
    pickups.forEach(p => {
      const pickupDate = parseDate(p.scheduledDate);
      if (pickupDate &&
        pickupDate.getDate() === day &&
        pickupDate.getMonth() === month &&
        pickupDate.getFullYear() === year) {
        events.push({
          type: 'pickup',
          id: p._id,
          title: `${p.wasteTypes?.join(', ') || 'Pickup'}`,
          time: p.timeSlot || '',
          location: p.location?.address || '',
          status: p.status
        });
      }
    });

    // Check opportunities
    opportunities.forEach(opp => {
      if (opp.date) {
        const oppDate = parseDate(opp.date);
        if (oppDate &&
          oppDate.getDate() === day &&
          oppDate.getMonth() === month &&
          oppDate.getFullYear() === year) {
          events.push({
            type: 'opportunity',
            id: opp._id,
            title: opp.title || 'Opportunity',
            time: opp.time || '',
            location: opp.location || '',
            status: opp.status
          });
        }
      }
    });

    return events;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentDate);
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  if (loading) {
    return (
      <div className="premium-card p-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#123524] flex items-center justify-center text-white">
            <Calendar size={20} />
          </div>
          <div>
            <h2 className="text-xl font-normal text-gray-900 tracking-tight">Calendar</h2>
            <p className="text-xs text-gray-400 font-normal">Your scheduled events</p>
          </div>
        </div>

      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
            {day}
          </div>
        ))}
        {days.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="h-20" />;
          }

          const events = getEventsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();

          const handleMouseEnter = (e) => {
            if (events.length > 0) {
              clearTimeout(hoverTimeoutRef.current);
              const rect = e.currentTarget.getBoundingClientRect();
              setHoverPosition({
                x: rect.left + rect.width / 2,
                y: rect.top
              });
              hoverTimeoutRef.current = setTimeout(() => {
                setHoveredDate(day);
              }, 300);
            }
          };

          const handleMouseLeave = () => {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = setTimeout(() => {
              setHoveredDate(null);
            }, 200);
          };

          return (
            <div key={day.toISOString()} className="relative">
              <motion.div
                onClick={() => setSelectedDate(day)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className={`aspect-square p-2 border rounded-full cursor-pointer transition-all relative flex flex-col items-center justify-center ${isToday ? 'bg-emerald-50 border-emerald-200' :
                  isSelected ? 'bg-[#123524] text-white border-[#123524]' :
                    'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`text-xs font-medium mb-1 ${isToday ? 'text-emerald-700' : isSelected ? 'text-white' : 'text-gray-700'}`}>
                  {day.getDate()}
                </div>
                <div className="flex items-center justify-center gap-1 flex-wrap">
                  {events.slice(0, 3).map((event, eIdx) => (
                    <div
                      key={eIdx}
                      className={`w-2 h-2 rounded-full ${event.type === 'pickup'
                        ? isSelected ? 'bg-white' : 'bg-blue-500'
                        : isSelected ? 'bg-emerald-300' : 'bg-emerald-500'
                        }`}
                    />
                  ))}
                  {events.length > 3 && (
                    <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white/50' : 'bg-gray-400'}`} />
                  )}
                </div>
              </motion.div>

              {/* Hover Popup */}
              <AnimatePresence>
                {hoveredDate && hoveredDate.toDateString() === day.toDateString() && events.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="fixed z-50 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 pointer-events-none"
                    style={{
                      left: `${Math.max(10, Math.min(hoverPosition.x - 128, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 274))}px`,
                      top: `${Math.max(10, hoverPosition.y - 20)}px`,
                      transform: 'translateY(-100%)'
                    }}
                  >
                    <div className="text-xs font-semibold text-gray-900 mb-3">
                      {day.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {events.map((event, eIdx) => (
                        <div
                          key={eIdx}
                          className={`p-2 rounded-lg border ${event.type === 'pickup'
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-emerald-50 border-emerald-200'
                            }`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${event.type === 'pickup' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                              {event.type === 'pickup' ? <Package size={12} /> : <Leaf size={12} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-gray-900 truncate">{event.title}</div>
                              {event.time && (
                                <div className="flex items-center gap-1 text-[10px] text-gray-600 mt-0.5">
                                  <Clock size={10} />
                                  {event.time}
                                </div>
                              )}
                              {event.location && (
                                <div className="flex items-center gap-1 text-[10px] text-gray-600 mt-0.5 truncate">
                                  <MapPin size={10} />
                                  {event.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Selected Date Events */}
      {selectedDate && selectedDateEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 pt-6 border-t border-gray-200"
        >
          <h4 className="text-sm font-semibold text-gray-900 mb-4">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h4>
          <div className="space-y-3">
            {selectedDateEvents.map(event => (
              <div
                key={event.id}
                className={`p-4 rounded-xl border ${event.type === 'pickup'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-emerald-50 border-emerald-200'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${event.type === 'pickup' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                    {event.type === 'pickup' ? <Package size={18} /> : <Leaf size={18} />}
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-semibold text-gray-900 mb-1">{event.title}</h5>
                    {event.time && (
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <Clock size={12} />
                        {event.time}
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <MapPin size={12} />
                        {event.location}
                      </div>
                    )}
                    <div className="mt-2">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${event.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        event.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                        {event.status?.replace('_', ' ') || 'scheduled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

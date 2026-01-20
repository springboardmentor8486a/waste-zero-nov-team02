import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HorizontalCalendar({ selectedDate, onDateChange }) {
    const [viewDate, setViewDate] = useState(selectedDate ? new Date(selectedDate) : new Date());

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        return days;
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const isSelected = (date) => {
        if (!selectedDate || !date) return false;
        const d = new Date(selectedDate);
        return d.getDate() === date.getDate() &&
            d.getMonth() === date.getMonth() &&
            d.getFullYear() === date.getFullYear();
    };

    const days = getDaysInMonth(viewDate);

    return (
        <div className="w-full max-w-sm mx-auto bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 capitalize">
                    {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                </h3>
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-900"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={handleNextMonth}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-900"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-0.5">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest py-1">
                        {day}
                    </div>
                ))}
                {days.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} />;

                    const isToday = day.toDateString() === new Date().toDateString();
                    const selected = isSelected(day);

                    return (
                        <motion.button
                            key={day.toISOString()}
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onDateChange(day.toISOString().split('T')[0])}
                            className={`h-9 w-9 flex flex-col items-center justify-center rounded-xl text-xs transition-all relative mx-auto ${selected
                                ? 'bg-[#123524] text-white shadow-md'
                                : isToday
                                    ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-100'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                                }`}
                        >
                            {day.getDate()}
                            {isToday && !selected && (
                                <div className="absolute bottom-1 w-0.5 h-0.5 bg-emerald-500 rounded-full" />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

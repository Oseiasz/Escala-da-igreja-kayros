import React from 'react';
import { Schedule, ScheduleDay, Member } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, UserIcon, EditIcon } from './icons';

interface CalendarProps {
    viewDate: Date;
    schedule: Schedule;
    onNavigate: (newDate: Date) => void;
    onDateClick: (date: Date, daySchedule: ScheduleDay | undefined) => void;
    onMemberClick: (member: Member) => void;
    isAdmin?: boolean;
}

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_NAMES_MAP: { [key: number]: string } = {
  0: 'Domingo', 1: 'Segunda-feira', 2: 'Terça-feira', 3: 'Quarta-feira', 4: 'Quinta-feira', 5: 'Sexta-feira', 6: 'Sábado'
};

const areDatesSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const Calendar: React.FC<CalendarProps> = ({ viewDate, schedule, onNavigate, onDateClick, onMemberClick, isAdmin = false }) => {
    
    const getDaysForMonth = () => {
        const days = [];
        const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
        const lastDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
        
        // Add days from previous month
        for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
            const date = new Date(firstDayOfMonth);
            date.setDate(date.getDate() - (firstDayOfMonth.getDay() - i));
            days.push({ date, isCurrentMonth: false });
        }
        
        // Add days of current month
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push({ date: new Date(viewDate.getFullYear(), viewDate.getMonth(), i), isCurrentMonth: true });
        }
        
        // Add days from next month
        const lastDayOfMonthWeekday = lastDayOfMonth.getDay();
        if (lastDayOfMonthWeekday < 6) {
            for (let i = 1; i < 7 - lastDayOfMonthWeekday; i++) {
                 const date = new Date(lastDayOfMonth);
                 date.setDate(date.getDate() + i);
                 days.push({ date, isCurrentMonth: false });
            }
        }
        return days;
    };

    const calendarDays = getDaysForMonth();
    const today = new Date();

    const handlePrevMonth = () => {
        onNavigate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        onNavigate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const getScheduleForDay = (date: Date): ScheduleDay | undefined => {
        const dayName = DAY_NAMES_MAP[date.getDay()];
        return schedule.find(d => d.dayName === dayName);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100" aria-label="Mês anterior">
                    <ChevronLeftIcon className="w-6 h-6 text-slate-500" />
                </button>
                <h2 className="text-xl font-bold text-slate-700 capitalize">
                    {viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100" aria-label="Próximo mês">
                    <ChevronRightIcon className="w-6 h-6 text-slate-500" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
                {WEEKDAY_NAMES.map(day => (
                    <div key={day} className="text-center text-xs font-bold text-slate-500 py-2 bg-slate-50">
                        {day}
                    </div>
                ))}
                {calendarDays.map(({ date, isCurrentMonth }, index) => {
                    const daySchedule = getScheduleForDay(date);
                    const isToday = areDatesSameDay(date, today);
                    const hasActiveEvent = daySchedule?.active === true;
                    
                    const cellClasses = `p-2 min-h-[100px] transition-colors duration-200 relative
                        ${isCurrentMonth ? 'bg-white' : 'bg-slate-50 text-slate-400'}
                        ${hasActiveEvent && isCurrentMonth ? 'cursor-pointer hover:bg-indigo-50' : ''}
                    `;
                    const dateClasses = `flex items-center justify-center w-7 h-7 rounded-full text-sm
                        ${isToday ? 'bg-indigo-500 text-white font-bold' : ''}
                        ${!isToday && hasActiveEvent ? 'font-semibold text-indigo-700' : ''}
                    `;

                    return (
                        <div key={index} className={cellClasses} onClick={() => onDateClick(date, daySchedule)}>
                            <div className="flex justify-center">
                                <span className={dateClasses}>{date.getDate()}</span>
                            </div>
                            {isCurrentMonth && hasActiveEvent && (
                                <div className="mt-1 text-center">
                                     <p className="text-xs font-semibold text-indigo-800 truncate">{daySchedule?.event}</p>
                                     <div className="flex justify-center mt-1.5 gap-1">
                                         {daySchedule?.doorkeepers.length > 0 && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" title="Porteiros"></div>}
                                         {daySchedule?.hymnSingers.length > 0 && <div className="w-1.5 h-1.5 bg-green-400 rounded-full" title="Cantores"></div>}
                                     </div>
                                </div>
                            )}
                            {isAdmin && isCurrentMonth && hasActiveEvent && (
                                <button className="absolute bottom-1 right-1 p-1 text-slate-400 hover:text-indigo-600" onClick={(e) => { e.stopPropagation(); onDateClick(date, daySchedule);}}>
                                    <EditIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Calendar;
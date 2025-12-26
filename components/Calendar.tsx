
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
        
        for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
            const date = new Date(firstDayOfMonth);
            date.setDate(date.getDate() - (firstDayOfMonth.getDay() - i));
            days.push({ date, isCurrentMonth: false });
        }
        
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            days.push({ date: new Date(viewDate.getFullYear(), viewDate.getMonth(), i), isCurrentMonth: true });
        }
        
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
            <div className="flex justify-between items-center mb-6">
                <button onClick={handlePrevMonth} className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-emerald-950/30 transition-all" aria-label="Mês anterior">
                    <ChevronLeftIcon className="w-6 h-6 text-slate-500 dark:text-emerald-500" />
                </button>
                <h2 className="text-2xl font-black text-slate-700 dark:text-emerald-400 capitalize tracking-tight">
                    {viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={handleNextMonth} className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-emerald-950/30 transition-all" aria-label="Próximo mês">
                    <ChevronRightIcon className="w-6 h-6 text-slate-500 dark:text-emerald-500" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-emerald-900/20 border border-slate-200 dark:border-emerald-900/30 rounded-3xl overflow-hidden shadow-sm">
                {WEEKDAY_NAMES.map(day => (
                    <div key={day} className="text-center text-[10px] font-black uppercase text-slate-500 dark:text-emerald-800 py-3 bg-slate-50 dark:bg-slate-950 tracking-widest">
                        {day}
                    </div>
                ))}
                {calendarDays.map(({ date, isCurrentMonth }, index) => {
                    const daySchedule = getScheduleForDay(date);
                    const isToday = areDatesSameDay(date, today);
                    const hasActiveEvent = daySchedule?.active === true;
                    
                    const cellClasses = `p-2 min-h-[110px] transition-all duration-300 relative
                        ${isCurrentMonth ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-950/50 text-slate-400 dark:text-emerald-950'}
                        ${hasActiveEvent && isCurrentMonth ? 'cursor-pointer hover:bg-indigo-50 dark:hover:bg-emerald-950/20' : ''}
                    `;
                    const dateClasses = `flex items-center justify-center w-8 h-8 rounded-xl text-sm transition-all
                        ${isToday ? 'bg-indigo-600 dark:bg-emerald-600 text-white font-black shadow-lg shadow-indigo-200 dark:shadow-emerald-900/40 scale-110' : ''}
                        ${!isToday && hasActiveEvent ? 'font-black text-indigo-700 dark:text-emerald-400' : 'font-bold'}
                        ${!isCurrentMonth ? 'opacity-40' : ''}
                    `;

                    return (
                        <div key={index} className={cellClasses} onClick={() => onDateClick(date, daySchedule)}>
                            <div className="flex justify-center mb-1">
                                <span className={dateClasses}>{date.getDate()}</span>
                            </div>
                            {isCurrentMonth && hasActiveEvent && (
                                <div className="text-center">
                                     <p className="text-[10px] font-black text-indigo-800 dark:text-emerald-500 uppercase leading-tight truncate px-1">{daySchedule?.event}</p>
                                     <div className="flex justify-center mt-2 gap-1 flex-wrap">
                                         {daySchedule?.worshipLeaders && daySchedule.worshipLeaders.length > 0 && <div className="w-1.5 h-1.5 bg-purple-400 dark:bg-emerald-400 rounded-full" />}
                                         {daySchedule?.preachers && daySchedule.preachers.length > 0 && <div className="w-1.5 h-1.5 bg-orange-400 dark:bg-emerald-400 rounded-full" />}
                                         {daySchedule?.doorkeepers.length > 0 && <div className="w-1.5 h-1.5 bg-blue-400 dark:bg-emerald-400 rounded-full" />}
                                         {daySchedule?.hymnSingers.length > 0 && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />}
                                     </div>
                                </div>
                            )}
                            {isAdmin && isCurrentMonth && hasActiveEvent && (
                                <button className="absolute bottom-2 right-2 p-1 text-slate-300 dark:text-emerald-900 hover:text-indigo-600 dark:hover:text-emerald-400 transition-colors" onClick={(e) => { e.stopPropagation(); onDateClick(date, daySchedule);}}>
                                    <EditIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-purple-400 dark:bg-emerald-400 rounded-full" /><span className="text-[10px] font-black uppercase text-slate-500 dark:text-emerald-800 tracking-widest">Dirigente</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-orange-400 dark:bg-emerald-400 rounded-full" /><span className="text-[10px] font-black uppercase text-slate-500 dark:text-emerald-800 tracking-widest">Pregador</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-blue-400 dark:bg-emerald-400 rounded-full" /><span className="text-[10px] font-black uppercase text-slate-500 dark:text-emerald-800 tracking-widest">Portaria</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-400 dark:bg-emerald-400 rounded-full" /><span className="text-[10px] font-black uppercase text-slate-500 dark:text-emerald-800 tracking-widest">Louvor</span></div>
            </div>
        </div>
    );
};

export default Calendar;

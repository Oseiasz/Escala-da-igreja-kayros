
import React from 'react';
import { Schedule, ScheduleDay, Member } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, EditIcon } from './icons';

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

const Calendar: React.FC<CalendarProps> = ({ viewDate, schedule, onNavigate, onDateClick, isAdmin = false }) => {
    
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

    const getScheduleForDay = (date: Date): ScheduleDay | undefined => {
        const dayName = DAY_NAMES_MAP[date.getDay()];
        return schedule.find(d => d.dayName === dayName);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <button onClick={() => onNavigate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-black text-black dark:text-white uppercase tracking-widest">
                    {viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={() => onNavigate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all">
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                {WEEKDAY_NAMES.map(day => (
                    <div key={day} className="text-center text-[10px] font-black uppercase text-zinc-400 py-4 bg-zinc-50 dark:bg-black tracking-widest">
                        {day}
                    </div>
                ))}
                {calendarDays.map(({ date, isCurrentMonth }, index) => {
                    const daySchedule = getScheduleForDay(date);
                    const isToday = areDatesSameDay(date, today);
                    const hasActiveEvent = daySchedule?.active === true;
                    
                    return (
                        <div key={index} className={`p-2 min-h-[110px] relative transition-all duration-300 ${isCurrentMonth ? 'bg-white dark:bg-zinc-900' : 'bg-zinc-50 dark:bg-black/40 text-zinc-300'}`} onClick={() => onDateClick(date, daySchedule)}>
                            <div className="flex justify-center mb-1">
                                <span className={`flex items-center justify-center w-8 h-8 rounded-xl text-sm font-black transition-all ${isToday ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg scale-110' : isCurrentMonth ? 'text-zinc-600 dark:text-zinc-400' : 'opacity-20'}`}>
                                    {date.getDate()}
                                </span>
                            </div>
                            {isCurrentMonth && hasActiveEvent && (
                                <div className="text-center px-1">
                                     <p className="text-[9px] font-black text-black dark:text-white uppercase truncate tracking-tighter">{daySchedule?.event}</p>
                                     <div className="flex justify-center mt-2 gap-1 flex-wrap">
                                         {daySchedule?.worshipLeaders && daySchedule.worshipLeaders.length > 0 && <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full" />}
                                         {daySchedule?.preachers && daySchedule.preachers.length > 0 && <div className="w-1.5 h-1.5 bg-zinc-400 dark:bg-zinc-500 rounded-full" />}
                                     </div>
                                </div>
                            )}
                            {isAdmin && isCurrentMonth && hasActiveEvent && (
                                <button className="absolute bottom-2 right-2 p-1 text-zinc-300 hover:text-black dark:hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); onDateClick(date, daySchedule);}}>
                                    <EditIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-zinc-400 tracking-widest"><div className="w-2 h-2 bg-black dark:bg-white rounded-full" /> Dirigente</div>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-zinc-400 tracking-widest"><div className="w-2 h-2 bg-zinc-300 dark:bg-zinc-600 rounded-full" /> Membros</div>
            </div>
        </div>
    );
};

export default Calendar;

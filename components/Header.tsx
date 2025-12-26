
import React, { useMemo } from 'react';
// Added CalendarIcon to the imports
import { BellIcon, AdminIcon, UserIcon, LogoutIcon, SearchIcon, CalendarIcon } from './icons';
import { Schedule, Member, ScheduleGroup } from '../types';
import Avatar from './Avatar';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  view: 'admin' | 'user';
  schedule: Schedule;
  currentUser: Member | null;
  onLogout: () => void;
  isAdmin: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleSearch: () => void;
  scheduleGroups: ScheduleGroup[];
  activeScheduleGroupId: string;
  onSetActiveScheduleGroupId: (id: string) => void;
}

const NotificationBell: React.FC<{ count: number }> = ({ count }) => {
    return (
        <div className="relative group cursor-pointer p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <BellIcon className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-indigo-500" />
            {count > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-800 animate-pulse">
                    {count}
                </span>
            )}
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ 
    view, schedule, currentUser, onLogout, isAdmin, theme, onToggleTheme, onToggleSearch,
    scheduleGroups, activeScheduleGroupId, onSetActiveScheduleGroupId 
}) => {
    const notificationCount = useMemo(() => {
        if (!currentUser) return 0;
        const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const tomorrowIndex = (new Date().getDay() + 1) % 7;
        const tomorrowDayName = dayNames[tomorrowIndex];
        const tomorrowSchedule = schedule.find(day => day.dayName === tomorrowDayName);
        if (!tomorrowSchedule || !tomorrowSchedule.active) return 0;
        let tasksCount = 0;
        if (tomorrowSchedule.doorkeepers.some(m => m.id === currentUser.id)) tasksCount++;
        if (tomorrowSchedule.hymnSingers.some(m => m.id === currentUser.id)) tasksCount++;
        return tasksCount;
    }, [schedule, currentUser]);

    const handleNavigation = (hash: string) => {
        window.location.hash = hash;
    };
  
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-700/50">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-8">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                    <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white hidden sm:block tracking-tight">Escala<span className="text-indigo-600">Igreja</span></h1>
             </div>
             
             <div className="hidden md:block h-8 w-px bg-slate-200 dark:bg-slate-700"></div>

             <div className="relative group hidden sm:block">
                <select
                    value={activeScheduleGroupId}
                    onChange={(e) => onSetActiveScheduleGroupId(e.target.value)}
                    className="block w-full min-w-[160px] pl-3 pr-10 py-2.5 text-sm font-bold bg-slate-100 dark:bg-slate-700/50 border-none focus:ring-2 focus:ring-indigo-500 rounded-xl dark:text-slate-100 cursor-pointer transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                    {scheduleGroups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                </select>
             </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            {currentUser && (
                <>
                    <div className="flex items-center gap-1 sm:gap-3 mr-2">
                        <button
                            onClick={onToggleSearch}
                            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                            title="Buscar (Ctrl+K)"
                        >
                            <SearchIcon className="w-6 h-6" />
                        </button>
                        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                        {view === 'user' && <NotificationBell count={notificationCount} />}
                    </div>

                    <div className="flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                        {isAdmin && (
                            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
                                <button
                                    onClick={() => handleNavigation('#/')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${view === 'user' ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <UserIcon className="w-4 h-4" />
                                    <span className="hidden lg:inline">Geral</span>
                                </button>
                                <button
                                    onClick={() => handleNavigation('#/admin')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${view === 'admin' ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    <AdminIcon className="w-4 h-4" />
                                    <span className="hidden lg:inline">Gestão</span>
                                </button>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-900 dark:text-white leading-none mb-0.5">{currentUser.name.split(' ')[0]}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentUser.role === 'admin' ? 'Adm' : 'Membro'}</p>
                            </div>
                            <Avatar member={currentUser} className="w-10 h-10 border-2 border-white dark:border-slate-800 shadow-sm" />
                        </div>

                        <button onClick={onLogout} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all" title="Sair">
                            <LogoutIcon className="w-6 h-6" />
                        </button>
                    </div>
                </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

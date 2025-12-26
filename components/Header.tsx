
import React, { useMemo } from 'react';
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
        <div className="relative group cursor-pointer p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-emerald-500/10 transition-colors">
            <BellIcon className="w-7 h-7 text-slate-600 dark:text-emerald-500 group-hover:text-indigo-500 dark:group-hover:text-emerald-400" />
            {count > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-black animate-pulse">
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
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-slate-100 dark:border-emerald-500/20 h-20 sm:h-24 flex items-center">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 dark:bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg dark:shadow-emerald-500/20">
                    <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-emerald-500 hidden sm:block tracking-tight">Escala<span className="text-indigo-600 dark:text-emerald-400">Igreja</span></h1>
             </div>
             
             <div className="hidden md:block h-10 w-px bg-slate-200 dark:bg-emerald-500/10"></div>

             <div className="relative group hidden sm:block">
                <select
                    value={activeScheduleGroupId}
                    onChange={(e) => onSetActiveScheduleGroupId(e.target.value)}
                    className="block w-full min-w-[220px] pl-4 pr-10 py-3 text-sm font-black bg-slate-100 dark:bg-zinc-900 border-none focus:ring-2 focus:ring-emerald-500 rounded-2xl dark:text-emerald-400 cursor-pointer transition-all hover:bg-slate-200 dark:hover:bg-zinc-800"
                >
                    {scheduleGroups.map(group => (
                        <option key={group.id} value={group.id} className="font-bold">{group.name}</option>
                    ))}
                </select>
             </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            {currentUser && (
                <>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={onToggleSearch}
                            className="p-2.5 rounded-xl text-slate-500 dark:text-emerald-500 hover:bg-slate-100 dark:hover:bg-emerald-500/10 transition-all"
                            title="Buscar (Ctrl+K)"
                        >
                            <SearchIcon className="w-7 h-7" />
                        </button>
                        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                        {view === 'user' && <NotificationBell count={notificationCount} />}
                    </div>

                    <div className="flex items-center gap-4 pl-4 sm:pl-6 border-l border-slate-200 dark:border-emerald-500/20">
                        {isAdmin && (
                            <div className="flex items-center p-1.5 bg-slate-100 dark:bg-zinc-900 rounded-2xl">
                                <button
                                    onClick={() => handleNavigation('#/')}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${view === 'user' ? 'bg-white dark:bg-emerald-600 shadow-md text-indigo-600 dark:text-white' : 'text-slate-400 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-emerald-500'}`}
                                >
                                    <UserIcon className="w-5 h-5" />
                                    <span className="hidden xl:inline">Geral</span>
                                </button>
                                <button
                                    onClick={() => handleNavigation('#/admin')}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${view === 'admin' ? 'bg-white dark:bg-emerald-600 shadow-md text-indigo-600 dark:text-white' : 'text-slate-400 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-emerald-500'}`}
                                >
                                    <AdminIcon className="w-5 h-5" />
                                    <span className="hidden xl:inline">Gestão</span>
                                </button>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-slate-900 dark:text-emerald-400 leading-none mb-1">{currentUser.name.split(' ')[0]}</p>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{currentUser.role === 'admin' ? 'Adm' : 'Membro'}</p>
                            </div>
                            <Avatar member={currentUser} className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-white dark:border-emerald-500/30 shadow-sm" />
                        </div>

                        <button onClick={onLogout} className="p-2.5 text-slate-400 dark:text-zinc-700 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all" title="Sair">
                            <LogoutIcon className="w-7 h-7" />
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

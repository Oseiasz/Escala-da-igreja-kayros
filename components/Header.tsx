import React, { useMemo } from 'react';
import { BellIcon, AdminIcon, UserIcon, LogoutIcon, SearchIcon } from './icons';
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
        <div className="relative">
            <BellIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
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
        
        if (!tomorrowSchedule || !tomorrowSchedule.active) {
            return 0;
        }

        let tasksCount = 0;
        if (tomorrowSchedule.doorkeepers.some(m => m.id === currentUser.id)) {
            tasksCount++;
        }
        if (tomorrowSchedule.hymnSingers.some(m => m.id === currentUser.id)) {
            tasksCount++;
        }
        return tasksCount;
    }, [schedule, currentUser]);

    const handleNavigation = (hash: string) => {
        window.location.hash = hash;
    };
  
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
             <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 hidden sm:block">Escala</h1>
             <select
                value={activeScheduleGroupId}
                onChange={(e) => onSetActiveScheduleGroupId(e.target.value)}
                className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                aria-label="Selecionar escala"
             >
                {scheduleGroups.map(group => (
                    <option key={group.id} value={group.id}>
                        {group.name}
                    </option>
                ))}
             </select>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {currentUser && (
                <>
                    {view === 'user' && <NotificationBell count={notificationCount} />}
                    
                     <button
                        onClick={onToggleSearch}
                        type="button"
                        className="flex items-center gap-2 p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 transition-colors"
                        aria-label="Abrir busca (Ctrl+K)"
                    >
                        <SearchIcon className="w-5 h-5" />
                        <kbd className="hidden lg:inline-block px-2 py-1 text-xs font-sans font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md">
                            Ctrl+K
                        </kbd>
                    </button>

                    <ThemeToggle theme={theme} onToggle={onToggleTheme} />

                    <div className="flex items-center gap-2">
                         <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hidden sm:block">
                            Olá, {currentUser.name.split(' ')[0]}
                        </span>
                        <Avatar member={currentUser} className="w-8 h-8"/>
                    </div>


                    {isAdmin && (
                        <div className="flex items-center p-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                            <button
                                type="button"
                                onClick={() => handleNavigation('#/')}
                                className={`block p-1.5 rounded-full transition-colors duration-300 ${view === 'user' ? 'bg-white dark:bg-slate-500 shadow' : 'bg-transparent text-slate-500 dark:text-slate-400'}`}
                                aria-label="Visualização de Usuário"
                            >
                                <UserIcon className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleNavigation('#/admin')}
                                className={`block p-1.5 rounded-full transition-colors duration-300 ${view === 'admin' ? 'bg-white dark:bg-slate-500 shadow' : 'bg-transparent text-slate-500 dark:text-slate-400'}`}
                                aria-label="Visualização de Administrador"
                            >
                                <AdminIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                    <button onClick={onLogout} className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-500 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Sair">
                      <LogoutIcon className="w-5 h-5" />
                    </button>
                </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

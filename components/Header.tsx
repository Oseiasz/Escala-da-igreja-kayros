
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

const Header: React.FC<HeaderProps> = ({ 
    view, schedule, currentUser, onLogout, isAdmin, theme, onToggleTheme, onToggleSearch,
    scheduleGroups, activeScheduleGroupId, onSetActiveScheduleGroupId 
}) => {
    const handleNavigation = (hash: string) => {
        window.location.hash = hash;
    };
  
  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-church-black/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 h-20 sm:h-24 flex items-center">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center shadow-lg">
                    <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white dark:text-black" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white hidden sm:block tracking-tighter uppercase">Escala</h1>
             </div>
             
             <div className="hidden md:block h-8 w-px bg-zinc-200 dark:bg-zinc-800"></div>

             <div className="relative group hidden sm:block">
                <select
                    value={activeScheduleGroupId}
                    onChange={(e) => onSetActiveScheduleGroupId(e.target.value)}
                    className="block w-full min-w-[200px] px-4 py-2 text-sm font-black bg-zinc-100 dark:bg-church-surface border-none rounded-xl text-black dark:text-white cursor-pointer transition-all hover:bg-zinc-200 dark:hover:bg-zinc-800"
                >
                    {scheduleGroups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
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
                            className="p-2.5 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                        >
                            <SearchIcon className="w-6 h-6" />
                        </button>
                        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 pl-4 sm:pl-6 border-l border-zinc-200 dark:border-zinc-800">
                        {/* Removido o check isAdmin && para que o menu de navegação apareça para todos */}
                        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-church-surface rounded-xl">
                            <button
                                onClick={() => handleNavigation('#/')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${view === 'user' ? 'bg-white dark:bg-white text-black shadow-sm' : 'text-zinc-500 dark:text-zinc-600 hover:text-black dark:hover:text-white'}`}
                            >
                                <UserIcon className="w-4 h-4" />
                                <span className="hidden xl:inline">Geral</span>
                            </button>
                            <button
                                onClick={() => handleNavigation('#/admin')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${view === 'admin' ? 'bg-white dark:bg-white text-black shadow-sm' : 'text-zinc-500 dark:text-zinc-600 hover:text-black dark:hover:text-white'}`}
                            >
                                <AdminIcon className="w-4 h-4" />
                                <span className="hidden xl:inline">Gestão</span>
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigation('#/profile')}>
                            <Avatar member={currentUser} className="w-10 h-10 border border-zinc-200 dark:border-zinc-800" />
                        </div>

                        <button onClick={onLogout} className="p-2.5 text-zinc-400 dark:text-zinc-700 hover:text-red-500 transition-all">
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

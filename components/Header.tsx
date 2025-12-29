
import React from 'react';
import { BellIcon, AdminIcon, UserIcon, LogoutIcon, CalendarIcon } from './icons';
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
  isCloudConnected?: boolean;
  onAdminClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    view, currentUser, onLogout, theme, onToggleTheme,
    scheduleGroups, activeScheduleGroupId, onSetActiveScheduleGroupId, isCloudConnected = false,
    onAdminClick
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-church-black/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 h-20 sm:h-24 flex items-center">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
             <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black dark:bg-white rounded-2xl flex items-center justify-center shadow-lg">
                        <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white dark:text-black" />
                    </div>
                    {isCloudConnected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-church-black animate-pulse-fast shadow-sm"></div>
                    )}
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-black dark:text-white hidden lg:block tracking-tighter uppercase">Escala</h1>
             </div>
             
             <div className="hidden md:block h-8 w-px bg-zinc-200 dark:bg-zinc-800"></div>

             <div className="relative group hidden sm:block">
                <select
                    value={activeScheduleGroupId}
                    onChange={(e) => onSetActiveScheduleGroupId(e.target.value)}
                    className="block w-full min-w-[180px] px-4 py-2 text-xs font-black bg-zinc-100 dark:bg-church-surface border-none rounded-xl text-black dark:text-white cursor-pointer transition-all hover:bg-zinc-200"
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
                    <div className="flex items-center gap-1.5 sm:gap-3">
                        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
                        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block"></div>
                        
                        <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-church-surface rounded-xl">
                            <button
                                onClick={() => { window.location.hash = '#/'; }}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'user' ? 'bg-white dark:bg-church-zinc text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-black'}`}
                            >
                                <UserIcon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Geral</span>
                            </button>
                            <button
                                onClick={onAdminClick}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'admin' ? 'bg-white dark:bg-church-zinc text-black dark:text-white shadow-sm' : 'text-zinc-500 hover:text-black'}`}
                            >
                                <AdminIcon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Direção</span>
                            </button>
                        </div>
                        
                        <Avatar member={currentUser} className="w-10 h-10 border-2 border-zinc-100 dark:border-zinc-800 ml-2" />

                        <button onClick={onLogout} className="p-2 text-zinc-400 hover:text-red-500 transition-all">
                            <LogoutIcon className="w-5 h-5" />
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

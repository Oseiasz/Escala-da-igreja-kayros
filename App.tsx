
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Schedule, Member, User, ScheduleDay, ScheduleGroup } from './types';
import AdminView from './components/AdminView';
import UserView from './components/UserView';
import Header from './components/Header';
import LoginView from './components/LoginView';
import SignUpView from './components/SignUpView';
import ProfileModal from './components/ProfileModal';
import QuickSearchModal from './components/QuickSearchModal';
import ScheduleDetailModal from './components/ScheduleDetailModal';
import ForgotPasswordView from './components/ForgotPasswordView';
import { KeyIcon, SpinnerIcon } from './components/icons';

const DB_KEYS = {
  MEMBERS: 'church_members_v8',
  USERS: 'church_users_v8',
  GROUPS: 'church_groups_v8',
  ACTIVE_GROUP: 'church_active_group_v8',
  THEME: 'church_theme_v8',
  SESSION: 'church_session_v8'
};

const MASTER_ADMIN_EMAIL = 'ozeiasof@gmail.com';
const ADMIN_ACCESS_PASSWORD = 'Kayros2026';

const INITIAL_MEMBERS: Member[] = [
  { id: 'admin', name: 'Administrador Principal', email: MASTER_ADMIN_EMAIL, role: 'admin' },
];

const INITIAL_USERS: User[] = [
    { email: MASTER_ADMIN_EMAIL, password: 'Oseias10', memberId: 'admin' },
];

const BLANK_SCHEDULE: Schedule = [
    { id: 'd1', dayName: 'Domingo', dateLabel: '', event: 'Culto da Família', active: true, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd2', dayName: 'Segunda-feira', dateLabel: '', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd3', dayName: 'Terça-feira', dateLabel: '', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd4', dayName: 'Quarta-feira', dateLabel: '', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd5', dayName: 'Quinta-feira', dateLabel: '', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd6', dayName: 'Sexta-feira', dateLabel: '', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd7', dayName: 'Sábado', dateLabel: '', event: 'Culto de Jovens', active: true, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
];

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot'>('login');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(DB_KEYS.THEME);
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [activeUserId, setActiveUserId] = useState<string | null>(localStorage.getItem(DB_KEYS.SESSION));
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState(false);
  const [isLoadingSync, setIsLoadingSync] = useState(false);

  // --- PERSISTÊNCIA ---
  const [allMembers, setAllMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(DB_KEYS.MEMBERS);
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(DB_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [scheduleGroups, setScheduleGroups] = useState<ScheduleGroup[]>(() => {
    const saved = localStorage.getItem(DB_KEYS.GROUPS);
    return saved ? JSON.parse(saved) : [{ id: 'default', name: 'Congregação Sede', schedule: BLANK_SCHEDULE, announcements: 'Avisos da congregação.' }];
  });

  const [activeScheduleGroupId, setActiveScheduleGroupId] = useState<string>(() => {
      return localStorage.getItem(DB_KEYS.ACTIVE_GROUP) || 'default';
  });

  const syncToLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // --- AUTO-SINCRONIZAÇÃO VIA NUVEM (BYTEBIN) ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cloudId = urlParams.get('cloud');
    
    if (cloudId) {
      const fetchCloudData = async () => {
        setIsLoadingSync(true);
        try {
          const response = await fetch(`https://bytebin.org/download/${cloudId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.members && data.groups) {
              if (confirm("Nova escala disponível! Deseja carregar as atualizações enviadas pelo administrador?")) {
                setAllMembers(data.members);
                setUsers(data.users);
                setScheduleGroups(data.groups);
                syncToLocalStorage(DB_KEYS.MEMBERS, data.members);
                syncToLocalStorage(DB_KEYS.USERS, data.users);
                syncToLocalStorage(DB_KEYS.GROUPS, data.groups);
                // Limpa o parâmetro da URL para não perguntar de novo
                window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
              }
            }
          }
        } catch (error) {
          console.error("Erro ao sincronizar com a nuvem:", error);
        } finally {
          setIsLoadingSync(false);
        }
      };
      fetchCloudData();
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem(DB_KEYS.THEME, theme);
  }, [theme]);

  const currentUser = useMemo(() => allMembers.find(m => m.id === activeUserId) || null, [allMembers, activeUserId]);
  const isSuperAdmin = currentUser?.email === MASTER_ADMIN_EMAIL;

  const handleLogin = useCallback(async (email: string, password: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);
    if (user) {
        setActiveUserId(user.memberId);
        localStorage.setItem(DB_KEYS.SESSION, user.memberId);
        return { success: true };
    }
    return { success: false, message: 'Usuário ou senha inválidos.' };
  }, [users]);

  const handleSignUp = useCallback(async (name: string, email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    if (users.some(u => u.email === normalizedEmail)) {
      return { success: false, message: 'Este e-mail já está em uso.' };
    }
    const memberId = `m_${Date.now()}`;
    const newMember: Member = { id: memberId, name, email: normalizedEmail, role: normalizedEmail === MASTER_ADMIN_EMAIL ? 'admin' : 'member' };
    const newUser: User = { email: normalizedEmail, password, memberId };
    const updatedMembers = [...allMembers, newMember];
    const updatedUsers = [...users, newUser];
    setAllMembers(updatedMembers);
    setUsers(updatedUsers);
    syncToLocalStorage(DB_KEYS.MEMBERS, updatedMembers);
    syncToLocalStorage(DB_KEYS.USERS, updatedUsers);
    setActiveUserId(memberId);
    localStorage.setItem(DB_KEYS.SESSION, memberId);
    return { success: true };
  }, [allMembers, users]);

  const handleLogout = () => {
      setActiveUserId(null);
      setIsAdminUnlocked(false);
      localStorage.removeItem(DB_KEYS.SESSION);
      window.location.hash = '#/';
  };

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockPassword === ADMIN_ACCESS_PASSWORD) {
        setIsAdminUnlocked(true);
        if (currentUser && currentUser.role !== 'admin') {
            const updated = allMembers.map(m => m.id === currentUser.id ? { ...m, role: 'admin' as const } : m);
            setAllMembers(updated);
            syncToLocalStorage(DB_KEYS.MEMBERS, updated);
        }
    } else {
        setUnlockError(true);
        setUnlockPassword('');
    }
  };

  const activeScheduleGroup = useMemo(() => scheduleGroups.find(g => g.id === activeScheduleGroupId) || scheduleGroups[0], [scheduleGroups, activeScheduleGroupId]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<Member | null>(null);
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; date?: Date; schedule?: ScheduleDay }>({ isOpen: false });

  if (isLoadingSync) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white gap-4">
        <SpinnerIcon className="w-12 h-12 text-white" />
        <p className="font-black uppercase tracking-widest text-xs">Sincronizando Escala...</p>
      </div>
    );
  }

  if (!currentUser) {
    if (authView === 'signup') return <SignUpView onSignUp={handleSignUp} onSwitchToLogin={() => setAuthView('login')} />;
    if (authView === 'forgot') return <ForgotPasswordView onSubmit={async () => ({success: true})} onSwitchToLogin={() => setAuthView('login')} />;
    return <LoginView onLogin={handleLogin} onSwitchToSignUp={() => setAuthView('signup')} onForgotPassword={() => setAuthView('forgot')} />;
  }

  return (
    <div className="min-h-screen">
      <Header 
        isAdmin={true} 
        view={route === '#/admin' ? 'admin' : 'user'} 
        schedule={activeScheduleGroup.schedule} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        theme={theme} 
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        onToggleSearch={() => setIsSearchOpen(true)}
        scheduleGroups={scheduleGroups} 
        activeScheduleGroupId={activeScheduleGroupId}
        onSetActiveScheduleGroupId={(id) => {
            setActiveScheduleGroupId(id);
            localStorage.setItem(DB_KEYS.ACTIVE_GROUP, id);
        }}
      />
      
      <main className="container mx-auto p-4 lg:p-8 max-w-7xl">
        {route === '#/admin' ? (
          isAdminUnlocked || currentUser.role === 'admin' ? (
            <AdminView
                schedule={activeScheduleGroup.schedule}
                onUpdateSchedule={(s) => {
                    const updated = scheduleGroups.map(g => g.id === activeScheduleGroupId ? {...g, schedule: s} : g);
                    setScheduleGroups(updated);
                    syncToLocalStorage(DB_KEYS.GROUPS, updated);
                }}
                announcements={activeScheduleGroup.announcements}
                onUpdateAnnouncements={(a) => {
                    const updated = scheduleGroups.map(g => g.id === activeScheduleGroupId ? {...g, announcements: a} : g);
                    setScheduleGroups(updated);
                    syncToLocalStorage(DB_KEYS.GROUPS, updated);
                }}
                allMembers={allMembers}
                users={users}
                onDeleteMember={(id) => {
                    if (id === 'admin') return;
                    const filteredM = allMembers.filter(m => m.id !== id);
                    const filteredU = users.filter(u => u.memberId !== id);
                    setAllMembers(filteredM);
                    setUsers(filteredU);
                    syncToLocalStorage(DB_KEYS.MEMBERS, filteredM);
                    syncToLocalStorage(DB_KEYS.USERS, filteredU);
                }}
                onAddMember={(n, e, p, r) => {
                    const memberId = `m_${Date.now()}`;
                    const newM = { id: memberId, name: n, email: e.toLowerCase(), phone: p, role: r };
                    const updated = [...allMembers, newM];
                    setAllMembers(updated);
                    syncToLocalStorage(DB_KEYS.MEMBERS, updated);
                }}
                currentUser={currentUser}
                onToggleAdmin={(id) => {
                    if (!isSuperAdmin) return;
                    const updated = allMembers.map(m => m.id === id ? {...m, role: m.role === 'admin' ? 'member' : 'admin'} : m);
                    setAllMembers(updated);
                    syncToLocalStorage(DB_KEYS.MEMBERS, updated);
                }}
                onUpdateMember={(m) => {
                    const updated = allMembers.map(old => old.id === m.id ? m : old);
                    setAllMembers(updated);
                    syncToLocalStorage(DB_KEYS.MEMBERS, updated);
                }}
                scheduleGroups={scheduleGroups}
                activeScheduleGroupId={activeScheduleGroupId}
                onAddScheduleGroup={(name) => {
                    const newG = {id: `g_${Date.now()}`, name, schedule: BLANK_SCHEDULE, announcements: ""};
                    const updated = [...scheduleGroups, newG];
                    setScheduleGroups(updated);
                    syncToLocalStorage(DB_KEYS.GROUPS, updated);
                }}
                onDeleteScheduleGroup={(id) => {
                    if (scheduleGroups.length > 1) {
                        const updated = scheduleGroups.filter(g => g.id !== id);
                        setScheduleGroups(updated);
                        setActiveScheduleGroupId(updated[0].id);
                        syncToLocalStorage(DB_KEYS.GROUPS, updated);
                    }
                }}
                onUpdateScheduleGroupName={(id, n) => {
                    const updated = scheduleGroups.map(g => g.id === id ? {...g, name: n} : g);
                    setScheduleGroups(updated);
                    syncToLocalStorage(DB_KEYS.GROUPS, updated);
                }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-full max-w-md p-10 bg-white dark:bg-church-surface rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-8">
                    <div className="text-center space-y-4">
                        <KeyIcon className="w-12 h-12 mx-auto text-black dark:text-white" />
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Área de Direção</h2>
                        <p className="text-xs font-bold text-zinc-500 uppercase">Insira a senha mestra para editar a escala</p>
                    </div>
                    <form onSubmit={handleUnlockAdmin} className="space-y-6">
                        <input 
                            type="password" 
                            placeholder="Senha de Acesso"
                            value={unlockPassword}
                            onChange={(e) => setUnlockPassword(e.target.value)}
                            className={`w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border rounded-2xl text-center text-xl tracking-[0.3em] font-black ${unlockError ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'}`}
                        />
                        <button type="submit" className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl shadow-xl uppercase tracking-widest text-xs">Desbloquear</button>
                    </form>
                </div>
            </div>
          )
        ) : (
          <UserView 
            schedule={activeScheduleGroup.schedule} 
            announcements={activeScheduleGroup.announcements} 
            currentUser={currentUser} 
            onUpdateAvatar={(id, url) => {
                const updated = allMembers.map(m => m.id === id ? {...m, avatar: url} : m);
                setAllMembers(updated);
                syncToLocalStorage(DB_KEYS.MEMBERS, updated);
            }}
            onMemberClick={setViewingProfile} 
            scheduleName={activeScheduleGroup.name}
            viewDate={new Date()} 
            onNavigateDate={() => {}} 
            onDateClick={(date, day) => setDetailModal({ isOpen: true, date, schedule: day })}
          />
        )}
      </main>

      <QuickSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        allMembers={allMembers} 
        schedule={activeScheduleGroup.schedule} 
        onSelectMember={(m) => { setViewingProfile(m); setIsSearchOpen(false); }} 
        onSelectTask={(day) => { setDetailModal({ isOpen: true, date: new Date(), schedule: day }); setIsSearchOpen(false); }} 
      />

      <ProfileModal 
        member={viewingProfile} 
        schedule={activeScheduleGroup.schedule} 
        onClose={() => setViewingProfile(null)} 
        currentUser={currentUser} 
        onUpdateAvatar={(id, url) => {
            const updated = allMembers.map(m => m.id === id ? {...m, avatar: url} : m);
            setAllMembers(updated);
            syncToLocalStorage(DB_KEYS.MEMBERS, updated);
        }}
        onDeleteAccount={(id) => {
            if (id === 'admin') return;
            const filteredM = allMembers.filter(m => m.id !== id);
            const filteredU = users.filter(u => u.memberId !== id);
            setAllMembers(filteredM);
            setUsers(filteredU);
            syncToLocalStorage(DB_KEYS.MEMBERS, filteredM);
            syncToLocalStorage(DB_KEYS.USERS, filteredU);
            if (activeUserId === id) handleLogout();
        }}
      />

      <ScheduleDetailModal 
        isOpen={detailModal.isOpen} 
        onClose={() => setDetailModal({ isOpen: false })} 
        date={detailModal.date} 
        daySchedule={detailModal.schedule} 
        onMemberClick={setViewingProfile} 
      />
    </div>
  );
};

export default App;

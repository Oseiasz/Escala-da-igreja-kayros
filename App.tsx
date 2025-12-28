
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

// Versão v10: Promoção automática a admin e proteção de super-admin ozeiasof@gmail.com
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
    { id: 'd1', dayName: 'Domingo', event: 'Culto da Família', active: true, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd2', dayName: 'Segunda-feira', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd3', dayName: 'Terça-feira', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd4', dayName: 'Quarta-feira', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd5', dayName: 'Quinta-feira', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd6', dayName: 'Sexta-feira', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd7', dayName: 'Sábado', event: 'Culto de Jovens', active: true, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
];

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot'>('login');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem(DB_KEYS.THEME) as 'light' | 'dark') || 'dark');
  const [activeUserId, setActiveUserId] = useState<string | null>(localStorage.getItem(DB_KEYS.SESSION));
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState(false);

  // --- PERSISTÊNCIA ---

  const [allMembers, setAllMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem(DB_KEYS.MEMBERS);
      if (!saved) return INITIAL_MEMBERS;
      const list = JSON.parse(saved);
      return (Array.isArray(list) && list.length > 0) ? list : INITIAL_MEMBERS;
    } catch { return INITIAL_MEMBERS; }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(DB_KEYS.USERS);
      if (!saved) return INITIAL_USERS;
      const list = JSON.parse(saved);
      return (Array.isArray(list) && list.length > 0) ? list : INITIAL_USERS;
    } catch { return INITIAL_USERS; }
  });

  const [scheduleGroups, setScheduleGroups] = useState<ScheduleGroup[]>(() => {
    try {
      const saved = localStorage.getItem(DB_KEYS.GROUPS);
      return saved ? JSON.parse(saved) : [{ id: 'default', name: 'Congregação Sede', schedule: BLANK_SCHEDULE, announcements: 'Avisos da congregação.' }];
    } catch { return [{ id: 'default', name: 'Congregação Sede', schedule: BLANK_SCHEDULE, announcements: 'Avisos da congregação.' }]; }
  });

  const [activeScheduleGroupId, setActiveScheduleGroupId] = useState<string>(() => {
      return localStorage.getItem(DB_KEYS.ACTIVE_GROUP) || 'default';
  });

  const syncToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Erro crítico ao salvar dados:", e);
    }
  };

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(DB_KEYS.THEME, theme);
  }, [theme]);

  // --- MANIPULADORES ---

  const currentUser = useMemo(() => allMembers.find(m => m.id === activeUserId) || null, [allMembers, activeUserId]);
  const isSuperAdmin = currentUser?.email === MASTER_ADMIN_EMAIL;

  const handleLogin = useCallback(async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);
    if (user) {
        setActiveUserId(user.memberId);
        localStorage.setItem(DB_KEYS.SESSION, user.memberId);
        return { success: true };
    }
    return { success: false, message: 'Usuário ou senha inválidos.' };
  }, [users]);

  const handleSignUp = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const normalizedEmail = email.toLowerCase().trim();
    const currentUsers = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    if (currentUsers.some((u: User) => u.email === normalizedEmail)) {
      return { success: false, message: 'Este e-mail já está em uso.' };
    }
    const memberId = `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newMember: Member = { id: memberId, name, email: normalizedEmail, role: normalizedEmail === MASTER_ADMIN_EMAIL ? 'admin' : 'member' };
    const newUser: User = { email: normalizedEmail, password, memberId };
    const updatedMembers = [...allMembers, newMember];
    const updatedUsers = [...users, newUser];
    syncToLocalStorage(DB_KEYS.MEMBERS, updatedMembers);
    syncToLocalStorage(DB_KEYS.USERS, updatedUsers);
    setAllMembers(updatedMembers);
    setUsers(updatedUsers);
    setActiveUserId(memberId);
    localStorage.setItem(DB_KEYS.SESSION, memberId);
    return { success: true };
  }, [allMembers, users]);

  const handleLogout = () => {
      setActiveUserId(null);
      setIsAdminUnlocked(false);
      localStorage.removeItem(DB_KEYS.SESSION);
      window.location.hash = '#/';
      setAuthView('login');
  };

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockPassword === ADMIN_ACCESS_PASSWORD) {
        setIsAdminUnlocked(true);
        setUnlockError(false);
        
        // Promoção Automática: Se o usuário logado ainda não for admin, ele se torna admin agora.
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
  const isAdmin = currentUser?.role === 'admin';

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<Member | null>(null);
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; date?: Date; schedule?: ScheduleDay }>({ isOpen: false });

  if (!currentUser) {
    if (authView === 'signup') return <SignUpView onSignUp={handleSignUp} onSwitchToLogin={() => setAuthView('login')} />;
    if (authView === 'forgot') return <ForgotPasswordView onSubmit={async () => ({success: true})} onSwitchToLogin={() => setAuthView('login')} />;
    return <LoginView onLogin={handleLogin} onSwitchToSignUp={() => setAuthView('signup')} onForgotPassword={() => setAuthView('forgot')} />;
  }

  return (
    <div className="min-h-screen bg-church-white dark:bg-church-black transition-colors duration-500">
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
          isAdminUnlocked || isAdmin ? (
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
                    const targetMember = allMembers.find(m => m.id === id);
                    if (targetMember?.email === MASTER_ADMIN_EMAIL) return;
                    
                    // Somente Ozeias pode excluir outros admins
                    if (targetMember?.role === 'admin' && !isSuperAdmin) {
                        alert("Apenas o administrador principal pode excluir outros administradores.");
                        return;
                    }

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
                    const targetMember = allMembers.find(m => m.id === id);
                    if (targetMember?.email === MASTER_ADMIN_EMAIL) return;
                    
                    // Somente Ozeias pode remover o cargo de Admin
                    if (!isSuperAdmin) {
                        alert("Apenas o administrador principal pode gerenciar cargos de diretoria.");
                        return;
                    }

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
                    setActiveScheduleGroupId(newG.id);
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
                <div className="w-full max-w-md p-10 bg-white dark:bg-church-surface rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-8">
                    <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-black dark:bg-church-black rounded-2xl flex items-center justify-center shadow-lg border border-zinc-800">
                            <KeyIcon className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter">Área Restrita</h2>
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Insira a senha mestra para configurar</p>
                    </div>
                    <form onSubmit={handleUnlockAdmin} className="space-y-6">
                        <input 
                            type="password" 
                            placeholder="Senha de Acesso"
                            value={unlockPassword}
                            onChange={(e) => setUnlockPassword(e.target.value)}
                            className={`w-full px-6 py-4 bg-zinc-50 dark:bg-church-black border rounded-2xl text-black dark:text-white font-bold outline-none focus:ring-2 focus:ring-zinc-400 transition-all text-center text-xl tracking-[0.3em] ${unlockError ? 'border-red-500 animate-shake' : 'border-zinc-200 dark:border-zinc-800'}`}
                        />
                        {unlockError && <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest">Senha Incorreta</p>}
                        <button type="submit" className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-2xl shadow-xl hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest text-xs">Desbloquear Configurações</button>
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
            const targetMember = allMembers.find(m => m.id === id);
            if (targetMember?.email === MASTER_ADMIN_EMAIL) return;
            
            // Proteção na exclusão pela modal de perfil
            if (targetMember?.role === 'admin' && !isSuperAdmin) {
                alert("Apenas o administrador principal pode remover outros administradores.");
                return;
            }

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

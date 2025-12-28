
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

// Versão v7: Reinício limpo para garantir que a nova lógica de persistência funcione sem interferências
const DB_KEYS = {
  MEMBERS: 'church_members_v7',
  USERS: 'church_users_v7',
  GROUPS: 'church_groups_v7',
  ACTIVE_GROUP: 'church_active_group_v7',
  THEME: 'church_theme_v7',
  SESSION: 'church_session_v7'
};

const MASTER_ADMIN_EMAIL = 'ozeiasof@gmail.com';

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

  // --- PERSISTÊNCIA ROBUSTA ---

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

  // Gravação Síncrona Manual para garantir que não haja perda de dados em operações críticas
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

  // --- MANIPULADORES DE DADOS ---

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
    
    // Verificação de duplicidade no estado atual e no localStorage para garantia tripla
    const currentUsers = JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
    if (currentUsers.some((u: User) => u.email === normalizedEmail)) {
      return { success: false, message: 'Este e-mail já está em uso.' };
    }

    const memberId = `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newMember: Member = { id: memberId, name, email: normalizedEmail, role: normalizedEmail === MASTER_ADMIN_EMAIL ? 'admin' : 'member' };
    const newUser: User = { email: normalizedEmail, password, memberId };
    
    // 1. Grava no LocalStorage Sincronamente ANTES de atualizar o estado do React
    const updatedMembers = [...allMembers, newMember];
    const updatedUsers = [...users, newUser];
    
    syncToLocalStorage(DB_KEYS.MEMBERS, updatedMembers);
    syncToLocalStorage(DB_KEYS.USERS, updatedUsers);
    
    // 2. Atualiza o estado para refletir na UI
    setAllMembers(updatedMembers);
    setUsers(updatedUsers);
    
    // 3. Define a sessão
    setActiveUserId(memberId);
    localStorage.setItem(DB_KEYS.SESSION, memberId);
    
    return { success: true };
  }, [allMembers, users]);

  const handleLogout = () => {
      setActiveUserId(null);
      localStorage.removeItem(DB_KEYS.SESSION);
      window.location.hash = '#/';
      setAuthView('login');
  };

  const currentUser = useMemo(() => allMembers.find(m => m.id === activeUserId) || null, [allMembers, activeUserId]);
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
        isAdmin={isAdmin} 
        view={isAdmin && route === '#/admin' ? 'admin' : 'user'} 
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
        {isAdmin && route === '#/admin' ? (
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
                if (id === 'admin') return;
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

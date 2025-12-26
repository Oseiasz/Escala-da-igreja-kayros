
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Schedule, Member, User, ScheduleDay, ScheduleGroup, ScheduleParticipant } from './types';
import AdminView from './components/AdminView';
import UserView from './components/UserView';
import Header from './components/Header';
import Notification from './components/Notification';
import LoginView from './components/LoginView';
import SignUpView from './components/SignUpView';
import ProfileModal from './components/ProfileModal';
import QuickSearchModal from './components/QuickSearchModal';
import ScheduleDetailModal from './components/ScheduleDetailModal';

// Chaves para o Banco de Dados Local
const DB_KEYS = {
  MEMBERS: 'church_db_members_v2',
  USERS: 'church_db_users_v2',
  GROUPS: 'church_db_groups_v2',
  ACTIVE_GROUP: 'church_db_active_group_v2',
  THEME: 'church_db_theme_v2',
  SESSION: 'church_db_active_user_v2'
};

const INITIAL_MEMBERS: Member[] = [
  { id: 'admin', name: 'Administrador Principal', email: 'ozeiasof@gmail.com', role: 'admin' },
];

const INITIAL_USERS: User[] = [
    { email: 'ozeiasof@gmail.com', password: 'Oseias10', memberId: 'admin' },
];

const BLANK_SCHEDULE: Schedule = [
    { id: 'd1', dayName: 'Domingo', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd2', dayName: 'Segunda-feira', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd3', dayName: 'Terça-feira', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd4', dayName: 'Quarta-feira', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd5', dayName: 'Quinta-feira', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd6', dayName: 'Sexta-feira', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd7', dayName: 'Sábado', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
];

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem(DB_KEYS.THEME) === 'dark' ? 'dark' : 'light'));
  const [activeUserId, setActiveUserId] = useState<string | null>(localStorage.getItem(DB_KEYS.SESSION));

  // Sincronização de Hash para Roteamento
  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Carregamento Inicial de Membros
  const [allMembers, setAllMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(DB_KEYS.MEMBERS);
    let members = saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    // Garante que o administrador mestre esteja sempre na lista
    if (!members.find((m: Member) => m.email === 'ozeiasof@gmail.com')) {
        members = [...INITIAL_MEMBERS, ...members];
    }
    return members.map((m: Member) => m.email === 'ozeiasof@gmail.com' ? { ...m, role: 'admin' } : m);
  });

  // Carregamento Inicial de Usuários (Login)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(DB_KEYS.USERS);
    let u = saved ? JSON.parse(saved) : INITIAL_USERS;
    if (!u.find((usr: User) => usr.email === 'ozeiasof@gmail.com')) {
        u = [...INITIAL_USERS, ...u];
    }
    return u;
  });

  // Carregamento Inicial de Grupos (Congregações)
  const [scheduleGroups, setScheduleGroups] = useState<ScheduleGroup[]>(() => {
      const saved = localStorage.getItem(DB_KEYS.GROUPS);
      return saved ? JSON.parse(saved) : [{ id: 'default', name: 'Congregação Sede', schedule: BLANK_SCHEDULE, announcements: 'Seja bem-vindo!' }];
  });

  const [activeScheduleGroupId, setActiveScheduleGroupId] = useState<string>(() => {
      return localStorage.getItem(DB_KEYS.ACTIVE_GROUP) || 'default';
  });

  // Persistência automática no localStorage quando houver mudanças
  useEffect(() => {
    localStorage.setItem(DB_KEYS.MEMBERS, JSON.stringify(allMembers));
  }, [allMembers]);

  useEffect(() => {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(DB_KEYS.GROUPS, JSON.stringify(scheduleGroups));
    localStorage.setItem(DB_KEYS.ACTIVE_GROUP, activeScheduleGroupId);
  }, [scheduleGroups, activeScheduleGroupId]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(DB_KEYS.THEME, theme);
  }, [theme]);

  const currentUser = useMemo(() => allMembers.find(m => m.id === activeUserId) || null, [allMembers, activeUserId]);
  const activeScheduleGroup = useMemo(() => scheduleGroups.find(g => g.id === activeScheduleGroupId) || scheduleGroups[0], [scheduleGroups, activeScheduleGroupId]);

  const handleLogin = useCallback(async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
        setActiveUserId(user.memberId);
        localStorage.setItem(DB_KEYS.SESSION, user.memberId);
        return { success: true };
    }
    return { success: false, message: 'Credenciais inválidas. Verifique e-mail e senha.' };
  }, [users]);

  const handleSignUp = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const normalizedEmail = email.toLowerCase();
    if (users.some(u => u.email === normalizedEmail)) return { success: false, message: 'Este e-mail já está sendo usado.' };
    
    const memberId = `m_${Date.now()}`;
    const newMember: Member = { 
        id: memberId, 
        name, 
        email: normalizedEmail, 
        role: normalizedEmail === 'ozeiasof@gmail.com' ? 'admin' : 'member' 
    };
    const newUser: User = { email: normalizedEmail, password, memberId };

    setAllMembers(prev => [...prev, newMember]);
    setUsers(prev => [...prev, newUser]);
    
    setActiveUserId(memberId);
    localStorage.setItem(DB_KEYS.SESSION, memberId);
    return { success: true };
  }, [users]);

  const handleLogout = () => {
      setActiveUserId(null);
      localStorage.removeItem(DB_KEYS.SESSION);
      window.location.hash = '#/';
  };

  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgotPassword'>('login');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<Member | null>(null);
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; date?: Date; schedule?: ScheduleDay }>({ isOpen: false });

  if (!currentUser) {
    if (authView === 'signup') return <SignUpView onSignUp={handleSignUp} onSwitchToLogin={() => setAuthView('login')} />;
    return <LoginView onLogin={handleLogin} onSwitchToSignUp={() => setAuthView('signup')} onForgotPassword={() => setAuthView('forgotPassword')} />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-church-black transition-colors duration-500">
      <Header 
        isAdmin={isAdmin} 
        view={isAdmin && route === '#/admin' ? 'admin' : 'user'} 
        schedule={activeScheduleGroup.schedule} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        theme={theme} 
        onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        onToggleSearch={() => setIsSearchOpen(true)}
        scheduleGroups={scheduleGroups} 
        activeScheduleGroupId={activeScheduleGroupId}
        onSetActiveScheduleGroupId={setActiveScheduleGroupId}
      />
      
      <main className="container mx-auto p-4 lg:p-8 max-w-7xl">
        {isAdmin && route === '#/admin' ? (
          <AdminView
            schedule={activeScheduleGroup.schedule}
            onUpdateSchedule={(s) => setScheduleGroups(prev => prev.map(g => g.id === activeScheduleGroupId ? {...g, schedule: s} : g))}
            announcements={activeScheduleGroup.announcements}
            onUpdateAnnouncements={(a) => setScheduleGroups(prev => prev.map(g => g.id === activeScheduleGroupId ? {...g, announcements: a} : g))}
            allMembers={allMembers}
            users={users}
            onDeleteMember={(id) => {
                if (id === 'admin') return; // Protege o admin principal
                setAllMembers(prev => prev.filter(m => m.id !== id));
                setUsers(prev => prev.filter(u => u.memberId !== id));
            }}
            onAddMember={(n, e, p, r) => setAllMembers(prev => [...prev, {id: `m_${Date.now()}`, name: n, email: e, phone: p, role: r}])}
            currentUser={currentUser}
            onToggleAdmin={(id) => {
                if (id === 'admin') return;
                setAllMembers(prev => prev.map(m => m.id === id ? {...m, role: m.role === 'admin' ? 'member' : 'admin'} : m))
            }}
            onUpdateMember={(m) => setAllMembers(prev => prev.map(old => old.id === m.id ? m : old))}
            scheduleGroups={scheduleGroups}
            activeScheduleGroupId={activeScheduleGroupId}
            onAddScheduleGroup={(name) => {
                const newG = {id: `g_${Date.now()}`, name, schedule: BLANK_SCHEDULE, announcements: "Novo quadro de avisos."};
                setScheduleGroups(prev => [...prev, newG]);
                setActiveScheduleGroupId(newG.id);
            }}
            onDeleteScheduleGroup={(id) => {
                if (scheduleGroups.length > 1) {
                    setScheduleGroups(prev => prev.filter(g => g.id !== id));
                    setActiveScheduleGroupId(scheduleGroups[0].id);
                }
            }}
            onUpdateScheduleGroupName={(id, n) => setScheduleGroups(prev => prev.map(g => g.id === id ? {...g, name: n} : g))}
          />
        ) : (
          <UserView 
            schedule={activeScheduleGroup.schedule} 
            announcements={activeScheduleGroup.announcements} 
            currentUser={currentUser} 
            onUpdateAvatar={(id, url) => setAllMembers(prev => prev.map(m => m.id === id ? {...m, avatar: url} : m))}
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
        onUpdateAvatar={(id, url) => setAllMembers(prev => prev.map(m => m.id === id ? {...m, avatar: url} : m))}
        onDeleteAccount={(id) => {
            if (id === 'admin') return;
            setAllMembers(prev => prev.filter(m => m.id !== id));
            setUsers(prev => prev.filter(u => u.memberId !== id));
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

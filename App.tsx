
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

// Chaves estáveis para o banco de dados
const DB_KEYS = {
  MEMBERS: 'church_members_v3',
  USERS: 'church_users_v3',
  GROUPS: 'church_groups_v3',
  ACTIVE_GROUP: 'church_active_group_v3',
  THEME: 'church_theme_v3',
  SESSION: 'church_session_v3'
};

const INITIAL_MEMBERS: Member[] = [
  { id: 'admin', name: 'Administrador Principal', email: 'ozeiasof@gmail.com', role: 'admin' },
];

const INITIAL_USERS: User[] = [
    { email: 'ozeiasof@gmail.com', password: 'Oseias10', memberId: 'admin' },
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
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [activeUserId, setActiveUserId] = useState<string | null>(localStorage.getItem(DB_KEYS.SESSION));

  // Estado de Membros com persistência real
  const [allMembers, setAllMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(DB_KEYS.MEMBERS);
    let members = saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    
    // Hard check: Garante que você sempre esteja lá como Admin
    if (!members.find((m: Member) => m.email === 'ozeiasof@gmail.com')) {
        members = [...INITIAL_MEMBERS, ...members];
    }
    return members.map((m: Member) => m.email === 'ozeiasof@gmail.com' ? { ...m, role: 'admin' } : m);
  });

  // Estado de Usuários com persistência real
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(DB_KEYS.USERS);
    let u = saved ? JSON.parse(saved) : INITIAL_USERS;
    if (!u.find((usr: User) => usr.email === 'ozeiasof@gmail.com')) {
        u = [...INITIAL_USERS, ...u];
    }
    return u;
  });

  const [scheduleGroups, setScheduleGroups] = useState<ScheduleGroup[]>(() => {
      const saved = localStorage.getItem(DB_KEYS.GROUPS);
      return saved ? JSON.parse(saved) : [{ id: 'default', name: 'Congregação Sede', schedule: BLANK_SCHEDULE, announcements: 'Avisos da congregação aparecerão aqui.' }];
  });

  const [activeScheduleGroupId, setActiveScheduleGroupId] = useState<string>(() => {
      return localStorage.getItem(DB_KEYS.ACTIVE_GROUP) || 'default';
  });

  // Watchers de salvamento manual
  useEffect(() => { localStorage.setItem(DB_KEYS.MEMBERS, JSON.stringify(allMembers)); }, [allMembers]);
  useEffect(() => { localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users)); }, [users]);
  useEffect(() => { 
    localStorage.setItem(DB_KEYS.GROUPS, JSON.stringify(scheduleGroups));
    localStorage.setItem(DB_KEYS.ACTIVE_GROUP, activeScheduleGroupId);
  }, [scheduleGroups, activeScheduleGroupId]);

  const currentUser = useMemo(() => allMembers.find(m => m.id === activeUserId) || null, [allMembers, activeUserId]);
  const activeScheduleGroup = useMemo(() => scheduleGroups.find(g => g.id === activeScheduleGroupId) || scheduleGroups[0], [scheduleGroups, activeScheduleGroupId]);

  const handleLogin = useCallback(async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
        setActiveUserId(user.memberId);
        localStorage.setItem(DB_KEYS.SESSION, user.memberId);
        return { success: true };
    }
    return { success: false, message: 'Usuário ou senha incorretos.' };
  }, [users]);

  const handleSignUp = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const normalizedEmail = email.toLowerCase();
    if (users.some(u => u.email === normalizedEmail)) return { success: false, message: 'E-mail já está em uso.' };
    
    const memberId = `m_${Date.now()}`;
    const newMember: Member = { id: memberId, name, email: normalizedEmail, role: normalizedEmail === 'ozeiasof@gmail.com' ? 'admin' : 'member' };
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
    <div className="min-h-screen bg-black dark:bg-black transition-colors duration-500">
      <Header 
        isAdmin={isAdmin} 
        view={isAdmin && route === '#/admin' ? 'admin' : 'user'} 
        schedule={activeScheduleGroup.schedule} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        theme={theme} 
        onToggleTheme={() => {}} // Forçado para dark
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
                if (id === 'admin') return;
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
                const newG = {id: `g_${Date.now()}`, name, schedule: BLANK_SCHEDULE, announcements: ""};
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

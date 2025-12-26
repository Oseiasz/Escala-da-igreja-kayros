
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Schedule, Member, User, ScheduleDay, ScheduleGroup, ScheduleParticipant } from './types';
import AdminView from './components/AdminView';
import UserView from './components/UserView';
import Header from './components/Header';
import Notification from './components/Notification';
import LoginView from './components/LoginView';
import SignUpView from './components/SignUpView';
import ForgotPasswordView from './components/ForgotPasswordView';
import ResetPasswordView from './components/ResetPasswordView';
import QuickSearchModal from './components/QuickSearchModal';
import ProfileModal from './components/ProfileModal';
import ScheduleDetailModal from './components/ScheduleDetailModal';
import { sendWelcomeEmail } from './services/emailService';

// Chaves para o Banco de Dados Local
const DB_KEYS = {
  MEMBERS: 'church_db_members',
  USERS: 'church_db_users',
  GROUPS: 'church_db_groups',
  ACTIVE_GROUP: 'church_db_active_group_id',
  THEME: 'church_db_theme',
  SESSION: 'church_db_active_user_id'
};

const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', name: 'João Alves', phone: '(11) 98765-4321', email: 'joao.alves@example.com', role: 'member' },
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

  // Estado dos Membros (Pessoas cadastradas pelo ADM ou via SignUP)
  const [allMembers, setAllMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(DB_KEYS.MEMBERS);
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  // Estado dos Usuários (Pessoas que já criaram login/senha)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(DB_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [scheduleGroups, setScheduleGroups] = useState<ScheduleGroup[]>(() => {
      const saved = localStorage.getItem(DB_KEYS.GROUPS);
      return saved ? JSON.parse(saved) : [{ id: 'default', name: 'Escala Sede', schedule: BLANK_SCHEDULE, announcements: '' }];
  });

  const [activeScheduleGroupId, setActiveScheduleGroupId] = useState<string>(() => {
      return localStorage.getItem(DB_KEYS.ACTIVE_GROUP) || 'default';
  });

  const [currentUser, setCurrentUser] = useState<Member | null>(() => {
    const activeUserId = localStorage.getItem(DB_KEYS.SESSION);
    if (activeUserId) {
        // Tentamos carregar do banco de dados local atualizado
        const savedMembers = localStorage.getItem(DB_KEYS.MEMBERS);
        const membersList = savedMembers ? JSON.parse(savedMembers) : INITIAL_MEMBERS;
        return membersList.find((m: Member) => m.id === activeUserId) || null;
    }
    return null;
  });

  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgotPassword'>('login');
  const [notification, setNotification] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<Member | null>(null);

  // Persistência Automática
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

  const handleLogin = useCallback(async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
        const member = allMembers.find(m => m.id === user.memberId);
        if (member) {
            setCurrentUser(member);
            localStorage.setItem(DB_KEYS.SESSION, member.id);
            return { success: true };
        }
    }
    return { success: false, message: 'Dados inválidos.' };
  }, [users, allMembers]);

  const handleSignUp = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const normalizedEmail = email.toLowerCase();
    if (users.some(u => u.email === normalizedEmail)) return { success: false, message: 'E-mail já cadastrado.' };

    const existingMember = allMembers.find(m => m.email.toLowerCase() === normalizedEmail);
    const memberId = existingMember ? existingMember.id : `m_${Date.now()}`;
    
    if (!existingMember) {
        setAllMembers(prev => [...prev, { id: memberId, name, email: normalizedEmail, role: 'member' }]);
    }

    const newUser = { email: normalizedEmail, password, memberId };
    setUsers(prev => [...prev, newUser]);
    
    const finalMember = existingMember || { id: memberId, name, email: normalizedEmail, role: 'member' };
    setCurrentUser(finalMember);
    localStorage.setItem(DB_KEYS.SESSION, memberId);
    
    return { success: true };
  }, [users, allMembers]);

  const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem(DB_KEYS.SESSION);
      window.location.hash = '#/';
  };

  const handleDeleteMember = useCallback((id: string) => {
    setAllMembers(prev => prev.filter(m => m.id !== id));
    setUsers(prev => prev.filter(u => u.memberId !== id));
    
    // Se o usuário estiver deletando a própria conta, desloga
    if (currentUser?.id === id) {
        handleLogout();
    }
  }, [currentUser]);

  const activeScheduleGroup = useMemo(() => scheduleGroups.find(g => g.id === activeScheduleGroupId) || scheduleGroups[0], [scheduleGroups, activeScheduleGroupId]);

  if (!currentUser) {
    if (authView === 'signup') return <SignUpView onSignUp={handleSignUp} onSwitchToLogin={() => setAuthView('login')} />;
    return <LoginView onLogin={handleLogin} onSwitchToSignUp={() => setAuthView('signup')} onForgotPassword={() => setAuthView('forgotPassword')} />;
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Header 
        isAdmin={isAdmin} view={isAdmin && route === '#/admin' ? 'admin' : 'user'} 
        schedule={activeScheduleGroup.schedule} currentUser={currentUser} onLogout={handleLogout} 
        theme={theme} onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        onToggleSearch={() => setIsSearchOpen(true)}
        scheduleGroups={scheduleGroups} activeScheduleGroupId={activeScheduleGroupId}
        onSetActiveScheduleGroupId={setActiveScheduleGroupId}
      />
      
      <main className="container mx-auto p-4 lg:p-8">
        {isAdmin && route === '#/admin' ? (
          <AdminView
            schedule={activeScheduleGroup.schedule}
            onUpdateSchedule={(s) => setScheduleGroups(prev => prev.map(g => g.id === activeScheduleGroupId ? {...g, schedule: s} : g))}
            announcements={activeScheduleGroup.announcements}
            onUpdateAnnouncements={(a) => setScheduleGroups(prev => prev.map(g => g.id === activeScheduleGroupId ? {...g, announcements: a} : g))}
            allMembers={allMembers}
            users={users}
            onDeleteMember={handleDeleteMember}
            onAddMember={(n, e, p, r) => setAllMembers(prev => [...prev, {id: `m_${Date.now()}`, name: n, email: e, phone: p, role: r}])}
            currentUser={currentUser}
            onToggleAdmin={(id) => setAllMembers(prev => prev.map(m => m.id === id ? {...m, role: m.role === 'admin' ? 'member' : 'admin'} : m))}
            onUpdateMember={(m) => setAllMembers(prev => prev.map(old => old.id === m.id ? m : old))}
            scheduleGroups={scheduleGroups}
            activeScheduleGroupId={activeScheduleGroupId}
            onAddScheduleGroup={(name) => {
                const newG = {id: `g_${Date.now()}`, name, schedule: BLANK_SCHEDULE, announcements: ""};
                setScheduleGroups(prev => [...prev, newG]);
                setActiveScheduleGroupId(newG.id);
            }}
            onDeleteScheduleGroup={(id) => setScheduleGroups(prev => prev.filter(g => g.id !== id))}
            onUpdateScheduleGroupName={(id, n) => setScheduleGroups(prev => prev.map(g => g.id === id ? {...g, name: n} : g))}
          />
        ) : (
          <UserView 
            schedule={activeScheduleGroup.schedule} announcements={activeScheduleGroup.announcements} 
            currentUser={currentUser} onUpdateAvatar={(id, url) => setAllMembers(prev => prev.map(m => m.id === id ? {...m, avatar: url} : m))}
            onMemberClick={setViewingProfile} scheduleName={activeScheduleGroup.name}
            viewDate={new Date()} onNavigateDate={() => {}} onDateClick={() => {}}
          />
        )}
      </main>

      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} allMembers={allMembers} schedule={activeScheduleGroup.schedule} onSelectMember={setViewingProfile} onSelectTask={() => setIsSearchOpen(false)} />
      <ProfileModal 
        member={viewingProfile} 
        schedule={activeScheduleGroup.schedule} 
        onClose={() => setViewingProfile(null)} 
        currentUser={currentUser} 
        onUpdateAvatar={(id, url) => setAllMembers(prev => prev.map(m => m.id === id ? {...m, avatar: url} : m))}
        onDeleteAccount={handleDeleteMember}
      />
    </div>
  );
};

export default App;

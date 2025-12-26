
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

const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', name: 'João Alves', phone: '(11) 98765-4321', email: 'joao.alves@example.com', role: 'member' },
  { id: 'm2', name: 'Maria Costa', phone: '(21) 91234-5678', email: 'maria.costa@example.com', role: 'member' },
  { id: 'm3', name: 'Pedro Lima', phone: '(31) 98888-7777', email: 'pedro.lima@example.com', role: 'member' },
  { id: 'm4', name: 'Ana Souza', phone: '(41) 99999-8888', email: 'ana.souza@example.com', role: 'member' },
  { id: 'm5', name: 'Tiago Pereira', phone: '(51) 97654-3210', email: 'tiago.pereira@example.com', role: 'member' },
  { id: 'm6', name: 'Sara Ferreira', phone: '(61) 96543-2109', email: 'sara.ferreira@example.com', role: 'member' },
  { id: 'm7', name: 'Lucas Martins', phone: '(71) 95432-1098', email: 'lucas.martins@example.com', role: 'member' },
  { id: 'm8', name: 'Carla Dias', phone: '(81) 94321-0987', email: 'carla.dias@example.com', role: 'member' },
  { id: 'admin', name: 'Administrador', email: 'ozeiasof@gmail.com', role: 'admin' },
];

const INITIAL_USERS: User[] = [
    { email: 'joao.alves@example.com', password: 'password123', memberId: 'm1' },
    { email: 'maria.costa@example.com', password: 'password123', memberId: 'm2' },
    { email: 'pedro.lima@example.com', password: 'password123', memberId: 'm3' },
    { email: 'ana.souza@example.com', password: 'password123', memberId: 'm4' }, 
    { email: 'tiago.pereira@example.com', password: 'password123', memberId: 'm5' },
    { email: 'sara.ferreira@example.com', password: 'password123', memberId: 'm6' },
    { email: 'lucas.martins@example.com', password: 'password123', memberId: 'm7' },
    { email: 'carla.dias@example.com', password: 'password123', memberId: 'm8' },
    { email: 'ozeiasof@gmail.com', password: 'Oseias10', memberId: 'admin' },
];

const memberToParticipant = (member: Member): ScheduleParticipant => ({
    id: member.id,
    name: member.name,
    isRegistered: true,
    memberData: member,
});

const BLANK_SCHEDULE: Schedule = [
    { id: 'd1', dayName: 'Domingo', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd2', dayName: 'Segunda-feira', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd3', dayName: 'Terça-feira', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd4', dayName: 'Quarta-feira', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd5', dayName: 'Quinta-feira', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd6', dayName: 'Sexta-feira', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
    { id: 'd7', dayName: 'Sábado', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
];

const INITIAL_SCHEDULE_GROUPS: ScheduleGroup[] = [
    {
        id: 'group_sede',
        name: 'Sede',
        schedule: [
            { id: 'd1', dayName: 'Domingo', event: 'Culto de Celebração', active: true, doorkeepers: [INITIAL_MEMBERS[0], INITIAL_MEMBERS[1]].map(memberToParticipant), hymnSingers: [INITIAL_MEMBERS[3], INITIAL_MEMBERS[5]].map(memberToParticipant), worshipLeaders: [INITIAL_MEMBERS[2]].map(memberToParticipant), preachers: [INITIAL_MEMBERS[6]].map(memberToParticipant) },
            { id: 'd2', dayName: 'Segunda-feira', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
            { id: 'd3', dayName: 'Terça-feira', event: 'Culto de Ensino', active: true, doorkeepers: [INITIAL_MEMBERS[2]].map(memberToParticipant), hymnSingers: [INITIAL_MEMBERS[4]].map(memberToParticipant), worshipLeaders: [INITIAL_MEMBERS[1]].map(memberToParticipant), preachers: [] },
            { id: 'd4', dayName: 'Quarta-feira', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
            { id: 'd5', dayName: 'Quinta-feira', event: 'Círculo de Oração', active: true, doorkeepers: [INITIAL_MEMBERS[4], INITIAL_MEMBERS[6]].map(memberToParticipant), hymnSingers: [INITIAL_MEMBERS[1]].map(memberToParticipant), worshipLeaders: [], preachers: [] },
            { id: 'd6', dayName: 'Sexta-feira', event: '', active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [] },
            { id: 'd7', dayName: 'Sábado', event: 'Ensaio do Louvor', active: true, doorkeepers: [], hymnSingers: [INITIAL_MEMBERS[3], INITIAL_MEMBERS[5], INITIAL_MEMBERS[4]].map(memberToParticipant), worshipLeaders: [], preachers: [] },
        ],
        announcements: `Bem-vindo ao nosso quadro de avisos!
- Próximo sábado teremos um café da manhã especial.
- A campanha de doação de agasalhos vai até o final do mês. Participe!`
    }
];

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  const [scheduleGroups, setScheduleGroups] = useState<ScheduleGroup[]>(() => {
      const saved = localStorage.getItem('churchScheduleGroups');
      try {
          const parsedGroups = saved ? JSON.parse(saved) : null;
          return Array.isArray(parsedGroups) ? parsedGroups : INITIAL_SCHEDULE_GROUPS;
      } catch (e) {
          return INITIAL_SCHEDULE_GROUPS;
      }
  });

  const [activeScheduleGroupId, setActiveScheduleGroupId] = useState<string>(() => {
      const savedId = localStorage.getItem('activeChurchScheduleGroupId');
      return savedId || (scheduleGroups[0]?.id || '');
  });

  const [allMembers, setAllMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('churchMembers');
    try {
        const parsedMembers = saved ? JSON.parse(saved) : null;
        return Array.isArray(parsedMembers) ? parsedMembers : INITIAL_MEMBERS;
    } catch (e) {
        return INITIAL_MEMBERS;
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('churchUsers');
    try {
        const parsedUsers = saved ? JSON.parse(saved) : null;
        return Array.isArray(parsedUsers) ? parsedUsers : INITIAL_USERS;
    } catch (e) {
        return INITIAL_USERS;
    }
  });

  const [notification, setNotification] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<Member | null>(() => {
    const activeUserId = localStorage.getItem('churchApp_activeUserId');
    if (activeUserId) {
        const savedMembers = localStorage.getItem('churchMembers');
        const membersList = savedMembers ? JSON.parse(savedMembers) : INITIAL_MEMBERS;
        return membersList.find((m: Member) => m.id === activeUserId) || null;
    }
    return null;
  });

  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgotPassword' | 'resetPassword'>('login');
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<Member | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<{ date: Date; daySchedule: ScheduleDay } | null>(null);
  const [viewDate, setViewDate] = useState(new Date());

  const activeScheduleGroup = useMemo(() => {
    return scheduleGroups.find(g => g.id === activeScheduleGroupId) || scheduleGroups[0];
  }, [scheduleGroups, activeScheduleGroupId]);

  const activeSchedule = useMemo(() => activeScheduleGroup?.schedule || [], [activeScheduleGroup]);
  const activeAnnouncements = useMemo(() => activeScheduleGroup?.announcements || '', [activeScheduleGroup]);

  // Listener para mudança de Hash (Navegação sem reload)
  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('churchScheduleGroups', JSON.stringify(scheduleGroups));
    localStorage.setItem('churchMembers', JSON.stringify(allMembers));
    localStorage.setItem('churchUsers', JSON.stringify(users));
    localStorage.setItem('activeChurchScheduleGroupId', activeScheduleGroupId);
  }, [scheduleGroups, allMembers, users, activeScheduleGroupId]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (currentUser) {
        const lastUpdate = localStorage.getItem('last_schedule_update');
        const lastSeen = localStorage.getItem(`last_seen_update_${currentUser.id}`);
        if (lastUpdate && lastUpdate !== lastSeen) {
            setNotification("A escala de trabalho foi atualizada! ✨");
            localStorage.setItem(`last_seen_update_${currentUser.id}`, lastUpdate);
        }
    }
  }, [currentUser]);

  const handleToggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  const handleLogin = useCallback(async (email: string, password: string, rememberMe: boolean): Promise<{ success: boolean; message?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const userAccount = users.find(u => u.email.toLowerCase() === normalizedEmail && u.password === password);
    if (userAccount) {
        const memberProfile = allMembers.find(m => m.id === userAccount.memberId);
        if (memberProfile) {
            setCurrentUser(memberProfile);
            localStorage.setItem('churchApp_activeUserId', memberProfile.id);
            return { success: true };
        }
    }
    return { success: false, message: 'Ops! E-mail ou senha incorretos.' };
  }, [users, allMembers]);

  const handleSignUp = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    
    if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
        return { success: false, message: 'Este e-mail já possui uma conta. Tente fazer login.' };
    }

    const existingMember = allMembers.find(m => m.email.toLowerCase() === normalizedEmail);
    const memberId = existingMember ? existingMember.id : `m_${Date.now()}`;
    
    const newMember: Member = existingMember 
        ? existingMember 
        : { id: memberId, name, email: normalizedEmail, role: 'member' };
    
    const newUser: User = { email: normalizedEmail, password, memberId };

    const updatedMembers = existingMember ? allMembers : [...allMembers, newMember];
    const updatedUsers = [...users, newUser];

    localStorage.setItem('churchMembers', JSON.stringify(updatedMembers));
    localStorage.setItem('churchUsers', JSON.stringify(updatedUsers));
    localStorage.setItem('churchApp_activeUserId', memberId);

    setAllMembers(updatedMembers);
    setUsers(updatedUsers);
    setCurrentUser(newMember);
    
    sendWelcomeEmail(normalizedEmail, name);
    return { success: true };
  }, [users, allMembers]);

  const handleDateClick = useCallback((date: Date, daySchedule: ScheduleDay | undefined) => {
    if (daySchedule && daySchedule.active) {
      setSelectedTaskDetail({ date, daySchedule });
    }
  }, []);

  const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem('churchApp_activeUserId');
      window.location.hash = '#/';
  };

  const handleNotifyUpdate = () => {
      localStorage.setItem('last_schedule_update', Date.now().toString());
      setNotification("Escala finalizada e membros notificados! 🔔");
  };

  if (!currentUser) {
    if (authView === 'signup') return <SignUpView onSignUp={handleSignUp} onSwitchToLogin={() => setAuthView('login')} />;
    if (authView === 'forgotPassword') return <ForgotPasswordView onSubmit={async (e) => ({success: true})} onSwitchToLogin={() => setAuthView('login')} />;
    if (authView === 'resetPassword') return <ResetPasswordView email={resetEmail} onSubmit={async (p) => ({success: true})} onSwitchToLogin={() => setAuthView('login')} />;
    return <LoginView onLogin={handleLogin} onSwitchToSignUp={() => setAuthView('signup')} onForgotPassword={() => setAuthView('forgotPassword')} />;
  }

  const isAdmin = currentUser.role === 'admin';
  const currentView = isAdmin && route === '#/admin' ? 'admin' : 'user';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      <Header 
        isAdmin={isAdmin} 
        view={currentView} 
        schedule={activeSchedule} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onToggleSearch={() => setIsSearchOpen(true)}
        scheduleGroups={scheduleGroups}
        activeScheduleGroupId={activeScheduleGroupId}
        onSetActiveScheduleGroupId={setActiveScheduleGroupId}
      />
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {currentView === 'admin' ? (
          <AdminView
            schedule={activeSchedule}
            onUpdateSchedule={(s) => setScheduleGroups(prev => prev.map(g => g.id === activeScheduleGroupId ? {...g, schedule: s} : g))}
            announcements={activeAnnouncements}
            onUpdateAnnouncements={(a) => setScheduleGroups(prev => prev.map(g => g.id === activeScheduleGroupId ? {...g, announcements: a} : g))}
            allMembers={allMembers}
            onDeleteMember={(id) => setAllMembers(prev => prev.filter(m => m.id !== id))}
            onAddMember={(n, e, p) => setAllMembers(prev => [...prev, {id: `m_${Date.now()}`, name: n, email: e, phone: p, role: 'member'}])}
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
            schedule={activeSchedule} 
            announcements={activeAnnouncements} 
            currentUser={currentUser}
            onUpdateAvatar={(id, url) => setAllMembers(prev => prev.map(m => m.id === id ? {...m, avatar: url} : m))}
            onMemberClick={setViewingProfile}
            scheduleName={activeScheduleGroup?.name || ''}
            viewDate={viewDate}
            onNavigateDate={setViewDate}
            onDateClick={handleDateClick}
          />
        )}
      </main>

      {isAdmin && currentView === 'admin' && (
          <button 
            onClick={handleNotifyUpdate}
            className="fixed bottom-6 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl transition-transform active:scale-95 flex items-center gap-2 font-bold z-40"
          >
            Finalizar e Notificar Todos
          </button>
      )}
      
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}

      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} allMembers={allMembers} schedule={activeSchedule} onSelectMember={(m) => { setViewingProfile(m); setIsSearchOpen(false); }} onSelectTask={(day) => { setSelectedTaskDetail({date: new Date(), daySchedule: day}); setIsSearchOpen(false); }} />
      <ProfileModal member={viewingProfile} schedule={activeSchedule} onClose={() => setViewingProfile(null)} currentUser={currentUser} onUpdateAvatar={(id, url) => setAllMembers(prev => prev.map(m => m.id === id ? {...m, avatar: url} : m))} />
      <ScheduleDetailModal isOpen={!!selectedTaskDetail} onClose={() => setSelectedTaskDetail(null)} date={selectedTaskDetail?.date} daySchedule={selectedTaskDetail?.daySchedule} onMemberClick={setViewingProfile} />
      
      <footer className="text-center p-8 text-slate-500 dark:text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Ministério Local. Sistema de Escala Inteligente.</p>
      </footer>
    </div>
  );
};

export default App;

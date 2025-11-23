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
    { id: 'd1', dayName: 'Domingo', event: '', active: false, doorkeepers: [], hymnSingers: [] },
    { id: 'd2', dayName: 'Segunda-feira', event: '', active: false, doorkeepers: [], hymnSingers: [] },
    { id: 'd3', dayName: 'Terça-feira', event: '', active: false, doorkeepers: [], hymnSingers: [] },
    { id: 'd4', dayName: 'Quarta-feira', event: '', active: false, doorkeepers: [], hymnSingers: [] },
    { id: 'd5', dayName: 'Quinta-feira', event: '', active: false, doorkeepers: [], hymnSingers: [] },
    { id: 'd6', dayName: 'Sexta-feira', event: '', active: false, doorkeepers: [], hymnSingers: [] },
    { id: 'd7', dayName: 'Sábado', event: '', active: false, doorkeepers: [], hymnSingers: [] },
];

const INITIAL_SCHEDULE_GROUPS: ScheduleGroup[] = [
    {
        id: 'group_sede',
        name: 'Sede',
        schedule: [
            { id: 'd1', dayName: 'Domingo', event: 'Culto de Celebração', active: true, doorkeepers: [INITIAL_MEMBERS[0], INITIAL_MEMBERS[1]].map(memberToParticipant), hymnSingers: [INITIAL_MEMBERS[3], INITIAL_MEMBERS[5]].map(memberToParticipant) },
            { id: 'd2', dayName: 'Segunda-feira', event: '', active: false, doorkeepers: [], hymnSingers: [] },
            { id: 'd3', dayName: 'Terça-feira', event: 'Culto de Ensino', active: true, doorkeepers: [INITIAL_MEMBERS[2]].map(memberToParticipant), hymnSingers: [INITIAL_MEMBERS[4]].map(memberToParticipant) },
            { id: 'd4', dayName: 'Quarta-feira', event: '', active: false, doorkeepers: [], hymnSingers: [] },
            { id: 'd5', dayName: 'Quinta-feira', event: 'Círculo de Oração', active: true, doorkeepers: [INITIAL_MEMBERS[4], INITIAL_MEMBERS[6]].map(memberToParticipant), hymnSingers: [INITIAL_MEMBERS[1]].map(memberToParticipant) },
            { id: 'd6', dayName: 'Sexta-feira', event: '', active: false, doorkeepers: [], hymnSingers: [] },
            { id: 'd7', dayName: 'Sábado', event: 'Ensaio do Louvor', active: true, doorkeepers: [], hymnSingers: [INITIAL_MEMBERS[3], INITIAL_MEMBERS[5], INITIAL_MEMBERS[4]].map(memberToParticipant) },
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
    if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [scheduleGroups, setScheduleGroups] = useState<ScheduleGroup[]>(() => {
      const saved = localStorage.getItem('churchScheduleGroups');
      try {
          const parsed = saved ? JSON.parse(saved) : null;
          if (Array.isArray(parsed)) return parsed;
          return INITIAL_SCHEDULE_GROUPS;
      } catch (e) {
          console.error("Failed to parse schedule groups:", e);
          return INITIAL_SCHEDULE_GROUPS;
      }
  });

  const [activeScheduleGroupId, setActiveScheduleGroupId] = useState<string>(() => {
      const saved = localStorage.getItem('activeChurchScheduleGroupId');
      // Ensure the saved ID still exists and scheduleGroups is an array
      if (saved && Array.isArray(scheduleGroups) && scheduleGroups.some(g => g.id === saved)) {
          return saved;
      }
      return (Array.isArray(scheduleGroups) && scheduleGroups[0]?.id) || '';
  });

  const [allMembers, setAllMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('churchMembers');
    try {
        const parsed = saved ? JSON.parse(saved) : null;
        return Array.isArray(parsed) ? parsed : INITIAL_MEMBERS;
    } catch (e) {
        return INITIAL_MEMBERS;
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('churchUsers');
    try {
        const parsed = saved ? JSON.parse(saved) : null;
        return Array.isArray(parsed) ? parsed : INITIAL_USERS;
    } catch (e) {
        return INITIAL_USERS;
    }
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgotPassword' | 'resetPassword'>('login');
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<Member | null>(null);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<{ date: Date; daySchedule: ScheduleDay } | null>(null);
  const [viewDate, setViewDate] = useState(new Date());

  const activeScheduleGroup = useMemo(() => {
    if (!Array.isArray(scheduleGroups)) return undefined;
    return scheduleGroups.find(g => g.id === activeScheduleGroupId) || scheduleGroups[0];
  }, [scheduleGroups, activeScheduleGroupId]);

  const activeSchedule = useMemo(() => {
      const s = activeScheduleGroup?.schedule;
      return Array.isArray(s) ? s : [];
  }, [activeScheduleGroup]);
  
  const activeAnnouncements = useMemo(() => activeScheduleGroup?.announcements || '', [activeScheduleGroup]);


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    localStorage.setItem('churchMembers', JSON.stringify(allMembers));
  }, [allMembers]);

  useEffect(() => {
    localStorage.setItem('churchUsers', JSON.stringify(users));
  }, [users]);
  
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            setIsSearchOpen(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const syncFromStorage = (e: StorageEvent) => {
      if (e.key === 'churchMembers' && e.newValue) {
        try {
            setAllMembers(JSON.parse(e.newValue));
        } catch(err) {}
      }
      if (e.key === 'churchUsers' && e.newValue) {
        try {
            setUsers(JSON.parse(e.newValue));
        } catch(err) {}
      }
      if (e.key === 'churchScheduleGroups' && e.newValue) {
        try {
            setScheduleGroups(JSON.parse(e.newValue));
        } catch(err) {}
      }
      if (e.key === 'activeChurchScheduleGroupId' && e.newValue) {
        setActiveScheduleGroupId(e.newValue);
      }
    };

    window.addEventListener('storage', syncFromStorage);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('churchScheduleGroups', JSON.stringify(scheduleGroups));
  }, [scheduleGroups]);
  
  useEffect(() => {
    localStorage.setItem('activeChurchScheduleGroupId', activeScheduleGroupId);
  }, [activeScheduleGroupId]);


  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedUserEmail');
    if (rememberedEmail) {
        const userAccount = users.find(u => u.email === rememberedEmail);
        if (userAccount) {
            const memberProfile = allMembers.find(m => m.id === userAccount.memberId);
            if (memberProfile) {
                setCurrentUser(memberProfile);
            }
        }
    }
  }, [users, allMembers]);

  useEffect(() => {
    if (!currentUser) {
        setNotification(null);
        return;
    }
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const tomorrowIndex = (new Date().getDay() + 1) % 7;
    const tomorrowDayName = dayNames[tomorrowIndex];

    const tomorrowSchedule = activeSchedule.find(day => day.dayName === tomorrowDayName);

    if (tomorrowSchedule && tomorrowSchedule.active) {
      const isDoorkeeper = tomorrowSchedule.doorkeepers.some(m => m.id === currentUser.id);
      const isSinger = tomorrowSchedule.hymnSingers.some(m => m.id === currentUser.id);

      if (isDoorkeeper || isSinger) {
        let tasks: string[] = [];
        if (isDoorkeeper) tasks.push("Porteiro(a)");
        if (isSinger) tasks.push("Cantor(a)");
        
        const message = `Você está escalado como ${tasks.join(' e ')} amanhã (${activeScheduleGroup?.name}).`;
        const pushEnabled = localStorage.getItem('pushNotificationsEnabled') === 'true';

        if (pushEnabled && 'Notification' in window && Notification.permission === 'granted' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_NOTIFICATION',
                payload: {
                    title: 'Lembrete de Tarefa',
                    body: message
                }
            });
            setNotification(null);
        } else {
            setNotification(message);
        }

      } else {
        setNotification(null);
      }
    } else {
        setNotification(null);
    }
  }, [activeSchedule, currentUser, activeScheduleGroup]);
  
  const handleLogin = useCallback(async (email: string, password: string, rememberMe: boolean): Promise<boolean> => {
    const userAccount = users.find(u => u.email === email && u.password === password);
    if (userAccount) {
        const memberProfile = allMembers.find(m => m.id === userAccount.memberId);
        if (memberProfile) {
            setCurrentUser(memberProfile);
            if (rememberMe) {
                localStorage.setItem('rememberedUserEmail', email);
            } else {
                localStorage.removeItem('rememberedUserEmail');
            }
            return true;
        }
    }
    return false;
  }, [users, allMembers]);

  const handleSignUp = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    if (users.some(u => u.email === email)) {
        return { success: false, message: 'Este e-mail já está em uso.' };
    }

    const newMemberId = `m_${Date.now()}`;
    const newMember: Member = { id: newMemberId, name, email, phone: '', role: 'member' };
    const newUser: User = { email, password, memberId: newMemberId };

    setAllMembers(prev => [...prev, newMember]);
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newMember);

    localStorage.setItem('rememberedUserEmail', email);
    return { success: true };
  }, [users, allMembers]);

  const handleForgotPasswordRequest = useCallback(async (email: string): Promise<{ success: boolean; message?: string }> => {
    if (users.some(u => u.email === email)) {
        setResetEmail(email);
        setAuthView('resetPassword');
        return { success: true };
    }
    return { success: false, message: 'E-mail não encontrado em nosso sistema.' };
  }, [users]);

  const handlePasswordReset = useCallback(async (password: string): Promise<{ success: boolean; message?: string }> => {
    if (!resetEmail) {
      return { success: false, message: 'Ocorreu um erro. Tente novamente.' };
    }
    
    setUsers(prevUsers => prevUsers.map(user => 
        user.email === resetEmail ? { ...user, password } : user
    ));
    
    setResetEmail(null);
    setAuthView('login');
    return { success: true };
  }, [resetEmail]);


  const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem('rememberedUserEmail');
      window.location.hash = '#/';
  };
  
  const handleDeleteMember = (memberId: string) => {
    // Remove member from all schedules in all groups
    setScheduleGroups(prevGroups =>
        prevGroups.map(group => ({
            ...group,
            schedule: group.schedule.map(day => ({
                ...day,
                doorkeepers: day.doorkeepers.filter(p => p.id !== memberId),
                hymnSingers: day.hymnSingers.filter(p => p.id !== memberId),
            })),
        }))
    );
  
    const memberToDelete = allMembers.find(m => m.id === memberId);
    if (memberToDelete) {
      setUsers(prevUsers => prevUsers.filter(u => u.email !== memberToDelete.email));
    }
  
    setAllMembers(prevMembers => prevMembers.filter(m => m.id !== memberId));
  };
  
  const handleToggleAdminStatus = (memberId: string) => {
    setAllMembers(prevMembers =>
      prevMembers.map(member =>
        member.id === memberId
          ? { ...member, role: member.role === 'admin' ? 'member' : 'admin' }
          : member
      )
    );
  };
  
  const handleUpdateMember = (updatedMember: Member) => {
    setAllMembers(prevMembers =>
      prevMembers.map(member =>
        member.id === updatedMember.id ? updatedMember : member
      )
    );
    // Update participant details across all schedule groups
    setScheduleGroups(prevGroups =>
        prevGroups.map(group => ({
            ...group,
            schedule: group.schedule.map(day => ({
                ...day,
                doorkeepers: day.doorkeepers.map(p => p.id === updatedMember.id ? { ...p, name: updatedMember.name, memberData: updatedMember } : p),
                hymnSingers: day.hymnSingers.map(p => p.id === updatedMember.id ? { ...p, name: updatedMember.name, memberData: updatedMember } : p),
            })),
        }))
    );
    if (currentUser?.id === updatedMember.id) {
      setCurrentUser(prev => (prev ? { ...prev, ...updatedMember } : null));
    }
  };

  const handleUpdateAvatar = (memberId: string, avatarDataUrl: string) => {
    setAllMembers(prevMembers =>
      prevMembers.map(member => 
        member.id === memberId ? { ...member, avatar: avatarDataUrl } : member
      )
    );
    
    setScheduleGroups(prevGroups =>
        prevGroups.map(group => ({
            ...group,
            schedule: group.schedule.map(day => ({
                ...day,
                doorkeepers: day.doorkeepers.map(p => {
                    if (p.id === memberId && p.memberData) {
                        return { ...p, memberData: { ...p.memberData, avatar: avatarDataUrl } };
                    }
                    return p;
                }),
                hymnSingers: day.hymnSingers.map(p => {
                    if (p.id === memberId && p.memberData) {
                        return { ...p, memberData: { ...p.memberData, avatar: avatarDataUrl } };
                    }
                    return p;
                }),
            })),
        }))
    );
    
    if (currentUser?.id === memberId) {
      setCurrentUser(prev => (prev ? { ...prev, avatar: avatarDataUrl } : null));
    }
  };

  const handleSelectMemberFromSearch = (member: Member) => {
    setIsSearchOpen(false);
    setViewingProfile(member);
  };

  const handleSelectTaskFromSearch = (day: ScheduleDay) => {
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const targetDayIndex = dayNames.indexOf(day.dayName);
    
    if (targetDayIndex === -1) return;

    const today = new Date();
    const currentDayIndex = today.getDay();
    let dayDifference = targetDayIndex - currentDayIndex;

    if (dayDifference < 0) {
        dayDifference += 7;
    }

    const nextDate = new Date();
    nextDate.setDate(today.getDate() + dayDifference);
    
    setIsSearchOpen(false);
    setSelectedTaskDetail({ date: nextDate, daySchedule: day });
  };
  
  const handleDateClick = (date: Date, daySchedule: ScheduleDay | undefined) => {
    if (daySchedule?.active) {
        setSelectedTaskDetail({ date, daySchedule });
    }
  };

  const handleSetActiveSchedule = (newSchedule: Schedule) => {
    setScheduleGroups(prev => prev.map(group => 
        group.id === activeScheduleGroupId ? { ...group, schedule: newSchedule } : group
    ));
  };

  const handleSetActiveAnnouncements = (newAnnouncements: string) => {
      setScheduleGroups(prev => prev.map(group => 
          group.id === activeScheduleGroupId ? { ...group, announcements: newAnnouncements } : group
      ));
  };

  const handleAddScheduleGroup = (name: string) => {
      const newGroup: ScheduleGroup = {
          id: `group_${Date.now()}`,
          name,
          schedule: BLANK_SCHEDULE,
          announcements: `Bem-vindo ao quadro de avisos de ${name}!`
      };
      setScheduleGroups(prev => [...prev, newGroup]);
      setActiveScheduleGroupId(newGroup.id);
  };

  const handleDeleteScheduleGroup = (id: string) => {
      const remainingGroups = scheduleGroups.filter(group => group.id !== id);
      setScheduleGroups(remainingGroups);
      // If the deleted group was the active one, switch to the first available group
      if (activeScheduleGroupId === id) {
          setActiveScheduleGroupId(remainingGroups[0]?.id || '');
      }
  };

  const handleUpdateScheduleGroupName = (id: string, newName: string) => {
      setScheduleGroups(prev => prev.map(group =>
          group.id === id ? { ...group, name: newName } : group
      ));
  };


  if (!currentUser) {
    switch (authView) {
        case 'signup':
            return <SignUpView onSignUp={handleSignUp} onSwitchToLogin={() => setAuthView('login')} />;
        case 'forgotPassword':
            return <ForgotPasswordView onSubmit={handleForgotPasswordRequest} onSwitchToLogin={() => setAuthView('login')} />;
        case 'resetPassword':
            return <ResetPasswordView email={resetEmail} onSubmit={handlePasswordReset} onSwitchToLogin={() => setAuthView('login')} />;
        default:
            return <LoginView onLogin={handleLogin} onSwitchToSignUp={() => setAuthView('signup')} onForgotPassword={() => setAuthView('forgotPassword')} />;
    }
  }
  
  const isAdmin = currentUser.role === 'admin';
  const currentView = isAdmin && route === '#/admin' ? 'admin' : 'user';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
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
      <main className="p-4 sm:p-6 lg:p-8">
        {currentView === 'admin' ? (
          <AdminView
            schedule={activeSchedule}
            onUpdateSchedule={handleSetActiveSchedule}
            announcements={activeAnnouncements}
            onUpdateAnnouncements={handleSetActiveAnnouncements}
            allMembers={allMembers}
            onDeleteMember={handleDeleteMember}
            currentUser={currentUser}
            onToggleAdmin={handleToggleAdminStatus}
            onUpdateMember={handleUpdateMember}
            scheduleGroups={scheduleGroups}
            activeScheduleGroupId={activeScheduleGroupId}
            onAddScheduleGroup={handleAddScheduleGroup}
            onDeleteScheduleGroup={handleDeleteScheduleGroup}
            onUpdateScheduleGroupName={handleUpdateScheduleGroupName}
          />
        ) : (
          <UserView 
            schedule={activeSchedule} 
            announcements={activeAnnouncements} 
            currentUser={currentUser}
            onUpdateAvatar={handleUpdateAvatar}
            onMemberClick={setViewingProfile}
            scheduleName={activeScheduleGroup?.name || ''}
            viewDate={viewDate}
            onNavigateDate={setViewDate}
            onDateClick={handleDateClick}
          />
        )}
      </main>
      
      {notification && (
        <Notification 
          message={notification} 
          onClose={() => setNotification(null)}
        />
      )}

      <QuickSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        allMembers={allMembers}
        schedule={activeSchedule}
        onSelectMember={handleSelectMemberFromSearch}
        onSelectTask={handleSelectTaskFromSearch}
      />

      <ProfileModal 
        member={viewingProfile}
        schedule={activeSchedule}
        onClose={() => setViewingProfile(null)}
        currentUser={currentUser}
        onUpdateAvatar={handleUpdateAvatar}
      />

      <ScheduleDetailModal
        isOpen={!!selectedTaskDetail}
        onClose={() => setSelectedTaskDetail(null)}
        date={selectedTaskDetail?.date}
        daySchedule={selectedTaskDetail?.daySchedule}
        onMemberClick={(member) => setViewingProfile(member)}
      />

      <footer className="text-center p-4 text-slate-500 dark:text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Ministério Local. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App;
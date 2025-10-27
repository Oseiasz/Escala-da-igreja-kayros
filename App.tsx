import React, { useState, useEffect, useCallback } from 'react';
import { Schedule, Member, User } from './types';
import AdminView from './components/AdminView';
import UserView from './components/UserView';
import Header from './components/Header';
import Notification from './components/Notification';
import LoginView from './components/LoginView';
import SignUpView from './components/SignUpView';
import ForgotPasswordView from './components/ForgotPasswordView';
import ResetPasswordView from './components/ResetPasswordView';

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


const INITIAL_SCHEDULE: Schedule = [
  { id: 'd1', dayName: 'Domingo', event: 'Culto de Celebração', active: true, doorkeepers: [INITIAL_MEMBERS[0], INITIAL_MEMBERS[1]], hymnSingers: [INITIAL_MEMBERS[3], INITIAL_MEMBERS[5]] },
  { id: 'd2', dayName: 'Segunda-feira', event: '', active: false, doorkeepers: [], hymnSingers: [] },
  { id: 'd3', dayName: 'Terça-feira', event: 'Culto de Ensino', active: true, doorkeepers: [INITIAL_MEMBERS[2]], hymnSingers: [INITIAL_MEMBERS[4]] },
  { id: 'd4', dayName: 'Quarta-feira', event: '', active: false, doorkeepers: [], hymnSingers: [] },
  { id: 'd5', dayName: 'Quinta-feira', event: 'Círculo de Oração', active: true, doorkeepers: [INITIAL_MEMBERS[4], INITIAL_MEMBERS[6]], hymnSingers: [INITIAL_MEMBERS[1]] },
  { id: 'd6', dayName: 'Sexta-feira', event: '', active: false, doorkeepers: [], hymnSingers: [] },
  { id: 'd7', dayName: 'Sábado', event: 'Ensaio do Louvor', active: true, doorkeepers: [], hymnSingers: [INITIAL_MEMBERS[3], INITIAL_MEMBERS[5], INITIAL_MEMBERS[4]] },
];

const INITIAL_ANNOUNCEMENTS = `Bem-vindo ao nosso quadro de avisos!
- Próximo sábado teremos um café da manhã especial.
- A campanha de doação de agasalhos vai até o final do mês. Participe!`;

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
    }
    // Default to user's system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [schedule, setSchedule] = useState<Schedule>(() => {
    const savedSchedule = localStorage.getItem('churchSchedule');
    return savedSchedule ? JSON.parse(savedSchedule) : INITIAL_SCHEDULE;
  });
  const [announcements, setAnnouncements] = useState<string>(() => {
    const savedAnnouncements = localStorage.getItem('churchAnnouncements');
    return savedAnnouncements || INITIAL_ANNOUNCEMENTS;
  });

  const [allMembers, setAllMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('churchMembers');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('churchUsers');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgotPassword' | 'resetPassword'>('login');
  const [resetEmail, setResetEmail] = useState<string | null>(null);

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

  useEffect(() => {
    const syncFromStorage = (e: StorageEvent) => {
      if (e.key === 'churchMembers' && e.newValue) {
        setAllMembers(JSON.parse(e.newValue));
      }
      if (e.key === 'churchUsers' && e.newValue) {
        setUsers(JSON.parse(e.newValue));
      }
      if (e.key === 'churchSchedule' && e.newValue) {
        setSchedule(JSON.parse(e.newValue));
      }
      if (e.key === 'churchAnnouncements' && e.newValue) {
        setAnnouncements(e.newValue);
      }
    };

    window.addEventListener('storage', syncFromStorage);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('churchSchedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('churchAnnouncements', announcements);
  }, [announcements]);

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

    const tomorrowSchedule = schedule.find(day => day.dayName === tomorrowDayName);

    if (tomorrowSchedule && tomorrowSchedule.active) {
      const isDoorkeeper = tomorrowSchedule.doorkeepers.some(m => m.id === currentUser.id);
      const isSinger = tomorrowSchedule.hymnSingers.some(m => m.id === currentUser.id);

      if (isDoorkeeper || isSinger) {
        let tasks: string[] = [];
        if (isDoorkeeper) tasks.push("Porteiro(a)");
        if (isSinger) tasks.push("Cantor(a)");
        
        const message = `Você está escalado como ${tasks.join(' e ')} amanhã.`;
        const pushEnabled = localStorage.getItem('pushNotificationsEnabled') === 'true';

        // Prioritize push notifications if enabled and permission is granted
        if (pushEnabled && 'Notification' in window && Notification.permission === 'granted' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_NOTIFICATION',
                payload: {
                    title: 'Lembrete de Tarefa',
                    body: message
                }
            });
            setNotification(null); // Don't show in-app notification if push is sent
        } else {
            setNotification(message); // Fallback to in-app notification
        }

      } else {
        setNotification(null);
      }
    } else {
        setNotification(null);
    }
  }, [schedule, currentUser]);
  
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

    // Automatically "remember" new users
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
    // We can add a success message on the login screen later if needed
    return { success: true };
  }, [resetEmail]);


  const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem('rememberedUserEmail');
      window.location.hash = '#/';
  };
  
  const handleDeleteMember = (memberId: string) => {
    // 1. Remove member from all schedules
    setSchedule(prevSchedule =>
      prevSchedule.map(day => ({
        ...day,
        doorkeepers: day.doorkeepers.filter(m => m.id !== memberId),
        hymnSingers: day.hymnSingers.filter(m => m.id !== memberId),
      }))
    );
  
    // 2. Find and remove the corresponding user account
    const memberToDelete = allMembers.find(m => m.id === memberId);
    if (memberToDelete) {
      setUsers(prevUsers => prevUsers.filter(u => u.email !== memberToDelete.email));
    }
  
    // 3. Remove the member from the main list
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
    // FIX: Update schedule with new member details to prevent stale data
    setSchedule(prevSchedule =>
        prevSchedule.map(day => ({
            ...day,
            doorkeepers: day.doorkeepers.map(m => m.id === updatedMember.id ? updatedMember : m),
            hymnSingers: day.hymnSingers.map(m => m.id === updatedMember.id ? updatedMember : m),
        }))
    );
    if (currentUser?.id === updatedMember.id) {
      setCurrentUser(prev => (prev ? { ...prev, ...updatedMember } : null));
    }
  };

  const handleUpdateAvatar = (memberId: string, avatarDataUrl: string) => {
    let updatedMemberWithAvatar: Member | null = null;
    
    setAllMembers(prevMembers =>
      prevMembers.map(member => {
        if (member.id === memberId) {
            updatedMemberWithAvatar = { ...member, avatar: avatarDataUrl };
            return updatedMemberWithAvatar;
        }
        return member;
      })
    );

    // FIX: Propagate avatar change to the schedule to prevent stale data
    if (updatedMemberWithAvatar) {
        const finalUpdatedMember = updatedMemberWithAvatar;
        setSchedule(prevSchedule =>
            prevSchedule.map(day => ({
                ...day,
                doorkeepers: day.doorkeepers.map(m => m.id === memberId ? finalUpdatedMember : m),
                hymnSingers: day.hymnSingers.map(m => m.id === memberId ? finalUpdatedMember : m),
            }))
        );
    }
    
    if (currentUser?.id === memberId) {
      setCurrentUser(prev => (prev ? { ...prev, avatar: avatarDataUrl } : null));
    }
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
        schedule={schedule} 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
      <main className="p-4 sm:p-6 lg:p-8">
        {currentView === 'admin' ? (
          <AdminView
            schedule={schedule}
            setSchedule={setSchedule}
            announcements={announcements}
            setAnnouncements={setAnnouncements}
            allMembers={allMembers}
            onDeleteMember={handleDeleteMember}
            currentUser={currentUser}
            onToggleAdmin={handleToggleAdminStatus}
            onUpdateMember={handleUpdateMember}
          />
        ) : (
          <UserView 
            schedule={schedule} 
            announcements={announcements} 
            currentUser={currentUser}
            onUpdateAvatar={handleUpdateAvatar}
          />
        )}
      </main>
      
      {notification && (
        <Notification 
          message={notification} 
          onClose={() => setNotification(null)}
        />
      )}

      <footer className="text-center p-4 text-slate-500 dark:text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Ministério Local. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App;
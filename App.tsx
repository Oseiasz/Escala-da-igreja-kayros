
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Schedule, Member, User, ScheduleDay, ScheduleGroup } from './types';
import AdminView from './components/AdminView';
import UserView from './components/UserView';
import Header from './components/Header';
import LoginView from './components/LoginView';
import SignUpView from './components/SignUpView';
import { SpinnerIcon } from './components/icons';
import { DatabaseService } from './services/databaseService';

const DB_KEYS = {
  SESSION: 'church_session_v9',
  THEME: 'church_theme_v9'
};

const DEFAULT_WEEK_SCHEDULE: Schedule = [
    { id: 'mon', dayName: 'Segunda-feira', event: 'Culto de Oração', doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [], active: true },
    { id: 'tue', dayName: 'Terça-feira', event: 'Culto de Doutrina', doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [], active: true },
    { id: 'wed', dayName: 'Quarta-feira', event: 'Círculo de Oração', doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [], active: true },
    { id: 'thu', dayName: 'Quinta-feira', event: 'Culto da Vitória', doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [], active: true },
    { id: 'fri', dayName: 'Sexta-feira', event: 'Vigília / Ensaio', doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [], active: true },
    { id: 'sat', dayName: 'Sábado', event: 'Culto de Jovens', doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [], active: true },
    { id: 'sun', dayName: 'Domingo', event: 'EBD / Culto da Família', doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [], active: true },
];

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(DB_KEYS.THEME);
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [activeUserId, setActiveUserId] = useState<string | null>(localStorage.getItem(DB_KEYS.SESSION));
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isLoadingSync, setIsLoadingSync] = useState(true);

  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [scheduleGroups, setScheduleGroups] = useState<ScheduleGroup[]>([]);
  const [activeScheduleGroupId, setActiveScheduleGroupId] = useState<string>('default');

  // Controle de carregamento por fonte
  const loadedSources = useRef(new Set<string>());

  useEffect(() => {
    setIsLoadingSync(true);

    const markSourceLoaded = (source: string) => {
      loadedSources.current.add(source);
      if (loadedSources.current.size >= 3) {
        setIsLoadingSync(false);
        setIsCloudConnected(true);
      }
    };

    // Timeout de segurança: Se em 4 segundos não carregar tudo, libera o app com o que tem
    const safetyTimeout = setTimeout(() => {
        if (isLoadingSync) {
            console.warn("Aviso: Carregamento lento. Liberando interface via cache local.");
            setIsLoadingSync(false);
        }
    }, 4000);

    const unsubConfig = DatabaseService.listenToConfig((groups) => {
      if (groups && groups.length > 0) {
        setScheduleGroups(groups);
      } else {
        setScheduleGroups([{ id: 'default', name: 'Congregação Sede', schedule: DEFAULT_WEEK_SCHEDULE, announcements: 'Escala Mensal e Avisos' }]);
      }
      markSourceLoaded('config');
    });

    const unsubMembers = DatabaseService.listenToMembers((members) => {
      let processedMembers = members || [];
      
      // Sempre garante Ozeias como Admin
      processedMembers = processedMembers.map(m => 
        m.email.toLowerCase() === 'ozeiasof@gmail.com' ? { ...m, role: 'admin' as const } : m
      );

      if (processedMembers.length === 0) {
          setAllMembers([
            { id: 'admin_ozeias', name: 'Ozeias (ADM)', email: 'ozeiasof@gmail.com', role: 'admin' },
            { id: 'admin_default', name: 'Admin Master', email: 'admin@igreja.com', role: 'admin' }
          ]);
      } else {
          setAllMembers(processedMembers);
      }
      markSourceLoaded('members');
    });

    const unsubUsers = DatabaseService.listenToUsers((u) => {
      if (!u || u.length === 0) {
          setUsers([
            { email: 'ozeiasof@gmail.com', password: '123', memberId: 'admin_ozeias' },
            { email: 'admin@igreja.com', password: '123', memberId: 'admin_default' }
          ]);
      } else {
          setUsers(u);
      }
      markSourceLoaded('users');
    });

    return () => {
      clearTimeout(safetyTimeout);
      unsubConfig();
      unsubMembers();
      unsubUsers();
    };
  }, []);

  const triggerSync = async (updatedMembers?: Member[], updatedGroups?: ScheduleGroup[], updatedUsers?: User[]) => {
    if (updatedMembers) await DatabaseService.publishMembers(updatedMembers);
    if (updatedGroups) await DatabaseService.publishGroups(updatedGroups);
    if (updatedUsers) await DatabaseService.publishUsers(updatedUsers);
  };

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

  const handleLogin = useCallback(async (email: string, password: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);
    if (found) {
        setActiveUserId(found.memberId);
        localStorage.setItem(DB_KEYS.SESSION, found.memberId);
        return { success: true };
    }
    return { success: false, message: 'E-mail ou senha inválidos.' };
  }, [users]);

  const activeScheduleGroup = useMemo(() => 
    scheduleGroups.find(g => g.id === activeScheduleGroupId) || scheduleGroups[0] || { id: 'default', name: 'Minha Igreja', schedule: DEFAULT_WEEK_SCHEDULE, announcements: '' }
  , [scheduleGroups, activeScheduleGroupId]);

  const handleToggleAdmin = useCallback((memberId: string) => {
    // Apenas Ozeias ou outros Admins podem promover, mas a lógica de cargos fica aqui
    setAllMembers(prev => {
        const updated = prev.map(m => {
            if (m.id === memberId) {
                // Não permite despromover o Ozeias por segurança
                if (m.email.toLowerCase() === 'ozeiasof@gmail.com') return m;
                return { ...m, role: m.role === 'admin' ? 'member' : 'admin' };
            }
            return m;
        });
        triggerSync(updated);
        return updated;
    });
  }, []);

  if (isLoadingSync) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-church-black text-white gap-4">
        <SpinnerIcon className="w-12 h-12 animate-spin text-indigo-500" />
        <div className="text-center">
            <p className="font-black uppercase tracking-[0.2em] text-[10px] animate-pulse">Conectando ao Supabase...</p>
            <p className="text-[8px] text-zinc-500 mt-2 uppercase tracking-widest">Aguardando sincronização de dados</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} onSwitchToSignUp={() => {}} onForgotPassword={() => {}} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'dark bg-church-black' : 'bg-church-white'}`}>
      <Header 
        isAdmin={currentUser.role === 'admin'} 
        view={route === '#/admin' ? 'admin' : 'user'} 
        schedule={activeScheduleGroup.schedule} 
        currentUser={currentUser} 
        onLogout={() => { setActiveUserId(null); localStorage.removeItem(DB_KEYS.SESSION); }} 
        theme={theme} 
        onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        onToggleSearch={() => {}}
        scheduleGroups={scheduleGroups} 
        activeScheduleGroupId={activeScheduleGroupId}
        onSetActiveScheduleGroupId={setActiveScheduleGroupId}
        isCloudConnected={isCloudConnected}
      />
      
      <main className="container mx-auto p-4 lg:p-8 max-w-7xl">
        {route === '#/admin' ? (
          <AdminView
                schedule={activeScheduleGroup.schedule}
                onUpdateSchedule={(s) => {
                    const updated = scheduleGroups.map(g => g.id === activeScheduleGroupId ? {...g, schedule: s} : g);
                    setScheduleGroups(updated);
                    triggerSync(undefined, updated);
                }}
                announcements={activeScheduleGroup.announcements}
                onUpdateAnnouncements={(a) => {
                    const updated = scheduleGroups.map(g => g.id === activeScheduleGroupId ? {...g, announcements: a} : g);
                    setScheduleGroups(updated);
                    triggerSync(undefined, updated);
                }}
                allMembers={allMembers}
                users={users}
                onDeleteMember={(id) => {
                    const upM = allMembers.filter(m => m.id !== id);
                    const upU = users.filter(u => u.memberId !== id);
                    setAllMembers(upM);
                    setUsers(upU);
                    triggerSync(upM, undefined, upU);
                }}
                onAddMember={(n, e, p, r) => {
                    const mId = `m_${Date.now()}`;
                    const upM = [...allMembers, { id: mId, name: n, email: e, phone: p, role: r }];
                    const upU = [...users, { email: e, password: '123', memberId: mId }];
                    setAllMembers(upM);
                    setUsers(upU);
                    triggerSync(upM, undefined, upU);
                }}
                currentUser={currentUser}
                onToggleAdmin={handleToggleAdmin}
                onUpdateMember={() => {}}
                scheduleGroups={scheduleGroups}
                activeScheduleGroupId={activeScheduleGroupId}
                onAddScheduleGroup={() => {}}
                onDeleteScheduleGroup={() => {}}
                onUpdateScheduleGroupName={() => {}}
            />
        ) : (
          <UserView 
            schedule={activeScheduleGroup.schedule} 
            announcements={activeScheduleGroup.announcements} 
            currentUser={currentUser} 
            onUpdateAvatar={() => {}}
            onMemberClick={() => {}} 
            scheduleName={activeScheduleGroup.name}
            viewDate={new Date()} 
            onNavigateDate={() => {}} 
            onDateClick={() => {}}
          />
        )}
      </main>
    </div>
  );
};

export default App;

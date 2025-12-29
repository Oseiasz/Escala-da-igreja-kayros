
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Schedule, Member, User, ScheduleDay, ScheduleGroup } from './types';
import AdminView from './components/AdminView';
import UserView from './components/UserView';
import Header from './components/Header';
import LoginView from './components/LoginView';
import SignUpView from './components/SignUpView';
import { SpinnerIcon, KeyIcon } from './components/icons';
import { DatabaseService } from './services/databaseService';

const DB_KEYS = {
  SESSION: 'church_session_v13',
  THEME: 'church_theme_v13',
  ADMIN_AUTH: 'church_admin_authenticated_v13'
};

const ADMIN_PASSWORD = "Kayros2026";

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
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(DB_KEYS.THEME);
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [activeUserId, setActiveUserId] = useState<string | null>(localStorage.getItem(DB_KEYS.SESSION));
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(localStorage.getItem(DB_KEYS.ADMIN_AUTH) === 'true');
  const [isLoadingSync, setIsLoadingSync] = useState(true);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  // Fallback state com dados iniciais para evitar tela branca
  const [scheduleGroups, setScheduleGroups] = useState<ScheduleGroup[]>([{ 
    id: 'default', 
    name: 'Congregação Sede', 
    schedule: DEFAULT_WEEK_SCHEDULE, 
    announcements: 'Bem-vindo! Use a aba Direção para atualizar os avisos.' 
  }]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeScheduleGroupId, setActiveScheduleGroupId] = useState<string>('default');

  useEffect(() => {
    setIsLoadingSync(true);
    let loadedCount = 0;
    const checkLoaded = () => {
        loadedCount++;
        if (loadedCount >= 3) setIsLoadingSync(false);
    };

    const unsubConfig = DatabaseService.listenToConfig((groups) => {
      if (groups && groups.length > 0) setScheduleGroups(groups);
      checkLoaded();
    });

    const unsubMembers = DatabaseService.listenToMembers((members) => {
      setAllMembers(members || []);
      checkLoaded();
    });

    const unsubUsers = DatabaseService.listenToUsers((u) => {
      setUsers(u || []);
      checkLoaded();
    });

    const safety = setTimeout(() => setIsLoadingSync(false), 2000);
    return () => { clearTimeout(safety); unsubConfig(); unsubMembers(); unsubUsers(); };
  }, []);

  const triggerSync = async (m?: Member[], g?: ScheduleGroup[], u?: User[]) => {
    if (m) await DatabaseService.publishMembers(m);
    if (g) await DatabaseService.publishGroups(g);
    if (u) await DatabaseService.publishUsers(u);
  };

  const handleLogin = useCallback(async (email: string, pass: string) => {
    const emailLower = email.toLowerCase().trim();
    const found = users.find(u => u.email.toLowerCase() === emailLower && u.password === pass);
    if (found) {
        setActiveUserId(found.memberId);
        localStorage.setItem(DB_KEYS.SESSION, found.memberId);
        return { success: true };
    }
    return { success: false, message: 'Dados incorretos.' };
  }, [users]);

  const handleSignUp = useCallback(async (name: string, email: string, password: string) => {
    const emailLower = email.toLowerCase().trim();
    if (users.some(u => u.email.toLowerCase() === emailLower)) return { success: false, message: 'E-mail já cadastrado.' };
    
    const mId = `m_${Date.now()}`;
    const newM: Member = { id: mId, name, email: emailLower, role: 'member' };
    const newU: User = { email: emailLower, password, memberId: mId };
    
    const upM = [...allMembers, newM];
    const upU = [...users, newU];
    
    setAllMembers(upM);
    setUsers(upU);
    await triggerSync(upM, undefined, upU);
    
    setActiveUserId(mId);
    localStorage.setItem(DB_KEYS.SESSION, mId);
    return { success: true };
  }, [allMembers, users]);

  const handleAdminAuth = (e: React.FormEvent) => {
      e.preventDefault();
      if (adminPassInput === ADMIN_PASSWORD) {
          setIsAdminAuthenticated(true);
          localStorage.setItem(DB_KEYS.ADMIN_AUTH, 'true');
          setShowAdminLogin(false);
          setAdminPassInput('');
          window.location.hash = '#/admin';
      } else {
          alert("Senha incorreta!");
          setAdminPassInput('');
      }
  };

  const currentUser = useMemo(() => allMembers.find(m => m.id === activeUserId) || null, [allMembers, activeUserId]);
  
  // Memoização com fallback absoluto para evitar crash/tela branca
  const activeGroup = useMemo(() => {
    const found = scheduleGroups.find(g => g.id === activeScheduleGroupId);
    if (found) return found;
    if (scheduleGroups.length > 0) return scheduleGroups[0];
    return { id: 'default', name: 'Congregação', schedule: DEFAULT_WEEK_SCHEDULE, announcements: '' };
  }, [scheduleGroups, activeScheduleGroupId]);

  useEffect(() => {
    const handleHash = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem(DB_KEYS.THEME, theme);
  }, [theme]);

  if (isLoadingSync) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-church-black text-white gap-4">
      <SpinnerIcon className="w-10 h-10 animate-spin text-indigo-500" />
      <p className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Sincronizando...</p>
    </div>
  );

  if (!currentUser) {
    return authView === 'signup' ? 
        <SignUpView onSignUp={handleSignUp} onSwitchToLogin={() => setAuthView('login')} /> : 
        <LoginView onLogin={handleLogin} onSwitchToSignUp={() => setAuthView('signup')} onForgotPassword={() => {}} />;
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${theme === 'dark' ? 'dark bg-church-black text-white' : 'bg-church-white text-black'}`}>
      <Header 
        isAdmin={true} 
        view={route === '#/admin' ? 'admin' : 'user'} 
        schedule={activeGroup.schedule} 
        currentUser={currentUser} 
        onLogout={() => { setActiveUserId(null); setIsAdminAuthenticated(false); localStorage.clear(); window.location.reload(); }} 
        theme={theme} 
        onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        onToggleSearch={() => {}}
        scheduleGroups={scheduleGroups} 
        activeScheduleGroupId={activeScheduleGroupId}
        onSetActiveScheduleGroupId={setActiveScheduleGroupId}
        isCloudConnected={true}
        onAdminClick={() => {
            if (isAdminAuthenticated) {
                window.location.hash = '#/admin';
            } else {
                setShowAdminLogin(true);
            }
        }}
      />
      
      <main className="container mx-auto p-4 lg:p-8 max-w-7xl">
        {route === '#/admin' && isAdminAuthenticated ? (
          <AdminView
                schedule={activeGroup.schedule}
                onUpdateSchedule={(s) => {
                    const up = scheduleGroups.map(g => g.id === activeScheduleGroupId ? {...g, schedule: s} : g);
                    setScheduleGroups(up);
                    triggerSync(undefined, up);
                }}
                announcements={activeGroup.announcements}
                onUpdateAnnouncements={(a) => {
                    const up = scheduleGroups.map(g => g.id === activeScheduleGroupId ? {...g, announcements: a} : g);
                    setScheduleGroups(up);
                    triggerSync(undefined, up);
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
                onToggleAdmin={() => {}}
                onUpdateMember={() => {}}
                scheduleGroups={scheduleGroups}
                activeScheduleGroupId={activeScheduleGroupId}
                onAddScheduleGroup={() => {}}
                onDeleteScheduleGroup={() => {}}
                onUpdateScheduleGroupName={() => {}}
            />
        ) : (
          <UserView 
            schedule={activeGroup.schedule} 
            announcements={activeGroup.announcements} 
            currentUser={currentUser} 
            onUpdateAvatar={() => {}}
            onMemberClick={() => {}} 
            scheduleName={activeGroup.name}
            viewDate={new Date()} 
            onNavigateDate={() => {}} 
            onDateClick={() => {}}
          />
        )}
      </main>

      {/* Modal de Senha Direção */}
      {showAdminLogin && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-white dark:bg-church-surface p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95">
                  <div className="text-center mb-6">
                      <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/20">
                          <KeyIcon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-tighter text-black dark:text-white">Acesso Direção</h3>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Insira a senha mestra para editar</p>
                  </div>
                  <form onSubmit={handleAdminAuth} className="space-y-4">
                      <input 
                        autoFocus
                        type="password" 
                        value={adminPassInput} 
                        onChange={e => setAdminPassInput(e.target.value)}
                        placeholder="Senha"
                        className="w-full px-5 py-4 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl font-black text-center outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white tracking-widest"
                      />
                      <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowAdminLogin(false)} className="flex-1 py-4 text-[10px] font-black uppercase bg-zinc-100 dark:bg-zinc-800 rounded-2xl hover:bg-zinc-200 transition-all text-zinc-500">Voltar</button>
                        <button type="submit" className="flex-1 py-4 text-[10px] font-black uppercase bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all">Entrar</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;

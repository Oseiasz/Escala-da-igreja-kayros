
import { createClient } from '@supabase/supabase-js';
import { Member, ScheduleGroup, User } from '../types';

const SUPABASE_URL = 'https://wknhbafewjdbexmldjqa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbmhiYWZld2pkYmV4bWxkanFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NjM3ODUsImV4cCI6MjA4MjUzOTc4NX0.UZgl2KzjxSxPHbG47A6oDfx7MTqHnr29hp3B5Ggx2sQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TABLE_NAME = 'church_storage';

const LOCAL_KEYS = {
  config: 'church_backup_config_v9',
  members: 'church_backup_members_v9',
  users: 'church_backup_users_v9'
};

export const DatabaseService = {
  saveData: async (key: string, data: any) => {
    localStorage.setItem(LOCAL_KEYS[key as keyof typeof LOCAL_KEYS] || `church_backup_${key}`, JSON.stringify(data));

    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .upsert({ key, data, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      
      if (error) {
        console.warn(`Erro Supabase (${key}):`, error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error(`Falha de rede (${key}):`, e);
      return false;
    }
  },

  publishGroups: (groups: ScheduleGroup[]) => DatabaseService.saveData('config', groups),
  publishMembers: (members: Member[]) => DatabaseService.saveData('members', members),
  publishUsers: (users: User[]) => DatabaseService.saveData('users', users),

  listenToConfig: (callback: (groups: ScheduleGroup[]) => void) => {
    const local = localStorage.getItem(LOCAL_KEYS.config);
    if (local) callback(JSON.parse(local));

    supabase.from(TABLE_NAME).select('data').eq('key', 'config').maybeSingle().then(({ data, error }) => {
      if (!error && data?.data) {
        localStorage.setItem(LOCAL_KEYS.config, JSON.stringify(data.data));
        callback(data.data);
      } else {
        // Se houver erro ou não houver dados, dispara o callback com o que temos (ou vazio) para destravar o app
        callback(local ? JSON.parse(local) : []);
      }
    });

    const channel = supabase.channel('config-realtime').on('postgres_changes', { 
      event: '*', schema: 'public', table: TABLE_NAME, filter: 'key=eq.config' 
    }, (p: any) => {
      if (p.new?.data) {
        localStorage.setItem(LOCAL_KEYS.config, JSON.stringify(p.new.data));
        callback(p.new.data);
      }
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  listenToMembers: (callback: (members: Member[]) => void) => {
    const local = localStorage.getItem(LOCAL_KEYS.members);
    if (local) callback(JSON.parse(local));

    supabase.from(TABLE_NAME).select('data').eq('key', 'members').maybeSingle().then(({ data, error }) => {
      if (!error && data?.data) {
        localStorage.setItem(LOCAL_KEYS.members, JSON.stringify(data.data));
        callback(data.data);
      } else {
        callback(local ? JSON.parse(local) : []);
      }
    });

    const channel = supabase.channel('members-realtime').on('postgres_changes', { 
      event: '*', schema: 'public', table: TABLE_NAME, filter: 'key=eq.members' 
    }, (p: any) => {
      if (p.new?.data) {
        localStorage.setItem(LOCAL_KEYS.members, JSON.stringify(p.new.data));
        callback(p.new.data);
      }
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  listenToUsers: (callback: (users: User[]) => void) => {
    const local = localStorage.getItem(LOCAL_KEYS.users);
    if (local) callback(JSON.parse(local));

    supabase.from(TABLE_NAME).select('data').eq('key', 'users').maybeSingle().then(({ data, error }) => {
      if (!error && data?.data) {
        localStorage.setItem(LOCAL_KEYS.users, JSON.stringify(data.data));
        callback(data.data);
      } else {
        callback(local ? JSON.parse(local) : []);
      }
    });

    const channel = supabase.channel('users-realtime').on('postgres_changes', { 
      event: '*', schema: 'public', table: TABLE_NAME, filter: 'key=eq.users' 
    }, (p: any) => {
      if (p.new?.data) {
        localStorage.setItem(LOCAL_KEYS.users, JSON.stringify(p.new.data));
        callback(p.new.data);
      }
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }
};

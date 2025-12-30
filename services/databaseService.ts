
import { createClient } from '@supabase/supabase-js';
import { Member, ScheduleGroup, User } from '../types';

/**
 * CONFIGURAÇÃO DO SUPABASE
 * URL: Confirmada pelo usuário
 * Key: Confirmada pelo usuário
 */
const SUPABASE_URL = 'https://wknhbafewjdbexmldjqa.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jRFBxNjci-cxESFJX9Secg_tR_vgkSN';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TABLE_NAME = 'church_storage';

/**
 * 🚀 COMANDO SQL PARA O SUPABASE (SQL EDITOR):
 * 
 * Copie e cole o código abaixo no SQL Editor do seu projeto para que o app funcione:
 * 
 * -- 1. Criar a tabela principal
 * CREATE TABLE IF NOT EXISTS public.church_storage (
 *     key text PRIMARY KEY,
 *     data jsonb NOT NULL,
 *     updated_at timestamptz DEFAULT now()
 * );
 * 
 * -- 2. Habilitar o Row Level Security (RLS)
 * ALTER TABLE public.church_storage ENABLE ROW LEVEL SECURITY;
 * 
 * -- 3. Criar a política de acesso (Permitir tudo para a chave pública)
 * CREATE POLICY "Permitir acesso total público" 
 * ON public.church_storage 
 * FOR ALL 
 * USING (true) 
 * WITH CHECK (true);
 * 
 * -- 4. Habilitar o Realtime para sincronização instantânea
 * ALTER PUBLICATION supabase_realtime ADD TABLE public.church_storage;
 */

const LOCAL_KEYS = {
  config: 'church_backup_config_v15',
  members: 'church_backup_members_v15',
  users: 'church_backup_users_v15'
};

export const DatabaseService = {
  saveData: async (key: string, data: any) => {
    // Local-First: Garante que os dados existam no dispositivo mesmo sem internet ou sem tabela pronta
    localStorage.setItem(LOCAL_KEYS[key as keyof typeof LOCAL_KEYS] || `church_backup_${key}`, JSON.stringify(data));

    try {
      const { error } = await supabase
        .from(TABLE_NAME)
        .upsert({ 
            key, 
            data, 
            updated_at: new Date().toISOString() 
        }, { onConflict: 'key' });
      
      if (error) {
        console.warn(`[Supabase Sync] Sincronização falhou para '${key}'. Verifique se a tabela '${TABLE_NAME}' existe.`);
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  publishGroups: (groups: ScheduleGroup[]) => DatabaseService.saveData('config', groups),
  publishMembers: (members: Member[]) => DatabaseService.saveData('members', members),
  publishUsers: (users: User[]) => DatabaseService.saveData('users', users),

  listenToConfig: (callback: (groups: ScheduleGroup[]) => void) => {
    const local = localStorage.getItem(LOCAL_KEYS.config);
    if (local) callback(JSON.parse(local));

    supabase.from(TABLE_NAME).select('data').eq('key', 'config').maybeSingle()
      .then(({ data, error }) => {
        if (!error && data?.data) {
          localStorage.setItem(LOCAL_KEYS.config, JSON.stringify(data.data));
          callback(data.data);
        }
      }).catch(() => {});

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

    supabase.from(TABLE_NAME).select('data').eq('key', 'members').maybeSingle()
      .then(({ data, error }) => {
        if (!error && data?.data) {
          localStorage.setItem(LOCAL_KEYS.members, JSON.stringify(data.data));
          callback(data.data);
        }
      }).catch(() => {});

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

    supabase.from(TABLE_NAME).select('data').eq('key', 'users').maybeSingle()
      .then(({ data, error }) => {
        if (!error && data?.data) {
          localStorage.setItem(LOCAL_KEYS.users, JSON.stringify(data.data));
          callback(data.data);
        }
      }).catch(() => {});

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

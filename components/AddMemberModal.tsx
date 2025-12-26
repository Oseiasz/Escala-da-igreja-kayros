
import React, { useState } from 'react';
import { CloseIcon, UserIcon, AdminIcon, MailIcon, PhoneIcon } from './icons';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, email: string, phone: string, role: 'admin' | 'member') => void;
}

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
  <div className="group relative inline-block ml-1">
    <div className="cursor-help text-slate-400 hover:text-indigo-500 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-[10px] rounded-lg shadow-xl z-50 pointer-events-none animate-in fade-in zoom-in-95">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800" />
    </div>
  </div>
);

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    onAdd(name, email, phone, role);
    setName(''); setEmail(''); setPhone(''); setRole('member');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20">
          <div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white">Novo Membro</h3>
            <p className="text-xs text-slate-500 font-medium">Cadastre e defina o acesso no sistema.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
            <CloseIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="flex items-center text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1">
                Nome Completo
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Ex: Maria Oliveira" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1">
                E-mail
                <Tooltip text="O e-mail será usado para o membro realizar login e receber notificações." />
              </label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="email@exemplo.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center text-xs font-black uppercase tracking-widest text-slate-500 mb-1.5 ml-1">
                Telefone (Opcional)
                <Tooltip text="Usado para contato rápido via WhatsApp pela administração." />
              </label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="(00) 00000-0000" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
              Cargo no Sistema
              <Tooltip text="Administradores podem editar escalas e avisos. Membros apenas visualizam." />
            </label>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setRole('member')}
                className={`flex-1 flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${role === 'member' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500' : 'bg-transparent border-slate-100 dark:border-slate-700 opacity-60'}`}
              >
                <UserIcon className={`w-6 h-6 mb-1 ${role === 'member' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className={`text-[10px] font-black uppercase ${role === 'member' ? 'text-indigo-600' : 'text-slate-400'}`}>Membro</span>
              </button>
              <button 
                type="button" 
                onClick={() => setRole('admin')}
                className={`flex-1 flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${role === 'admin' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500' : 'bg-transparent border-slate-100 dark:border-slate-700 opacity-60'}`}
              >
                <AdminIcon className={`w-6 h-6 mb-1 ${role === 'admin' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className={`text-[10px] font-black uppercase ${role === 'admin' ? 'text-indigo-600' : 'text-slate-400'}`}>Admin</span>
              </button>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-200 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="flex-1 py-3 text-sm font-black text-white bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Salvar Membro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;


import React, { useState, useMemo } from 'react';
import { Schedule, ScheduleDay, Member, ScheduleGroup, User } from '../types';
import { PdfIcon, EditIcon, TrashIcon, PlusIcon, QrCodeIcon, CalendarIcon, SearchIcon, CheckIcon, UserIcon } from './icons';
import { exportScheduleToPDF } from '../services/pdfService';
import MultiSelect from './MultiSelect';
import Avatar from './Avatar';
import SchedulePDFView from './SchedulePDFView';
import QRCodeModal from './QRCodeModal';
import AddMemberModal from './AddMemberModal';

interface AdminViewProps {
  schedule: Schedule;
  onUpdateSchedule: (newSchedule: Schedule) => void;
  announcements: string;
  onUpdateAnnouncements: (newAnnouncements: string) => void;
  allMembers: Member[];
  users: User[]; // Lista de quem já tem conta ativa
  onDeleteMember: (memberId: string) => void;
  onAddMember: (name: string, email: string, phone: string, role: 'admin' | 'member') => void;
  currentUser: Member;
  onToggleAdmin: (memberId: string) => void;
  onUpdateMember: (member: Member) => void;
  scheduleGroups: ScheduleGroup[];
  activeScheduleGroupId: string;
  onAddScheduleGroup: (name: string) => void;
  onDeleteScheduleGroup: (id: string) => void;
  onUpdateScheduleGroupName: (id: string, newName: string) => void;
}

const AdminView: React.FC<AdminViewProps> = (props) => {
    const [editingDay, setEditingDay] = useState<ScheduleDay | null>(null);
    const [isSavingPdf, setIsSavingPdf] = useState(false);
    const [isQrOpen, setIsQrOpen] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');

    const filteredMembers = useMemo(() => {
        const search = memberSearch.toLowerCase().trim();
        return props.allMembers.filter(m => 
            m.name.toLowerCase().includes(search) || 
            m.email.toLowerCase().includes(search)
        );
    }, [props.allMembers, memberSearch]);

    const activeUsersCount = useMemo(() => {
        return props.allMembers.filter(m => props.users.some(u => u.memberId === m.id)).length;
    }, [props.allMembers, props.users]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} url={window.location.href} />
            
            <AddMemberModal 
                isOpen={isAddMemberOpen} 
                onClose={() => setIsAddMemberOpen(false)} 
                onAdd={props.onAddMember} 
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white">Gerenciamento</h2>
                    <p className="text-slate-500 font-medium">Controle total dos membros e acessos.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsQrOpen(true)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 hover:scale-105 transition-transform"><QrCodeIcon className="w-6 h-6" /></button>
                    <button onClick={async () => { setIsSavingPdf(true); await exportScheduleToPDF('admin-offscreen-pdf', 'escala.pdf'); setIsSavingPdf(false); }} className="px-6 py-3 bg-green-600 text-white font-bold rounded-2xl shadow-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
                        <PdfIcon className="w-5 h-5" /> {isSavingPdf ? 'Gerando...' : 'Exportar PDF'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border dark:border-slate-700">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-2"><CalendarIcon className="w-6 h-6 text-indigo-500" /> Escala Ativa</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {props.schedule.map(day => (
                                <div key={day.id} onClick={() => setEditingDay(day)} className={`p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${day.active ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60'}`}>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold">{day.dayName}</span>
                                        <EditIcon className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 mt-1">{day.active ? day.event || 'Evento Ativo' : 'Sem Programação'}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border dark:border-slate-700">
                        <h3 className="text-xl font-black mb-4">Avisos</h3>
                        <textarea 
                            value={props.announcements}
                            onChange={e => props.onUpdateAnnouncements(e.target.value)}
                            className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-indigo-500 outline-none transition-all"
                            placeholder="Escreva os comunicados..."
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border dark:border-slate-700 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-black">Membros</h3>
                                <p className="text-[10px] text-green-500 font-bold uppercase">{activeUsersCount} Contas Ativas</p>
                            </div>
                            <button 
                                onClick={() => setIsAddMemberOpen(true)} 
                                className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95"
                                title="Adicionar Novo Membro"
                            >
                                <PlusIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="relative mb-4">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Buscar membros..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>

                        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                            {filteredMembers.map(m => {
                                const isRegistered = props.users.some(u => u.memberId === m.id);
                                return (
                                    <div key={m.id} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <Avatar member={m} className="w-10 h-10" />
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1">
                                                        <span className="font-bold text-xs truncate max-w-[100px]">{m.name}</span>
                                                        {isRegistered && <CheckIcon className="w-3 h-3 text-green-500" />}
                                                    </div>
                                                    <span className="text-[9px] text-slate-500">{m.email}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => props.onDeleteMember(m.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2 border-t dark:border-slate-800">
                                            <button 
                                                onClick={() => props.onToggleAdmin(m.id)}
                                                className={`flex-1 py-1 text-[9px] font-black rounded-lg uppercase tracking-widest ${m.role === 'admin' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
                                            >
                                                {m.role === 'admin' ? 'Administrador' : 'Membro'}
                                            </button>
                                            <div className={`px-2 py-1 rounded text-[8px] font-bold uppercase ${isRegistered ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-400'}`}>
                                                {isRegistered ? 'Acesso Ativo' : 'Aguardando'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredMembers.length === 0 && (
                                <div className="text-center py-10 text-slate-400 text-sm italic">
                                    <UserIcon className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    Nenhum membro encontrado.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {editingDay && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in-95">
                        <h3 className="text-xl font-black mb-6">Configurar {editingDay.dayName}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                <input type="checkbox" checked={editingDay.active} onChange={e => props.onUpdateSchedule(props.schedule.map(d => d.id === editingDay.id ? {...d, active: e.target.checked} : d))} className="h-4 w-4 rounded" />
                                <span className="text-sm font-bold">Ativar este dia na escala</span>
                            </div>
                            {editingDay.active && (
                                <>
                                    <input type="text" placeholder="Nome do Evento (ex: Culto)" value={editingDay.event} onChange={e => props.onUpdateSchedule(props.schedule.map(d => d.id === editingDay.id ? {...d, event: e.target.value} : d))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border-none focus:ring-2 focus:ring-indigo-500" />
                                    <MultiSelect label="Escalados para este dia" allOptions={props.allMembers} selectedOptions={editingDay.worshipLeaders} onChange={s => props.onUpdateSchedule(props.schedule.map(d => d.id === editingDay.id ? {...d, worshipLeaders: s} : d))} />
                                </>
                            )}
                        </div>
                        <button onClick={() => setEditingDay(null)} className="w-full mt-6 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-lg">Salvar Alterações</button>
                    </div>
                </div>
            )}

            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', zIndex: -1 }} aria-hidden="true">
                <div id="admin-offscreen-pdf">
                     <SchedulePDFView schedule={props.schedule} announcements={props.announcements} scheduleName={props.activeScheduleGroupId} />
                </div>
            </div>
        </div>
    );
};

export default AdminView;

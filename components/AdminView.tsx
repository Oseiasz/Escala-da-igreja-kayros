
import React, { useState, useMemo, useEffect } from 'react';
import { Schedule, ScheduleDay, Member, ScheduleGroup, User } from '../types';
import { PdfIcon, EditIcon, TrashIcon, PlusIcon, QrCodeIcon, CalendarIcon, SearchIcon, CheckIcon, UserIcon, AdminIcon, CloseIcon } from './icons';
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
  users: User[];
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

const StatCard: React.FC<{ label: string, value: number | string, icon: React.ReactNode, color: string }> = ({ label, value, icon, color }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center gap-5">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <h4 className="text-2xl font-black text-slate-800 dark:text-white">{value}</h4>
        </div>
    </div>
);

const AdminView: React.FC<AdminViewProps> = (props) => {
    // editingDay agora é apenas o ID do dia sendo editado para manter reatividade com o schedule do pai
    const [editingDayId, setEditingDayId] = useState<string | null>(null);
    const [isSavingPdf, setIsSavingPdf] = useState(false);
    const [isQrOpen, setIsQrOpen] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');

    const editingDay = useMemo(() => props.schedule.find(d => d.id === editingDayId), [props.schedule, editingDayId]);

    const filteredMembers = useMemo(() => {
        const search = memberSearch.toLowerCase().trim();
        return props.allMembers.filter(m => 
            m.name.toLowerCase().includes(search) || 
            m.email.toLowerCase().includes(search)
        );
    }, [props.allMembers, memberSearch]);

    const stats = useMemo(() => ({
        totalMembers: props.allMembers.length,
        activeAccounts: props.allMembers.filter(m => props.users.some(u => u.memberId === m.id)).length,
        activeDays: props.schedule.filter(d => d.active).length
    }), [props.allMembers, props.users, props.schedule]);

    const updateDayField = (id: string, field: keyof ScheduleDay, value: any) => {
        const newSchedule = props.schedule.map(d => d.id === id ? { ...d, [field]: value } : d);
        props.onUpdateSchedule(newSchedule);
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} url={window.location.href} />
            <AddMemberModal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} onAdd={props.onAddMember} />

            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-1">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400">Dashboard</span>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white leading-none">Administração</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsQrOpen(true)} className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all text-slate-600 dark:text-slate-300"><QrCodeIcon className="w-6 h-6" /></button>
                    <button onClick={async () => { setIsSavingPdf(true); await exportScheduleToPDF('admin-offscreen-pdf', 'escala.pdf'); setIsSavingPdf(false); }} className="px-8 py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-200 dark:shadow-none flex items-center gap-3 hover:bg-green-700 active:scale-95 transition-all">
                        <PdfIcon className="w-5 h-5" /> {isSavingPdf ? 'Gerando...' : 'Exportar Escala'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Membros Totais" value={stats.totalMembers} icon={<UserIcon className="w-6 h-6 text-indigo-600" />} color="bg-indigo-600" />
                <StatCard label="Contas Ativas" value={stats.activeAccounts} icon={<CheckIcon className="w-6 h-6 text-emerald-600" />} color="bg-emerald-600" />
                <StatCard label="Dias na Escala" value={stats.activeDays} icon={<CalendarIcon className="w-6 h-6 text-amber-600" />} color="bg-amber-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    <section className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3"><CalendarIcon className="w-7 h-7 text-indigo-500" /> Dias da Semana</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {props.schedule.map(day => (
                                <button 
                                    key={day.id} 
                                    onClick={() => setEditingDayId(day.id)} 
                                    className={`group relative p-6 rounded-3xl border-2 text-left transition-all duration-300 active:scale-[0.98] ${day.active ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-60'}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-lg font-black text-slate-800 dark:text-white">{day.dayName}</span>
                                        <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border dark:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors`}>
                                            <EditIcon className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${day.active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                                        {day.active ? (day.event || 'Evento Ativo') : 'Dia Inativo'}
                                    </p>
                                    <div className="mt-4 flex gap-1.5">
                                        {day.active && day.worshipLeaders.length > 0 && <div className="w-2 h-2 rounded-full bg-purple-500" title="Dirigentes" />}
                                        {day.active && day.preachers.length > 0 && <div className="w-2 h-2 rounded-full bg-orange-500" title="Pregadores" />}
                                        {day.active && day.doorkeepers.length > 0 && <div className="w-2 h-2 rounded-full bg-blue-500" title="Porteiros" />}
                                        {day.active && day.hymnSingers.length > 0 && <div className="w-2 h-2 rounded-full bg-emerald-500" title="Cantores" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50">
                        <h3 className="text-2xl font-black mb-6 text-slate-800 dark:text-white">Comunicados Importantes</h3>
                        <textarea 
                            value={props.announcements}
                            onChange={e => props.onUpdateAnnouncements(e.target.value)}
                            className="w-full h-40 p-6 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-700 dark:text-slate-300"
                            placeholder="Escreva os avisos aqui para os membros visualizarem..."
                        />
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700/50 sticky top-28">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white">Equipe</h3>
                            <button onClick={() => setIsAddMemberOpen(true)} className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all"><PlusIcon className="w-6 h-6" /></button>
                        </div>

                        <div className="relative mb-6">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Pesquisar..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
                            {filteredMembers.map(m => {
                                const isRegistered = props.users.some(u => u.memberId === m.id);
                                return (
                                    <div key={m.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Avatar member={m} className="w-12 h-12" />
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate max-w-[120px]">{m.name}</h4>
                                                        {isRegistered && <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />}
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">{m.email}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => props.onDeleteMember(m.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800">
                                            <button 
                                                onClick={() => props.onToggleAdmin(m.id)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${m.role === 'admin' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-600'}`}
                                            >
                                                <AdminIcon className="w-3 h-3" />
                                                {m.role === 'admin' ? 'Administrador' : 'Membro'}
                                            </button>
                                            <span className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight ${isRegistered ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-800'}`}>
                                                {isRegistered ? 'Ativo' : 'Pendente'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </div>

            {editingDay && (
                <div className="fixed inset-0 bg-slate-900/60 z-[100] flex justify-center items-center p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-2xl w-full max-w-xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="sticky top-0 bg-white dark:bg-slate-800 z-10 pb-4 mb-4 flex justify-between items-center border-b dark:border-slate-700">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Configurar {editingDay.dayName}</h3>
                            <button onClick={() => setEditingDayId(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"><CloseIcon className="w-6 h-6 text-slate-400" /></button>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                                <input 
                                    type="checkbox" 
                                    id="day-active"
                                    checked={editingDay.active} 
                                    onChange={e => updateDayField(editingDay.id, 'active', e.target.checked)} 
                                    className="h-6 w-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500" 
                                />
                                <label htmlFor="day-active" className="text-base font-black text-slate-800 dark:text-white cursor-pointer">Dia ativo nesta escala</label>
                            </div>
                            {editingDay.active && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Título do Evento</label>
                                        <input 
                                            type="text" 
                                            placeholder="Ex: Culto da Família" 
                                            value={editingDay.event} 
                                            onChange={e => updateDayField(editingDay.id, 'event', e.target.value)} 
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none ring-1 ring-slate-100 dark:ring-slate-800 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold" 
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-6">
                                        <MultiSelect 
                                            label="Dirigentes" 
                                            allOptions={props.allMembers} 
                                            selectedOptions={editingDay.worshipLeaders} 
                                            onChange={s => updateDayField(editingDay.id, 'worshipLeaders', s)} 
                                        />
                                        <MultiSelect 
                                            label="Pregadores" 
                                            allOptions={props.allMembers} 
                                            selectedOptions={editingDay.preachers} 
                                            onChange={s => updateDayField(editingDay.id, 'preachers', s)} 
                                        />
                                        <MultiSelect 
                                            label="Porteiros" 
                                            allOptions={props.allMembers} 
                                            selectedOptions={editingDay.doorkeepers} 
                                            onChange={s => updateDayField(editingDay.id, 'doorkeepers', s)} 
                                        />
                                        <MultiSelect 
                                            label="Cantores" 
                                            allOptions={props.allMembers} 
                                            selectedOptions={editingDay.hymnSingers} 
                                            onChange={s => updateDayField(editingDay.id, 'hymnSingers', s)} 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setEditingDayId(null)} className="w-full mt-10 py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all text-lg">Concluir Edição</button>
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

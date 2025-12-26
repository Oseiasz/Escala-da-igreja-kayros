
import React, { useState, useMemo } from 'react';
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
    <div className="bg-church-surface p-6 rounded-3xl border border-church-border/50 flex items-center gap-5">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-20 flex items-center justify-center`}>
            {icon}
        </div>
        <div>
            <p className="text-xs font-black uppercase tracking-widest text-emerald-500/70 mb-1">{label}</p>
            <h4 className="text-3xl font-black text-white">{value}</h4>
        </div>
    </div>
);

const AdminView: React.FC<AdminViewProps> = (props) => {
    const [editingDayId, setEditingDayId] = useState<string | null>(null);
    const [isSavingPdf, setIsSavingPdf] = useState(false);
    const [isQrOpen, setIsQrOpen] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');
    const [newCongregationName, setNewCongregationName] = useState('');

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
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500 pb-20">
            <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} url={window.location.href} />
            <AddMemberModal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} onAdd={props.onAddMember} />

            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-1">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">Gestão Pastoral</span>
                    <h2 className="text-4xl font-black text-white leading-none">Administração</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsQrOpen(true)} className="p-4 bg-church-surface rounded-2xl border border-church-border/50 text-emerald-500"><QrCodeIcon className="w-6 h-6" /></button>
                    <button onClick={async () => { setIsSavingPdf(true); await exportScheduleToPDF('admin-offscreen-pdf', 'escala.pdf'); setIsSavingPdf(false); }} className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center gap-3 hover:bg-emerald-700 active:scale-95 transition-all">
                        <PdfIcon className="w-5 h-5" /> {isSavingPdf ? 'Gerando...' : 'Exportar Escala'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Membros" value={stats.totalMembers} icon={<UserIcon className="w-6 h-6 text-emerald-400" />} color="bg-emerald-600" />
                <StatCard label="Usuários Ativos" value={stats.activeAccounts} icon={<CheckIcon className="w-6 h-6 text-emerald-300" />} color="bg-emerald-600" />
                <StatCard label="Dias na Escala" value={stats.activeDays} icon={<CalendarIcon className="w-6 h-6 text-emerald-400" />} color="bg-emerald-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    {/* GESTÃO DE CONGREGAÇÕES */}
                    <section className="bg-church-surface p-8 rounded-[2.5rem] border border-church-border/30 shadow-2xl">
                        <h3 className="text-2xl font-black text-white mb-6">Congregações</h3>
                        <div className="flex gap-4 mb-6">
                            <input 
                                type="text" 
                                placeholder="Nome da nova congregação..." 
                                value={newCongregationName}
                                onChange={(e) => setNewCongregationName(e.target.value)}
                                className="flex-1 p-4 bg-black border border-church-border/50 rounded-2xl text-emerald-400 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder-emerald-900"
                            />
                            <button 
                                onClick={() => { if(newCongregationName) { props.onAddScheduleGroup(newCongregationName); setNewCongregationName(''); }}}
                                className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg"
                            >
                                <PlusIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {props.scheduleGroups.map(group => (
                                <div key={group.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${props.activeScheduleGroupId === group.id ? 'bg-emerald-500/10 border-emerald-500' : 'bg-black border-church-border/20'}`}>
                                    <span className={`font-bold text-lg ${props.activeScheduleGroupId === group.id ? 'text-emerald-500' : 'text-emerald-800'}`}>{group.name}</span>
                                    <div className="flex gap-2">
                                        {props.scheduleGroups.length > 1 && (
                                            <button onClick={() => props.onDeleteScheduleGroup(group.id)} className="text-red-500 hover:text-red-400 p-2">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-church-surface p-8 rounded-[2.5rem] border border-church-border/30 shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-white flex items-center gap-3"><CalendarIcon className="w-7 h-7 text-emerald-500" /> Agenda Semanal</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {props.schedule.map(day => (
                                <button 
                                    key={day.id} 
                                    onClick={() => setEditingDayId(day.id)} 
                                    className={`group relative p-6 rounded-3xl border-2 text-left transition-all duration-300 active:scale-[0.98] ${day.active ? 'bg-black border-emerald-500/50 shadow-emerald-500/10 shadow-xl' : 'bg-zinc-950 border-transparent opacity-40'}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-xl font-black text-emerald-400">{day.dayName}</span>
                                        <div className={`p-2 rounded-xl bg-zinc-900 border border-emerald-500/30 group-hover:bg-emerald-600 group-hover:text-white transition-all`}>
                                            <EditIcon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <p className={`text-xs font-black uppercase tracking-widest ${day.active ? 'text-emerald-500' : 'text-emerald-900'}`}>
                                        {day.active ? (day.event || 'Atividade Ativa') : 'Sem Programação'}
                                    </p>
                                    <div className="mt-5 flex gap-2">
                                        {day.active && day.worshipLeaders.length > 0 && <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_emerald]" />}
                                        {day.active && day.preachers.length > 0 && <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_emerald]" />}
                                        {day.active && day.doorkeepers.length > 0 && <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_emerald]" />}
                                        {day.active && day.hymnSingers.length > 0 && <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_emerald]" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="bg-church-surface p-8 rounded-[2.5rem] border border-church-border/30 shadow-2xl">
                        <h3 className="text-2xl font-black mb-6 text-white">Quadro de Avisos</h3>
                        <textarea 
                            value={props.announcements}
                            onChange={e => props.onUpdateAnnouncements(e.target.value)}
                            className="w-full h-40 p-6 bg-black border border-church-border/50 rounded-3xl focus:border-emerald-500 outline-none transition-all text-emerald-500 font-bold text-lg"
                            placeholder="Escreva os avisos aqui..."
                        />
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-church-surface p-8 rounded-[2.5rem] border border-church-border/30 shadow-2xl sticky top-28">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-white">Equipe</h3>
                            <button onClick={() => setIsAddMemberOpen(true)} className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all"><PlusIcon className="w-6 h-6" /></button>
                        </div>

                        <div className="relative mb-6">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-700" />
                            <input type="text" placeholder="Filtrar membros..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-black border border-church-border/50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-white font-bold transition-all placeholder-emerald-900" />
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
                            {filteredMembers.map(m => {
                                const isRegistered = props.users.some(u => u.memberId === m.id);
                                return (
                                    <div key={m.id} className="p-4 bg-black rounded-3xl border border-church-border/10 hover:border-emerald-500/40 transition-all group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Avatar member={m} className="w-12 h-12 border border-emerald-900" />
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <h4 className="font-bold text-base text-emerald-400 truncate max-w-[120px]">{m.name}</h4>
                                                        {isRegistered && <CheckIcon className="w-4 h-4 text-emerald-500" />}
                                                    </div>
                                                    <p className="text-[11px] text-emerald-900 font-medium truncate max-w-[120px]">{m.email}</p>
                                                </div>
                                            </div>
                                            {m.email !== 'ozeiasof@gmail.com' && (
                                                <button onClick={() => props.onDeleteMember(m.id)} className="p-2 text-emerald-900 hover:text-red-500 transition-colors">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-emerald-500/10">
                                            <button 
                                                disabled={m.email === 'ozeiasof@gmail.com'}
                                                onClick={() => props.onToggleAdmin(m.id)}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${m.role === 'admin' ? 'bg-emerald-600 text-white' : 'bg-zinc-900 text-emerald-900 border border-emerald-900/30 hover:border-emerald-500 hover:text-emerald-500'}`}
                                            >
                                                <AdminIcon className="w-4 h-4" />
                                                {m.role === 'admin' ? 'Administrador' : 'Membro'}
                                            </button>
                                            <span className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tight ${isRegistered ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-900 text-emerald-950'}`}>
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
                <div className="fixed inset-0 bg-black/90 z-[100] flex justify-center items-center p-4 backdrop-blur-md animate-in fade-in">
                    <div className="bg-church-surface rounded-[3rem] shadow-2xl w-full max-w-xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar border border-emerald-500/30">
                        <div className="sticky top-0 bg-church-surface z-10 pb-4 mb-4 flex justify-between items-center border-b border-emerald-500/10">
                            <h3 className="text-2xl font-black text-emerald-400">Escala: {editingDay.dayName}</h3>
                            <button onClick={() => setEditingDayId(null)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><CloseIcon className="w-7 h-7 text-emerald-500" /></button>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-6 bg-black rounded-3xl border border-emerald-500/20">
                                <input 
                                    type="checkbox" 
                                    id="day-active"
                                    checked={editingDay.active} 
                                    onChange={e => updateDayField(editingDay.id, 'active', e.target.checked)} 
                                    className="h-7 w-7 rounded-lg border-emerald-500 text-emerald-600 focus:ring-emerald-500" 
                                />
                                <label htmlFor="day-active" className="text-lg font-black text-white cursor-pointer">Dia com atividade nesta congregação</label>
                            </div>
                            {editingDay.active && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-emerald-500 ml-2">Evento / Culto</label>
                                        <input 
                                            type="text" 
                                            placeholder="Ex: Culto da Família" 
                                            value={editingDay.event} 
                                            onChange={e => updateDayField(editingDay.id, 'event', e.target.value)} 
                                            className="w-full p-5 bg-black rounded-2xl border border-emerald-500/30 focus:border-emerald-500 transition-all font-bold text-white" 
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-6">
                                        <MultiSelect label="Dirigentes" allOptions={props.allMembers} selectedOptions={editingDay.worshipLeaders} onChange={s => updateDayField(editingDay.id, 'worshipLeaders', s)} />
                                        <MultiSelect label="Pregadores" allOptions={props.allMembers} selectedOptions={editingDay.preachers} onChange={s => updateDayField(editingDay.id, 'preachers', s)} />
                                        <MultiSelect label="Porteiros" allOptions={props.allMembers} selectedOptions={editingDay.doorkeepers} onChange={s => updateDayField(editingDay.id, 'doorkeepers', s)} />
                                        <MultiSelect label="Louvor / Harpa" allOptions={props.allMembers} selectedOptions={editingDay.hymnSingers} onChange={s => updateDayField(editingDay.id, 'hymnSingers', s)} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setEditingDayId(null)} className="w-full mt-10 py-5 bg-emerald-600 text-white font-black rounded-3xl shadow-xl hover:bg-emerald-700 active:scale-95 transition-all text-xl">Confirmar Alterações</button>
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

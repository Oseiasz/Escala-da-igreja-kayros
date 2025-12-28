
import React, { useState, useMemo, useEffect } from 'react';
import { Schedule, ScheduleDay, Member, ScheduleGroup, User } from '../types';
import { PdfIcon, EditIcon, TrashIcon, PlusIcon, QrCodeIcon, CalendarIcon, SearchIcon, CheckIcon, UserIcon, AdminIcon, CloseIcon, ChevronLeftIcon, ChevronRightIcon, KeyIcon } from './icons';
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

const MEMBERS_PER_PAGE = 6;

const StatCard: React.FC<{ label: string, value: number | string, icon: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="bg-white dark:bg-church-surface p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-5 transition-all hover:translate-y-[-2px] hover:shadow-lg">
        <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
            {icon}
        </div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">{label}</p>
            <h4 className="text-3xl font-black text-black dark:text-white leading-none">{value}</h4>
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
    const [currentPage, setCurrentPage] = useState(1);

    const editingDay = useMemo(() => props.schedule.find(d => d.id === editingDayId), [props.schedule, editingDayId]);

    const filteredMembers = useMemo(() => {
        const search = memberSearch.toLowerCase().trim();
        return props.allMembers.filter(m => 
            m.name.toLowerCase().includes(search) || 
            m.email.toLowerCase().includes(search)
        );
    }, [props.allMembers, memberSearch]);

    useEffect(() => { setCurrentPage(1); }, [memberSearch]);

    const totalPages = Math.ceil(filteredMembers.length / MEMBERS_PER_PAGE);
    const paginatedMembers = useMemo(() => {
        const startIndex = (currentPage - 1) * MEMBERS_PER_PAGE;
        return filteredMembers.slice(startIndex, startIndex + MEMBERS_PER_PAGE);
    }, [filteredMembers, currentPage]);

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
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-500">Gestão de Equipe</span>
                    <h2 className="text-4xl font-black text-black dark:text-white leading-none tracking-tighter">Administração</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsQrOpen(true)} className="p-4 bg-white dark:bg-church-surface rounded-2xl border border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"><QrCodeIcon className="w-6 h-6" /></button>
                    <button onClick={async () => { setIsSavingPdf(true); await exportScheduleToPDF('admin-offscreen-pdf', 'escala.pdf'); setIsSavingPdf(false); }} className="px-8 py-4 bg-black dark:bg-church-zinc text-white font-black rounded-2xl shadow-xl flex items-center gap-3 hover:opacity-90 active:scale-95 transition-all">
                        <PdfIcon className="w-5 h-5" /> {isSavingPdf ? 'Gerando...' : 'Exportar Escala'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Total Membros" value={stats.totalMembers} icon={<UserIcon className="w-6 h-6 text-black dark:text-white" />} />
                <StatCard label="Contas Ativas" value={stats.activeAccounts} icon={<CheckIcon className="w-6 h-6 text-black dark:text-white" />} />
                <StatCard label="Dias Programados" value={stats.activeDays} icon={<CalendarIcon className="w-6 h-6 text-black dark:text-white" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    <section className="bg-white dark:bg-church-surface p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="text-2xl font-black text-black dark:text-white mb-6">Congregações</h3>
                        <div className="flex gap-4 mb-6">
                            <input 
                                type="text" 
                                placeholder="Nova congregação..." 
                                value={newCongregationName}
                                onChange={(e) => setNewCongregationName(e.target.value)}
                                className="flex-1 p-4 bg-zinc-50 dark:bg-church-black border border-zinc-200 dark:border-zinc-800 rounded-2xl text-black dark:text-white font-bold outline-none focus:ring-2 focus:ring-zinc-400 transition-all"
                            />
                            <button 
                                onClick={() => { if(newCongregationName) { props.onAddScheduleGroup(newCongregationName); setNewCongregationName(''); }}}
                                className="p-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl hover:opacity-90 transition-all shadow-lg"
                            >
                                <PlusIcon className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {props.scheduleGroups.map(group => (
                                <div key={group.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${props.activeScheduleGroupId === group.id ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-400' : 'bg-white dark:bg-church-black border-zinc-200 dark:border-zinc-800'}`}>
                                    <span className={`font-black text-lg ${props.activeScheduleGroupId === group.id ? 'text-black dark:text-white' : 'text-zinc-400 dark:text-zinc-600'}`}>{group.name}</span>
                                    {props.scheduleGroups.length > 1 && (
                                        <button onClick={() => props.onDeleteScheduleGroup(group.id)} className="text-zinc-400 hover:text-red-500 p-2">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-church-surface p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="text-2xl font-black text-black dark:text-white mb-8">Agenda Semanal</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {props.schedule.map(day => (
                                <button 
                                    key={day.id} 
                                    onClick={() => setEditingDayId(day.id)} 
                                    className={`group relative p-6 rounded-3xl border-2 text-left transition-all duration-300 active:scale-[0.98] ${day.active ? 'bg-zinc-50 dark:bg-church-black border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600' : 'bg-transparent border-transparent opacity-20'}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-xl font-black text-black dark:text-white">{day.dayName}</span>
                                        <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
                                            <EditIcon className="w-5 h-5 text-zinc-400" />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                        {day.active ? (day.event || 'Evento Ativo') : 'Sem Programação'}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-white dark:bg-church-surface p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-28">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-black dark:text-white">Equipe</h3>
                            <button onClick={() => setIsAddMemberOpen(true)} className="p-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all"><PlusIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="relative mb-6">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input type="text" placeholder="Filtrar..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-church-black border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-zinc-400 text-black dark:text-white font-bold transition-all" />
                        </div>
                        
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar min-h-[300px]">
                            {paginatedMembers.map(m => (
                                <div key={m.id} className={`p-4 rounded-3xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all group ${m.role === 'admin' ? 'bg-zinc-100 dark:bg-zinc-800/50' : 'bg-zinc-50 dark:bg-church-black'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar member={m} className="w-12 h-12" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-base text-black dark:text-white">{m.name}</h4>
                                                    {m.role === 'admin' && <AdminIcon className="w-3.5 h-3.5 text-zinc-400" />}
                                                </div>
                                                <p className="text-[10px] text-zinc-500 font-medium">{m.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {/* Botão de Toggle Admin */}
                                            {m.email !== 'ozeiasof@gmail.com' && (
                                                <button 
                                                    onClick={() => props.onToggleAdmin(m.id)} 
                                                    title={m.role === 'admin' ? "Remover de Admin" : "Tornar Admin"}
                                                    className={`p-2 transition-colors rounded-xl ${m.role === 'admin' ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' : 'text-zinc-400 hover:text-indigo-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                                                >
                                                    <KeyIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            {m.email !== 'ozeiasof@gmail.com' && (
                                                <button onClick={() => props.onDeleteMember(m.id)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white disabled:opacity-20"><ChevronLeftIcon className="w-5 h-5" /></button>
                                <span className="text-[10px] font-black text-zinc-400">Pág {currentPage}/{totalPages}</span>
                                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white disabled:opacity-20"><ChevronRightIcon className="w-5 h-5" /></button>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {editingDay && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-church-surface rounded-[3rem] shadow-2xl w-full max-w-xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar border border-zinc-200 dark:border-zinc-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-black dark:text-white">Escala: {editingDay.dayName}</h3>
                            <button onClick={() => setEditingDayId(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"><CloseIcon className="w-7 h-7 text-black dark:text-white" /></button>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-6 bg-zinc-50 dark:bg-church-black rounded-3xl border border-zinc-200 dark:border-zinc-800">
                                <input type="checkbox" id="day-active" checked={editingDay.active} onChange={e => updateDayField(editingDay.id, 'active', e.target.checked)} className="h-6 w-6 rounded border-zinc-300 text-black" />
                                <label htmlFor="day-active" className="text-lg font-black text-black dark:text-white">Atividade Ativa</label>
                            </div>
                            {editingDay.active && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Título do Culto</label>
                                        <input type="text" value={editingDay.event} onChange={e => updateDayField(editingDay.id, 'event', e.target.value)} className="w-full p-5 bg-zinc-50 dark:bg-church-black rounded-2xl border border-zinc-200 dark:border-zinc-800 font-bold" />
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
                        <button onClick={() => setEditingDayId(null)} className="w-full mt-10 py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-3xl shadow-xl hover:opacity-90 active:scale-95 transition-all text-xl">Salvar Escala</button>
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

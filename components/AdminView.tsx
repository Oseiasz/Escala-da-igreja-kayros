
import React, { useState, useMemo, useEffect } from 'react';
import { Schedule, ScheduleDay, Member, ScheduleGroup, User } from '../types';
import { PdfIcon, EditIcon, TrashIcon, PlusIcon, QrCodeIcon, CalendarIcon, SearchIcon, CheckIcon, UserIcon, AdminIcon, CloseIcon, ChevronLeftIcon, ChevronRightIcon, KeyIcon, ShareIcon, SpinnerIcon } from './icons';
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

const AdminView: React.FC<AdminViewProps> = (props) => {
    const [editingDayId, setEditingDayId] = useState<string | null>(null);
    const [isSavingPdf, setIsSavingPdf] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [lastSyncUrl, setLastSyncUrl] = useState<string>(window.location.href);
    const [isQrOpen, setIsQrOpen] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');
    const [newCongregationName, setNewCongregationName] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const isSuperAdmin = props.currentUser.email === 'ozeiasof@gmail.com';
    const editingDay = useMemo(() => props.schedule.find(d => d.id === editingDayId), [props.schedule, editingDayId]);

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            const dataToSync = {
                members: props.allMembers,
                users: props.users,
                groups: props.scheduleGroups
            };
            
            const response = await fetch('https://bytebin.org/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSync)
            });

            if (response.ok) {
                const { key } = await response.json();
                const syncUrl = `${window.location.origin}${window.location.pathname}?cloud=${key}${window.location.hash}`;
                setLastSyncUrl(syncUrl);
                navigator.clipboard.writeText(syncUrl);
                alert("Escala publicada com sucesso! O link de atualização foi copiado para sua área de transferência. Compartilhe no grupo da igreja.");
            } else {
                alert("Erro ao publicar na nuvem. Tente novamente.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão ao publicar.");
        } finally {
            setIsPublishing(false);
        }
    };

    const filteredMembers = useMemo(() => {
        const search = memberSearch.toLowerCase().trim();
        return props.allMembers.filter(m => 
            m.name.toLowerCase().includes(search) || 
            m.email.toLowerCase().includes(search)
        );
    }, [props.allMembers, memberSearch]);

    const paginatedMembers = useMemo(() => {
        const startIndex = (currentPage - 1) * MEMBERS_PER_PAGE;
        return filteredMembers.slice(startIndex, startIndex + MEMBERS_PER_PAGE);
    }, [filteredMembers, currentPage]);

    const updateDayField = (id: string, field: keyof ScheduleDay, value: any) => {
        const newSchedule = props.schedule.map(d => d.id === id ? { ...d, [field]: value } : d);
        props.onUpdateSchedule(newSchedule);
    };

    return (
        <div className="space-y-10 pb-20">
            <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} url={lastSyncUrl} />
            <AddMemberModal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} onAdd={props.onAddMember} />

            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-1">
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Painel ADM</span>
                    <h2 className="text-4xl font-black text-black dark:text-white leading-none tracking-tighter">Gerenciamento</h2>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={handlePublish} 
                        disabled={isPublishing}
                        className="flex-1 md:flex-none px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        {isPublishing ? <SpinnerIcon className="w-5 h-5" /> : <ShareIcon className="w-5 h-5" />}
                        {isPublishing ? 'Publicando...' : 'Publicar Escala'}
                    </button>
                    <button onClick={() => setIsQrOpen(true)} className="p-4 bg-white dark:bg-church-surface rounded-2xl border border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:bg-zinc-50 transition-colors shadow-sm"><QrCodeIcon className="w-6 h-6" /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    {/* Editor de Avisos */}
                    <section className="bg-white dark:bg-church-surface p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <EditIcon className="w-6 h-6 text-zinc-400" />
                            <h3 className="text-2xl font-black text-black dark:text-white uppercase tracking-tighter">Avisos da Semana</h3>
                        </div>
                        <textarea 
                            value={props.announcements}
                            onChange={(e) => props.onUpdateAnnouncements(e.target.value)}
                            placeholder="Digite aqui os avisos importantes para os membros..."
                            className="w-full h-32 p-6 bg-zinc-50 dark:bg-church-black border border-zinc-200 dark:border-zinc-800 rounded-3xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                        />
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Clique em "Publicar Escala" após editar os avisos para que todos vejam.</p>
                    </section>

                    <section className="bg-white dark:bg-church-surface p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="text-2xl font-black text-black dark:text-white mb-8">Escala Semanal</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {props.schedule.map(day => (
                                <button 
                                    key={day.id} 
                                    onClick={() => setEditingDayId(day.id)} 
                                    className={`group p-6 rounded-3xl border-2 text-left transition-all duration-300 ${day.active ? 'bg-zinc-50 dark:bg-church-black border-zinc-200 dark:border-zinc-800 hover:border-indigo-400' : 'bg-transparent border-transparent opacity-30'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xl font-black text-black dark:text-white leading-tight">
                                                {day.dayName}
                                                {day.dateLabel && <span className="ml-2 text-zinc-400 font-bold">({day.dateLabel})</span>}
                                            </span>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">
                                                {day.active ? (day.event || 'Atividade Ativa') : 'Sem Programação'}
                                            </p>
                                        </div>
                                        <EditIcon className="w-5 h-5 text-zinc-400" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-white dark:bg-church-surface p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-black dark:text-white">Equipe</h3>
                            <button onClick={() => setIsAddMemberOpen(true)} className="p-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all"><PlusIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="relative mb-6">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input type="text" placeholder="Filtrar membros..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-church-black border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm outline-none font-bold" />
                        </div>
                        <div className="space-y-4">
                            {paginatedMembers.map(m => (
                                <div key={m.id} className="p-4 bg-zinc-50 dark:bg-church-black rounded-3xl flex items-center justify-between border border-transparent hover:border-zinc-200">
                                    <div className="flex items-center gap-4">
                                        <Avatar member={m} className="w-10 h-10" />
                                        <div>
                                            <h4 className="font-black text-sm text-black dark:text-white truncate max-w-[120px]">{m.name}</h4>
                                            <p className="text-[10px] text-zinc-500 uppercase font-black">{m.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => props.onDeleteMember(m.id)} className="p-2 text-zinc-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {editingDay && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-church-surface rounded-[3rem] shadow-2xl w-full max-w-xl p-8 max-h-[90vh] overflow-y-auto custom-scrollbar border border-zinc-200 dark:border-zinc-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black text-black dark:text-white uppercase tracking-tighter">Editar {editingDay.dayName}</h3>
                            <button onClick={() => setEditingDayId(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><CloseIcon className="w-7 h-7 text-black dark:text-white" /></button>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-6 bg-zinc-50 dark:bg-church-black rounded-3xl border border-zinc-200 dark:border-zinc-800">
                                <input type="checkbox" id="day-active" checked={editingDay.active} onChange={e => updateDayField(editingDay.id, 'active', e.target.checked)} className="h-6 w-6 rounded border-zinc-300 text-black" />
                                <label htmlFor="day-active" className="text-lg font-black text-black dark:text-white uppercase tracking-widest">Dia Ativo na Escala</label>
                            </div>
                            {editingDay.active && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Data Específica (Ex: 05)</label>
                                            <input type="text" placeholder="Ex: 05, Dia 12..." value={editingDay.dateLabel || ''} onChange={e => updateDayField(editingDay.id, 'dateLabel', e.target.value)} className="w-full p-5 bg-zinc-50 dark:bg-church-black rounded-2xl border border-zinc-200 font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-zinc-400">Título do Evento</label>
                                            <input type="text" value={editingDay.event} onChange={e => updateDayField(editingDay.id, 'event', e.target.value)} className="w-full p-5 bg-zinc-50 dark:bg-church-black rounded-2xl border border-zinc-200 font-bold" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <MultiSelect label="Dirigentes" allOptions={props.allMembers} selectedOptions={editingDay.worshipLeaders} onChange={s => updateDayField(editingDay.id, 'worshipLeaders', s)} />
                                        <MultiSelect label="Pregadores" allOptions={props.allMembers} selectedOptions={editingDay.preachers} onChange={s => updateDayField(editingDay.id, 'preachers', s)} />
                                        <MultiSelect label="Porteiros" allOptions={props.allMembers} selectedOptions={editingDay.doorkeepers} onChange={s => updateDayField(editingDay.id, 'doorkeepers', s)} />
                                        <MultiSelect label="Cantores de Hinos" allOptions={props.allMembers} selectedOptions={editingDay.hymnSingers} onChange={s => updateDayField(editingDay.id, 'hymnSingers', s)} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setEditingDayId(null)} className="w-full mt-10 py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-3xl shadow-xl hover:opacity-90 active:scale-95 transition-all text-xl uppercase tracking-widest">Salvar e Voltar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminView;

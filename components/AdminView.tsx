
import React, { useState, useMemo } from 'react';
import { Schedule, ScheduleDay, Member, ScheduleGroup, User } from '../types';
import { PdfIcon, EditIcon, TrashIcon, PlusIcon, QrCodeIcon, SearchIcon, UserIcon, CloseIcon, ShareIcon, SpinnerIcon, MicrophoneIcon, KeyIcon, MusicalNoteIcon, BookOpenIcon, AdminIcon, CheckIcon } from './icons';
import MultiSelect from './MultiSelect';
import Avatar from './Avatar';
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

const AdminView: React.FC<AdminViewProps> = (props) => {
    const [editingDayId, setEditingDayId] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isQrOpen, setIsQrOpen] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');

    const editingDay = useMemo(() => props.schedule.find(d => d.id === editingDayId), [props.schedule, editingDayId]);

    const handleSyncCloud = async () => {
        setIsPublishing(true);
        try {
          props.onUpdateSchedule([...props.schedule]);
          props.onUpdateAnnouncements(props.announcements);
          
          setTimeout(() => {
            setIsPublishing(false);
          }, 800);
        } catch (err) {
          console.error(err);
          setIsPublishing(false);
          alert("Erro ao sincronizar. Verifique sua conexão.");
        }
    };

    const updateDayField = (id: string, field: keyof ScheduleDay, value: any) => {
        const newSchedule = props.schedule.map(d => d.id === id ? { ...d, [field]: value } : d);
        props.onUpdateSchedule(newSchedule);
    };

    const handleResetAll = () => {
        if(confirm("Deseja desativar todos os dias da escala?")) {
            const reset = props.schedule.map(d => ({...d, active: false, doorkeepers: [], hymnSingers: [], worshipLeaders: [], preachers: [], dateLabel: ''}));
            props.onUpdateSchedule(reset);
        }
    };

    const handleEnableAll = () => {
        const enabled = props.schedule.map(d => ({...d, active: true}));
        props.onUpdateSchedule(enabled);
    };

    const canPromote = props.currentUser.email.toLowerCase() === 'ozeiasof@gmail.com';

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} url={window.location.href} />
            <AddMemberModal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} onAdd={props.onAddMember} />

            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Gestão Semanal</span>
                    <h2 className="text-4xl font-black text-black dark:text-white leading-none tracking-tighter">Painel da Direção</h2>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={handleSyncCloud}
                        disabled={isPublishing}
                        className="flex-1 md:flex-none px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isPublishing ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <ShareIcon className="w-5 h-5" />}
                        Sincronizar Cloud
                    </button>
                    <button onClick={() => setIsQrOpen(true)} title="Gerar QR Code de Acesso" className="p-4 bg-white dark:bg-church-surface rounded-2xl border border-zinc-200 dark:border-zinc-800 text-black dark:text-white hover:scale-105 transition-all shadow-sm">
                        <QrCodeIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex gap-4">
                        <button onClick={handleEnableAll} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-500 hover:text-white transition-all">Ativar Todos os Dias</button>
                        <button onClick={handleResetAll} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-500 hover:text-white transition-all">Limpar Escala</button>
                    </div>

                    <section className="bg-white dark:bg-church-surface p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <h3 className="text-2xl font-black text-black dark:text-white mb-8">Escala Semanal</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {props.schedule.map(day => (
                                <button 
                                    key={day.id} 
                                    onClick={() => setEditingDayId(day.id)} 
                                    className={`group p-6 rounded-3xl border-2 text-left transition-all duration-300 relative overflow-hidden ${day.active ? 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 shadow-sm' : 'bg-transparent border-dashed border-zinc-200 dark:border-zinc-800 opacity-40 hover:opacity-70'}`}
                                >
                                    <div className="relative z-10 flex justify-between items-start">
                                        <div>
                                            <span className="text-xl font-black text-black dark:text-white leading-tight flex items-center gap-2">
                                                {day.dayName}
                                                {day.dateLabel && <span className="text-sm text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md font-bold">{day.dateLabel}</span>}
                                            </span>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">
                                                {day.active ? (day.event || 'Clique para definir evento') : 'Dia Inativo'}
                                            </p>
                                            
                                            {day.active && (
                                                <div className="flex gap-2 mt-4">
                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${day.worshipLeaders?.length ? 'bg-purple-100 text-purple-600' : 'bg-zinc-100 text-zinc-300'}`} title="Dirigentes"><MicrophoneIcon className="w-3.5 h-3.5" /></div>
                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${day.preachers?.length ? 'bg-orange-100 text-orange-600' : 'bg-zinc-100 text-zinc-300'}`} title="Pregadores"><BookOpenIcon className="w-3.5 h-3.5" /></div>
                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${day.doorkeepers?.length ? 'bg-blue-100 text-blue-600' : 'bg-zinc-100 text-zinc-300'}`} title="Porteiros"><KeyIcon className="w-3.5 h-3.5" /></div>
                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${day.hymnSingers?.length ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-300'}`} title="Cantores/Harpa"><MusicalNoteIcon className="w-3.5 h-3.5" /></div>
                                                </div>
                                            )}
                                        </div>
                                        <EditIcon className="w-5 h-5 text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                    {!day.active && <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-[1px]"></div>}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-church-surface p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"><EditIcon className="w-5 h-5 text-indigo-500" /></div>
                            <h3 className="text-xl font-black text-black dark:text-white uppercase tracking-tighter">Comunicados Gerais</h3>
                        </div>
                        <textarea 
                            value={props.announcements}
                            onChange={(e) => props.onUpdateAnnouncements(e.target.value)}
                            placeholder="Escreva avisos, temas do mês ou escalas extras..."
                            className="w-full h-32 p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-400 transition-all dark:text-white"
                        />
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-white dark:bg-church-surface p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-28">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-black dark:text-white">Membros</h3>
                            <button onClick={() => setIsAddMemberOpen(true)} className="p-3 bg-black dark:bg-white text-white dark:text-black rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all"><PlusIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="relative mb-6">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input type="text" placeholder="Pesquisar..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm outline-none font-bold dark:text-white" />
                        </div>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                            {props.allMembers.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase())).map(m => (
                                <div key={m.id} className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-between border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all">
                                    <div className="flex items-center gap-3">
                                        <Avatar member={m} className="w-8 h-8" />
                                        <div>
                                            <h4 className="font-black text-xs text-black dark:text-white truncate max-w-[100px]">{m.name}</h4>
                                            <p className={`text-[8px] uppercase font-black ${m.role === 'admin' ? 'text-indigo-500' : 'text-zinc-500'}`}>{m.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {canPromote && m.email.toLowerCase() !== 'ozeiasof@gmail.com' && (
                                            <button 
                                                onClick={() => props.onToggleAdmin(m.id)} 
                                                title={m.role === 'admin' ? "Remover Cargo de Admin" : "Tornar Administrador"}
                                                className={`p-2 rounded-lg transition-all ${m.role === 'admin' ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'text-zinc-400 hover:text-indigo-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                                            >
                                                <AdminIcon className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                        <button onClick={() => props.onDeleteMember(m.id)} className="p-2 text-zinc-300 hover:text-red-500 transition-colors"><TrashIcon className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {editingDay && (
                <div className="fixed inset-0 bg-black/90 z-[100] flex justify-center items-center p-4 backdrop-blur-md animate-in fade-in zoom-in-95">
                    <div className="bg-white dark:bg-church-surface rounded-[3.5rem] shadow-2xl w-full max-w-xl p-8 lg:p-12 max-h-[90vh] overflow-y-auto custom-scrollbar border border-zinc-200 dark:border-zinc-800">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-3xl font-black text-black dark:text-white uppercase tracking-tighter">Configurar {editingDay.dayName}</h3>
                                <p className="text-xs font-bold text-zinc-400">Preencha as informações para este culto.</p>
                            </div>
                            <button onClick={() => setEditingDayId(null)} className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all"><CloseIcon className="w-8 h-8 text-black dark:text-white" /></button>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="flex items-center gap-4 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                                <input type="checkbox" id="day-active" checked={editingDay.active} onChange={e => updateDayField(editingDay.id, 'active', e.target.checked)} className="h-6 w-6 rounded border-zinc-300 text-indigo-600" />
                                <label htmlFor="day-active" className="text-lg font-black text-black dark:text-white uppercase">Culto Ativo na Escala</label>
                            </div>

                            {editingDay.active && (
                                <div className="space-y-6 animate-in slide-in-from-top-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Data ou Rótulo (Ex: 15/10)</label>
                                            <input type="text" placeholder="Ex: Dia 20" value={editingDay.dateLabel || ''} onChange={e => updateDayField(editingDay.id, 'dateLabel', e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-400 dark:text-white" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Nome do Evento/Culto</label>
                                            <input type="text" placeholder="Ex: Santa Ceia" value={editingDay.event} onChange={e => updateDayField(editingDay.id, 'event', e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-indigo-400 dark:text-white" />
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-5">
                                        <MultiSelect label="Dirigentes" allOptions={props.allMembers} selectedOptions={editingDay.worshipLeaders} onChange={s => updateDayField(editingDay.id, 'worshipLeaders', s)} />
                                        <MultiSelect label="Pregadores" allOptions={props.allMembers} selectedOptions={editingDay.preachers} onChange={s => updateDayField(editingDay.id, 'preachers', s)} />
                                        <MultiSelect label="Porteiros" allOptions={props.allMembers} selectedOptions={editingDay.doorkeepers} onChange={s => updateDayField(editingDay.id, 'doorkeepers', s)} />
                                        <MultiSelect label="Hinos da Harpa" allOptions={props.allMembers} selectedOptions={editingDay.hymnSingers} onChange={s => updateDayField(editingDay.id, 'hymnSingers', s)} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setEditingDayId(null)} className="w-full mt-10 py-5 bg-black dark:bg-white text-white dark:text-black font-black rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-md uppercase tracking-widest">Concluir Alterações</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminView;

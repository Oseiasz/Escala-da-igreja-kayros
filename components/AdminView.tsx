
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Schedule, ScheduleDay, Member, ScheduleGroup, ScheduleParticipant, User } from '../types';
import { PdfIcon, EditIcon, TrashIcon, AdminIcon, PhoneIcon, CheckIcon, CloseIcon, UserIcon, KeyIcon, MusicalNoteIcon, PlusIcon, QrCodeIcon, MicrophoneIcon, BookOpenIcon, CalendarIcon, SearchIcon, MailIcon } from './icons';
import { exportScheduleToPDF } from '../services/pdfService';
import MultiSelect from './MultiSelect';
import Avatar from './Avatar';
import SchedulePDFView from './SchedulePDFView';
import QRCodeModal from './QRCodeModal';

interface AdminViewProps {
  schedule: Schedule;
  onUpdateSchedule: (newSchedule: Schedule) => void;
  announcements: string;
  onUpdateAnnouncements: (newAnnouncements: string) => void;
  allMembers: Member[];
  users: User[];
  onDeleteMember: (memberId: string) => void;
  onAddMember: (name: string, email: string, phone: string) => void;
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
    const [memberSearch, setMemberSearch] = useState('');
    const [showAddMemberForm, setShowAddMemberForm] = useState(false);
    
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberPhone, setNewMemberPhone] = useState('');

    const filteredMembers = useMemo(() => {
        const search = memberSearch.toLowerCase().trim();
        if (!search) return props.allMembers;
        return props.allMembers.filter(m => 
            m.name.toLowerCase().includes(search) || 
            m.email.toLowerCase().includes(search)
        );
    }, [props.allMembers, memberSearch]);

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMemberName || !newMemberEmail) return;
        props.onAddMember(newMemberName, newMemberEmail, newMemberPhone);
        setNewMemberName('');
        setNewMemberEmail('');
        setNewMemberPhone('');
        setShowAddMemberForm(false);
    };

    const handleToggleAdmin = (memberId: string) => {
        if (memberId === props.currentUser.id) {
            alert("Você não pode remover seus próprios privilégios de administrador por segurança.");
            return;
        }
        props.onToggleAdmin(memberId);
    };

    const isUserRegistered = (memberId: string) => {
        return props.users.some(u => u.memberId === memberId);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {editingDay && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
                    {/* Simplified Edit Modal for brevity - reuse logic from previous versions if needed */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6">
                        <h3 className="text-xl font-black mb-6">Editar {editingDay.dayName}</h3>
                        <MultiSelect label="Dirigente" allOptions={props.allMembers} selectedOptions={editingDay.worshipLeaders} onChange={s => props.onUpdateSchedule(props.schedule.map(d => d.id === editingDay.id ? {...d, worshipLeaders: s} : d))} />
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setEditingDay(null)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold">Fechar</button>
                        </div>
                    </div>
                </div>
            )}
            
            <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} url={window.location.href} />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white">Painel de Gestão</h2>
                    <p className="text-slate-500 font-medium">Configure as escalas e acompanhe quem já se cadastrou.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setIsQrOpen(true)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform"><QrCodeIcon className="w-6 h-6" /></button>
                    <button onClick={async () => { setIsSavingPdf(true); await exportScheduleToPDF('schedule-to-print-admin-offscreen', 'escala.pdf'); setIsSavingPdf(false); }} className="px-6 py-3 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-200 flex items-center gap-2 hover:bg-green-700 transition-colors">
                        <PdfIcon className="w-5 h-5" /> {isSavingPdf ? 'Gerando...' : 'Exportar PDF'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-2"><CalendarIcon className="w-6 h-6 text-indigo-500" /> Escala Semanal</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {props.schedule.map(day => (
                                <div key={day.id} onClick={() => setEditingDay(day)} className={`p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md active:scale-95 ${day.active ? 'bg-indigo-50/50 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60'}`}>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold">{day.dayName}</span>
                                        <EditIcon className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-1 uppercase tracking-widest">{day.active ? day.event || 'Sem Evento' : 'Inativo'}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-xl font-black mb-4">Avisos e Comunicados</h3>
                        <textarea 
                            value={props.announcements}
                            onChange={e => props.onUpdateAnnouncements(e.target.value)}
                            placeholder="Digite os avisos aqui..."
                            className="w-full h-40 p-4 bg-amber-50/50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-900 rounded-2xl focus:ring-2 focus:ring-amber-500 transition-all outline-none text-slate-700 dark:text-slate-200 font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black">Membros da Igreja</h3>
                            <button 
                                onClick={() => setShowAddMemberForm(!showAddMemberForm)}
                                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {showAddMemberForm && (
                            <form onSubmit={handleAddMember} className="mb-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-900 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                <input type="text" placeholder="Nome completo" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} required className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                                <input type="email" placeholder="E-mail" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} required className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                                <input type="text" placeholder="Telefone (opcional)" value={newMemberPhone} onChange={e => setNewMemberPhone(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                                <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition-colors">Cadastrar Membro</button>
                            </form>
                        )}
                        
                        <div className="relative mb-4">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Filtrar por nome..."
                                value={memberSearch}
                                onChange={e => setMemberSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar flex-1">
                            {filteredMembers.map(m => (
                                <div key={m.id} className="flex flex-col p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar member={m} className="w-10 h-10 shadow-sm" />
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm truncate max-w-[120px]">{m.name}</span>
                                                    {isUserRegistered(m.id) && (
                                                        <span className="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider flex items-center gap-1">
                                                            <CheckIcon className="w-2.5 h-2.5" /> Conta Ativa
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">{m.email}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleToggleAdmin(m.id)} className={`p-2 rounded-xl transition-all ${m.role === 'admin' ? 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50' : 'text-slate-300 hover:bg-slate-200'}`} title={m.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}><AdminIcon className="w-4 h-4" /></button>
                                            <button onClick={() => props.onDeleteMember(m.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" title="Excluir"><TrashIcon className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredMembers.length === 0 && (
                                <div className="text-center py-8 text-slate-400 text-sm italic">Nenhum membro encontrado.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', zIndex: -1 }} aria-hidden="true">
                <div id="schedule-to-print-admin-offscreen">
                     <SchedulePDFView schedule={props.schedule} announcements={props.announcements} scheduleName={props.activeScheduleGroupId} />
                </div>
            </div>
        </div>
    );
};

export default AdminView;

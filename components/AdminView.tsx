
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Schedule, ScheduleDay, Member, ScheduleGroup, ScheduleParticipant } from '../types';
import { PdfIcon, EditIcon, TrashIcon, AdminIcon, PhoneIcon, CheckIcon, CloseIcon, UserIcon, KeyIcon, MusicalNoteIcon, PlusIcon, QrCodeIcon, MicrophoneIcon, BookOpenIcon, CalendarIcon } from './icons';
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

interface EditModalProps {
  day: ScheduleDay | null;
  onClose: () => void;
  onSave: (updatedDay: ScheduleDay) => void;
  allMembers: Member[];
}

const EditScheduleModal: React.FC<EditModalProps> = ({ day, allMembers, onClose, onSave }) => {
  const [editedDay, setEditedDay] = useState<ScheduleDay | null>(null);

  useEffect(() => {
    if (day) {
      setEditedDay({ 
          ...day,
          worshipLeaders: day.worshipLeaders || [],
          preachers: day.preachers || []
      });
    }
  }, [day]);

  if (!editedDay) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <h3 className="text-xl font-black mb-6 dark:text-slate-100 flex items-center gap-2">
              <EditIcon className="w-6 h-6 text-indigo-500" />
              Editar {editedDay.dayName}
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
              <input 
                type="checkbox" 
                id="active" 
                checked={editedDay.active}
                onChange={e => setEditedDay(prev => prev ? { ...prev, active: e.target.checked } : null)}
                className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded-lg cursor-pointer"
              />
              <label htmlFor="active" className="block text-sm font-bold text-gray-700 dark:text-slate-300 cursor-pointer">Ativar Programação para este dia</label>
            </div>

            {editedDay.active && (
              <div className="space-y-4">
                <div>
                    <label htmlFor="event" className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Nome do Evento</label>
                    <input
                      type="text"
                      id="event"
                      value={editedDay.event}
                      placeholder="Ex: Culto de Celebração"
                      onChange={e => setEditedDay(prev => prev ? { ...prev, event: e.target.value } : null)}
                      className="block w-full px-4 py-3 bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    />
                </div>
                
                <div className="space-y-4 pt-4 border-t dark:border-slate-700">
                    <MultiSelect label="Dirigente" allOptions={allMembers} selectedOptions={editedDay.worshipLeaders} onChange={s => setEditedDay(p => p ? {...p, worshipLeaders: s} : null)} />
                    <MultiSelect label="Pregador(a)" allOptions={allMembers} selectedOptions={editedDay.preachers} onChange={s => setEditedDay(p => p ? {...p, preachers: s} : null)} />
                    <MultiSelect label="Porteiros" allOptions={allMembers} selectedOptions={editedDay.doorkeepers} onChange={s => setEditedDay(p => p ? {...p, doorkeepers: s} : null)} />
                    <MultiSelect label="Cantores" allOptions={allMembers} selectedOptions={editedDay.hymnSingers} onChange={s => setEditedDay(p => p ? {...p, hymnSingers: s} : null)} />
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 flex flex-row-reverse gap-3 border-t dark:border-slate-700">
          <button onClick={() => onSave(editedDay)} className="bg-indigo-600 text-white font-bold px-6 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-md">Salvar</button>
          <button onClick={onClose} className="text-gray-500 font-bold px-6 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

const AdminView: React.FC<AdminViewProps> = (props) => {
    const [editingDay, setEditingDay] = useState<ScheduleDay | null>(null);
    const [isSavingPdf, setIsSavingPdf] = useState(false);
    const [isQrOpen, setIsQrOpen] = useState(false);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {editingDay && <EditScheduleModal day={editingDay} allMembers={props.allMembers} onClose={() => setEditingDay(null)} onSave={(d) => { props.onUpdateSchedule(props.schedule.map(old => old.id === d.id ? d : old)); setEditingDay(null); }} />}
            <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} url={window.location.href} />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white">Painel de Gestão</h2>
                    <p className="text-slate-500 font-medium">Configure as escalas e avisos da congregação.</p>
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
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-xl font-black mb-4">Membros ({props.allMembers.length})</h3>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {props.allMembers.map(m => (
                                <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <Avatar member={m} className="w-10 h-10" />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm truncate max-w-[120px]">{m.name}</span>
                                            <span className="text-[10px] text-slate-500 font-medium">{m.role === 'admin' ? 'Administrador' : 'Membro'}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => props.onToggleAdmin(m.id)} className={`p-2 rounded-xl transition-colors ${m.role === 'admin' ? 'text-indigo-600 bg-indigo-100' : 'text-slate-400 hover:bg-slate-200'}`}><AdminIcon className="w-4 h-4" /></button>
                                        <button onClick={() => props.onDeleteMember(m.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
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

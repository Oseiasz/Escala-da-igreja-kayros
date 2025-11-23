
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Schedule, ScheduleDay, Member, ScheduleGroup, ScheduleParticipant } from '../types';
import { PdfIcon, EditIcon, TrashIcon, AdminIcon, PhoneIcon, CheckIcon, CloseIcon, UserIcon, KeyIcon, MusicalNoteIcon, PlusIcon, QrCodeIcon } from './icons';
import { exportScheduleToPDF } from '../services/pdfService';
import MultiSelect from './MultiSelect';
import ConfirmationModal from './ConfirmationModal';
import Avatar from './Avatar';
import { sendNewAssignmentNotificationToAdmins } from '../services/emailService';
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
      setEditedDay({ ...day });
    } else {
      setEditedDay(null);
    }
  }, [day]);

  if (!editedDay) return null;

  const handleSave = () => {
    if (editedDay) {
        if(!editedDay.active){
            editedDay.doorkeepers = [];
            editedDay.hymnSingers = [];
            editedDay.event = "";
        }
        onSave(editedDay);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 dark:text-slate-100">Editar Escala Padrão: {editedDay.dayName}</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="active" 
                checked={editedDay.active}
                onChange={e => setEditedDay(prev => prev ? { ...prev, active: e.target.checked } : null)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm font-medium text-gray-700 dark:text-slate-300">Dia Ativo</label>
            </div>

            {editedDay.active && (
              <div>
                <label htmlFor="event" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Nome do Evento</label>
                <input
                  type="text"
                  id="event"
                  value={editedDay.event}
                  onChange={e => setEditedDay(prev => prev ? { ...prev, event: e.target.value } : null)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            )}
            
            {editedDay.active && (
                <div className="space-y-4 pt-4">
                    <MultiSelect
                        label="Porteiros"
                        allOptions={allMembers}
                        selectedOptions={editedDay.doorkeepers}
                        onChange={(newSelection) => setEditedDay(prev => prev ? { ...prev, doorkeepers: newSelection } : null)}
                        placeholder="Buscar ou adicionar porteiros..."
                    />
                    <MultiSelect
                        label="Cantores (Harpa)"
                        allOptions={allMembers}
                        selectedOptions={editedDay.hymnSingers}
                        onChange={(newSelection) => setEditedDay(prev => prev ? { ...prev, hymnSingers: newSelection } : null)}
                        placeholder="Buscar ou adicionar cantores..."
                    />
                </div>
            )}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button onClick={handleSave} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
            Salvar
          </button>
          <button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

const ParticipantChip: React.FC<{ participant: ScheduleParticipant, variant: 'blue' | 'green' }> = ({ participant, variant }) => {
    const colorClasses = variant === 'blue'
        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
        : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300';

    return (
        <div className={`inline-flex items-center gap-1.5 border rounded-full p-0.5 pr-2 shadow-sm ${colorClasses}`}>
            {participant.isRegistered && participant.memberData ? (
                <Avatar member={participant.memberData} className="w-5 h-5 text-[0.55rem]"/>
            ) : (
                <div className="w-5 h-5 bg-white/60 dark:bg-slate-600 rounded-full flex items-center justify-center">
                    <UserIcon className="w-3 h-3 opacity-70" />
                </div>
            )}
            <span className="text-[11px] font-semibold truncate max-w-[85px]">
                {participant.name.split(' ')[0]}
            </span>
        </div>
    );
};

const AdminScheduleCard: React.FC<{ day: ScheduleDay, onEdit: (day: ScheduleDay) => void }> = ({ day, onEdit }) => {
    return (
        <div className={`rounded-lg p-3 sm:p-4 border ${day.active ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className={`font-bold text-lg ${day.active ? 'text-slate-800 dark:text-slate-100' : ''}`}>{day.dayName}</h3>
                    {day.active && <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">{day.event}</p>}
                </div>
                <button onClick={() => onEdit(day)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label={`Editar ${day.dayName}`}>
                    <EditIcon className="w-5 h-5" />
                </button>
            </div>
            {day.active ? (
                <div className="space-y-3">
                    {/* Row for Doorkeepers */}
                    <div className="flex items-start gap-2">
                         <div className="mt-1" title="Porteiros">
                             <KeyIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                         </div>
                         <div className="flex flex-wrap gap-1.5 flex-1">
                             {day.doorkeepers.length > 0 ? (
                                 day.doorkeepers.map(p => <ParticipantChip key={p.id} participant={p} variant="blue" />)
                             ) : (
                                 <span className="text-xs text-slate-400 italic mt-0.5">Vazio</span>
                             )}
                         </div>
                    </div>

                    {/* Row for Singers */}
                    <div className="flex items-start gap-2">
                        <div className="mt-1" title="Cantores">
                            <MusicalNoteIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        </div>
                        <div className="flex flex-wrap gap-1.5 flex-1">
                            {day.hymnSingers.length > 0 ? (
                                day.hymnSingers.map(p => <ParticipantChip key={p.id} participant={p} variant="green" />)
                            ) : (
                                <span className="text-xs text-slate-400 italic mt-0.5">Vazio</span>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-sm italic">Dia inativo</p>
            )}
        </div>
    );
};


const AdminView: React.FC<AdminViewProps> = ({ 
    schedule, onUpdateSchedule, announcements, onUpdateAnnouncements, allMembers, 
    onDeleteMember, onAddMember, currentUser, onToggleAdmin, onUpdateMember,
    scheduleGroups, activeScheduleGroupId, onAddScheduleGroup, onDeleteScheduleGroup, onUpdateScheduleGroupName
}) => {
    const [editingDay, setEditingDay] = useState<ScheduleDay | null>(null);
    const [isSavingPdf, setIsSavingPdf] = useState(false);
    const [isPdfConfirmOpen, setIsPdfConfirmOpen] = useState(false);
    const [isQrOpen, setIsQrOpen] = useState(false);
    const [deletingMember, setDeletingMember] = useState<Member | null>(null);
    const [togglingAdminFor, setTogglingAdminFor] = useState<Member | null>(null);
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [editedName, setEditedName] = useState('');
    const [editedPhone, setEditedPhone] = useState('');
    const [modalAction, setModalAction] = useState<'create' | 'rename' | null>(null);
    const [modalInputValue, setModalInputValue] = useState('');
    const [deletingSchedule, setDeletingSchedule] = useState<ScheduleGroup | null>(null);
    
    // State for new member form
    const [newMemberName, setNewMemberName] = useState('');
    const [newMemberEmail, setNewMemberEmail] = useState('');
    const [newMemberPhone, setNewMemberPhone] = useState('');
    const [addMemberError, setAddMemberError] = useState<string | null>(null);

    const activeScheduleGroup = useMemo(() => 
        scheduleGroups.find(g => g.id === activeScheduleGroupId),
    [scheduleGroups, activeScheduleGroupId]);

    const handleSaveDay = useCallback((updatedDay: ScheduleDay) => {
        const originalDay = schedule.find(d => d.id === updatedDay.id);
        const newAssignments: { member: ScheduleParticipant, day: ScheduleDay, role: string }[] = [];

        if (originalDay) {
            const originalDoorkeeperIds = new Set(originalDay.doorkeepers.map(p => p.id));
            updatedDay.doorkeepers
                .filter(p => !originalDoorkeeperIds.has(p.id))
                .forEach(participant => {
                    newAssignments.push({ member: participant, day: updatedDay, role: 'Porteiro(a)' });
                });

            const originalSingerIds = new Set(originalDay.hymnSingers.map(p => p.id));
            updatedDay.hymnSingers
                .filter(p => !originalSingerIds.has(p.id))
                .forEach(participant => {
                    newAssignments.push({ member: participant, day: updatedDay, role: 'Cantor(a) (Harpa)' });
                });
        }

        if (newAssignments.length > 0) {
            const admins = allMembers.filter(m => m.role === 'admin');
            const registeredNewAssignments = newAssignments
                .filter(a => a.member.isRegistered && a.member.memberData)
                .map(a => ({
                    member: a.member.memberData!,
                    day: a.day,
                    role: a.role
                }));

            if (registeredNewAssignments.length > 0) {
                sendNewAssignmentNotificationToAdmins(admins, registeredNewAssignments);
            }
        }
        
        // CORRECTION: Create the new array and pass it directly.
        // The parent component expects the value, not a callback.
        const updatedSchedule = schedule.map(day => day.id === updatedDay.id ? updatedDay : day);
        onUpdateSchedule(updatedSchedule);
        
        setEditingDay(null);
    }, [schedule, onUpdateSchedule, allMembers]);
    
    const handleSavePdf = async () => {
        setIsSavingPdf(true);
        try {
            const safeName = activeScheduleGroup?.name.replace(/\s+/g, '_') || 'semanal';
            await exportScheduleToPDF('schedule-to-print-admin-offscreen', `escala_${safeName}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF", error);
        } finally {
            setIsSavingPdf(false);
        }
    };
    
    const handleConfirmPdfExport = () => {
        setIsPdfConfirmOpen(false);
        handleSavePdf();
    };

    const confirmDeleteMember = () => {
        if (deletingMember) {
            onDeleteMember(deletingMember.id);
            setDeletingMember(null);
        }
    };
    
    const confirmToggleAdmin = () => {
        if (togglingAdminFor) {
            onToggleAdmin(togglingAdminFor.id);
            setTogglingAdminFor(null);
        }
    };
    
    const handleStartEditMember = (member: Member) => {
        setEditingMemberId(member.id);
        setEditedName(member.name);
        setEditedPhone(member.phone || '');
    };

    const handleCancelEditMember = () => {
        setEditingMemberId(null);
        setEditedName('');
        setEditedPhone('');
    };

    const handleSaveEditMember = () => {
        if (!editingMemberId) return;

        const originalMember = allMembers.find(m => m.id === editingMemberId);
        if (originalMember) {
            onUpdateMember({
                ...originalMember,
                name: editedName.trim(),
                phone: editedPhone.trim(),
            });
        }
        handleCancelEditMember();
    };
    
    const handleStartCreate = () => {
        setModalInputValue('');
        setModalAction('create');
    };

    const handleStartRename = () => {
        setModalInputValue(activeScheduleGroup?.name || '');
        setModalAction('rename');
    };
    
    const handleModalConfirm = () => {
        if (!modalInputValue.trim()) return;
        if (modalAction === 'create') {
            onAddScheduleGroup(modalInputValue.trim());
        } else if (modalAction === 'rename' && activeScheduleGroupId) {
            onUpdateScheduleGroupName(activeScheduleGroupId, modalInputValue.trim());
        }
        setModalAction(null);
        setModalInputValue('');
    };

    const confirmDeleteSchedule = () => {
        if (deletingSchedule) {
            onDeleteScheduleGroup(deletingSchedule.id);
            setDeletingSchedule(null);
        }
    };

    const handleAddNewMember = (e: React.FormEvent) => {
        e.preventDefault();
        setAddMemberError(null);

        const normalizedEmail = newMemberEmail.trim().toLowerCase();
        
        // Check if email already exists
        const emailExists = allMembers.some(member => member.email.toLowerCase() === normalizedEmail);
        
        if (emailExists) {
            setAddMemberError('Este endereço de e-mail já está cadastrado para outro membro.');
            return;
        }

        if (newMemberName.trim() && newMemberEmail.trim()) {
            onAddMember(newMemberName.trim(), newMemberEmail.trim(), newMemberPhone.trim());
            setNewMemberName('');
            setNewMemberEmail('');
            setNewMemberPhone('');
        }
    };

    return (
    <>
        {editingDay && <EditScheduleModal day={editingDay} allMembers={allMembers} onClose={() => setEditingDay(null)} onSave={handleSaveDay} />}
        <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} url={window.location.origin + window.location.pathname} />
        
        <ConfirmationModal
            isOpen={isPdfConfirmOpen}
            onClose={() => setIsPdfConfirmOpen(false)}
            onConfirm={handleConfirmPdfExport}
            title="Confirmar Exportação para PDF"
            message="Você tem certeza que deseja exportar a escala para PDF?"
            confirmButtonText="Sim, Exportar"
            confirmButtonClass="bg-green-600 hover:bg-green-700 focus:ring-green-500"
        />

        <ConfirmationModal
            isOpen={!!deletingMember}
            onClose={() => setDeletingMember(null)}
            onConfirm={confirmDeleteMember}
            title="Confirmar Exclusão de Membro"
            message={<><p>Excluir <strong>{deletingMember?.name}</strong>?</p><p className="mt-2 text-sm text-red-600">Esta ação é irreversível.</p></>}
        />
        
        <ConfirmationModal
            isOpen={!!togglingAdminFor}
            onClose={() => setTogglingAdminFor(null)}
            onConfirm={confirmToggleAdmin}
            title="Confirmar Alteração de Cargo"
            message={ togglingAdminFor?.role === 'admin' ? `Remover privilégios de admin de ${togglingAdminFor?.name}?` : `Tornar ${togglingAdminFor?.name} um admin?`}
        />
        
        {/* Modal for creating/renaming schedules */}
        {modalAction && (
             <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                            {modalAction === 'create' ? 'Criar Nova Escala' : 'Renomear Escala'}
                        </h3>
                        <div className="mt-4">
                            <label htmlFor="scheduleName" className="block text-sm font-medium text-gray-700 dark:text-slate-300">Nome da Escala</label>
                            <input
                                type="text"
                                id="scheduleName"
                                value={modalInputValue}
                                onChange={e => setModalInputValue(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleModalConfirm()}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 dark:text-white border border-slate-300 dark:border-slate-600 rounded-md shadow-sm"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-3 flex flex-row-reverse gap-3">
                        <button onClick={handleModalConfirm} type="button" className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm">
                            Salvar
                        </button>
                        <button onClick={() => setModalAction(null)} type="button" className="inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 sm:text-sm">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        <ConfirmationModal
            isOpen={!!deletingSchedule}
            onClose={() => setDeletingSchedule(null)}
            onConfirm={confirmDeleteSchedule}
            title="Confirmar Exclusão de Escala"
            message={<><p>Excluir a escala <strong>{deletingSchedule?.name}</strong>?</p><p className="mt-2 text-sm text-red-600">Esta ação é irreversível.</p></>}
        />

        {/* Hidden container for PDF generation */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', zIndex: -1 }} aria-hidden="true">
            <div id="schedule-to-print-admin-offscreen">
                 <SchedulePDFView schedule={schedule} announcements={announcements} scheduleName={activeScheduleGroup?.name || ''} />
            </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-200">Painel do Administrador</h2>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsQrOpen(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg shadow-sm hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
                    >
                        <QrCodeIcon className="w-5 h-5"/>
                        QR Code
                    </button>
                    <button
                        onClick={() => setIsPdfConfirmOpen(true)}
                        disabled={isSavingPdf}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400"
                    >
                        <PdfIcon className="w-5 h-5"/>
                        {isSavingPdf ? 'Salvando...' : 'Salvar como PDF'}
                    </button>
                </div>
            </div>
            
             <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg dark:shadow-slate-950/20">
                <h3 className="text-lg sm:text-xl font-bold mb-4 dark:text-slate-200">Gerenciar Escalas</h3>
                <div className="flex flex-wrap items-center gap-4">
                    <button onClick={handleStartCreate} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        + Nova Escala
                    </button>
                    <div className="flex-grow">
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            Editando: <strong className="font-semibold text-slate-800 dark:text-slate-100">{activeScheduleGroup?.name}</strong>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleStartRename} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-md">
                            <EditIcon className="w-4 h-4" /> Renomear
                        </button>
                        <button onClick={() => activeScheduleGroup && setDeletingSchedule(activeScheduleGroup)}
                            disabled={scheduleGroups.length <= 1}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/50 hover:bg-red-100 dark:hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                            title={scheduleGroups.length <= 1 ? "Não é possível excluir a única escala." : ""}
                        >
                            <TrashIcon className="w-4 h-4" /> Excluir
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg dark:shadow-slate-950/20">
                 <h2 className="text-xl sm:text-2xl font-bold text-center text-slate-700 dark:text-slate-200 mb-6">Editar Escala Padrão da Semana</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schedule.map(day => (
                        <AdminScheduleCard key={day.id} day={day} onEdit={setEditingDay} />
                    ))}
                 </div>
                 <div className="mt-6 pt-6 border-t dark:border-slate-700">
                    <h3 className="text-lg sm:text-xl font-bold text-center text-slate-700 dark:text-slate-200 mb-4">Quadro de Avisos</h3>
                    <div className="whitespace-pre-wrap p-4 bg-amber-50 dark:bg-amber-900/50 border-l-4 border-amber-400 dark:border-amber-500 text-amber-800 dark:text-amber-200 rounded-md">
                        {announcements}
                    </div>
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-slate-950/20">
                <h3 className="text-lg sm:text-xl font-bold mb-4 dark:text-slate-200">Editar Avisos</h3>
                <textarea
                    value={announcements}
                    onChange={e => onUpdateAnnouncements(e.target.value)}
                    rows={5}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                    placeholder="Digite os avisos aqui..."
                />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-slate-950/20">
                <h3 className="text-lg sm:text-xl font-bold mb-4 dark:text-slate-200">Gerenciar Membros</h3>
                
                 {/* New Member Form - ADDED HERE */}
                <form onSubmit={handleAddNewMember} className="mb-6 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 uppercase tracking-wider">Cadastrar Novo Membro</h4>
                    
                    {addMemberError && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-sm rounded">
                            {addMemberError}
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                            type="text"
                            placeholder="Nome Completo"
                            required
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                        />
                        <input
                            type="email"
                            placeholder="E-mail"
                            required
                            value={newMemberEmail}
                            onChange={(e) => {
                                setNewMemberEmail(e.target.value);
                                if (addMemberError) setAddMemberError(null);
                            }}
                            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                        />
                        <div className="flex gap-2">
                             <input
                                type="text"
                                placeholder="Telefone (Opcional)"
                                value={newMemberPhone}
                                onChange={(e) => setNewMemberPhone(e.target.value)}
                                className="flex-grow px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:text-white"
                            />
                            <button
                                type="submit"
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </form>

                <div className="max-h-96 overflow-y-auto pr-2">
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                        {allMembers.map(member => (
                        <li key={member.id} className="flex flex-col sm:flex-row justify-between sm:items-center py-3 gap-2">
                             <div className="flex items-center gap-3 flex-grow">
                                <Avatar member={member} className="w-10 h-10" />
                                { editingMemberId === member.id ? (
                                    <div className="flex-grow space-y-1">
                                        <input type="text" value={editedName} onChange={e => setEditedName(e.target.value)} className="w-full text-sm p-1 border rounded-md" aria-label="Editar nome"/>
                                        <input type="text" value={editedPhone} onChange={e => setEditedPhone(e.target.value)} placeholder="Telefone" className="w-full text-sm p-1 border rounded-md" aria-label="Editar telefone"/>
                                    </div>
                                ) : (
                                    <div className="flex-grow">
                                        <p className="font-medium text-slate-800 dark:text-slate-100">{member.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                                        {member.phone && (<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5"><PhoneIcon className="w-3 h-3"/>{member.phone}</p>)}
                                    </div>
                                )}
                                {member.role === 'admin' && editingMemberId !== member.id && ( <span className="px-2 py-1 text-xs font-semibold text-indigo-800 bg-indigo-100 dark:text-indigo-200 dark:bg-indigo-900/50 rounded-full self-start">Admin</span> )}
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                                { editingMemberId === member.id ? (
                                    <>
                                        <button onClick={handleSaveEditMember} className="p-2 text-green-600 rounded-full hover:bg-green-100" aria-label="Salvar"><CheckIcon className="w-5 h-5"/></button>
                                        <button onClick={handleCancelEditMember} className="p-2 text-slate-500 rounded-full hover:bg-slate-100" aria-label="Cancelar"><CloseIcon className="w-5 h-5"/></button>
                                    </>
                                ) : (
                                    <>
                                        {member.id !== 'admin' && (<button onClick={() => handleStartEditMember(member)} className="p-2 text-slate-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50" aria-label={`Editar ${member.name}`}><EditIcon className="w-5 h-5" /></button>)}
                                        {currentUser.id !== member.id && member.id !== 'admin' && (<button onClick={() => setTogglingAdminFor(member)} className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${member.role === 'admin' ? 'text-amber-700 bg-amber-50' : 'text-indigo-700 bg-indigo-50'}`} aria-label={member.role === 'admin' ? `Remover admin de ${member.name}` : `Tornar ${member.name} admin`}><AdminIcon className="w-4 h-4" /> <span className="hidden sm:inline">{member.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}</span></button>)}
                                        {member.id !== 'admin' && (<button onClick={() => setDeletingMember(member)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-50 disabled:text-slate-300" aria-label={`Excluir ${member.name}`} disabled={member.role === 'admin'} title={member.role === 'admin' ? "Remova o cargo de 'Admin' para poder excluir" : ""}><TrashIcon className="w-5 h-5" /></button>)}
                                    </>
                                )}
                            </div>
                        </li>
                        ))}
                    </ul>
                </div>
            </div>

        </div>
    </>
  );
};

export default AdminView;

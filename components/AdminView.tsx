
import React, { useState, useCallback, useEffect } from 'react';
import { Schedule, ScheduleDay, Member } from '../types';
import { PdfIcon, EditIcon, TrashIcon, AdminIcon, PhoneIcon, CheckIcon, CloseIcon } from './icons';
import { exportScheduleToPDF } from '../services/pdfService';
import MultiSelect from './MultiSelect';
import ConfirmationModal from './ConfirmationModal';
import Avatar from './Avatar';
import { sendNewAssignmentNotificationToAdmins } from '../services/emailService';

interface AdminViewProps {
  schedule: Schedule;
  setSchedule: React.Dispatch<React.SetStateAction<Schedule>>;
  announcements: string;
  setAnnouncements: React.Dispatch<React.SetStateAction<string>>;
  allMembers: Member[];
  onDeleteMember: (memberId: string) => void;
  currentUser: Member;
  onToggleAdmin: (memberId: string) => void;
  onUpdateMember: (member: Member) => void;
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
    // When the modal is opened with a new day, update our internal state
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
                        placeholder="Buscar porteiros..."
                    />
                    <MultiSelect
                        label="Cantores (Harpa)"
                        allOptions={allMembers}
                        selectedOptions={editedDay.hymnSingers}
                        onChange={(newSelection) => setEditedDay(prev => prev ? { ...prev, hymnSingers: newSelection } : null)}
                        placeholder="Buscar cantores..."
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

const AdminMemberList: React.FC<{ members: Member[] }> = ({ members }) => {
    if (members.length === 0) {
        return <p className="text-sm text-slate-500 dark:text-slate-400 italic">Ninguém escalado.</p>;
    }
    return (
        <ul className="space-y-2">
            {members.map(member => (
                <li key={member.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Avatar member={member} className="w-5 h-5"/>
                    <span>{member.name}</span>
                </li>
            ))}
        </ul>
    );
};

const AdminScheduleCard: React.FC<{ day: ScheduleDay, onEdit: (day: ScheduleDay) => void }> = ({ day, onEdit }) => {
    return (
        <div className={`rounded-lg p-3 sm:p-4 border ${day.active ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className={`font-bold text-lg ${day.active ? 'text-slate-800 dark:text-slate-100' : ''}`}>{day.dayName}</h3>
                    {day.active && <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold mb-3">{day.event}</p>}
                </div>
                <button onClick={() => onEdit(day)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label={`Editar ${day.dayName}`}>
                    <EditIcon className="w-5 h-5" />
                </button>
            </div>
            {day.active ? (
                <div className="space-y-3 mt-1">
                    <div>
                        <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400 mb-1">Porteiros</h4>
                        <AdminMemberList members={day.doorkeepers} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400 mb-1">Cantores (Harpa)</h4>
                        <AdminMemberList members={day.hymnSingers} />
                    </div>
                </div>
            ) : (
                <p className="text-sm italic mt-4">Dia inativo</p>
            )}
        </div>
    );
};


const AdminView: React.FC<AdminViewProps> = ({ schedule, setSchedule, announcements, setAnnouncements, allMembers, onDeleteMember, currentUser, onToggleAdmin, onUpdateMember }) => {
    const [editingDay, setEditingDay] = useState<ScheduleDay | null>(null);
    const [isSavingPdf, setIsSavingPdf] = useState(false);
    const [deletingMember, setDeletingMember] = useState<Member | null>(null);
    const [togglingAdminFor, setTogglingAdminFor] = useState<Member | null>(null);
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [editedName, setEditedName] = useState('');
    const [editedPhone, setEditedPhone] = useState('');

    const handleSaveDay = useCallback((updatedDay: ScheduleDay) => {
        const originalDay = schedule.find(d => d.id === updatedDay.id);
        const newAssignments: { member: Member, day: ScheduleDay, role: string }[] = [];

        if (originalDay) {
            // Find newly added doorkeepers
            const originalDoorkeeperIds = new Set(originalDay.doorkeepers.map(m => m.id));
            updatedDay.doorkeepers
                .filter(m => !originalDoorkeeperIds.has(m.id))
                .forEach(member => {
                    newAssignments.push({ member, day: updatedDay, role: 'Porteiro(a)' });
                });

            // Find newly added hymn singers
            const originalSingerIds = new Set(originalDay.hymnSingers.map(m => m.id));
            updatedDay.hymnSingers
                .filter(m => !originalSingerIds.has(m.id))
                .forEach(member => {
                    newAssignments.push({ member, day: updatedDay, role: 'Cantor(a) (Harpa)' });
                });
        }

        // If there are new assignments, notify admins
        if (newAssignments.length > 0) {
            const admins = allMembers.filter(m => m.role === 'admin');
            sendNewAssignmentNotificationToAdmins(admins, newAssignments);
        }
        
        setSchedule(prevSchedule => 
            prevSchedule.map(day => day.id === updatedDay.id ? updatedDay : day)
        );
        setEditingDay(null);
    }, [schedule, setSchedule, allMembers]);
    
    const handleSavePdf = async () => {
        setIsSavingPdf(true);
        try {
            await exportScheduleToPDF('schedule-to-print-admin', `escala_semanal.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF", error);
        } finally {
            setIsSavingPdf(false);
        }
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
    
    const handleStartEdit = (member: Member) => {
        setEditingMemberId(member.id);
        setEditedName(member.name);
        setEditedPhone(member.phone || '');
    };

    const handleCancelEdit = () => {
        setEditingMemberId(null);
        setEditedName('');
        setEditedPhone('');
    };

    const handleSaveEdit = () => {
        if (!editingMemberId) return;

        const originalMember = allMembers.find(m => m.id === editingMemberId);
        if (originalMember) {
            onUpdateMember({
                ...originalMember,
                name: editedName.trim(),
                phone: editedPhone.trim(),
            });
        }
        handleCancelEdit(); // Reset state
    };

    return (
    <>
        {editingDay && <EditScheduleModal day={editingDay} allMembers={allMembers} onClose={() => setEditingDay(null)} onSave={handleSaveDay} />}
        
        <ConfirmationModal
            isOpen={!!deletingMember}
            onClose={() => setDeletingMember(null)}
            onConfirm={confirmDeleteMember}
            title="Confirmar Exclusão de Membro"
            message={
                <>
                    <p>Você tem certeza que deseja excluir <strong>{deletingMember?.name}</strong>?</p>
                    <p className="mt-2 text-sm text-red-600">
                        Esta ação é irreversível. O membro será removido de todas as escalas e sua conta de usuário será permanentemente deletada.
                    </p>
                </>
            }
        />
        
        <ConfirmationModal
            isOpen={!!togglingAdminFor}
            onClose={() => setTogglingAdminFor(null)}
            onConfirm={confirmToggleAdmin}
            title="Confirmar Alteração de Cargo"
            message={
                togglingAdminFor?.role === 'admin' ? (
                <>
                    <p>Você tem certeza que deseja remover os privilégios de administrador de <strong>{togglingAdminFor?.name}</strong>?</p>
                    <p className="mt-2 text-sm text-yellow-700">
                    Ele(a) perderá o acesso ao painel de administração.
                    </p>
                </>
                ) : (
                <>
                    <p>Você tem certeza que deseja tornar <strong>{togglingAdminFor?.name}</strong> um administrador?</p>
                    <p className="mt-2 text-sm text-yellow-700">
                    Ele(a) terá acesso total para editar escalas, avisos e gerenciar membros.
                    </p>
                </>
                )
            }
        />

        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-200">Painel do Administrador</h2>
                <button
                    onClick={handleSavePdf}
                    disabled={isSavingPdf}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400"
                >
                    <PdfIcon className="w-5 h-5"/>
                    {isSavingPdf ? 'Salvando...' : 'Salvar como PDF'}
                </button>
            </div>
            
            <div id="schedule-to-print-admin" className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg dark:shadow-slate-950/20">
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
                    onChange={e => setAnnouncements(e.target.value)}
                    rows={5}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                    placeholder="Digite os avisos aqui..."
                />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-slate-950/20">
                <h3 className="text-lg sm:text-xl font-bold mb-4 dark:text-slate-200">Gerenciar Membros</h3>
                <div className="max-h-96 overflow-y-auto pr-2">
                    <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                        {allMembers.map(member => (
                        <li key={member.id} className="flex flex-col sm:flex-row justify-between sm:items-center py-3 gap-2">
                             <div className="flex items-center gap-3 flex-grow">
                                <Avatar member={member} className="w-10 h-10" />
                                { editingMemberId === member.id ? (
                                    <div className="flex-grow space-y-1">
                                        <input
                                            type="text"
                                            value={editedName}
                                            onChange={e => setEditedName(e.target.value)}
                                            className="w-full text-sm p-1 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-700"
                                            aria-label="Editar nome"
                                        />
                                        <input
                                            type="text"
                                            value={editedPhone}
                                            onChange={e => setEditedPhone(e.target.value)}
                                            placeholder="Telefone"
                                            className="w-full text-sm p-1 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-700"
                                            aria-label="Editar telefone"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-grow">
                                        <p className="font-medium text-slate-800 dark:text-slate-100">{member.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                                        {member.phone && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                                                <PhoneIcon className="w-3 h-3"/>
                                                {member.phone}
                                            </p>
                                        )}
                                    </div>
                                )}
                                
                                {member.role === 'admin' && editingMemberId !== member.id && (
                                    <span className="px-2 py-1 text-xs font-semibold text-indigo-800 bg-indigo-100 dark:text-indigo-200 dark:bg-indigo-900/50 rounded-full self-start">
                                        Admin
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                                { editingMemberId === member.id ? (
                                    <>
                                        <button onClick={handleSaveEdit} className="p-2 text-green-600 hover:text-green-800 rounded-full hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors" aria-label="Salvar alterações">
                                            <CheckIcon className="w-5 h-5"/>
                                        </button>
                                        <button onClick={handleCancelEdit} className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" aria-label="Cancelar edição">
                                            <CloseIcon className="w-5 h-5"/>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {member.id !== 'admin' && (
                                            <button onClick={() => handleStartEdit(member)} className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors" aria-label={`Editar ${member.name}`}>
                                                <EditIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                        {currentUser.id !== member.id && member.id !== 'admin' && (
                                             <button
                                                onClick={() => setTogglingAdminFor(member)}
                                                className={`px-3 py-1.5 rounded-full transition-colors text-sm font-medium flex items-center gap-1.5 ${
                                                    member.role === 'admin'
                                                    ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/50 dark:text-amber-200 dark:hover:bg-amber-900'
                                                    : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-200 dark:hover:bg-indigo-900'
                                                }`}
                                                aria-label={member.role === 'admin' ? `Remover admin de ${member.name}` : `Tornar ${member.name} admin`}
                                            >
                                                <AdminIcon className="w-4 h-4" />
                                                <span className="hidden sm:inline">{member.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}</span>
                                            </button>
                                        )}
                                        {member.id !== 'admin' && (
                                            <button
                                                onClick={() => setDeletingMember(member)}
                                                className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:bg-transparent"
                                                aria-label={`Excluir ${member.name}`}
                                                disabled={member.role === 'admin'}
                                                title={member.role === 'admin' ? "Remova o cargo de 'Admin' para poder excluir" : ""}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        )}
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
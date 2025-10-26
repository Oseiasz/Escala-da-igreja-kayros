import React, { useMemo, useRef } from 'react';
import { Member, Schedule } from '../types';
import { CloseIcon, PhoneIcon, MailIcon, EditIcon } from './icons';
import Avatar from './Avatar';

interface ProfileModalProps {
  member: Member | null;
  schedule: Schedule;
  onClose: () => void;
  currentUser: Member | null;
  onUpdateAvatar: (memberId: string, avatarDataUrl: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ member, schedule, onClose, currentUser, onUpdateAvatar }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!member) return null;
  
  const isCurrentUser = currentUser?.id === member.id;

  const weeklyTasks = useMemo(() => {
    const tasks: { dayName: string, role: string }[] = [];
    schedule.forEach(day => {
        if (day.doorkeepers.some(m => m.id === member.id)) {
            tasks.push({ dayName: day.dayName, role: 'Porteiro(a)' });
        }
        if (day.hymnSingers.some(m => m.id === member.id)) {
            tasks.push({ dayName: day.dayName, role: 'Cantor(a) (Harpa)' });
        }
    });
    return tasks;
  }, [member, schedule]);
  
  const handleAvatarClick = () => {
    if (isCurrentUser) {
        fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && member) {
          const MAX_SIZE_MB = 2;
          if (file.size > MAX_SIZE_MB * 1024 * 1024) {
              alert(`O arquivo é muito grande. O tamanho máximo permitido é ${MAX_SIZE_MB}MB.`);
              event.target.value = '';
              return;
          }

          const reader = new FileReader();
          reader.onload = (loadEvent) => {
              const result = loadEvent.target?.result;
              if (typeof result === 'string') {
                  onUpdateAvatar(member.id, result);
              }
          };
          reader.readAsDataURL(file);
      }
      // Reset the input value to allow re-uploading the same file
      event.target.value = '';
  };


  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-label="Fechar perfil"
            >
                <CloseIcon className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 mb-4">
                    <Avatar member={member} className="w-24 h-24" />
                     {isCurrentUser && (
                        <>
                            <button
                                onClick={handleAvatarClick}
                                className="absolute -bottom-1 -right-1 bg-white p-2 rounded-full shadow-lg hover:bg-slate-100 transition-colors border border-slate-200"
                                aria-label="Alterar foto do perfil"
                            >
                                <EditIcon className="w-5 h-5 text-slate-600" />
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </>
                    )}
                </div>
                <h3 id="profile-modal-title" className="text-2xl font-bold text-slate-800">{member.name}</h3>
            </div>
        </div>

        <div className="px-6 pb-6 space-y-4">
             <div>
                <h4 className="font-semibold text-slate-600 mb-2">Contato</h4>
                <div className="space-y-2 text-sm text-slate-700">
                    <div className="flex items-center gap-3">
                        <PhoneIcon className="w-5 h-5 text-slate-400" />
                        <a href={`tel:${member.phone}`} className="hover:text-indigo-600">{member.phone}</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <MailIcon className="w-5 h-5 text-slate-400" />
                        <a href={`mailto:${member.email}`} className="hover:text-indigo-600">{member.email}</a>
                    </div>
                </div>
             </div>

             <div>
                <h4 className="font-semibold text-slate-600 mb-2">Escalas da Semana</h4>
                {weeklyTasks.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                        {weeklyTasks.map((task, index) => (
                            <li key={index} className="flex justify-between p-2 bg-slate-50 rounded-md">
                                <span className="font-medium text-slate-800">{task.dayName}</span>
                                <span className="text-slate-600">{task.role}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-slate-500 italic p-2 bg-slate-50 rounded-md">
                        Nenhuma tarefa atribuída esta semana.
                    </p>
                )}
             </div>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 rounded-b-2xl">
            <button 
                onClick={onClose} 
                type="button" 
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            >
                Fechar
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
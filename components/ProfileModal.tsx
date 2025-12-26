
import React, { useMemo, useRef, useState } from 'react';
import { Member, Schedule } from '../types';
import { CloseIcon, PhoneIcon, MailIcon, CameraIcon, TrashIcon } from './icons';
import Avatar from './Avatar';
import ConfirmationModal from './ConfirmationModal';

interface ProfileModalProps {
  member: Member | null;
  schedule: Schedule;
  onClose: () => void;
  currentUser: Member | null;
  onUpdateAvatar: (memberId: string, avatarDataUrl: string) => void;
  onDeleteAccount: (memberId: string) => void;
}

// Helper function to resize and compress images to prevent localStorage overflow
const resizeAndCompressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 300;
                const MAX_HEIGHT = 300;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    // Compress to JPEG at 70% quality to save space
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                } else {
                    reject(new Error('Canvas context not available'));
                }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = readerEvent.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};

const ProfileModal: React.FC<ProfileModalProps> = ({ member, schedule, onClose, currentUser, onUpdateAvatar, onDeleteAccount }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  if (!member) return null;
  
  const isCurrentUser = currentUser?.id === member.id;

  const memberRoles = useMemo(() => {
    if (!member) return [];
    const roles = new Set<string>();

    if (member.role === 'admin') {
        roles.add('Administrador');
    }

    const isDoorkeeper = schedule.some(day => day.active && day.doorkeepers.some(p => p.id === member.id));
    if (isDoorkeeper) {
        roles.add('Porteiro(a)');
    }

    const isHymnSinger = schedule.some(day => day.active && day.hymnSingers.some(p => p.id === member.id));
    if (isHymnSinger) {
        roles.add('Cantor(a)');
    }

    return Array.from(roles);
  }, [member, schedule]);

  const upcomingTasks = useMemo(() => {
    if (!member) return [];

    const tasks: { dayLabel: string; event: string; role: string }[] = [];
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

    const todaySchedule = schedule.find(day => day.dayName === dayNames[today.getDay()]);
    if (todaySchedule?.active) {
        if (todaySchedule.doorkeepers.some(p => p.id === member.id)) {
            tasks.push({ dayLabel: 'Hoje', event: todaySchedule.event, role: 'Porteiro(a)' });
        }
        if (todaySchedule.hymnSingers.some(p => p.id === member.id)) {
            tasks.push({ dayLabel: 'Hoje', event: todaySchedule.event, role: 'Cantor(a) (Harpa)' });
        }
    }

    const tomorrowSchedule = schedule.find(day => day.dayName === dayNames[tomorrow.getDay()]);
    if (tomorrowSchedule?.active) {
        if (tomorrowSchedule.doorkeepers.some(p => p.id === member.id)) {
            tasks.push({ dayLabel: 'Amanhã', event: tomorrowSchedule.event, role: 'Porteiro(a)' });
        }
        if (tomorrowSchedule.hymnSingers.some(p => p.id === member.id)) {
            tasks.push({ dayLabel: 'Amanhã', event: tomorrowSchedule.event, role: 'Cantor(a) (Harpa)' });
        }
    }

    return tasks;
}, [member, schedule]);

  const weeklyTasks = useMemo(() => {
    const tasks: { dayName: string, role: string }[] = [];
    schedule.forEach(day => {
        if (day.active) {
            if (day.doorkeepers.some(p => p.id === member.id)) {
                tasks.push({ dayName: day.dayName, role: 'Porteiro(a)' });
            }
            if (day.hymnSingers.some(p => p.id === member.id)) {
                tasks.push({ dayName: day.dayName, role: 'Cantor(a) (Harpa)' });
            }
        }
    });
    return tasks;
  }, [member, schedule]);
  
  const handleAvatarClick = () => {
    if (isCurrentUser) {
        fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && member) {
          if (!file.type.startsWith('image/')) {
              alert('Por favor, selecione um arquivo de imagem válido.');
              return;
          }
          
          setIsProcessing(true);
          try {
             const compressedDataUrl = await resizeAndCompressImage(file);
             onUpdateAvatar(member.id, compressedDataUrl);
          } catch (error) {
             console.error('Erro ao processar imagem:', error);
             alert('Ocorreu um erro ao processar a imagem. Tente novamente com outra foto.');
          } finally {
             setIsProcessing(false);
             if (event.target) event.target.value = '';
          }
      }
  };

  const handleDeleteConfirm = () => {
      onDeleteAccount(member.id);
      setIsDeleteConfirmOpen(false);
      onClose();
  };

  return (
    <>
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 backdrop-blur-sm" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm transform transition-all max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Fechar perfil"
            >
                <CloseIcon className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center">
                <div className="relative w-28 h-28 mb-4 group">
                    <Avatar member={member} className="w-28 h-28 shadow-xl" />
                     {isCurrentUser && (
                        <>
                            <button
                                onClick={handleAvatarClick}
                                disabled={isProcessing}
                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                                aria-label="Alterar foto do perfil"
                            >
                                <CameraIcon className="w-8 h-8 text-white drop-shadow-md" />
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
                    {isProcessing && (
                         <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 rounded-full z-30">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                         </div>
                    )}
                </div>
                <h3 id="profile-modal-title" className="text-2xl font-black text-slate-800 dark:text-slate-100 text-center">{member.name}</h3>
                {memberRoles.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                        {memberRoles.map(role => (
                            <span key={role} className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/50 rounded-full">
                                {role}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>

        <div className="px-8 py-6 space-y-6 overflow-y-auto custom-scrollbar">
             <div>
                <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-3 ml-1">Contato</h4>
                <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <PhoneIcon className="w-5 h-5 text-indigo-500" />
                        <a href={`tel:${member.phone}`} className="font-bold hover:text-indigo-600 dark:hover:text-indigo-400">{member.phone || 'Não informado'}</a>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <MailIcon className="w-5 h-5 text-indigo-500" />
                        <a href={`mailto:${member.email}`} className="font-bold hover:text-indigo-600 dark:hover:text-indigo-400 truncate">{member.email}</a>
                    </div>
                </div>
             </div>

             {upcomingTasks.length > 0 && (
                <div>
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-3 ml-1">Próximas Tarefas</h4>
                    <div className="space-y-2">
                        {upcomingTasks.map((task, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                                <div>
                                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{task.dayLabel}</span>
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-medium uppercase tracking-tighter">{task.event}</p>
                                </div>
                                <span className="text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase">{task.role}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

             {isCurrentUser && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="font-black text-xs uppercase tracking-widest text-red-500 mb-3 ml-1">Zona de Perigo</h4>
                    <button 
                        onClick={() => setIsDeleteConfirmOpen(true)}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all font-bold text-sm"
                    >
                        <TrashIcon className="w-5 h-5" />
                        Excluir Minha Conta
                    </button>
                </div>
             )}
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-900 p-6 border-t border-slate-200 dark:border-slate-700">
            <button 
                onClick={onClose} 
                className="w-full py-4 text-sm font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
                Fechar
            </button>
        </div>
      </div>
    </div>

    <ConfirmationModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Excluir Conta Permanentemente?"
        message={
            <div className="space-y-2">
                <p>Esta ação não pode ser desfeita. Ao excluir sua conta:</p>
                <ul className="list-disc list-inside text-xs space-y-1">
                    <li>Seu acesso ao sistema será revogado imediatamente.</li>
                    <li>Suas informações de perfil serão apagadas.</li>
                    <li>Você será removido das escalas futuras.</li>
                </ul>
            </div>
        }
        confirmButtonText="Sim, Excluir Conta"
    />
    </>
  );
};

export default ProfileModal;


import React from 'react';
import { Member, ScheduleDay, ScheduleParticipant } from '../types';
import { CloseIcon, UserIcon, KeyIcon, MusicalNoteIcon, MicrophoneIcon, BookOpenIcon } from './icons';
import Avatar from './Avatar';

interface ScheduleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date?: Date;
  daySchedule?: ScheduleDay;
  onMemberClick: (member: Member) => void;
}

const DetailParticipantChip: React.FC<{ participant: ScheduleParticipant, variant: 'blue' | 'green' | 'purple' | 'orange', onMemberClick: (m: Member) => void }> = ({ participant, variant, onMemberClick }) => {
    let colorClasses = '';
    switch(variant) {
        case 'blue':
            colorClasses = 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
            break;
        case 'green':
            colorClasses = 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300';
            break;
        case 'purple':
            colorClasses = 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-300';
            break;
        case 'orange':
            colorClasses = 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300';
            break;
    }

    return (
        <div className={`inline-flex items-center gap-2 border rounded-full p-1 pr-3 shadow-sm ${colorClasses}`}>
            {participant.isRegistered && participant.memberData ? (
                <button onClick={() => onMemberClick(participant.memberData!)} className="flex items-center gap-2 focus:outline-none">
                     <Avatar member={participant.memberData} className="w-6 h-6 text-[0.6rem]"/>
                     <span className="text-xs font-semibold hover:underline">
                         {participant.name.split(' ')[0]}
                     </span>
                </button>
            ) : (
                <div className="flex items-center gap-2">
                     <div className="w-6 h-6 bg-white/60 dark:bg-slate-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-3 h-3 opacity-70" />
                    </div>
                    <span className="text-xs font-semibold">{participant.name.split(' ')[0]}</span>
                </div>
            )}
        </div>
    );
};


const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({ isOpen, onClose, date, daySchedule, onMemberClick }) => {
  if (!isOpen || !date || !daySchedule) return null;

  const formattedDate = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-detail-title"
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b dark:border-slate-700">
            <div className="flex justify-between items-start">
                <div>
                    <h3 id="schedule-detail-title" className="text-xl font-bold text-slate-800 dark:text-slate-100">{daySchedule.event}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{formattedDate}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    aria-label="Fechar detalhes"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
        
        <div className="p-6 space-y-5">
             {/* Worship Leader */}
             {(daySchedule.worshipLeaders && daySchedule.worshipLeaders.length > 0) && (
                <div className="flex items-start gap-3">
                    <div className="mt-1.5 p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-full text-purple-600 dark:text-purple-400" title="Dirigente">
                        <MicrophoneIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Dirigente</h4>
                        <div className="flex flex-wrap gap-2">
                             {daySchedule.worshipLeaders.map(p => (
                                   <DetailParticipantChip key={p.id} participant={p} variant="purple" onMemberClick={onMemberClick} />
                               ))}
                        </div>
                    </div>
                </div>
             )}

             {/* Preacher */}
             {(daySchedule.preachers && daySchedule.preachers.length > 0) && (
                 <div className="flex items-start gap-3">
                     <div className="mt-1.5 p-1.5 bg-orange-100 dark:bg-orange-900/50 rounded-full text-orange-600 dark:text-orange-400" title="Pregador">
                         <BookOpenIcon className="w-5 h-5" />
                     </div>
                     <div className="flex-1">
                         <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Pregador(a)</h4>
                         <div className="flex flex-wrap gap-2">
                             {daySchedule.preachers.map(p => (
                                   <DetailParticipantChip key={p.id} participant={p} variant="orange" onMemberClick={onMemberClick} />
                               ))}
                         </div>
                     </div>
                 </div>
             )}

             {/* Doorkeepers */}
             <div className="flex items-start gap-3">
                 <div className="mt-1.5 p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-400" title="Porteiros">
                     <KeyIcon className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                     <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Porteiros</h4>
                     <div className="flex flex-wrap gap-2">
                        {daySchedule.doorkeepers.length > 0 ? (
                            daySchedule.doorkeepers.map(p => (
                                <DetailParticipantChip key={p.id} participant={p} variant="blue" onMemberClick={onMemberClick} />
                            ))
                        ) : (
                            <span className="text-sm text-slate-400 dark:text-slate-500 italic">Ninguém escalado</span>
                        )}
                     </div>
                 </div>
             </div>

             {/* Singers */}
             <div className="flex items-start gap-3">
                 <div className="mt-1.5 p-1.5 bg-green-100 dark:bg-green-900/50 rounded-full text-green-600 dark:text-green-400" title="Cantores">
                     <MusicalNoteIcon className="w-5 h-5" />
                 </div>
                 <div className="flex-1">
                     <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Cantores</h4>
                     <div className="flex flex-wrap gap-2">
                        {daySchedule.hymnSingers.length > 0 ? (
                            daySchedule.hymnSingers.map(p => (
                                <DetailParticipantChip key={p.id} participant={p} variant="green" onMemberClick={onMemberClick} />
                            ))
                        ) : (
                            <span className="text-sm text-slate-400 dark:text-slate-500 italic">Ninguém escalado</span>
                        )}
                     </div>
                 </div>
             </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-900 px-6 py-3 rounded-b-lg text-right">
            <button 
                onClick={onClose} 
                type="button" 
                className="inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            >
                Fechar
            </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailModal;

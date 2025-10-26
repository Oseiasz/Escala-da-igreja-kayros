import React from 'react';
import { Member, ScheduleDay } from '../types';
import { CloseIcon, UserIcon } from './icons';

interface ScheduleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date?: Date;
  daySchedule?: ScheduleDay;
  onMemberClick: (member: Member) => void;
}

const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({ isOpen, onClose, date, daySchedule, onMemberClick }) => {
  if (!isOpen || !date || !daySchedule) return null;

  const renderMemberList = (members: Member[]) => (
    <ul className="space-y-1">
        {members.map(m => (
            <li key={m.id} className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-slate-400"/>
                <button
                    onClick={() => onMemberClick(m)}
                    className="text-left hover:text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                >
                    {m.name}
                </button>
            </li>
        ))}
    </ul>
  );

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
        className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b">
            <div className="flex justify-between items-start">
                <div>
                    <h3 id="schedule-detail-title" className="text-xl font-bold text-slate-800">{daySchedule.event}</h3>
                    <p className="text-sm text-slate-500 capitalize">{formattedDate}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-full text-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    aria-label="Fechar detalhes"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
        
        <div className="p-6 space-y-4">
            <div>
                <h4 className="font-semibold text-slate-600 mb-2">Porteiros:</h4>
                {daySchedule.doorkeepers.length > 0 ? (
                    renderMemberList(daySchedule.doorkeepers)
                ) : <p className="text-slate-500 italic">Ninguém escalado</p>}
            </div>
            <div>
                <h4 className="font-semibold text-slate-600 mb-2">Cantores (Harpa):</h4>
                {daySchedule.hymnSingers.length > 0 ? (
                    renderMemberList(daySchedule.hymnSingers)
                ) : <p className="text-slate-500 italic">Ninguém escalado</p>}
            </div>
        </div>
        
        <div className="bg-slate-50 px-6 py-3 rounded-b-lg text-right">
            <button 
                onClick={onClose} 
                type="button" 
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            >
                Fechar
            </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailModal;
import React, { useState } from 'react';
import { Schedule, Member, ScheduleDay, ScheduleParticipant } from '../types';
import Avatar from './Avatar';
import PushNotificationManager from './PushNotificationManager';
import { PdfIcon, UserIcon } from './icons';
import { exportScheduleToPDF } from '../services/pdfService';
import SchedulePDFView from './SchedulePDFView';
import ConfirmationModal from './ConfirmationModal';

interface UserViewProps {
  schedule: Schedule;
  announcements: string;
  currentUser: Member | null;
  onUpdateAvatar: (memberId: string, avatarDataUrl: string) => void;
  onMemberClick: (member: Member) => void;
  scheduleName: string;
}

const MemberList: React.FC<{ members: ScheduleParticipant[]; onMemberClick: (member: Member) => void }> = ({ members, onMemberClick }) => {
    if (members.length === 0) {
        return <p className="text-sm text-slate-500 dark:text-slate-400 italic">Ninguém escalado.</p>;
    }
    return (
        <ul className="space-y-2">
            {members.map(participant => (
                <li key={participant.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    {participant.isRegistered && participant.memberData ? (
                        <>
                            <Avatar member={participant.memberData} className="w-6 h-6"/>
                            <button 
                                onClick={() => onMemberClick(participant.memberData!)}
                                className="hover:underline hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none rounded"
                            >
                                {participant.name}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                <UserIcon className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                            </div>
                            <span>{participant.name}</span>
                        </>
                    )}
                </li>
            ))}
        </ul>
    );
};

const ScheduleCard: React.FC<{ day: ScheduleDay, onMemberClick: (member: Member) => void }> = ({ day, onMemberClick }) => {
    return (
        <div className={`rounded-lg p-3 sm:p-4 border ${day.active ? 'bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-400'}`}>
            <h3 className={`font-bold text-lg ${day.active ? 'text-slate-800 dark:text-slate-100' : ''}`}>{day.dayName}</h3>
            {day.active && <p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold mb-3">{day.event}</p>}
            
            {day.active ? (
                <div className="space-y-3 mt-1">
                    <div>
                        <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400 mb-1">Porteiros</h4>
                        <MemberList members={day.doorkeepers} onMemberClick={onMemberClick} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-slate-600 dark:text-slate-400 mb-1">Cantores (Harpa)</h4>
                        <MemberList members={day.hymnSingers} onMemberClick={onMemberClick} />
                    </div>
                </div>
            ) : (
                <p className="text-sm italic mt-4">Dia inativo</p>
            )}
        </div>
    );
};

const UserView: React.FC<UserViewProps> = ({ schedule, announcements, currentUser, onUpdateAvatar, onMemberClick, scheduleName }) => {
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const [isPdfConfirmOpen, setIsPdfConfirmOpen] = useState(false);

  const handleSavePdf = async () => {
      setIsSavingPdf(true);
      try {
          const safeName = scheduleName.replace(/\s+/g, '_') || 'semanal';
          await exportScheduleToPDF('schedule-to-print-user-offscreen', `escala_${safeName}.pdf`);
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

  return (
    <>
        <ConfirmationModal
            isOpen={isPdfConfirmOpen}
            onClose={() => setIsPdfConfirmOpen(false)}
            onConfirm={handleConfirmPdfExport}
            title="Confirmar Exportação para PDF"
            message="Você tem certeza que deseja exportar a escala para PDF?"
            confirmButtonText="Sim, Exportar"
            confirmButtonClass="bg-green-600 hover:bg-green-700 focus:ring-green-500"
        />

        {/* Hidden container for PDF generation */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', zIndex: -1 }} aria-hidden="true">
            <div id="schedule-to-print-user-offscreen">
                <SchedulePDFView schedule={schedule} announcements={announcements} scheduleName={scheduleName} />
            </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
            <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg dark:shadow-slate-950/20">
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-200 sm:text-left text-center">Escala da Semana</h2>
                    <button
                        onClick={() => setIsPdfConfirmOpen(true)}
                        disabled={isSavingPdf}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400"
                    >
                        <PdfIcon className="w-5 h-5"/>
                        {isSavingPdf ? 'Salvando...' : 'Salvar como PDF'}
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schedule.map(day => (
                        <ScheduleCard key={day.id} day={day} onMemberClick={onMemberClick} />
                    ))}
                 </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-slate-950/20">
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-center text-slate-700 dark:text-slate-200">Configurações</h3>
                <PushNotificationManager />
            </div>
        
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-slate-950/20">
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-center text-slate-700 dark:text-slate-200">Quadro de Avisos</h3>
                <div className="whitespace-pre-wrap p-4 bg-amber-50 dark:bg-amber-900/50 border-l-4 border-amber-400 dark:border-amber-500 text-amber-800 dark:text-amber-200 rounded-r-lg">
                    <p>{announcements}</p>
                </div>
            </div>
        </div>
    </>
  );
};

export default UserView;

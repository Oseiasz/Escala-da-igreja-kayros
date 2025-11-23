
import React, { useState } from 'react';
import { Schedule, Member, ScheduleDay, ScheduleParticipant } from '../types';
import Avatar from './Avatar';
import PushNotificationManager from './PushNotificationManager';
import { PdfIcon, CalendarIcon, ListBulletIcon, KeyIcon, MusicalNoteIcon } from './icons';
import { exportScheduleToPDF } from '../services/pdfService';
import SchedulePDFView from './SchedulePDFView';
import ConfirmationModal from './ConfirmationModal';
import Calendar from './Calendar';

interface UserViewProps {
  schedule: Schedule;
  announcements: string;
  currentUser: Member | null;
  onUpdateAvatar: (memberId: string, avatarDataUrl: string) => void;
  onMemberClick: (member: Member) => void;
  scheduleName: string;
  viewDate: Date;
  onNavigateDate: (newDate: Date) => void;
  onDateClick: (date: Date, daySchedule: ScheduleDay | undefined) => void;
}

const ParticipantChip: React.FC<{ participant: ScheduleParticipant, onMemberClick: (m: Member) => void }> = ({ participant, onMemberClick }) => {
    return (
        <div 
            onClick={() => participant.memberData && onMemberClick(participant.memberData)}
            className={`inline-flex items-center gap-1.5 p-1 pr-2.5 rounded-full border shadow-sm transition-all ${participant.memberData ? 'bg-white hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600 border-slate-200 dark:border-slate-600 cursor-pointer' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-70 cursor-default'}`}
        >
            <Avatar member={participant.memberData || null} className="w-5 h-5 text-[0.6rem]" />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                {participant.name.split(' ')[0]}
            </span>
        </div>
    );
};

const UserView: React.FC<UserViewProps> = ({ schedule, announcements, currentUser, onUpdateAvatar, onMemberClick, scheduleName, viewDate, onNavigateDate, onDateClick }) => {
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const [isPdfConfirmOpen, setIsPdfConfirmOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

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
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-200 sm:text-left text-center">Calendário de Escala</h2>
                    
                    <div className="flex items-center gap-3 self-center sm:self-auto">
                        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                title="Visualização em Calendário"
                            >
                                <CalendarIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                                title="Visualização em Lista"
                            >
                                <ListBulletIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <button
                            onClick={() => setIsPdfConfirmOpen(true)}
                            disabled={isSavingPdf}
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400"
                        >
                            <PdfIcon className="w-4 h-4"/>
                            <span className="hidden sm:inline">PDF</span>
                        </button>
                    </div>
                 </div>
                 
                 {viewMode === 'calendar' ? (
                     <Calendar
                        viewDate={viewDate}
                        schedule={schedule}
                        onNavigate={onNavigateDate}
                        onDateClick={onDateClick}
                        onMemberClick={onMemberClick}
                     />
                 ) : (
                     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {schedule.filter(d => d.active).map(day => (
                            <div key={day.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
                                <div className="border-b border-slate-200 dark:border-slate-700 pb-2">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{day.dayName}</h3>
                                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{day.event}</p>
                                </div>
                                
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                                            <KeyIcon className="w-3.5 h-3.5" /> Porteiros
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {day.doorkeepers.length > 0 ? (
                                                day.doorkeepers.map(p => <ParticipantChip key={p.id} participant={p} onMemberClick={onMemberClick} />)
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Vazio</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                                            <MusicalNoteIcon className="w-3.5 h-3.5" /> Cantores
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {day.hymnSingers.length > 0 ? (
                                                day.hymnSingers.map(p => <ParticipantChip key={p.id} participant={p} onMemberClick={onMemberClick} />)
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Vazio</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {schedule.filter(d => d.active).length === 0 && (
                            <div className="col-span-full text-center py-8 text-slate-500 dark:text-slate-400 italic">
                                Nenhuma escala ativa configurada para visualização.
                            </div>
                        )}
                     </div>
                 )}
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

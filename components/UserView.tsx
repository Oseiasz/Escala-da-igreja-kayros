
import React, { useState } from 'react';
import { Schedule, Member, ScheduleDay, ScheduleParticipant } from '../types';
import Avatar from './Avatar';
import PushNotificationManager from './PushNotificationManager';
import { PdfIcon, CalendarIcon, ListBulletIcon, KeyIcon, MusicalNoteIcon, QrCodeIcon, MicrophoneIcon, BookOpenIcon } from './icons';
import { exportScheduleToPDF } from '../services/pdfService';
import SchedulePDFView from './SchedulePDFView';
import ConfirmationModal from './ConfirmationModal';
import Calendar from './Calendar';
import QRCodeModal from './QRCodeModal';

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
            className={`inline-flex items-center gap-1.5 p-1 pr-2.5 rounded-full border shadow-sm transition-all ${participant.memberData ? 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-emerald-950/20 border-slate-200 dark:border-emerald-900/40 cursor-pointer' : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-emerald-950 opacity-70 cursor-default'}`}
        >
            <Avatar member={participant.memberData || null} className="w-5 h-5 text-[0.6rem]" />
            <span className="text-xs font-black text-slate-700 dark:text-emerald-400 max-w-[100px] truncate uppercase tracking-tighter">
                {participant.name.split(' ')[0]}
            </span>
        </div>
    );
};

const UserView: React.FC<UserViewProps> = ({ schedule, announcements, currentUser, onUpdateAvatar, onMemberClick, scheduleName, viewDate, onNavigateDate, onDateClick }) => {
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const [isPdfConfirmOpen, setIsPdfConfirmOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
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
        <QRCodeModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} url={window.location.origin + window.location.pathname} />

        <ConfirmationModal
            isOpen={isPdfConfirmOpen}
            onClose={() => setIsPdfConfirmOpen(false)}
            onConfirm={handleConfirmPdfExport}
            title="Exportar para PDF"
            message="Confirmar a geração da escala em formato PDF para impressão?"
            confirmButtonText="Gerar PDF"
            confirmButtonClass="bg-green-600 hover:bg-green-700"
        />

        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', zIndex: -1 }} aria-hidden="true">
            <div id="schedule-to-print-user-offscreen">
                <SchedulePDFView schedule={schedule} announcements={announcements} scheduleName={scheduleName} />
            </div>
        </div>

        <div className="space-y-6 sm:space-y-8">
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl shadow-lg border border-transparent dark:border-emerald-900/20">
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-700 dark:text-emerald-400 sm:text-left text-center">Escala Mensal</h2>
                    
                    <div className="flex items-center gap-3 self-center sm:self-auto">
                        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl">
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`p-2.5 rounded-xl transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-emerald-600 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-emerald-900 hover:text-slate-700 dark:hover:text-emerald-500'}`}
                                title="Calendário"
                            >
                                <CalendarIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-emerald-600 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-emerald-900 hover:text-slate-700 dark:hover:text-emerald-500'}`}
                                title="Lista"
                            >
                                <ListBulletIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <button
                            onClick={() => setIsQrOpen(true)}
                            className="p-2.5 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-emerald-500 rounded-xl hover:bg-slate-200 dark:hover:bg-emerald-900/30 transition-all"
                            title="QR Code"
                        >
                            <QrCodeIcon className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => setIsPdfConfirmOpen(true)}
                            disabled={isSavingPdf}
                            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-black rounded-xl shadow-lg shadow-green-200 dark:shadow-emerald-900/20 hover:bg-green-700 transition-all disabled:opacity-50"
                        >
                            <PdfIcon className="w-5 h-5"/>
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
                            <div key={day.id} className="bg-slate-50 dark:bg-slate-950 rounded-[2rem] p-6 border border-slate-200 dark:border-emerald-900/20 flex flex-col gap-4">
                                <div className="border-b dark:border-emerald-900/20 pb-3">
                                    <h3 className="font-black text-xl text-slate-800 dark:text-emerald-400">{day.dayName}</h3>
                                    <p className="text-sm text-indigo-600 dark:text-emerald-600 font-black uppercase tracking-widest">{day.event}</p>
                                </div>
                                
                                <div className="space-y-4">
                                    {(day.worshipLeaders && day.worshipLeaders.length > 0) && (
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-2 text-[10px] font-black uppercase text-slate-500 dark:text-emerald-800 tracking-widest">
                                                <MicrophoneIcon className="w-3.5 h-3.5" /> Dirigente
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {day.worshipLeaders.map(p => <ParticipantChip key={p.id} participant={p} onMemberClick={onMemberClick} />)}
                                            </div>
                                        </div>
                                    )}

                                    {(day.preachers && day.preachers.length > 0) && (
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-2 text-[10px] font-black uppercase text-slate-500 dark:text-emerald-800 tracking-widest">
                                                <BookOpenIcon className="w-3.5 h-3.5" /> Pregador(a)
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {day.preachers.map(p => <ParticipantChip key={p.id} participant={p} onMemberClick={onMemberClick} />)}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-black uppercase text-slate-500 dark:text-emerald-800 tracking-widest">
                                            <KeyIcon className="w-3.5 h-3.5" /> Portaria
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {day.doorkeepers.length > 0 ? (
                                                day.doorkeepers.map(p => <ParticipantChip key={p.id} participant={p} onMemberClick={onMemberClick} />)
                                            ) : (
                                                <span className="text-xs text-slate-400 dark:text-emerald-950 italic font-medium">Livre</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-black uppercase text-slate-500 dark:text-emerald-800 tracking-widest">
                                            <MusicalNoteIcon className="w-3.5 h-3.5" /> Louvor
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {day.hymnSingers.length > 0 ? (
                                                day.hymnSingers.map(p => <ParticipantChip key={p.id} participant={p} onMemberClick={onMemberClick} />)
                                            ) : (
                                                <span className="text-xs text-slate-400 dark:text-emerald-950 italic font-medium">Livre</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                     </div>
                 )}
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-lg border border-transparent dark:border-emerald-900/20">
                <h3 className="text-xl font-black mb-4 text-center text-slate-700 dark:text-emerald-400 uppercase tracking-widest">Notificações</h3>
                <PushNotificationManager />
            </div>
        
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-lg border border-transparent dark:border-emerald-900/20">
                <h3 className="text-xl font-black mb-6 text-slate-700 dark:text-emerald-400 uppercase tracking-widest">Quadro de Avisos</h3>
                <div className="whitespace-pre-wrap p-6 bg-emerald-50 dark:bg-emerald-950/20 border-l-4 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-400 rounded-r-3xl font-bold text-sm leading-relaxed">
                    <p>{announcements}</p>
                </div>
            </div>
        </div>
    </>
  );
};

export default UserView;


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
            className={`inline-flex items-center gap-2 p-1 pr-3.5 rounded-full border shadow-sm transition-all ${participant.memberData ? 'bg-white hover:bg-slate-50 dark:bg-black dark:hover:bg-emerald-500/10 border-slate-200 dark:border-emerald-500/40 cursor-pointer' : 'bg-slate-100 dark:bg-zinc-950 border-slate-200 dark:border-zinc-900 opacity-70 cursor-default'}`}
        >
            <Avatar member={participant.memberData || null} className="w-7 h-7 text-[0.7rem]" />
            <span className="text-sm font-black text-slate-700 dark:text-emerald-400 max-w-[120px] truncate uppercase tracking-tighter">
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

        <div className="space-y-8 pb-16">
            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-10 rounded-[2.5rem] shadow-2xl border border-transparent dark:border-emerald-500/20">
                 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-10">
                    <div className="space-y-1 text-center sm:text-left">
                        <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight">Escala de Trabalho</h2>
                        <p className="text-slate-500 dark:text-emerald-500 font-bold uppercase tracking-widest text-xs">Visualização Mensal de Atividades</p>
                    </div>
                    
                    <div className="flex items-center gap-3 self-center sm:self-auto">
                        <div className="flex bg-slate-100 dark:bg-black p-1.5 rounded-[1.2rem] shadow-inner">
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`p-3 rounded-xl transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-emerald-600 shadow-md text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-zinc-700 hover:text-slate-700 dark:hover:text-emerald-500'}`}
                                title="Calendário"
                            >
                                <CalendarIcon className="w-6 h-6" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-emerald-600 shadow-md text-indigo-600 dark:text-white' : 'text-slate-500 dark:text-zinc-700 hover:text-slate-700 dark:hover:text-emerald-500'}`}
                                title="Lista"
                            >
                                <ListBulletIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <button
                            onClick={() => setIsQrOpen(true)}
                            className="p-3 bg-slate-100 dark:bg-black text-slate-600 dark:text-emerald-500 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 transition-all border border-transparent dark:border-emerald-500/20 shadow-md"
                            title="QR Code"
                        >
                            <QrCodeIcon className="w-6 h-6" />
                        </button>

                        <button
                            onClick={() => setIsPdfConfirmOpen(true)}
                            disabled={isSavingPdf}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white text-sm font-black rounded-xl shadow-xl shadow-green-200 dark:shadow-emerald-900/20 hover:bg-green-700 transition-all disabled:opacity-50"
                        >
                            <PdfIcon className="w-6 h-6"/>
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
                     <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {schedule.filter(d => d.active).map(day => (
                            <div key={day.id} className="bg-slate-50 dark:bg-black rounded-[2.5rem] p-8 border border-slate-200 dark:border-emerald-500/20 flex flex-col gap-6 hover:scale-[1.02] transition-transform duration-300 shadow-xl">
                                <div className="border-b dark:border-emerald-500/20 pb-4">
                                    <h3 className="font-black text-2xl text-slate-800 dark:text-emerald-400">{day.dayName}</h3>
                                    <p className="text-sm text-indigo-600 dark:text-emerald-500 font-black uppercase tracking-[0.2em] mt-1">{day.event}</p>
                                </div>
                                
                                <div className="space-y-6">
                                    {(day.worshipLeaders && day.worshipLeaders.length > 0) && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase text-slate-500 dark:text-emerald-900 tracking-widest">
                                                <MicrophoneIcon className="w-4 h-4 text-emerald-600" /> Dirigente
                                            </div>
                                            <div className="flex flex-wrap gap-2.5">
                                                {day.worshipLeaders.map(p => <ParticipantChip key={p.id} participant={p} onMemberClick={onMemberClick} />)}
                                            </div>
                                        </div>
                                    )}

                                    {(day.preachers && day.preachers.length > 0) && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase text-slate-500 dark:text-emerald-900 tracking-widest">
                                                <BookOpenIcon className="w-4 h-4 text-emerald-600" /> Pregador(a)
                                            </div>
                                            <div className="flex flex-wrap gap-2.5">
                                                {day.preachers.map(p => <ParticipantChip key={p.id} participant={p} onMemberClick={onMemberClick} />)}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase text-slate-500 dark:text-emerald-900 tracking-widest">
                                            <KeyIcon className="w-4 h-4 text-emerald-600" /> Portaria
                                        </div>
                                        <div className="flex flex-wrap gap-2.5">
                                            {day.doorkeepers.length > 0 ? (
                                                day.doorkeepers.map(p => <ParticipantChip key={p.id} participant={p} onMemberClick={onMemberClick} />)
                                            ) : (
                                                <span className="text-xs text-slate-400 dark:text-zinc-800 italic font-medium px-4 py-2 bg-slate-100 dark:bg-zinc-950 rounded-full">Livre</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase text-slate-500 dark:text-emerald-900 tracking-widest">
                                            <MusicalNoteIcon className="w-4 h-4 text-emerald-600" /> Louvor
                                        </div>
                                        <div className="flex flex-wrap gap-2.5">
                                            {day.hymnSingers.length > 0 ? (
                                                day.hymnSingers.map(p => <ParticipantChip key={p.id} participant={p} onMemberClick={onMemberClick} />)
                                            ) : (
                                                <span className="text-xs text-slate-400 dark:text-zinc-800 italic font-medium px-4 py-2 bg-slate-100 dark:bg-zinc-950 rounded-full">Livre</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                     </div>
                 )}
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] shadow-xl border border-transparent dark:border-emerald-500/20">
                <h3 className="text-xl font-black mb-6 text-center text-slate-700 dark:text-emerald-500 uppercase tracking-[0.3em]">Notificações</h3>
                <PushNotificationManager />
            </div>
        
            <div className="bg-white dark:bg-zinc-900 p-10 rounded-[2.5rem] shadow-xl border border-transparent dark:border-emerald-500/20">
                <h3 className="text-xl font-black mb-6 text-slate-700 dark:text-emerald-500 uppercase tracking-[0.3em]">Quadro de Avisos</h3>
                <div className="whitespace-pre-wrap p-8 bg-emerald-50 dark:bg-black border-l-8 border-emerald-500 text-emerald-950 dark:text-white rounded-r-[2.5rem] font-bold text-lg leading-relaxed shadow-inner">
                    <p>{announcements}</p>
                </div>
            </div>
        </div>
    </>
  );
};

export default UserView;

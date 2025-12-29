
import React, { useState } from 'react';
import { Schedule, Member, ScheduleDay, ScheduleParticipant } from '../types';
import Avatar from './Avatar';
import PushNotificationManager from './PushNotificationManager';
import { PdfIcon, CalendarIcon, ListBulletIcon } from './icons';
import { exportScheduleToPDF } from '../services/pdfService';
import Calendar from './Calendar';
import SchedulePDFView from './SchedulePDFView';

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
            className="inline-flex items-center gap-2 p-1 pr-4 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer transition-all shadow-sm"
        >
            <Avatar member={participant.memberData || null} className="w-7 h-7 text-[0.7rem]" />
            <span className="text-xs font-black text-black dark:text-white uppercase tracking-tighter">
                {participant.name}
            </span>
        </div>
    );
};

const UserView: React.FC<UserViewProps> = ({ schedule, announcements, onMemberClick, scheduleName, viewDate, onNavigateDate, onDateClick }) => {
  const [isSavingPdf, setIsSavingPdf] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const handleSavePdf = async () => {
      setIsSavingPdf(true);
      try {
          // Captura o elemento oculto renderizado no final do componente
          await exportScheduleToPDF('schedule-to-print-user-offscreen', `escala-${scheduleName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      } catch (error) {
          console.error(error);
          alert("Houve um problema ao gerar o PDF. Tente novamente.");
      } finally {
          setIsSavingPdf(false);
      }
  };

  return (
    <div className="space-y-8 pb-16">
        <div className="bg-white dark:bg-church-surface p-6 sm:p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl">
             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-10">
                <div className="space-y-1">
                    <h2 className="text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tighter">Atividades</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">{scheduleName}</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex bg-zinc-100 dark:bg-black p-1 rounded-xl">
                        <button onClick={() => setViewMode('calendar')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm' : 'text-zinc-400'}`}><CalendarIcon className="w-5 h-5" /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm' : 'text-zinc-400'}`}><ListBulletIcon className="w-5 h-5" /></button>
                    </div>
                    <button 
                        onClick={handleSavePdf} 
                        disabled={isSavingPdf} 
                        className="px-6 py-2.5 bg-indigo-600 text-white font-black text-xs rounded-xl shadow-lg hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        {isSavingPdf ? <div className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full"/> : <PdfIcon className="w-5 h-5"/>}
                        {isSavingPdf ? 'Gerando...' : 'Baixar Escala'}
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
                        <div key={day.id} className="bg-zinc-50 dark:bg-black rounded-[2rem] p-8 border border-zinc-200 dark:border-zinc-900 flex flex-col gap-6 transition-all hover:scale-[1.01]">
                            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
                                <h3 className="font-black text-2xl text-black dark:text-white">
                                    {day.dayName}
                                    {day.dateLabel && <span className="ml-2 text-zinc-400 font-bold">({day.dateLabel})</span>}
                                </h3>
                                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-1">{day.event}</p>
                            </div>
                            <div className="space-y-5">
                                {[
                                    {label: 'Dirigente', items: day.worshipLeaders},
                                    {label: 'Pregador', items: day.preachers},
                                    {label: 'Portaria', items: day.doorkeepers},
                                    {label: 'Louvor', items: day.hymnSingers}
                                ].map((group, i) => group.items && group.items.length > 0 && (
                                    <div key={i}>
                                        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2">{group.label}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {group.items.map(p => <ParticipantChip key={p.id} participant={p} onMemberClick={onMemberClick} />)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                 </div>
             )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-church-surface p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl">
                <h3 className="text-xs font-black mb-6 text-zinc-400 uppercase tracking-widest text-center">Notificações</h3>
                <PushNotificationManager />
            </div>
            <div className="bg-white dark:bg-church-surface p-10 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl">
                <h3 className="text-xs font-black mb-6 text-zinc-400 uppercase tracking-widest">Comunicados</h3>
                <div className="whitespace-pre-wrap p-6 bg-zinc-50 dark:bg-black border-l-4 border-black dark:border-white text-black dark:text-white font-bold text-sm leading-relaxed rounded-r-2xl">
                    <p>{announcements}</p>
                </div>
            </div>
        </div>

        {/* Versão oculta para impressão em PDF */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <SchedulePDFView 
                schedule={schedule} 
                announcements={announcements} 
                scheduleName={scheduleName} 
            />
        </div>
    </div>
  );
};

export default UserView;

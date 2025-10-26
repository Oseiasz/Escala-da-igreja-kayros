
import React, { useState } from 'react';
import { Schedule, Member, ScheduleDay } from '../types';
import ProfileModal from './ProfileModal';
import Avatar from './Avatar';
import PushNotificationManager from './PushNotificationManager';

interface UserViewProps {
  schedule: Schedule;
  announcements: string;
  currentUser: Member | null;
  onUpdateAvatar: (memberId: string, avatarDataUrl: string) => void;
}

const MemberList: React.FC<{ members: Member[]; onMemberClick: (member: Member) => void }> = ({ members, onMemberClick }) => {
    if (members.length === 0) {
        return <p className="text-sm text-slate-500 italic">Ninguém escalado.</p>;
    }
    return (
        <ul className="space-y-2">
            {members.map(member => (
                <li key={member.id} className="flex items-center gap-2 text-sm text-slate-700">
                    <Avatar member={member} className="w-6 h-6"/>
                    <button 
                        onClick={() => onMemberClick(member)}
                        className="hover:underline hover:text-indigo-600 focus:outline-none rounded"
                    >
                        {member.name}
                    </button>
                </li>
            ))}
        </ul>
    );
};

const ScheduleCard: React.FC<{ day: ScheduleDay, onMemberClick: (member: Member) => void }> = ({ day, onMemberClick }) => {
    return (
        <div className={`rounded-lg p-3 sm:p-4 border ${day.active ? 'bg-white shadow-sm' : 'bg-slate-50 text-slate-500'}`}>
            <h3 className={`font-bold text-lg ${day.active ? 'text-slate-800' : ''}`}>{day.dayName}</h3>
            {day.active && <p className="text-sm text-indigo-600 font-semibold mb-3">{day.event}</p>}
            
            {day.active ? (
                <div className="space-y-3 mt-1">
                    <div>
                        <h4 className="font-semibold text-sm text-slate-600 mb-1">Porteiros</h4>
                        <MemberList members={day.doorkeepers} onMemberClick={onMemberClick} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-slate-600 mb-1">Cantores (Harpa)</h4>
                        <MemberList members={day.hymnSingers} onMemberClick={onMemberClick} />
                    </div>
                </div>
            ) : (
                <p className="text-sm italic mt-4">Dia inativo</p>
            )}
        </div>
    );
};

const UserView: React.FC<UserViewProps> = ({ schedule, announcements, currentUser, onUpdateAvatar }) => {
  const [viewingProfile, setViewingProfile] = useState<Member | null>(null);

  const handleMemberClick = (member: Member) => {
    setViewingProfile(member);
  };
  
  const handleCloseProfile = () => {
    setViewingProfile(null);
  };

  return (
    <>
        <ProfileModal 
            member={viewingProfile}
            schedule={schedule}
            onClose={handleCloseProfile}
            currentUser={currentUser}
            onUpdateAvatar={onUpdateAvatar}
        />

        <div className="space-y-6 sm:space-y-8">
            <div id="schedule-to-print-user" className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                 <h2 className="text-xl sm:text-2xl font-bold text-center text-slate-700 mb-6">Escala da Semana</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {schedule.map(day => (
                        <ScheduleCard key={day.id} day={day} onMemberClick={handleMemberClick} />
                    ))}
                 </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-center text-slate-700">Configurações</h3>
                <PushNotificationManager />
            </div>
        
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg sm:text-xl font-bold mb-4 text-center text-slate-700">Quadro de Avisos</h3>
                <div className="whitespace-pre-wrap p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-800 rounded-r-lg">
                    <p>{announcements}</p>
                </div>
            </div>
        </div>
    </>
  );
};

export default UserView;

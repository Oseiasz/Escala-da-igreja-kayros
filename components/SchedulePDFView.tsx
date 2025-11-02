import React from 'react';
import { Schedule, ScheduleParticipant } from '../types';

interface SchedulePDFViewProps {
  schedule: Schedule;
  announcements: string;
  scheduleName: string;
}

const PDFMemberList: React.FC<{ members: ScheduleParticipant[] }> = ({ members }) => {
    if (members.length === 0) {
        return <span style={{ fontStyle: 'italic', color: '#666' }}>Ninguém escalado.</span>;
    }
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {members.map(member => (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px' }}>{member.name}</span>
                </div>
            ))}
        </div>
    );
};


const SchedulePDFView: React.FC<SchedulePDFViewProps> = ({ schedule, announcements, scheduleName }) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div 
      id="pdf-content" 
      style={{ 
        width: '780px', 
        padding: '20px', 
        fontFamily: 'Arial, sans-serif', 
        color: '#333',
        backgroundColor: '#ffffff',
        lineHeight: '1.5'
      }}
    >
      <div style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Escala Semanal - {scheduleName}</h1>
        <p style={{ fontSize: '14px', margin: '5px 0 0' }}>Gerado em: {formattedDate}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        {schedule.filter(day => day.active).map(day => (
          <div key={day.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', marginBottom: '15px', pageBreakInside: 'avoid' }}>
            <h2 style={{ fontSize: '18px', margin: '0 0 5px 0', color: '#000' }}>{day.dayName}</h2>
            <p style={{ fontSize: '14px', color: '#4F46E5', margin: '0 0 15px 0', fontWeight: 'bold' }}>{day.event}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '14px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Porteiros</h3>
                <PDFMemberList members={day.doorkeepers} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '14px', margin: '0 0 8px 0', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>Cantores (Harpa)</h3>
                <PDFMemberList members={day.hymnSingers} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {announcements && (
        <div style={{ marginTop: '25px', pageBreakInside: 'avoid' }}>
            <h2 style={{ fontSize: '18px', textAlign: 'center', borderBottom: '1px solid #ccc', paddingBottom: '8px', marginBottom: '15px' }}>Quadro de Avisos</h2>
            <div style={{ 
                whiteSpace: 'pre-wrap', 
                wordWrap: 'break-word',
                padding: '15px', 
                backgroundColor: '#FFFBEB', 
                borderLeft: '4px solid #FBBF24',
                color: '#92400E',
                fontSize: '14px',
                borderRadius: '4px'
            }}>
            {announcements}
            </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePDFView;


import React from 'react';
import { Schedule, ScheduleParticipant } from '../types';

interface SchedulePDFViewProps {
  schedule: Schedule;
  announcements: string;
  scheduleName: string;
}

const PDFParticipantList: React.FC<{ title: string; members: ScheduleParticipant[]; color: string }> = ({ title, members, color }) => {
    return (
        <div style={{ flex: 1, minWidth: 0, paddingBottom: '6px' }}>
            <h4 style={{ 
                fontSize: '7px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.8px', 
                color: '#475569', 
                marginBottom: '3px',
                fontWeight: '900',
                borderBottom: `1.5px solid ${color}`
            }}>
                {title}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
                {members && members.length > 0 ? (
                    members.map(member => (
                        <span key={member.id} style={{ fontSize: '10px', color: '#1e293b', fontWeight: 600 }}>
                            {member.name}
                        </span>
                    ))
                ) : (
                    <span style={{ fontSize: '9px', color: '#94a3b8', fontStyle: 'italic' }}>Não definido</span>
                )}
            </div>
        </div>
    );
};

const SchedulePDFView: React.FC<SchedulePDFViewProps> = ({ schedule, announcements, scheduleName }) => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const activeDays = schedule.filter(day => day.active);

  return (
    <div 
      id="schedule-to-print-user-offscreen" 
      style={{ 
        width: '800px', 
        padding: '40px 50px', 
        fontFamily: 'Inter, system-ui, sans-serif', 
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        color: '#000000'
      }}
    >
      {/* Cabeçalho */}
      <div style={{ borderBottom: '3px solid #000000', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', margin: 0, tracking: '-1px', textTransform: 'uppercase' }}>
                Escala de Trabalho
            </h1>
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#64748b', margin: '4px 0 0 0' }}>
                {scheduleName}
            </p>
        </div>
        <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', color: '#94a3b8' }}>Atualizado em</div>
            <div style={{ fontSize: '14px', fontWeight: '700' }}>{formattedDate}</div>
        </div>
      </div>

      {/* Grid de Escala */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {activeDays.map(day => (
          <div key={day.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px', backgroundColor: '#fcfcfc' }}>
            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '900', margin: 0 }}>{day.dayName}</h3>
                    {day.dateLabel && <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', margin: 0 }}>{day.dateLabel}</p>}
                </div>
                <div style={{ backgroundColor: '#000000', color: '#ffffff', padding: '4px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}>
                    {day.event}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <PDFParticipantList title="Dirigente" members={day.worshipLeaders} color="#8b5cf6" />
                <PDFParticipantList title="Pregador" members={day.preachers} color="#f59e0b" />
                <PDFParticipantList title="Portaria" members={day.doorkeepers} color="#3b82f6" />
                <PDFParticipantList title="Louvor" members={day.hymnSingers} color="#10b981" />
            </div>
          </div>
        ))}
      </div>

      {/* Comunicados */}
      {announcements && (
        <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <h3 style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: '#475569', marginBottom: '10px', letterSpacing: '1px' }}>
                Informativos e Avisos
            </h3>
            <div style={{ fontSize: '12px', lineHeight: '1.6', fontWeight: '500', color: '#334155', whiteSpace: 'pre-wrap' }}>
                {announcements}
            </div>
        </div>
      )}

      {/* Rodapé */}
      <div style={{ marginTop: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '15px', textAlign: 'center' }}>
        <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
            "Servi ao Senhor com alegria"
        </p>
      </div>
    </div>
  );
};

export default SchedulePDFView;

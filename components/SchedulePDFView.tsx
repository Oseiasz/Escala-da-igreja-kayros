
import React from 'react';
import { Schedule, ScheduleParticipant } from '../types';

interface SchedulePDFViewProps {
  schedule: Schedule;
  announcements: string;
  scheduleName: string;
}

const PDFParticipantList: React.FC<{ title: string; members: ScheduleParticipant[]; color: string }> = ({ title, members, color }) => {
    return (
        <div style={{ flex: 1, minWidth: 0, paddingBottom: '4px' }}>
            <h4 style={{ 
                fontSize: '8px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px', 
                color: '#64748b', // slate-500
                marginBottom: '2px',
                borderBottom: `1px solid ${color}40`, // Low opacity border
                paddingBottom: '1px',
                fontWeight: 'bold'
            }}>
                {title}
            </h4>
            {members && members.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    {members.map(member => (
                        <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <span style={{ fontSize: '9px', color: '#334155', fontWeight: 500 }}>• {member.name.split(' ').slice(0, 2).join(' ')}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <span style={{ fontSize: '9px', color: '#94a3b8', fontStyle: 'italic' }}>-</span>
            )}
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
      id="pdf-content" 
      style={{ 
        width: '794px', // Standard A4 width at 96dpi (approx)
        minHeight: '1123px', // A4 height
        padding: '30px 40px', 
        fontFamily: 'Inter, Helvetica, Arial, sans-serif', 
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header Minimalista */}
      <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          borderBottom: '2px solid #0f172a', // slate-900
          paddingBottom: '15px',
          marginBottom: '20px'
      }}>
        <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
                {scheduleName}
            </h1>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', fontWeight: 500 }}>
                Escala Semanal de Trabalho
            </p>
        </div>
        <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Gerado em</span>
            <span style={{ fontSize: '12px', color: '#334155', fontWeight: 600 }}>{formattedDate}</span>
        </div>
      </div>

      {/* Grid de Dias - Layout 2 Colunas */}
      <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '12px', 
          alignContent: 'flex-start',
          flex: 1 // Push footer down
      }}>
        {activeDays.map(day => (
          <div key={day.id} style={{ 
              width: 'calc(50% - 6px)', // 2 colunas com gap
              border: '1px solid #e2e8f0', // slate-200
              borderRadius: '6px',
              backgroundColor: '#f8fafc', // slate-50
              overflow: 'hidden',
              pageBreakInside: 'avoid',
              display: 'flex',
              flexDirection: 'column'
          }}>
            {/* Card Header */}
            <div style={{ 
                padding: '6px 10px', 
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    {day.dayName}
                </h3>
                <span style={{ fontSize: '10px', fontWeight: '600', color: '#4f46e5', backgroundColor: '#eef2ff', padding: '2px 6px', borderRadius: '4px' }}>
                    {day.event}
                </span>
            </div>

            {/* Card Body - Grid 2x2 Layout for Roles */}
            <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                
                {/* Top Row: Dirigente & Pregador */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <PDFParticipantList 
                        title="Dirigente" 
                        members={day.worshipLeaders || []} 
                        color="#a855f7" // purple
                    />
                     <div style={{ width: '1px', backgroundColor: '#e2e8f0' }}></div>
                    <PDFParticipantList 
                        title="Pregador(a)" 
                        members={day.preachers || []} 
                        color="#f97316" // orange
                    />
                </div>

                <div style={{ height: '1px', backgroundColor: '#e2e8f0' }}></div>

                {/* Bottom Row: Porteiros & Cantores */}
                <div style={{ display: 'flex', gap: '10px' }}>
                   <PDFParticipantList 
                        title="Porteiros" 
                        members={day.doorkeepers} 
                        color="#3b82f6" // blue
                   />
                   <div style={{ width: '1px', backgroundColor: '#e2e8f0' }}></div>
                   <PDFParticipantList 
                        title="Cantores" 
                        members={day.hymnSingers} 
                        color="#22c55e" // green
                   />
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Avisos - Rodapé Fixo ou ao final */}
      {announcements && (
        <div style={{ marginTop: 'auto', paddingTop: '15px', pageBreakInside: 'avoid' }}>
            <div style={{ 
                backgroundColor: '#fffbeb', // amber-50
                border: '1px solid #fcd34d', // amber-300
                borderRadius: '6px',
                padding: '12px',
                position: 'relative'
            }}>
                <h3 style={{ 
                    fontSize: '10px', 
                    textTransform: 'uppercase', 
                    fontWeight: 'bold', 
                    color: '#b45309', // amber-700
                    margin: '0 0 6px 0',
                    letterSpacing: '0.5px'
                }}>
                    Quadro de Avisos
                </h3>
                <div style={{ 
                    whiteSpace: 'pre-wrap', 
                    color: '#451a03', // amber-950
                    fontSize: '10px',
                    lineHeight: '1.4'
                }}>
                    {announcements}
                </div>
            </div>
        </div>
      )}
      
      {/* Footer Branding */}
      <div style={{ marginTop: '10px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
           <p style={{ fontSize: '9px', color: '#cbd5e1' }}>Escala da Igreja</p>
      </div>
    </div>
  );
};

export default SchedulePDFView;

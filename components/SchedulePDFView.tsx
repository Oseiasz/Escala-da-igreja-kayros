import React from 'react';
import { Schedule, ScheduleParticipant } from '../types';

interface SchedulePDFViewProps {
  schedule: Schedule;
  announcements: string;
  scheduleName: string;
}

const PDFParticipantList: React.FC<{ title: string; members: ScheduleParticipant[]; color: string }> = ({ title, members, color }) => {
    return (
        <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ 
                fontSize: '9px', 
                textTransform: 'uppercase', 
                letterSpacing: '0.5px', 
                color: '#64748b', // slate-500
                marginBottom: '4px',
                borderBottom: `1px solid ${color}40`, // Low opacity border
                paddingBottom: '2px',
                fontWeight: 'bold'
            }}>
                {title}
            </h4>
            {members.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {members.map(member => (
                        <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '10px', color: '#334155', fontWeight: 500 }}>• {member.name}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <span style={{ fontSize: '10px', color: '#94a3b8', fontStyle: 'italic' }}>-</span>
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
          marginBottom: '25px'
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
          gap: '15px', 
          alignContent: 'flex-start',
          flex: 1 // Push footer down
      }}>
        {activeDays.map(day => (
          <div key={day.id} style={{ 
              width: 'calc(50% - 8px)', // 2 colunas com gap
              border: '1px solid #e2e8f0', // slate-200
              borderRadius: '6px',
              backgroundColor: '#f8fafc', // slate-50
              overflow: 'hidden',
              pageBreakInside: 'avoid'
          }}>
            {/* Card Header */}
            <div style={{ 
                padding: '8px 12px', 
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

            {/* Card Body */}
            <div style={{ padding: '10px 12px', display: 'flex', gap: '15px' }}>
               <PDFParticipantList 
                    title="Porteiros" 
                    members={day.doorkeepers} 
                    color="#3b82f6" // blue
               />
               <div style={{ width: '1px', backgroundColor: '#cbd5e1' }}></div>
               <PDFParticipantList 
                    title="Cantores" 
                    members={day.hymnSingers} 
                    color="#22c55e" // green
               />
            </div>
          </div>
        ))}
      </div>

      {/* Avisos - Rodapé Fixo ou ao final */}
      {announcements && (
        <div style={{ marginTop: 'auto', paddingTop: '20px', pageBreakInside: 'avoid' }}>
            <div style={{ 
                backgroundColor: '#fffbeb', // amber-50
                border: '1px solid #fcd34d', // amber-300
                borderRadius: '6px',
                padding: '15px',
                position: 'relative'
            }}>
                <h3 style={{ 
                    fontSize: '11px', 
                    textTransform: 'uppercase', 
                    fontWeight: 'bold', 
                    color: '#b45309', // amber-700
                    margin: '0 0 8px 0',
                    letterSpacing: '0.5px'
                }}>
                    Quadro de Avisos
                </h3>
                <div style={{ 
                    whiteSpace: 'pre-wrap', 
                    color: '#451a03', // amber-950
                    fontSize: '11px',
                    lineHeight: '1.5'
                }}>
                    {announcements}
                </div>
            </div>
        </div>
      )}
      
      {/* Footer Branding */}
      <div style={{ marginTop: '15px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
           <p style={{ fontSize: '9px', color: '#cbd5e1' }}>Escala da Igreja</p>
      </div>
    </div>
  );
};

export default SchedulePDFView;
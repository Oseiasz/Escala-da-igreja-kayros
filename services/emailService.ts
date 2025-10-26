import { Member, ScheduleDay } from '../types';

interface NewAssignment {
  member: Member;
  day: ScheduleDay;
  role: string;
}

/**
 * Simulates sending an email notification to all administrators about new assignments.
 * In a real application, this would make an API call to a backend service.
 * @param admins - A list of admin members to notify.
 * @param assignments - A list of new assignments that were made.
 */
export const sendNewAssignmentNotificationToAdmins = (admins: Member[], assignments: NewAssignment[]): void => {
  if (admins.length === 0 || assignments.length === 0) {
    return;
  }

  const assignmentDetails = assignments
    .map(a => `- ${a.member.name} foi escalado(a) como ${a.role} para ${a.day.event} na ${a.day.dayName}.`)
    .join('\n');

  admins.forEach(admin => {
    const emailBody = `
Olá ${admin.name},

A escala foi atualizada. As seguintes novas atribuições foram feitas:
${assignmentDetails}

Atenciosamente,
Sistema de Escala da Igreja.
    `;

    console.log('--- SIMULATING ADMIN NOTIFICATION EMAIL ---');
    console.log(`To: ${admin.email}`);
    console.log(`Subject: Atualização na Escala da Igreja`);
    console.log(emailBody.trim());
    console.log('-------------------------------------------');
  });
};

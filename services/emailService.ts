
import { Member, ScheduleDay } from '../types';
import emailjs from '@emailjs/browser';

// ============================================================
// CONFIGURAÇÃO DO EMAILJS
// ============================================================
const EMAILJS_SERVICE_ID: string = 'service_kxzkb8s';
const EMAILJS_TEMPLATE_ID: string = 'template_nyds16o';
const EMAILJS_PUBLIC_KEY: string = 'dfksLlNhrz5LPqyZg';
// ============================================================

interface NewAssignment {
  member: Member;
  day: ScheduleDay;
  role: string;
}

/**
 * Helper interno para enviar o e-mail usando EmailJS
 */
const sendEmail = async (toEmail: string, toName: string, subject: string, message: string) => {
  // Verifica se as chaves foram configuradas corretamente
  if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' || !EMAILJS_PUBLIC_KEY) {
    console.log('--- EMAILJS NÃO CONFIGURADO (MODO SIMULAÇÃO) ---');
    console.log(`Para: ${toEmail} (${toName})`);
    console.log(`Assunto: ${subject}`);
    console.log(`Mensagem: ${message}`);
    console.log('------------------------------------------------');
    return;
  }

  // Mapeamento exato para as variáveis do template no EmailJS
  const templateParams = {
    to_email: toEmail,
    to_name: toName,
    assunto: subject, // Mapeia 'subject' do código para '{{assunto}}' no template
    mensagem: message, // Mapeia 'message' do código para '{{mensagem}}' no template
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
    console.log(`E-mail enviado com sucesso para ${toEmail}`);
  } catch (error) {
    console.error('ERRO AO ENVIAR EMAIL:', error);
    // Fallback: mostrar no console caso dê erro na API
    console.log('--- FALHA NO ENVIO (CONTEÚDO) ---');
    console.log(`Para: ${toEmail}`);
    console.log(message);
  }
};

/**
 * Envia notificação para administradores sobre novas atribuições na escala.
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
A escala foi atualizada recentemente.
As seguintes novas atribuições foram feitas:

${assignmentDetails}

Acesse o sistema para ver os detalhes completos.
    `;

    sendEmail(admin.email, admin.name, 'Atualização na Escala da Igreja', emailBody);
  });
};

/**
 * Envia e-mail de boas-vindas para novos usuários cadastrados.
 */
export const sendWelcomeEmail = (toEmail: string, userName: string): void => {
  const emailBody = `
Seja muito bem-vindo(a) ao nosso App de Escala!

Seu cadastro foi realizado com sucesso. A partir de agora, você poderá:
- Visualizar a escala de trabalho semanal.
- Verificar quando você foi escalado como Porteiro(a) ou Cantor(a).
- Acompanhar os avisos e novidades no quadro de avisos.

Estamos felizes em tê-lo(a) conosco servindo no ministério.

Se tiver qualquer dúvida, procure a administração.

Deus abençoe!
  `;

  sendEmail(toEmail, userName, 'Bem-vindo(a) à Escala da Igreja!', emailBody);
};

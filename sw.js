// Este service worker lida com a exibição de notificações push.

self.addEventListener('install', (event) => {
  // Força a ativação do novo service worker assim que instalado.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Garante que o service worker ativado assuma o controle da página imediatamente.
  clients.claim();
});

self.addEventListener('message', (event) => {
  // Escuta por mensagens vindas da aplicação principal.
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body } = event.data.payload;
    
    // Exibe a notificação. event.waitUntil garante que o service worker
    // não seja encerrado antes que a notificação seja exibida.
    event.waitUntil(
      self.registration.showNotification(title, {
        body: body,
        icon: '/vite.svg', // Ícone que aparece na notificação
        badge: '/vite.svg', // Ícone para a barra de status em alguns dispositivos
      })
    );
  }
});

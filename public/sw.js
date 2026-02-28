self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'Notification', body: 'Time for Iftar/Suhoor' };
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.png', // Replace with your actual icon path
      badge: '/badge.png',
      vibrate: [200, 100, 200]
    });
  });
  
  // This handles clicking the notification
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow('/')); 
  });
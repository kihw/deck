// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered successfully');
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
        
        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New SW is ready to take over
              showUpdateNotification();
            }
          });
        });
      })
      .catch(err => {
        console.log('Service Worker registration failed:', err);
      });
  });
}

function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    <div class="update-content">
      <h3>Nouvelle version disponible</h3>
      <p>Une nouvelle version de Deck est disponible.</p>
      <div class="update-actions">
        <button id="update-pwa" class="btn btn-primary">Mettre à jour</button>
        <button id="dismiss-update" class="btn btn-ghost">Plus tard</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  document.getElementById('update-pwa').addEventListener('click', () => {
    // Tell the waiting SW to take over
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
    }
    window.location.reload();
  });
  
  document.getElementById('dismiss-update').addEventListener('click', () => {
    notification.remove();
  });
}
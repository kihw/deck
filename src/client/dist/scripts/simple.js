console.log('Script started');

// Simple timeout to hide loading splash
setTimeout(() => {
    console.log('Hiding loading splash');
    const loadingSplash = document.getElementById('loading-splash');
    const authContainer = document.getElementById('auth-container');
    
    if (loadingSplash) loadingSplash.classList.add('hidden');
    if (authContainer) authContainer.classList.remove('hidden');
}, 1000);

// Test button auth
document.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('auth-btn');
    const authContainer = document.getElementById('auth-container');
    const deckContainer = document.getElementById('deck-container');
    
    if (authBtn) {
        authBtn.onclick = () => {
            console.log('Auth clicked');
            if (authContainer) authContainer.classList.add('hidden');
            if (deckContainer) deckContainer.classList.remove('hidden');
        };
    }
});

console.log('Script loaded');
// Main application initialization and event handling

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    
    // Always start in session mode with sidebar closed
    sessionMode = true;
    window.sessionMode = sessionMode;
    window.currentSession = null; // No active session initially
    
    // Create a fresh temporary session
    tempSession = {
        placements: {},
        notes: {},
        completedTracks: new Set()
    };
    
    // Reset completed tracks to ensure fresh start
    completedTrackNames = new Set();
    completedTracks = 0;
    completedTrackOrder = [];
    
    // Load saved data (but not completed tracks in session mode)
    loadFromLocalStorage();
    
    
    // Initialize session button to correct state (sidebar closed)
    const sessionToggleBtn = document.getElementById('sessionToggleBtn');
    sessionToggleBtn.textContent = 'Sessions';
    
    // Load existing sessions but keep sidebar closed initially
    loadSessionsFromStorage();
    
    // Generate tracks first
    generateTrackItems();
    
    // Initialize zoom button state and auto zoom to fit after tracks are generated
    setTimeout(() => {
        // Ensure zoom button is in correct initial state - always start as gray "Zoom to Fit"
        const toggleBtn = document.getElementById('zoomToggleBtn');
        const manualControls = document.getElementById('manualZoomControls');
        
        // Force auto zoom to be enabled and button to be gray
        autoZoomEnabled = true;
        toggleBtn.classList.remove('inactive');
        toggleBtn.textContent = '🔍 Zoom to Fit';
        manualControls.style.display = 'none';
        
        // Start continuous zoom monitoring
        startContinuousZoom();
    }, 100);
});

// Add keyboard event listener for F key
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'f' && hoveredTrackName) {
        e.preventDefault();
        toggleStar(hoveredTrackName);
    }
});

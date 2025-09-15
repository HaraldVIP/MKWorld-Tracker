// Main application initialization and event handling

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    
    // Always start in session mode with sidebar closed
    sessionMode = true;
    window.sessionMode = sessionMode;
    window.currentSession = null; // No active session initially
    
    // Initialize track tip mode
    window.trackTipMode = false;
    
    // Initialize completed tracks first
    completedTrackNames = new Set();
    completedTracks = 0;
    completedTrackOrder = [];
    
    // Load saved data (including temp session)
    loadFromLocalStorage();
    
    // If temp session was loaded, apply it to current state
    if (window.tempSession) {
        console.log('Loading temp session:', window.tempSession);
        // Apply temp session data to current state
        window.trackPlacements = {...window.tempSession.placements};
        window.trackNotes = {...window.tempSession.notes};
        completedTrackNames = new Set(window.tempSession.completedTracks || []);
        completedTracks = completedTrackNames.size;
        console.log('Applied temp session - completed tracks:', completedTrackNames.size);
    } else {
        console.log('No temp session to load');
        // Initialize empty track data if no temp session
        window.trackPlacements = {};
        window.trackNotes = {};
    }
    
    
    // Initialize session button to correct state (sidebar closed)
    const sessionToggleBtn = document.getElementById('sessionToggleBtn');
    sessionToggleBtn.textContent = 'Sessions';
    
    // Load existing sessions but keep sidebar closed initially
    loadSessionsFromStorage();
    
    // Sync session manager variables with global ones
    if (typeof window.syncGlobalVariables === 'function') {
        window.syncGlobalVariables();
    }
    
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
        
        // Initialize track tip mode button
        const trackTipBtn = document.getElementById('trackTipToggleBtn');
        if (window.trackTipMode) {
            trackTipBtn.classList.add('active');
            trackTipBtn.textContent = '💡 Track Tips ON';
        } else {
            trackTipBtn.classList.remove('active');
            trackTipBtn.textContent = '💡 Track Tips OFF';
        }
        
        // Initialize theme button text based on screen size
        if (typeof window.updateThemeButtonText === 'function') {
            window.updateThemeButtonText();
        }
        
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

// Add window resize listener for responsive updates
window.addEventListener('resize', () => {
    if (autoZoomEnabled) {
        // Trigger zoom to fit on resize
        setTimeout(() => {
            isZoomToFitCall = true;
            zoomToFit();
            isZoomToFitCall = false;
        }, 100);
    } else {
        // Update session button display based on current zoom level
        const currentZoom = parseFloat(document.getElementById('sizeSlider').value);
        updateSessionButtonDisplay(currentZoom);
    }
    
    // Update theme button text based on screen size
    if (typeof window.updateThemeButtonText === 'function') {
        window.updateThemeButtonText();
    }
});
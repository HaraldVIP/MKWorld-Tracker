// Data storage and persistence functionality

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('starredTracks', JSON.stringify(Array.from(starredTracks)));
    localStorage.setItem('completedTrackNames', JSON.stringify(Array.from(completedTrackNames)));
    localStorage.setItem('completedTrackOrder', JSON.stringify(completedTrackOrder));
    localStorage.setItem('sortMode', sortMode);
}

// Save global favorites separately
function saveGlobalFavorites() {
    localStorage.setItem('globalStarredTracks', JSON.stringify(Array.from(starredTracks)));
}

// Load global favorites separately
function loadGlobalFavorites() {
    const savedGlobalStarred = localStorage.getItem('globalStarredTracks');
    if (savedGlobalStarred) {
        starredTracks = new Set(JSON.parse(savedGlobalStarred));
    }
}

// Save temporary session to localStorage
function saveTempSession() {
    if (window.tempSession) {
        const tempSessionData = {
            placements: window.tempSession.placements,
            notes: window.tempSession.notes,
            completedTracks: Array.from(window.tempSession.completedTracks)
        };
        console.log('Saving temp session:', tempSessionData);
        localStorage.setItem('tempSession', JSON.stringify(tempSessionData));
    }
}

// Load temporary session from localStorage
function loadTempSession() {
    const savedTempSession = localStorage.getItem('tempSession');
    if (savedTempSession) {
        try {
            const tempSessionData = JSON.parse(savedTempSession);
            console.log('Loading temp session from storage:', tempSessionData);
            window.tempSession = {
                placements: tempSessionData.placements || {},
                notes: tempSessionData.notes || {},
                completedTracks: new Set(tempSessionData.completedTracks || [])
            };
            console.log('Loaded temp session:', window.tempSession);
            return true;
        } catch (e) {
            console.error('Error loading temp session:', e);
        }
    }
    console.log('No temp session found in storage');
    return false;
}

// Load from localStorage
function loadFromLocalStorage() {
    // Load global favorites first
    loadGlobalFavorites();
    
    // Load temporary session if available
    loadTempSession();
    
    const savedSortMode = localStorage.getItem('sortMode');
    if (savedSortMode) {
        sortMode = savedSortMode;
    }
    
}

// Make functions globally accessible
window.saveTempSession = saveTempSession;
window.loadTempSession = loadTempSession;

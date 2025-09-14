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

// Load from localStorage
function loadFromLocalStorage() {
    // Load global favorites first
    loadGlobalFavorites();
    
    // Don't load completed tracks from localStorage in session mode
    // They should only come from the current session or temp session
    
    const savedSortMode = localStorage.getItem('sortMode');
    if (savedSortMode) {
        sortMode = savedSortMode;
    }
    
}

// Track data and management functionality

// Track data with image filenames and display names
const tracks = [
    { filename: 'Acorn Heights.png', name: 'Acorn Heights' },
    { filename: 'Airship Fortress.png', name: 'Airship Fortress' },
    { filename: 'Boo Cinema.png', name: 'Boo Cinema' },
    { filename: 'Bowser\'s Castle.png', name: 'Bowser\'s Castle' },
    { filename: 'Cheep Cheep Falls.png', name: 'Cheep Cheep Falls' },
    { filename: 'Choco Mountain.png', name: 'Choco Mountain' },
    { filename: 'Crown City.png', name: 'Crown City' },
    { filename: 'Dandelion Depths.png', name: 'Dandelion Depths' },
    { filename: 'Desert Hills.png', name: 'Desert Hills' },
    { filename: 'Dino Dino Jungle.png', name: 'Dino Dino Jungle' },
    { filename: 'DK Pass.png', name: 'DK Pass' },
    { filename: 'DK spaceport.png', name: 'DK Spaceport' },
    { filename: 'Dry Bones Burnout.png', name: 'Dry Bones Burnout' },
    { filename: 'Faraway Oasis.png', name: 'Faraway Oasis' },
    { filename: 'Koopa Troopa Beach.png', name: 'Koopa Troopa Beach' },
    { filename: 'Mario Cuircut.png', name: 'Mario Circuit' },
    { filename: 'Mario_Bros_Circuit.png', name: 'Mario Bros Circuit' },
    { filename: 'Moo Moo Meadows.png', name: 'Moo Moo Meadows' },
    { filename: 'Peach Beach.jpg', name: 'Peach Beach' },
    { filename: 'Peach Stadium.png', name: 'Peach Stadium' },
    { filename: 'Question_Ruins_icon.png', name: 'Great ? Block Ruins' },
    { filename: 'Rainbow Road.png', name: 'Rainbow Road' },
    { filename: 'Salty Salty Speedway.jpg', name: 'Salty Salty Speedway' },
    { filename: 'Shy Guy Bazaar.png', name: 'Shy Guy Bazaar' },
    { filename: 'Sky-High Syndae.png', name: 'Sky-High Syndae' },
    { filename: 'Starview Peak.png', name: 'Starview Peak' },
    { filename: 'Toad\'s Factory.png', name: 'Toad\'s Factory' },
    { filename: 'Wario Shipyard.png', name: 'Wario Shipyard' },
    { filename: 'Wario Stadium.png', name: 'Wario Stadium' },
    { filename: 'Whistlestop Summit.png', name: 'Whistlestop Summit' }
];

// Make tracks array globally accessible
window.tracks = tracks;

// Discord track codes mapping
const discordTrackCodes = {
    'Acorn Heights': ':track_081AH:',
    'Airship Fortress': ':track_024rAF:',
    'Boo Cinema': ':track_063BCi:',
    'Bowser\'s Castle': ':track_074BC:',
    'Cheep Cheep Falls': ':track_061CCF:',
    'Choco Mountain': ':track_072rCM:',
    'Crown City': ':track_012CC:',
    'Dandelion Depths': ':track_062DD:',
    'Desert Hills': ':track_021rDH:',
    'Dino Dino Jungle': ':track_053rDDJ:',
    'DK Pass': ':track_031rDKP:',
    'DK Spaceport': ':track_014DKS:',
    'Dry Bones Burnout': ':track_064DBB:',
    'Faraway Oasis': ':track_042FO:',
    'Koopa Troopa Beach': ':track_041rKTB:',
    'Mario Circuit': ':track_011MBC:',
    'Mario Bros Circuit': ':track_082MC:',
    'Moo Moo Meadows': ':track_071rMMM:',
    'Peach Beach': ':track_051rPB:',
    'Peach Stadium': ':track_083PS:',
    'Great ? Block Ruins': ':track_054GBR:',
    'Rainbow Road': ':track_084RR:',
    'Salty Salty Speedway': ':track_052SSS:',
    'Shy Guy Bazaar': ':track_022rSGB:',
    'Sky-High Syndae': ':track_033rSHS:',
    'Starview Peak': ':track_032SP:',
    'Toad\'s Factory': ':track_073rTF:',
    'Wario Shipyard': ':track_034rWSh:',
    'Wario Stadium': ':track_023rWS:',
    'Whistlestop Summit': ':track_013WS:'
};

// Global track state variables
let completedTracks = 0;
let starredTracks = new Set();
let completedTrackNames = new Set();
let completedTrackOrder = []; // Track the order of completion
let sortMode = 'alphabetical';
let hoveredTrackName = null;

// Generate track items
function generateTrackItems() {
    const trackGrid = document.getElementById('trackGrid');
    if (!trackGrid) {
        return;
    }
    trackGrid.innerHTML = '';

    // Get tracks in the correct order based on sort mode
    let tracksToRender = getTracksInOrder();

    tracksToRender.forEach((track, index) => {
        const isStarred = starredTracks.has(track.name);
        const isCompleted = completedTrackNames.has(track.name);
        const trackItem = document.createElement('div');
        trackItem.className = `track-item ${isStarred ? 'starred' : ''} ${isCompleted ? 'grayed-out' : ''}`;
        trackItem.dataset.trackName = track.name;
        trackItem.dataset.track = track.name;
        
        trackItem.addEventListener('click', (e) => {
            // Toggle track completion (works in session mode, with or without active session)
            toggleTrackByName(track.name);
        });
        
        // Add hover events for F key functionality
        trackItem.addEventListener('mouseenter', () => {
            hoveredTrackName = track.name;
        });
        
        trackItem.addEventListener('mouseleave', () => {
            hoveredTrackName = null;
        });
        
        if (starredTracks.has(track.name)) {
            trackItem.classList.add('starred');
        }
        
        if (window.sessionMode) {
            trackItem.classList.add('session-mode');
        }
        
        // Basic track content
        trackItem.innerHTML = `<img src="Track images and names/${track.filename}" alt="${track.name}" class="track-image" onerror="this.onerror=null;this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJjZW50cmFsIj5JbWFnZSBOb3QgRGlzcGxheWVkPC90ZXh0Pjwvc3ZnPg';"/>
        <p class="track-name">${track.name}</p>
        <button class="star-button ${starredTracks.has(track.name) ? 'starred' : ''}" onclick="event.stopPropagation(); toggleStar('${track.name.replace(/'/g, "\\'")}')">${starredTracks.has(track.name) ? '★' : '☆'}</button>`;
        
        // Add session mode elements after basic content
        if (window.sessionMode) {
            // Placement display removed - now only shown on the placement button
            
            // Add control buttons for completed tracks
            if (completedTrackNames.has(track.name)) {
                // Notes button
                const notesToggle = document.createElement('button');
                const hasNotes = window.trackNotes[track.name] && window.trackNotes[track.name].trim() !== '';
                notesToggle.className = `session-control-button notes-button ${hasNotes ? 'has-notes' : ''}`;
                notesToggle.textContent = '📝 Notes';
                notesToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleNotes(track.name);
                });
                trackItem.appendChild(notesToggle);
                
                // Placement button
                const placementToggle = document.createElement('button');
                placementToggle.className = 'session-control-button placement-button';
                const placement = window.trackPlacements[track.name];
                if (placement) {
                    placementToggle.textContent = `${placement}${getOrdinalSuffix(placement)}`;
                    // Set background color based on placement
                    if (placement === 1) {
                        placementToggle.style.background = '#FFD700'; // Gold
                        placementToggle.style.color = '#000';
                    } else if (placement === 2) {
                        placementToggle.style.background = '#C0C0C0'; // Silver
                        placementToggle.style.color = '#000';
                    } else if (placement === 3) {
                        placementToggle.style.background = '#CD7F32'; // Bronze
                        placementToggle.style.color = '#fff';
                    } else {
                        placementToggle.style.background = '#8B4513'; // Brown for 4th+
                        placementToggle.style.color = '#fff';
                    }
                } else {
                    placementToggle.textContent = '🏆 Placement';
                }
                placementToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    showPlacementSelector(track.name);
                });
                trackItem.appendChild(placementToggle);
            }
            
            // Add placement selector
            const placementSelector = document.createElement('div');
            placementSelector.className = 'placement-selector';
            placementSelector.id = `placement-${track.name.replace(/\s+/g, '-')}`;
            placementSelector.style.display = 'none';
            
            // Prevent clicks on the placement selector from bubbling up to the track item
            placementSelector.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            for (let i = 1; i <= 12; i++) {
                const option = document.createElement('div');
                option.className = `placement-option placement-${i === 1 ? '1st' : i === 2 ? '2nd' : i === 3 ? '3rd' : i + 'th'}`;
                option.textContent = i;
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    selectPlacement(track.name, i);
                });
                placementSelector.appendChild(option);
            }
            trackItem.appendChild(placementSelector);
            
            // Add notes section
            const notesSection = document.createElement('div');
            notesSection.className = 'notes-section';
            notesSection.id = `notes-${track.name.replace(/\s+/g, '-')}`;
            notesSection.style.display = 'none';
            
            // Prevent clicks on the notes section from bubbling up to the track item
            notesSection.addEventListener('click', (e) => {
                e.stopPropagation();
                // Don't prevent default - we only want to stop event bubbling
            });
            
            const textarea = document.createElement('textarea');
            textarea.placeholder = 'Add notes about this race...';
            textarea.value = window.trackNotes[track.name] || '';
            textarea.onchange = (e) => updateNotes(track.name, e.target.value);
            
            // Also prevent textarea events from bubbling up
            textarea.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            textarea.addEventListener('focus', (e) => {
                e.stopPropagation();
            });
            textarea.addEventListener('keydown', (e) => {
                e.stopPropagation();
            });
            textarea.addEventListener('keyup', (e) => {
                e.stopPropagation();
            });
            
            notesSection.appendChild(textarea);
            trackItem.appendChild(notesSection);
        }
        trackGrid.appendChild(trackItem);
    });

    updateStats();
}

function updateStats() {
    document.getElementById('completedTracks').textContent = completedTracks;
    
    // Calculate progress percentage (100% when 12 tracks completed)
    const progressPercentage = Math.min(100, Math.round((completedTracks / 12) * 100));
    document.getElementById('progressPercentage').textContent = progressPercentage + '%';
    document.getElementById('progressFill').style.width = progressPercentage + '%';
    
    // Show/hide and update session score
    const sessionScoreElement = document.getElementById('sessionScore');
    const scoreValueElement = document.getElementById('scoreValue');
    
    // Always show score in session mode, calculate from current placements
    const score = calculateSessionScore();
    scoreValueElement.textContent = score;
    sessionScoreElement.style.display = 'inline';
}

function toggleTrackByName(trackName) {
    if (completedTrackNames.has(trackName)) {
        completedTrackNames.delete(trackName);
        completedTracks--;
        
        // Remove from completion order
        const index = completedTrackOrder.indexOf(trackName);
        if (index > -1) {
            completedTrackOrder.splice(index, 1);
        }
        
        // Remove placement when deselecting track
        if (window.sessionMode && trackPlacements[trackName]) {
            delete trackPlacements[trackName];
            window.trackPlacements = trackPlacements;
        }
        
        // Keep notes when deselecting track - don't delete them
    } else {
        completedTrackNames.add(trackName);
        completedTracks++;
        
        // Add to completion order
        completedTrackOrder.push(trackName);
        
        // Add completion animation
        const trackItems = document.querySelectorAll('.track-item');
        trackItems.forEach(item => {
            const nameElement = item.querySelector('.track-name');
            if (nameElement && nameElement.textContent === trackName) {
                item.classList.add('completing');
                setTimeout(() => {
                    item.classList.remove('completing');
                }, 600);
            }
        });
    }
    
    // Save to appropriate storage
    if (window.sessionMode && window.currentSession) {
        // Save to current session
        saveCurrentSession();
    } else if (window.sessionMode && !window.currentSession) {
        // Save to temp session
        tempSession.completedTracks = new Set(completedTrackNames);
        // Don't save starredTracks to temp session - they are global
    } else {
        // This should not happen in session mode
        console.warn('Unexpected normal mode save attempt');
    }
    
    generateTrackItems();
}

function toggleStar(trackName) {
    if (starredTracks.has(trackName)) {
        starredTracks.delete(trackName);
    } else {
        starredTracks.add(trackName);
    }
    
    // Update the specific track item without regenerating all
    const trackItems = document.querySelectorAll('.track-item');
    trackItems.forEach(item => {
        const nameElement = item.querySelector('.track-name');
        if (nameElement && nameElement.textContent === trackName) {
            const starButton = item.querySelector('.star-button');
            if (starredTracks.has(trackName)) {
                starButton.classList.add('starred');
                starButton.textContent = '★';
                item.classList.add('starred');
            } else {
                starButton.classList.remove('starred');
                starButton.textContent = '☆';
                item.classList.remove('starred');
            }
        }
    });
    
    // Always save global favorites
    saveGlobalFavorites();
    
    // Save to appropriate storage for other data
    if (window.sessionMode && window.currentSession) {
        // Save to current session (but not favorites)
        saveCurrentSession();
    } else if (window.sessionMode && !window.currentSession) {
        // Save to temp session (but not favorites)
        tempSession.completedTracks = new Set(completedTrackNames);
    } else {
        // This should not happen in session mode
        console.warn('Unexpected normal mode save attempt');
    }
    
    updateStats();
}

function resetAll() {
    completedTrackNames.clear();
    completedTracks = 0;
    completedTrackOrder = []; // Clear completion order
    // Don't clear starredTracks - keep favorites
    
    const resetButton = document.querySelector('.reset-button');
    resetButton.classList.add('reset-animation');
    setTimeout(() => {
        resetButton.classList.remove('reset-animation');
    }, 1000);
    
    generateTrackItems();
}

function setSortMode(mode) {
    sortMode = mode;
    document.querySelectorAll('.sort-button').forEach(button => button.classList.remove('active'));
    document.getElementById(`sort${mode[0].toUpperCase() + mode.slice(1)}`).classList.add('active');
    generateTrackItems();
}

function getTracksInOrder() {
    let tracksToRender = [...tracks];
    
    switch (sortMode) {
        case 'alphabetical':
            tracksToRender.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'starred':
            tracksToRender.sort((a, b) => {
                const aStarred = starredTracks.has(a.name);
                const bStarred = starredTracks.has(b.name);
                if (aStarred && !bStarred) return -1;
                if (!aStarred && bStarred) return 1;
                return a.name.localeCompare(b.name);
            });
            break;
        default:
            break;
    }
    
    return tracksToRender;
}


// Discord copy function
function copyDiscordCodes() {
    const discordCodes = completedTrackOrder
        .filter(trackName => discordTrackCodes[trackName])
        .map(trackName => discordTrackCodes[trackName])
        .join(' ');
    
    if (discordCodes) {
        navigator.clipboard.writeText(discordCodes).then(() => {
            // Show feedback
            const button = document.querySelector('.discord-copy-button');
            const originalText = button.textContent;
            button.textContent = '✅ Copied!';
            button.style.background = '#4CAF50';
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '#5865F2';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy to clipboard. Please try again.');
        });
    } else {
        alert('No completed tracks to copy!');
    }
}

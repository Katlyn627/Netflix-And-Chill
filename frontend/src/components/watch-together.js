// Watch Together Experience Component
(function() {
    'use strict';

    let currentUserId = null;
    let currentUser = null;
    let matches = [];
    let invitations = { sent: [], received: [] };
    let selectedInvitation = null;

    // Platform information
    const platformInfo = {
        'teleparty': {
            name: 'Teleparty (Netflix Party)',
            description: 'Watch Netflix, Disney+, Hulu, and HBO together with synchronized playback.',
            requirements: [
                'Both users need the Teleparty browser extension',
                'Both need accounts on the streaming service',
                'Works on Chrome, Edge, and Opera browsers'
            ],
            link: 'https://www.teleparty.com/'
        },
        'amazon-prime': {
            name: 'Amazon Prime Watch Party',
            description: 'Built-in feature to watch Amazon Prime Video content together.',
            requirements: [
                'Both users need Amazon Prime memberships',
                'Watch Party is built into Prime Video',
                'Works on web browsers'
            ],
            link: 'https://www.amazon.com/gp/video/watchparty'
        },
        'disney-plus': {
            name: 'Disney+ GroupWatch',
            description: 'Watch Disney+ content together with up to 6 people.',
            requirements: [
                'Both users need Disney+ subscriptions',
                'GroupWatch is built into Disney+',
                'Available on most devices'
            ],
            link: 'https://www.disneyplus.com/'
        },
        'scener': {
            name: 'Scener',
            description: 'Virtual movie theater with video chat for multiple streaming services.',
            requirements: [
                'Install Scener browser extension or app',
                'Subscriptions to the streaming services you want to use',
                'Includes video chat feature'
            ],
            link: 'https://scener.com/'
        },
        'zoom': {
            name: 'Zoom (Screen Share)',
            description: 'Use Zoom screen sharing as a fallback option for any streaming service.',
            requirements: [
                'Both users need Zoom (free accounts work)',
                'One person shares their screen',
                'Only the host needs the streaming subscription'
            ],
            link: 'https://zoom.us/'
        }
    };

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        currentUserId = localStorage.getItem('userId');
        
        if (!currentUserId) {
            window.location.href = 'login.html';
            return;
        }

        loadCurrentUser();
        loadMatches();
        loadInvitations();
        setupEventListeners();
        setMinDate();
    });

    function setMinDate() {
        const dateInput = document.getElementById('watch-date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }

    async function loadCurrentUser() {
        try {
            currentUser = await API.getUser(currentUserId);
        } catch (error) {
            console.error('Error loading user:', error);
        }
    }

    async function loadMatches() {
        try {
            // Get user's likes to find mutual matches
            const likesResponse = await API.getUserLikes(currentUserId);
            const mutualLikes = likesResponse.mutual || [];
            
            const matchSelect = document.getElementById('invite-match');
            matchSelect.innerHTML = '<option value="">Choose a match...</option>';
            
            if (mutualLikes.length === 0) {
                matchSelect.innerHTML += '<option value="" disabled>No matches yet. Go to Matches page to find someone!</option>';
                return;
            }

            for (const match of mutualLikes) {
                try {
                    // Extract userId from the match object
                    const matchUserId = match.userId || match;
                    const user = await API.getUser(matchUserId);
                    matchSelect.innerHTML += `<option value="${user.id}">${user.username}</option>`;
                    matches.push(user);
                } catch (error) {
                    console.error('Error loading match:', error);
                }
            }
        } catch (error) {
            console.error('Error loading matches:', error);
        }
    }

    async function loadInvitations() {
        try {
            const response = await fetch(`/api/watch-invitations/user/${currentUserId}`);
            if (!response.ok) throw new Error('Failed to load invitations');
            
            const data = await response.json();
            invitations = data;
            
            displayInvitations('sent');
        } catch (error) {
            console.error('Error loading invitations:', error);
        }
    }

    function setupEventListeners() {
        // Form submission
        document.getElementById('invitation-form').addEventListener('submit', handleCreateInvitation);

        // Platform selection
        document.getElementById('watch-platform').addEventListener('change', handlePlatformChange);

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const tab = this.dataset.tab;
                switchTab(tab);
            });
        });

        // Modal close
        document.getElementById('close-modal').addEventListener('click', closeModal);

        // Calendar and copy buttons
        document.getElementById('add-to-calendar-btn').addEventListener('click', addToCalendar);
        document.getElementById('copy-details-btn').addEventListener('click', copyDetails);

        // Load movie options when a match is selected
        document.getElementById('invite-match').addEventListener('change', loadMovieOptions);
    }

    function handlePlatformChange(e) {
        const platform = e.target.value;
        const infoDiv = document.getElementById('platform-info');
        
        if (!platform) {
            infoDiv.style.display = 'none';
            return;
        }

        const info = platformInfo[platform];
        infoDiv.innerHTML = `
            <h4>${info.name}</h4>
            <p>${info.description}</p>
            <p><strong>Requirements:</strong></p>
            <ul>
                ${info.requirements.map(req => `<li>${req}</li>`).join('')}
            </ul>
            <p><a href="${info.link}" target="_blank" rel="noopener">Learn more about ${info.name} →</a></p>
        `;
        infoDiv.style.display = 'block';
    }

    async function loadMovieOptions() {
        const matchId = document.getElementById('invite-match').value;
        const movieSelect = document.getElementById('movie-selection');
        
        if (!matchId) {
            movieSelect.innerHTML = '<option value="">Select a match first...</option>';
            return;
        }

        movieSelect.innerHTML = '<option value="">Select from your favorites or watch history...</option>';

        // Load current user's favorite movies and watch history
        if (currentUser) {
            // Add favorite movies
            if (currentUser.favoriteMovies && currentUser.favoriteMovies.length > 0) {
                const favGroup = document.createElement('optgroup');
                favGroup.label = 'Your Favorite Movies';
                currentUser.favoriteMovies.forEach(movie => {
                    const option = document.createElement('option');
                    option.value = JSON.stringify({
                        title: movie.title,
                        tmdbId: movie.tmdbId,
                        posterPath: movie.posterPath
                    });
                    option.textContent = movie.title;
                    favGroup.appendChild(option);
                });
                movieSelect.appendChild(favGroup);
            }

            // Add watch history
            if (currentUser.watchHistory && currentUser.watchHistory.length > 0) {
                const histGroup = document.createElement('optgroup');
                histGroup.label = 'Your Watch History';
                // Get unique titles from watch history
                const uniqueMovies = [...new Map(currentUser.watchHistory.map(item => 
                    [item.title, item]
                )).values()];
                
                uniqueMovies.slice(0, 10).forEach(item => {
                    const option = document.createElement('option');
                    option.value = JSON.stringify({
                        title: item.title,
                        tmdbId: item.tmdbId,
                        posterPath: item.posterPath
                    });
                    option.textContent = item.title;
                    histGroup.appendChild(option);
                });
                movieSelect.appendChild(histGroup);
            }
        }
    }

    async function handleCreateInvitation(e) {
        e.preventDefault();

        const matchId = document.getElementById('invite-match').value;
        const platform = document.getElementById('watch-platform').value;
        const movieSelection = document.getElementById('movie-selection').value;
        const date = document.getElementById('watch-date').value;
        const time = document.getElementById('watch-time').value;
        const joinLink = document.getElementById('join-link').value;

        if (!matchId || !platform || !date || !time) {
            alert('Please fill in all required fields');
            return;
        }

        const movie = movieSelection ? JSON.parse(movieSelection) : null;

        const invitationData = {
            fromUserId: currentUserId,
            toUserId: matchId,
            platform: platform,
            movie: movie,
            scheduledDate: date,
            scheduledTime: time,
            joinLink: joinLink || null
        };

        try {
            const response = await fetch('/api/watch-invitations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(invitationData)
            });

            if (!response.ok) throw new Error('Failed to create invitation');

            const invitation = await response.json();
            
            alert('Watch invitation created successfully! 🎉');
            
            // Reset form
            document.getElementById('invitation-form').reset();
            document.getElementById('platform-info').style.display = 'none';
            
            // Reload invitations
            await loadInvitations();
            
            // Show the invitation details
            showInvitationDetails(invitation);
        } catch (error) {
            console.error('Error creating invitation:', error);
            alert('Failed to create invitation. Please try again.');
        }
    }

    function switchTab(tab) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            }
        });

        // Show/hide invitation lists
        document.getElementById('sent-invitations').style.display = tab === 'sent' ? 'block' : 'none';
        document.getElementById('received-invitations').style.display = tab === 'received' ? 'block' : 'none';

        // Display invitations for the selected tab
        displayInvitations(tab);
    }

    async function displayInvitations(tab) {
        const container = document.getElementById(`${tab}-invitations`);
        const invitationList = invitations[tab] || [];

        if (invitationList.length === 0) {
            container.innerHTML = `<p class="empty-message">No invitations ${tab} yet</p>`;
            return;
        }

        // Sort by date (newest first)
        invitationList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        let html = '';
        for (const invitation of invitationList) {
            // Get user info for display
            let otherUserId = tab === 'sent' ? invitation.toUserId : invitation.fromUserId;
            let otherUser = matches.find(m => m.id === otherUserId);
            
            if (!otherUser) {
                try {
                    otherUser = await API.getUser(otherUserId);
                } catch (error) {
                    console.error('Error loading user:', error);
                    otherUser = { username: 'Unknown User' };
                }
            }

            const statusEmoji = {
                'pending': '⏳',
                'accepted': '✅',
                'declined': '❌',
                'cancelled': '🚫'
            };

            html += `
                <div class="invitation-card" data-invitation-id="${invitation.id}">
                    <div class="invitation-header">
                        <span class="invitation-user">${tab === 'sent' ? 'To' : 'From'}: ${otherUser.username}</span>
                        <span class="invitation-status ${invitation.status}">${statusEmoji[invitation.status]} ${invitation.status}</span>
                    </div>
                    <div class="invitation-body">
                        <p><strong>Platform:</strong> ${invitation.platformName || invitation.platform}</p>
                        ${invitation.movie ? `<p><strong>Movie:</strong> ${invitation.movie.title}</p>` : ''}
                        <p><strong>Date & Time:</strong> ${formatDateTime(invitation.scheduledDate, invitation.scheduledTime)}</p>
                    </div>
                    <div class="invitation-footer">
                        <button class="btn btn-secondary btn-sm" onclick="showInvitationDetails('${invitation.id}')">View Details</button>
                        ${tab === 'received' && invitation.status === 'pending' ? `
                            <button class="btn btn-primary btn-sm" onclick="updateStatus('${invitation.id}', 'accepted')">Accept</button>
                            <button class="btn btn-danger btn-sm" onclick="updateStatus('${invitation.id}', 'declined')">Decline</button>
                        ` : ''}
                        ${tab === 'sent' && invitation.status === 'pending' ? `
                            <button class="btn btn-danger btn-sm" onclick="updateStatus('${invitation.id}', 'cancelled')">Cancel</button>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    function formatDateTime(date, time) {
        const d = new Date(date + 'T' + time);
        return d.toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    async function showInvitationDetails(invitationId) {
        if (typeof invitationId === 'object') {
            // It's the full invitation object
            selectedInvitation = invitationId;
        } else {
            // It's an ID, fetch the invitation
            try {
                const response = await fetch(`/api/watch-invitations/${invitationId}`);
                if (!response.ok) throw new Error('Failed to load invitation');
                selectedInvitation = await response.json();
            } catch (error) {
                console.error('Error loading invitation:', error);
                alert('Failed to load invitation details');
                return;
            }
        }

        // Get other user info
        const otherUserId = selectedInvitation.fromUserId === currentUserId ? 
            selectedInvitation.toUserId : selectedInvitation.fromUserId;
        let otherUser = matches.find(m => m.id === otherUserId);
        
        if (!otherUser) {
            try {
                otherUser = await API.getUser(otherUserId);
            } catch (error) {
                otherUser = { username: 'Unknown User' };
            }
        }

        const modal = document.getElementById('invitation-modal');
        const modalBody = document.getElementById('modal-body');

        let instructionsHtml = '';
        if (selectedInvitation.instructions && selectedInvitation.instructions.length > 0) {
            instructionsHtml = `
                <div class="instructions-section">
                    <h4>Setup Instructions:</h4>
                    <ol class="instructions-list">
                        ${selectedInvitation.instructions.map(instr => `<li>${instr}</li>`).join('')}
                    </ol>
                </div>
            `;
        }

        modalBody.innerHTML = `
            <div class="invitation-details">
                <p><strong>Partner:</strong> ${otherUser.username}</p>
                <p><strong>Platform:</strong> ${selectedInvitation.platformName || selectedInvitation.platform}</p>
                ${selectedInvitation.movie ? `
                    <p><strong>Movie/Show:</strong> ${selectedInvitation.movie.title}</p>
                ` : ''}
                <p><strong>Date & Time:</strong> ${formatDateTime(selectedInvitation.scheduledDate, selectedInvitation.scheduledTime)}</p>
                <p><strong>Status:</strong> <span class="status-badge ${selectedInvitation.status}">${selectedInvitation.status}</span></p>
                ${selectedInvitation.joinLink ? `
                    <p><strong>Join Link:</strong> <a href="${selectedInvitation.joinLink}" target="_blank" rel="noopener">${selectedInvitation.joinLink}</a></p>
                ` : `
                    <p><em>Join link will be added once the watch party is created on the platform.</em></p>
                `}
                ${instructionsHtml}
            </div>
        `;

        modal.style.display = 'flex';
    }

    function closeModal() {
        document.getElementById('invitation-modal').style.display = 'none';
        selectedInvitation = null;
    }

    async function updateStatus(invitationId, newStatus) {
        try {
            const response = await fetch(`/api/watch-invitations/${invitationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update status');

            alert(`Invitation ${newStatus} successfully!`);
            await loadInvitations();
        } catch (error) {
            console.error('Error updating invitation:', error);
            alert('Failed to update invitation status. Please try again.');
        }
    }

    function addToCalendar() {
        if (!selectedInvitation) return;

        const { scheduledDate, scheduledTime, movie, platformName } = selectedInvitation;
        
        // Create event details
        const title = movie ? `Watch "${movie.title}" Together` : 'Watch Together';
        const description = `Watch together using ${platformName || selectedInvitation.platform}`;
        
        // Convert to calendar format
        const startDateTime = new Date(scheduledDate + 'T' + scheduledTime);
        const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours
        
        // Google Calendar URL
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&details=${encodeURIComponent(description)}&dates=${formatCalendarDate(startDateTime)}/${formatCalendarDate(endDateTime)}`;
        
        // Open in new tab
        window.open(googleCalendarUrl, '_blank');
    }

    function formatCalendarDate(date) {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
    }

    function copyDetails() {
        if (!selectedInvitation) return;

        const { scheduledDate, scheduledTime, movie, platformName, instructions, joinLink } = selectedInvitation;
        
        let text = `🎬 Watch Together Invitation\n\n`;
        text += `Platform: ${platformName || selectedInvitation.platform}\n`;
        if (movie) text += `Movie/Show: ${movie.title}\n`;
        text += `Date & Time: ${formatDateTime(scheduledDate, scheduledTime)}\n`;
        if (joinLink) text += `Join Link: ${joinLink}\n`;
        if (instructions && instructions.length > 0) {
            text += `\nInstructions:\n`;
            instructions.forEach((instr, i) => {
                text += `${i + 1}. ${instr}\n`;
            });
        }

        // Copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
            alert('Details copied to clipboard! 📋');
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy details. Please try again.');
        });
    }

    // Make functions globally available
    window.showInvitationDetails = showInvitationDetails;
    window.updateStatus = updateStatus;
})();

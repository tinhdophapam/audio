// ===== Audio Player Application =====

class AudioPlayer {
    constructor() {
        // DOM Elements
        this.audio = document.getElementById('audioPlayer');
        this.playBtn = document.getElementById('playBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.progressHandle = document.getElementById('progressHandle');
        this.currentTimeEl = document.getElementById('currentTime');
        this.durationEl = document.getElementById('duration');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.muteBtn = document.getElementById('muteBtn');
        this.speedBtn = document.getElementById('speedBtn');
        this.speedMenu = document.getElementById('speedMenu');
        this.trackTitle = document.getElementById('trackTitle');
        this.trackFolder = document.getElementById('trackFolder');
        this.playlist = document.getElementById('playlist');
        this.searchInput = document.getElementById('searchInput');
        this.clearSearch = document.getElementById('clearSearch');
        this.themeToggle = document.getElementById('themeToggle');
        this.themeToggleDesktop = document.getElementById('themeToggleDesktop');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        this.favoriteBtn = document.getElementById('favoriteBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        // Queue button removed - now using filter tab instead
        this.queuePanel = document.getElementById('queuePanel');
        this.closeQueue = document.getElementById('closeQueue');
        this.queueContent = document.getElementById('queueContent');
        this.shareModal = document.getElementById('shareModal');
        this.closeShareModal = document.getElementById('closeShareModal');
        this.shareLink = document.getElementById('shareLink');
        this.copyLink = document.getElementById('copyLink');
        this.totalTracks = document.getElementById('totalTracks');
        this.totalFavorites = document.getElementById('totalFavorites');

        // Mini Player Elements
        this.miniPlayer = document.getElementById('miniPlayer');
        this.miniPlayBtn = document.getElementById('miniPlayBtn');
        this.miniPrevBtn = document.getElementById('miniPrevBtn');
        this.miniNextBtn = document.getElementById('miniNextBtn');
        this.miniCloseBtn = document.getElementById('miniCloseBtn');
        this.miniTrackTitle = document.getElementById('miniTrackTitle');
        this.miniCurrentTime = document.getElementById('miniCurrentTime');
        this.miniDuration = document.getElementById('miniDuration');
        this.miniProgressBar = document.getElementById('miniProgressBar');
        this.miniProgressFill = document.getElementById('miniProgressFill');
        this.miniPlayerContent = document.getElementById('miniPlayerContent');
        this.miniPlayerInfo = document.querySelector('.mini-player-info');
        
        // Bottom Nav
        this.bottomNav = document.getElementById('bottomNav');
        
        // Swipe gesture state
        this.touchStartY = 0;
        this.touchEndY = 0;

        // State
        this.lectures = [];
        this.flatPlaylist = [];
        this.currentIndex = -1;
        this.isDragging = false;
        this.isShuffled = false;
        this.repeatMode = 'off'; // off, one, all
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        this.recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed')) || [];
        this.queue = [];
        this.currentFilter = 'all';

        // Initialize
        this.init();
    }

    async init() {
        await this.loadLectures();
        this.setupEventListeners();
        this.loadState();
        this.applyTheme();
        this.updateStats();
        this.initBuddhaText();
        this.initializeLibraryView();
        this.initializePlaylistView();
        this.initializeDefaultView();
    }

    // ===== Buddha Text Animation =====
    initBuddhaText() {
        const buddhaNameEl = document.querySelector('.buddha-name');
        if (!buddhaNameEl) return;

        const text = 'Nam Mô A Di Đà Phật';
        const words = text.split(' ').filter(w => w.length > 0);
        
        // 6 màu theo thứ tự từ Flutter (giống hệt)
        const colors = [
            '#D84315', // Deep Orange 900
            '#C62828', // Red 800
            '#2E7D32', // Green 800
            '#00838F', // Cyan 800
            '#1565C0', // Blue 800
            '#6A1B9A', // Purple 800
        ];

        let currentWordIndex = 0;
        let colorIndex = 0;
        let cycleCount = 0;

        const updateText = () => {
            // Hiển thị từ đầu đến từ hiện tại với animation
            const displayText = words.slice(0, currentWordIndex + 1).join(' ');
            buddhaNameEl.textContent = displayText;
            buddhaNameEl.style.color = colors[colorIndex];
            
            // Add subtle scale animation
            buddhaNameEl.style.transform = 'scale(1.02)';
            setTimeout(() => {
                buddhaNameEl.style.transform = 'scale(1)';
            }, 200);

            // Chuyển sang từ tiếp theo
            currentWordIndex++;

            // Nếu hết chuỗi, quay về đầu
            if (currentWordIndex >= words.length) {
                currentWordIndex = 0;
                cycleCount++;

                // Sau 10 lần chạy hết chuỗi thì đổi màu
                if (cycleCount >= 10) {
                    colorIndex = (colorIndex + 1) % colors.length;
                    cycleCount = 0;
                }
            }
        };

        // Chạy mỗi 1 giây (1000ms) - giống Flutter
        updateText(); // Hiển thị ngay lần đầu
        setInterval(updateText, 1000);
    }

    // ===== Load Lectures from JSON =====
    async loadLectures() {
        try {
            const response = await fetch('lectures.json');
            if (!response.ok) throw new Error('Không thể tải file lectures.json');
            
            this.lectures = await response.json();
            this.buildFlatPlaylist();
            this.renderPlaylist();
        } catch (error) {
            this.showError('Lỗi tải danh sách: ' + error.message);
            this.playlist.innerHTML = `
                <div class="loading">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Không thể tải danh sách bài giảng</p>
                    <p style="font-size: 0.85rem; margin-top: 0.5rem;">Đảm bảo file lectures.json nằm cùng thư mục</p>
                </div>
            `;
        }
    }

    // ===== Build Flat Playlist for Navigation =====
    buildFlatPlaylist() {
        this.flatPlaylist = [];
        this.lectures.forEach(folder => {
            if (folder.subfolders) {
                folder.subfolders.forEach(subfolder => {
                    if (subfolder.items) {
                        subfolder.items.forEach(item => {
                            this.flatPlaylist.push({
                                ...item,
                                folder: folder.folder,
                                subfolder: subfolder.name
                            });
                        });
                    }
                });
            }
        });
    }

    // ===== Navigation State =====
    currentView = 'folders'; // 'folders', 'subfolders', 'lectures'
    currentFolderIndex = -1;
    currentSubfolderIndex = -1;
    navigationHistory = [];

    // ===== Render Playlist =====
    renderPlaylist(searchTerm = '') {
        // Handle special filters first
        if (this.currentFilter === 'favorites') {
            this.renderFavorites(searchTerm);
            return;
        } else if (this.currentFilter === 'recent') {
            this.renderRecents(searchTerm);
            return;
        }

        // Render based on current view
        switch (this.currentView) {
            case 'folders':
                this.renderFolders(searchTerm);
                break;
            case 'subfolders':
                this.renderSubfolders(searchTerm);
                break;
            case 'lectures':
                this.renderLectures(searchTerm);
                break;
        }
    }

    // ===== Render Folders (Main View) =====
    renderFolders(searchTerm = '') {
        this.playlist.innerHTML = '';

        this.lectures.forEach((folder, folderIndex) => {
            // Search filter
            if (searchTerm && !folder.folder.toLowerCase().includes(searchTerm.toLowerCase())) {
                return;
            }

            // Count subfolders and items
            const subfolderCount = folder.subfolders ? folder.subfolders.length : 0;
            const itemCount = folder.subfolders 
                ? folder.subfolders.reduce((sum, sub) => sum + (sub.items ? sub.items.length : 0), 0)
                : 0;

            const folderCard = document.createElement('div');
            folderCard.className = 'folder-card';
            folderCard.innerHTML = `
                <div class="folder-card-icon">
                    <i class="fas fa-folder-open"></i>
                </div>
                <div class="folder-card-content">
                    <div class="folder-card-title">${folder.folder}</div>
                    <div class="folder-card-subtitle">${subfolderCount} thư mục • ${itemCount} bài</div>
                </div>
                <div class="folder-card-arrow">
                    <i class="fas fa-chevron-right"></i>
                </div>
            `;

            folderCard.addEventListener('click', () => {
                this.navigateToSubfolders(folderIndex);
            });

            this.playlist.appendChild(folderCard);
        });
    }

    // ===== Render Subfolders =====
    renderSubfolders(searchTerm = '') {
        this.playlist.innerHTML = '';

        if (this.currentFolderIndex < 0 || this.currentFolderIndex >= this.lectures.length) {
            this.navigateToFolders();
            return;
        }

        const folder = this.lectures[this.currentFolderIndex];

        // Add back button
        const backBtn = document.createElement('div');
        backBtn.className = 'back-button';
        backBtn.innerHTML = `
            <i class="fas fa-arrow-left"></i>
            <span>Quay lại</span>
        `;
        backBtn.addEventListener('click', () => this.navigateToFolders());
        this.playlist.appendChild(backBtn);

        // Add folder title
        const folderTitle = document.createElement('div');
        folderTitle.className = 'folder-title';
        folderTitle.textContent = folder.folder;
        this.playlist.appendChild(folderTitle);

        // Render subfolders
        if (folder.subfolders) {
            folder.subfolders.forEach((subfolder, subfolderIndex) => {
                // Search filter
                if (searchTerm && !subfolder.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return;
                }

                const itemCount = subfolder.items ? subfolder.items.length : 0;

                const subfolderCard = document.createElement('div');
                subfolderCard.className = 'folder-card';
                subfolderCard.innerHTML = `
                    <div class="folder-card-icon">
                        <i class="fas fa-folder"></i>
                    </div>
                    <div class="folder-card-content">
                        <div class="folder-card-title">${subfolder.name}</div>
                        <div class="folder-card-subtitle">${itemCount} bài giảng</div>
                    </div>
                    <div class="folder-card-arrow">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                `;

                subfolderCard.addEventListener('click', () => {
                    this.navigateToLectures(subfolderIndex);
                });

                this.playlist.appendChild(subfolderCard);
            });
        }
    }

    // ===== Render Lectures =====
    renderLectures(searchTerm = '') {
        this.playlist.innerHTML = '';

        if (this.currentFolderIndex < 0 || this.currentSubfolderIndex < 0) {
            this.navigateToFolders();
            return;
        }

        const folder = this.lectures[this.currentFolderIndex];
        const subfolder = folder.subfolders[this.currentSubfolderIndex];

        // Add back button
        const backBtn = document.createElement('div');
        backBtn.className = 'back-button';
        backBtn.innerHTML = `
            <i class="fas fa-arrow-left"></i>
            <span>Quay lại</span>
        `;
        backBtn.addEventListener('click', () => this.navigateToSubfolders(this.currentFolderIndex));
        this.playlist.appendChild(backBtn);

        // Add subfolder title
        const subfolderTitle = document.createElement('div');
        subfolderTitle.className = 'folder-title';
        subfolderTitle.textContent = subfolder.name;
        this.playlist.appendChild(subfolderTitle);

        // Render lectures
        if (subfolder.items) {
            subfolder.items.forEach((item, itemIndex) => {
                // Search filter
                if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return;
                }

                // Find index in flat playlist
                const flatIndex = this.flatPlaylist.findIndex(t => t.url === item.url);
                const isActive = flatIndex === this.currentIndex;

                const trackCard = document.createElement('div');
                trackCard.className = `track-card ${isActive ? 'active' : ''}`;
                trackCard.innerHTML = `
                    <div class="track-card-icon">
                        <i class="fas ${isActive ? 'fa-volume-up' : 'fa-music'}"></i>
                    </div>
                    <div class="track-card-content">
                        <div class="track-card-title">${item.title}</div>
                        <div class="track-card-subtitle">${item.duration || '--:--'}</div>
                    </div>
                    <div class="track-card-actions">
                        <button class="track-action-btn favorite-track-btn ${this.favorites.some(f => f.url === item.url) ? 'active' : ''}" data-url="${item.url}">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                `;

                trackCard.addEventListener('click', (e) => {
                    if (!e.target.closest('.track-action-btn')) {
                        this.playTrack(flatIndex);
                    }
                });

                // Favorite button
                const favoriteBtn = trackCard.querySelector('.favorite-track-btn');
                favoriteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFavoriteTrack(item);
                    favoriteBtn.classList.toggle('active');
                });

                this.playlist.appendChild(trackCard);
            });
        }
    }

    // ===== Render Favorites (Playlist) =====
    renderFavorites(searchTerm = '') {
        this.playlist.innerHTML = '';

        if (this.favorites.length === 0) {
            this.playlist.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-playlist-play"></i>
                    <h3>Playlist trống</h3>
                    <p>Thêm thư mục, thư mục con hoặc bài giảng vào playlist bằng cách nhấn vào biểu tượng ngôi sao.</p>
                </div>
            `;
            return;
        }

        // Add "Danh sách bài tự chọn" section (expandable) - Always show first
        const customPlaylistCard = document.createElement('div');
        customPlaylistCard.className = 'custom-playlist-card';
        customPlaylistCard.innerHTML = `
            <div class="custom-playlist-header">
                <div class="custom-playlist-icon">
                    <i class="fas fa-queue-music"></i>
                </div>
                <div class="custom-playlist-content">
                    <div class="custom-playlist-title">Danh sách bài tự chọn</div>
                    <div class="custom-playlist-subtitle">${this.favorites.length} bài đã chọn</div>
                </div>
                ${this.favorites.length > 0 ? `
                    <button class="custom-playlist-play-btn" title="Phát tất cả">
                        <i class="fas fa-play-circle"></i>
                    </button>
                ` : ''}
                <button class="custom-playlist-toggle">
                    <i class="fas fa-chevron-down"></i>
                </button>
            </div>
            <div class="custom-playlist-items collapsed"></div>
        `;

        const playBtn = customPlaylistCard.querySelector('.custom-playlist-play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.favorites.length > 0) {
                    const firstIndex = this.flatPlaylist.findIndex(t => t.url === this.favorites[0].url);
                    if (firstIndex >= 0) {
                        this.playTrack(firstIndex);
                    }
                }
            });
        }

        const toggleBtn = customPlaylistCard.querySelector('.custom-playlist-toggle');
        const itemsContainer = customPlaylistCard.querySelector('.custom-playlist-items');
        
        const headerDiv = customPlaylistCard.querySelector('.custom-playlist-header');
        headerDiv.addEventListener('click', (e) => {
            // Don't toggle if clicking on play button
            if (!e.target.closest('.custom-playlist-play-btn')) {
                itemsContainer.classList.toggle('collapsed');
                const icon = toggleBtn.querySelector('i');
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            }
        });

        // Render favorite items in expandable section
        this.favorites.forEach(item => {
            const flatIndex = this.flatPlaylist.findIndex(t => t.url === item.url);
            const isActive = flatIndex === this.currentIndex;

            const itemEl = document.createElement('div');
            itemEl.className = `custom-playlist-item ${isActive ? 'active' : ''}`;
            itemEl.innerHTML = `
                <div class="custom-playlist-item-icon">
                    <i class="fas fa-music"></i>
                </div>
                <div class="custom-playlist-item-content">
                    <div class="custom-playlist-item-title">${item.title}</div>
                    <div class="custom-playlist-item-subtitle">${item.teacher || item.folder}</div>
                </div>
                <button class="custom-playlist-item-remove" title="Xóa khỏi danh sách">
                    <i class="fas fa-times-circle"></i>
                </button>
            `;

            itemEl.addEventListener('click', (e) => {
                if (!e.target.closest('.custom-playlist-item-remove')) {
                    this.playTrack(flatIndex);
                }
            });

            const removeBtn = itemEl.querySelector('.custom-playlist-item-remove');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavoriteTrack(item);
                itemEl.remove();
                // Update count
                const subtitle = customPlaylistCard.querySelector('.custom-playlist-subtitle');
                subtitle.textContent = `${this.favorites.length} bài đã chọn`;
                
                // Hide play button if no items
                if (this.favorites.length === 0 && playBtn) {
                    playBtn.remove();
                }
            });

            itemsContainer.appendChild(itemEl);
        });

        this.playlist.appendChild(customPlaylistCard);
    }

    // ===== Render Recents (History) =====
    renderRecents(searchTerm = '') {
        this.playlist.innerHTML = '';

        if (this.recentlyPlayed.length === 0) {
            this.playlist.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h3>Chưa có lịch sử phát</h3>
                    <p>Các bài giảng bạn đã nghe sẽ xuất hiện ở đây.</p>
                </div>
            `;
            return;
        }

        this.recentlyPlayed.forEach(item => {
            if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
                return;
            }

            const flatIndex = this.flatPlaylist.findIndex(t => t.url === item.url);
            const isActive = flatIndex === this.currentIndex;

            const historyCard = document.createElement('div');
            historyCard.className = 'history-card';
            historyCard.innerHTML = `
                <div class="history-card-icon">
                    <i class="fas fa-history"></i>
                </div>
                <div class="history-card-content">
                    <div class="history-card-title">${item.title}</div>
                    <div class="history-card-subtitle">${item.teacher || item.folder}</div>
                    <div class="history-card-location">
                        <i class="fas fa-folder"></i>
                        <span>${item.folder} › ${item.subfolder}</span>
                    </div>
                </div>
                <div class="history-card-actions">
                    <button class="track-action-btn favorite-track-btn ${this.favorites.some(f => f.url === item.url) ? 'active' : ''}" data-url="${item.url}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            `;

            historyCard.addEventListener('click', (e) => {
                if (!e.target.closest('.track-action-btn')) {
                    this.playTrack(flatIndex);
                }
            });

            const favoriteBtn = historyCard.querySelector('.favorite-track-btn');
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavoriteTrack(item);
                favoriteBtn.classList.toggle('active');
            });

            this.playlist.appendChild(historyCard);
        });
    }

    // ===== Navigation Methods =====
    navigateToFolders() {
        this.currentView = 'folders';
        this.currentFolderIndex = -1;
        this.currentSubfolderIndex = -1;
        this.renderPlaylist();
    }

    navigateToSubfolders(folderIndex) {
        this.currentView = 'subfolders';
        this.currentFolderIndex = folderIndex;
        this.currentSubfolderIndex = -1;
        this.renderPlaylist();
    }

    navigateToLectures(subfolderIndex) {
        this.currentView = 'lectures';
        this.currentSubfolderIndex = subfolderIndex;
        this.renderPlaylist();
    }

    toggleFavoriteTrack(item) {
        const index = this.favorites.findIndex(f => f.url === item.url);
        if (index >= 0) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(item);
        }
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.updateStats();
    }

    // ===== Play Track =====
    playTrack(index) {
        if (index < 0 || index >= this.flatPlaylist.length) return;

        this.currentIndex = index;
        const track = this.flatPlaylist[index];

        this.audio.src = track.url;
        this.trackTitle.textContent = track.title;
        this.trackFolder.textContent = `${track.folder} • ${track.subfolder}`;

        this.audio.play().catch(error => {
            this.showError('Không thể phát audio: ' + error.message);
        });

        this.updateActiveTrack();
        this.scrollToActiveTrack();
        this.updateFavoriteButton();
        this.addToRecentlyPlayed(track);
        this.updateQueue();
        this.saveState();

        // Add playing animation to album art
        const albumArt = document.querySelector('.album-art-inner');
        if (albumArt) albumArt.classList.add('playing');

        // Update mini player
        this.updateMiniPlayer(track);
        this.showMiniPlayer();
    }

    // ===== Update Active Track Highlight =====
    updateActiveTrack() {
        // Active state is now handled during rendering
        // This method is kept for backward compatibility
    }

    // ===== Scroll to Active Track =====
    scrollToActiveTrack() {
        const activeTrack = document.querySelector('.track-item.active');
        if (activeTrack) {
            activeTrack.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // ===== Play/Pause Toggle =====
    togglePlay() {
        if (this.audio.paused) {
            if (this.currentIndex === -1 && this.flatPlaylist.length > 0) {
                this.playTrack(0);
            } else {
                this.audio.play();
            }
        } else {
            this.audio.pause();
        }
    }

    // ===== Previous Track =====
    prevTrack() {
        if (this.currentIndex > 0) {
            this.playTrack(this.currentIndex - 1);
        }
    }

    // ===== Next Track =====
    nextTrack() {
        if (this.currentIndex < this.flatPlaylist.length - 1) {
            this.playTrack(this.currentIndex + 1);
        }
    }

    // ===== Format Time =====
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // ===== Update Progress =====
    updateProgress() {
        const { currentTime, duration } = this.audio;
        if (duration) {
            const percent = (currentTime / duration) * 100;
            this.progressFill.style.width = `${percent}%`;
            this.progressHandle.style.left = `${percent}%`;
            this.currentTimeEl.textContent = this.formatTime(currentTime);
            
            // Update mini player progress
            if (this.miniProgressFill) {
                this.miniProgressFill.style.width = `${percent}%`;
            }
            if (this.miniCurrentTime) {
                this.miniCurrentTime.textContent = this.formatTime(currentTime);
            }
        }
    }

    // ===== Seek =====
    seek(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const time = percent * this.audio.duration;
        if (!isNaN(time)) {
            this.audio.currentTime = time;
        }
    }

    // ===== Volume Control =====
    updateVolume() {
        const volume = this.volumeSlider.value / 100;
        this.audio.volume = volume;
        this.updateVolumeIcon(volume);
        localStorage.setItem('volume', volume);
    }

    updateVolumeIcon(volume) {
        const icon = this.muteBtn.querySelector('i');
        if (volume === 0) {
            icon.className = 'fas fa-volume-mute';
        } else if (volume < 0.5) {
            icon.className = 'fas fa-volume-down';
        } else {
            icon.className = 'fas fa-volume-up';
        }
    }

    toggleMute() {
        if (this.audio.volume > 0) {
            this.audio.dataset.prevVolume = this.audio.volume;
            this.audio.volume = 0;
            this.volumeSlider.value = 0;
        } else {
            const prevVolume = parseFloat(this.audio.dataset.prevVolume) || 0.8;
            this.audio.volume = prevVolume;
            this.volumeSlider.value = prevVolume * 100;
        }
        this.updateVolumeIcon(this.audio.volume);
    }

    // ===== Playback Speed =====
    toggleSpeedMenu() {
        this.speedMenu.classList.toggle('show');
    }

    setSpeed(speed) {
        this.audio.playbackRate = speed;
        this.speedBtn.querySelector('.speed-text').textContent = `${speed}x`;
        
        document.querySelectorAll('.speed-menu button').forEach(btn => {
            btn.classList.remove('active');
            if (parseFloat(btn.dataset.speed) === speed) {
                btn.classList.add('active');
            }
        });

        localStorage.setItem('playbackSpeed', speed);
        this.speedMenu.classList.remove('show');
    }

    // ===== Theme Toggle =====
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const iconClass = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        const icon = this.themeToggle.querySelector('i');
        if (icon) icon.className = iconClass;
        if (this.themeToggleDesktop) {
            const desktopIcon = this.themeToggleDesktop.querySelector('i');
            if (desktopIcon) desktopIcon.className = iconClass;
        }
    }

    applyTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        const iconClass = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
        const icon = this.themeToggle.querySelector('i');
        if (icon) icon.className = iconClass;
        if (this.themeToggleDesktop) {
            const desktopIcon = this.themeToggleDesktop.querySelector('i');
            if (desktopIcon) desktopIcon.className = iconClass;
        }
    }

    // ===== Mini Player Functions =====
    updateMiniPlayer(track) {
        if (this.miniTrackTitle) {
            this.miniTrackTitle.textContent = track.title;
        }
        if (this.miniDuration && this.audio.duration) {
            this.miniDuration.textContent = this.formatTime(this.audio.duration);
        }
    }

    showMiniPlayer() {
        console.log(`📊 Window width: ${window.innerWidth}px`);
        if (window.innerWidth <= 968) {
            console.log('📱 Mobile mode: Showing mini player');
            if (this.miniPlayer) {
                // ✅ FIX: Use 'block' instead of empty string to override CSS display:none
                this.miniPlayer.style.display = 'block';
                // Force reflow for smooth animation
                this.miniPlayer.offsetHeight;
                this.miniPlayer.classList.add('show');
                console.log('✅ Mini player shown with display:', window.getComputedStyle(this.miniPlayer).display);
            }
        } else {
            console.log('🖥️ Desktop mode: Full player already visible, hiding mini player');
            // On desktop, ensure mini player is hidden
            if (this.miniPlayer) {
                this.miniPlayer.classList.remove('show');
                this.miniPlayer.style.display = 'none';
            }
        }
    }

    closeMiniPlayer() {
        if (this.miniPlayer) {
            this.miniPlayer.classList.remove('show');
        }
        // Stop audio
        this.audio.pause();
        this.audio.currentTime = 0;
        this.currentIndex = -1;
        this.trackTitle.textContent = 'Chọn bài giảng để phát';
        this.trackFolder.textContent = '---';
        if (this.miniTrackTitle) {
            this.miniTrackTitle.textContent = 'Chọn bài giảng';
        }
    }

    openFullPlayer() {
        console.log('🔵 openFullPlayer called, window width:', window.innerWidth);
        if (window.innerWidth <= 968) {
            const playerSection = document.querySelector('.player-section');
            if (playerSection) {
                console.log('✅ Adding fullscreen class');
                playerSection.classList.add('fullscreen');

                // Add close button for fullscreen
                if (!playerSection.querySelector('.close-fullscreen')) {
                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'close-fullscreen';
                    closeBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
                    closeBtn.addEventListener('click', () => {
                        console.log('🔴 Close button clicked');
                        this.closeFullPlayer();
                    });
                    playerSection.insertBefore(closeBtn, playerSection.firstChild);
                }

                // Hide mini player when full player is open
                if (this.miniPlayer) {
                    console.log('🔵 Hiding mini player');
                    this.miniPlayer.style.display = 'none';
                }
                console.log('✅ Full player opened');
            } else {
                console.error('❌ Player section NOT FOUND!');
            }
        }
    }

    closeFullPlayer() {
        console.log('🔵 Closing full player');
        const playerSection = document.querySelector('.player-section');
        if (playerSection) {
            playerSection.classList.remove('fullscreen');
            // Remove close button
            const closeBtn = playerSection.querySelector('.close-fullscreen');
            if (closeBtn) {
                closeBtn.remove();
            }
        }
        // Show mini player again
        if (this.miniPlayer) {
            console.log('✅ Showing mini player again');
            this.miniPlayer.style.display = 'block';
        }
    }

    setupSwipeGesture() {
        const playerSection = document.querySelector('.player-section');
        if (!playerSection) return;

        playerSection.addEventListener('touchstart', (e) => {
            if (playerSection.classList.contains('fullscreen')) {
                this.touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        playerSection.addEventListener('touchmove', (e) => {
            if (playerSection.classList.contains('fullscreen')) {
                this.touchEndY = e.touches[0].clientY;
            }
        }, { passive: true });

        playerSection.addEventListener('touchend', () => {
            if (playerSection.classList.contains('fullscreen')) {
                const swipeDistance = this.touchEndY - this.touchStartY;
                // If swipe down more than 100px, close full player
                if (swipeDistance > 100) {
                    console.log('⬇️ Swipe down detected, closing');
                    this.closeFullPlayer();
                }
            }
        }, { passive: true });
    }

    seekMini(e) {
        const rect = this.miniProgressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const time = percent * this.audio.duration;
        if (!isNaN(time)) {
            this.audio.currentTime = time;
        }
    }

    // ===== Bottom Navigation Handler =====
    handleBottomNav(nav) {
        // Update active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-nav="${nav}"]`).classList.add('active');

        // Hide all content views
        document.querySelectorAll('.content-view').forEach(view => {
            view.classList.remove('active');
        });

        // Handle navigation
        switch(nav) {
            case 'playlist':
                // Show playlist view
                document.getElementById('playlistView').classList.add('active');
                this.renderPlaylistView();
                break;
            case 'library':
                // Show library view
                document.getElementById('libraryView').classList.add('active');
                // Reset to folders view when switching to library tab
                if (this.libraryView !== 'folders') {
                    this.navigateLibraryToFolders();
                } else {
                    this.renderLibraryView();
                }
                break;
            case 'history':
                // Show history view
                document.getElementById('historyView').classList.add('active');
                this.renderHistoryView();
                break;
        }
    }

    // ===== Render Playlist View =====
    renderPlaylistView() {
        const playlistViewContent = document.getElementById('playlistViewContent');
        if (!playlistViewContent) return;

        playlistViewContent.innerHTML = '';

        // Playlist shows: Favorites + Quick access subfolders
        this.renderFavoriteTracks(playlistViewContent);
        this.renderQuickAccessSubfolders(playlistViewContent);
    }

    // ===== Render Favorite Tracks in Playlist View =====
    renderFavoriteTracks(container) {
        // Section header
        const favoritesSection = document.createElement('div');
        favoritesSection.className = 'playlist-section';
        favoritesSection.innerHTML = `
            <div class="playlist-section-header">
                <h3><i class="fas fa-star"></i> Bài yêu thích</h3>
                <span class="playlist-section-count">${this.favorites.length} bài</span>
            </div>
        `;
        container.appendChild(favoritesSection);

        // Check if empty
        if (this.favorites.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state-small';
            emptyState.innerHTML = `
                <p>Chưa có bài yêu thích. Nhấn vào <i class="fas fa-star"></i> để thêm bài vào playlist.</p>
            `;
            container.appendChild(emptyState);
            return;
        }

        // Render favorite tracks
        this.favorites.forEach(item => {
            const flatIndex = this.flatPlaylist.findIndex(t => t.url === item.url);
            const isActive = flatIndex === this.currentIndex;

            const trackCard = document.createElement('div');
            trackCard.className = `track-card ${isActive ? 'active' : ''}`;
            trackCard.innerHTML = `
                <div class="track-card-icon">
                    <i class="fas ${isActive ? 'fa-volume-up' : 'fa-music'}"></i>
                </div>
                <div class="track-card-content">
                    <div class="track-card-title">${item.title}</div>
                    <div class="track-card-subtitle">${item.folder} › ${item.subfolder}</div>
                </div>
                <div class="track-card-actions">
                    <button class="track-action-btn favorite-track-btn active" data-url="${item.url}">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
            `;

            trackCard.addEventListener('click', (e) => {
                if (!e.target.closest('.track-action-btn')) {
                    this.playTrack(flatIndex);
                }
            });

            // Favorite button (to remove from favorites)
            const favoriteBtn = trackCard.querySelector('.favorite-track-btn');
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavoriteTrack(item);
                // Re-render playlist view to update
                this.renderPlaylistView();
            });

            container.appendChild(trackCard);
        });
    }

    // ===== Render Quick Access Subfolders =====
    renderQuickAccessSubfolders(container) {
        // Section header
        const quickAccessSection = document.createElement('div');
        quickAccessSection.className = 'playlist-section';
        quickAccessSection.innerHTML = `
            <div class="playlist-section-header">
                <h3><i class="fas fa-star"></i> Thư mục yêu thích</h3>
                <span class="playlist-section-count" id="favSubfolderCount">0 thư mục</span>
            </div>
        `;
        container.appendChild(quickAccessSection);

        // Get saved quick access subfolders from localStorage
        const quickAccessSubfolders = JSON.parse(localStorage.getItem('quickAccessSubfolders') || '[]');

        // Update count
        const countSpan = container.querySelector('#favSubfolderCount');
        if (countSpan) {
            countSpan.textContent = `${quickAccessSubfolders.length} thư mục`;
        }

        if (quickAccessSubfolders.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state-small';
            emptyState.innerHTML = `
                <p>Chưa có thư mục yêu thích. Vào <strong>Thư viện</strong> và nhấn vào <i class="fas fa-star"></i> ở subfolder để thêm vào playlist.</p>
            `;
            container.appendChild(emptyState);
        } else {
            // Render each subfolder card
            quickAccessSubfolders.forEach((item, index) => {
                const subfolderCard = document.createElement('div');
                subfolderCard.className = 'folder-card';
                subfolderCard.innerHTML = `
                    <div class="folder-card-icon">
                        <i class="fas fa-folder"></i>
                    </div>
                    <div class="folder-card-content">
                        <div class="folder-card-title">${item.subfolderName}</div>
                        <div class="folder-card-subtitle">${item.folderName} • ${item.itemCount} bài</div>
                    </div>
                    <div class="folder-card-actions">
                        <button class="folder-remove-btn" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;

                // Click to navigate to that subfolder
                subfolderCard.addEventListener('click', (e) => {
                    if (!e.target.closest('.folder-remove-btn')) {
                        // Navigate to that subfolder in Library View
                        if (window.innerWidth <= 968) {
                            // On mobile: Switch to Library tab and navigate
                            this.libraryFolderIndex = item.folderIndex;
                            this.librarySubfolderIndex = item.subfolderIndex;
                            this.libraryView = 'lectures';

                            // Hide playlist view, show library view
                            document.getElementById('playlistView').classList.remove('active');
                            document.getElementById('libraryView').classList.add('active');

                            // Update bottom nav to Library
                            document.querySelectorAll('.nav-item').forEach(navItem => {
                                navItem.classList.remove('active');
                            });
                            document.querySelector('[data-nav="library"]').classList.add('active');

                            // Render library view with the selected subfolder
                            this.renderLibraryView();
                        } else {
                            // On desktop: Navigate to subfolder
                            this.navigateToSubfolders(item.folderIndex);
                            this.navigateToLectures(item.subfolderIndex);
                        }
                    }
                });

                // Remove button
                const removeBtn = subfolderCard.querySelector('.folder-remove-btn');
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    quickAccessSubfolders.splice(index, 1);
                    localStorage.setItem('quickAccessSubfolders', JSON.stringify(quickAccessSubfolders));
                    this.renderPlaylistView();
                });

                container.appendChild(subfolderCard);
            });
        }
    }

    // ===== Toggle Favorite Subfolder =====
    toggleFavoriteSubfolder(folderIndex, subfolderIndex, subfolderName, itemCount) {
        const quickAccessSubfolders = JSON.parse(localStorage.getItem('quickAccessSubfolders') || '[]');

        // Check if already in favorites
        const existingIndex = quickAccessSubfolders.findIndex(item =>
            item.folderIndex === folderIndex &&
            item.subfolderIndex === subfolderIndex
        );

        if (existingIndex >= 0) {
            // Remove from favorites
            quickAccessSubfolders.splice(existingIndex, 1);
        } else {
            // Add to favorites
            const folder = this.lectures[folderIndex];
            quickAccessSubfolders.push({
                folderName: folder.folder,
                folderIndex: folderIndex,
                subfolderName: subfolderName,
                subfolderIndex: subfolderIndex,
                itemCount: itemCount
            });
        }

        localStorage.setItem('quickAccessSubfolders', JSON.stringify(quickAccessSubfolders));

        // Re-render playlist view if it's currently visible
        const playlistView = document.getElementById('playlistView');
        if (playlistView && playlistView.classList.contains('active')) {
            this.renderPlaylistView();
        }
    }

    // ===== Initialize Playlist View =====
    initializePlaylistView() {
        // Render playlist view content when data is loaded
        if (this.lectures.length > 0) {
            this.renderPlaylistView();
        }
    }

    // ===== Initialize Default View =====
    initializeDefaultView() {
        // On mobile, show library view by default
        if (window.innerWidth <= 968) {
            // Hide all content views
            document.querySelectorAll('.content-view').forEach(view => {
                view.classList.remove('active');
            });
            // Show library view
            document.getElementById('libraryView').classList.add('active');

            // Update bottom nav active state
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector('[data-nav="library"]').classList.add('active');
        }
    }

    // ===== Initialize Library View =====
    initializeLibraryView() {
        // Render library content when data is loaded
        if (this.lectures.length > 0) {
            this.renderLibraryView();
        }
    }

    // ===== Library Navigation State =====
    libraryView = 'folders'; // 'folders', 'subfolders', 'lectures'
    libraryFolderIndex = -1;
    librarySubfolderIndex = -1;

    // ===== Render Library View =====
    renderLibraryView() {
        const libraryContent = document.getElementById('libraryContent');
        if (!libraryContent) return;

        libraryContent.innerHTML = '';

        // Render based on library view state
        switch (this.libraryView) {
            case 'folders':
                this.renderLibraryFolders(libraryContent);
                break;
            case 'subfolders':
                this.renderLibrarySubfolders(libraryContent);
                break;
            case 'lectures':
                this.renderLibraryLectures(libraryContent);
                break;
        }
    }

    // ===== Render Library Folders =====
    renderLibraryFolders(container) {
        this.lectures.forEach((folder, folderIndex) => {
            const subfolderCount = folder.subfolders ? folder.subfolders.length : 0;
            const itemCount = folder.subfolders 
                ? folder.subfolders.reduce((sum, sub) => sum + (sub.items ? sub.items.length : 0), 0)
                : 0;

            const folderCard = document.createElement('div');
            folderCard.className = 'folder-card';
            folderCard.innerHTML = `
                <div class="folder-card-icon">
                    <i class="fas fa-folder-open"></i>
                </div>
                <div class="folder-card-content">
                    <div class="folder-card-title">${folder.folder}</div>
                    <div class="folder-card-subtitle">${subfolderCount} thư mục • ${itemCount} bài</div>
                </div>
                <div class="folder-card-arrow">
                    <i class="fas fa-chevron-right"></i>
                </div>
            `;

            folderCard.addEventListener('click', () => {
                this.navigateLibraryToSubfolders(folderIndex);
            });

            container.appendChild(folderCard);
        });
    }

    // ===== Render Library Subfolders =====
    renderLibrarySubfolders(container) {
        if (this.libraryFolderIndex < 0 || this.libraryFolderIndex >= this.lectures.length) {
            this.navigateLibraryToFolders();
            return;
        }

        const folder = this.lectures[this.libraryFolderIndex];

        // Add back button
        const backBtn = document.createElement('div');
        backBtn.className = 'back-button';
        backBtn.innerHTML = `
            <i class="fas fa-arrow-left"></i>
            <span>Quay lại</span>
        `;
        backBtn.addEventListener('click', () => this.navigateLibraryToFolders());
        container.appendChild(backBtn);

        // Add folder title
        const folderTitle = document.createElement('div');
        folderTitle.className = 'folder-title';
        folderTitle.textContent = folder.folder;
        container.appendChild(folderTitle);

        // Render subfolders
        if (folder.subfolders) {
            folder.subfolders.forEach((subfolder, subfolderIndex) => {
                const itemCount = subfolder.items ? subfolder.items.length : 0;

                // Check if this subfolder is in favorites
                const quickAccessSubfolders = JSON.parse(localStorage.getItem('quickAccessSubfolders') || '[]');
                const isFavorite = quickAccessSubfolders.some(item =>
                    item.folderIndex === this.libraryFolderIndex &&
                    item.subfolderIndex === subfolderIndex
                );

                const subfolderCard = document.createElement('div');
                subfolderCard.className = 'folder-card';
                subfolderCard.innerHTML = `
                    <div class="folder-card-icon">
                        <i class="fas fa-folder"></i>
                    </div>
                    <div class="folder-card-content">
                        <div class="folder-card-title">${subfolder.name}</div>
                        <div class="folder-card-subtitle">${itemCount} bài giảng</div>
                    </div>
                    <div class="folder-card-actions">
                        <button class="folder-favorite-btn ${isFavorite ? 'active' : ''}"
                                data-folder-index="${this.libraryFolderIndex}"
                                data-subfolder-index="${subfolderIndex}">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                    <div class="folder-card-arrow">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                `;

                subfolderCard.addEventListener('click', (e) => {
                    // Don't navigate if clicking on favorite button
                    if (!e.target.closest('.folder-favorite-btn')) {
                        this.navigateLibraryToLectures(subfolderIndex);
                    }
                });

                // Favorite button handler
                const favoriteBtn = subfolderCard.querySelector('.folder-favorite-btn');
                favoriteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFavoriteSubfolder(this.libraryFolderIndex, subfolderIndex, subfolder.name, itemCount);
                    favoriteBtn.classList.toggle('active');
                });

                container.appendChild(subfolderCard);
            });
        }
    }

    // ===== Render Library Lectures =====
    renderLibraryLectures(container) {
        if (this.libraryFolderIndex < 0 || this.librarySubfolderIndex < 0) {
            this.navigateLibraryToFolders();
            return;
        }

        const folder = this.lectures[this.libraryFolderIndex];
        const subfolder = folder.subfolders[this.librarySubfolderIndex];

        // Add back button
        const backBtn = document.createElement('div');
        backBtn.className = 'back-button';
        backBtn.innerHTML = `
            <i class="fas fa-arrow-left"></i>
            <span>Quay lại</span>
        `;
        backBtn.addEventListener('click', () => this.navigateLibraryToSubfolders(this.libraryFolderIndex));
        container.appendChild(backBtn);

        // Add subfolder title
        const subfolderTitle = document.createElement('div');
        subfolderTitle.className = 'folder-title';
        subfolderTitle.textContent = subfolder.name;
        container.appendChild(subfolderTitle);

        // Render lectures
        if (subfolder.items) {
            subfolder.items.forEach((item, itemIndex) => {
                // Find index in flat playlist
                const flatIndex = this.flatPlaylist.findIndex(t => t.url === item.url);
                const isActive = flatIndex === this.currentIndex;

                const trackCard = document.createElement('div');
                trackCard.className = `track-card ${isActive ? 'active' : ''}`;
                trackCard.innerHTML = `
                    <div class="track-card-icon">
                        <i class="fas ${isActive ? 'fa-volume-up' : 'fa-music'}"></i>
                    </div>
                    <div class="track-card-content">
                        <div class="track-card-title">${item.title}</div>
                        <div class="track-card-subtitle">${item.duration || '--:--'}</div>
                    </div>
                    <div class="track-card-actions">
                        <button class="track-action-btn favorite-track-btn ${this.favorites.some(f => f.url === item.url) ? 'active' : ''}" data-url="${item.url}">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                `;

                trackCard.addEventListener('click', (e) => {
                    if (!e.target.closest('.track-action-btn')) {
                        this.playTrack(flatIndex);
                    }
                });

                // Favorite button
                const favoriteBtn = trackCard.querySelector('.favorite-track-btn');
                favoriteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFavoriteTrack(item);
                    favoriteBtn.classList.toggle('active');
                });

                container.appendChild(trackCard);
            });
        }
    }

    // ===== Library Navigation Methods =====
    navigateLibraryToFolders() {
        this.libraryView = 'folders';
        this.libraryFolderIndex = -1;
        this.librarySubfolderIndex = -1;
        this.renderLibraryView();
        // Update header
        const header = document.querySelector('#libraryView .library-header h2');
        if (header) {
            header.innerHTML = '<i class="fas fa-book"></i> Thư viện';
        }
        const subtitle = document.querySelector('#libraryView .library-subtitle');
        if (subtitle) {
            subtitle.textContent = 'Danh sách tất cả bài giảng';
        }
    }

    navigateLibraryToSubfolders(folderIndex) {
        this.libraryView = 'subfolders';
        this.libraryFolderIndex = folderIndex;
        this.librarySubfolderIndex = -1;
        this.renderLibraryView();
        // Update header
        const folder = this.lectures[folderIndex];
        const header = document.querySelector('#libraryView .library-header h2');
        if (header) {
            header.innerHTML = '<i class="fas fa-folder-open"></i> ' + folder.folder;
        }
        const subtitle = document.querySelector('#libraryView .library-subtitle');
        if (subtitle) {
            subtitle.textContent = 'Chọn thư mục con để xem bài giảng';
        }
    }

    navigateLibraryToLectures(subfolderIndex) {
        this.libraryView = 'lectures';
        this.librarySubfolderIndex = subfolderIndex;
        this.renderLibraryView();
        // Update header
        const folder = this.lectures[this.libraryFolderIndex];
        const subfolder = folder.subfolders[subfolderIndex];
        const header = document.querySelector('#libraryView .library-header h2');
        if (header) {
            header.innerHTML = '<i class="fas fa-folder"></i> ' + subfolder.name;
        }
        const subtitle = document.querySelector('#libraryView .library-subtitle');
        if (subtitle) {
            subtitle.textContent = folder.folder;
        }
    }

    // ===== Render History View =====
    renderHistoryView() {
        const historyContent = document.getElementById('historyContent');
        if (!historyContent) return;

        historyContent.innerHTML = '';

        if (this.recentlyPlayed.length === 0) {
            historyContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h3>Chưa có lịch sử phát</h3>
                    <p>Các bài giảng bạn đã nghe sẽ xuất hiện ở đây.</p>
                </div>
            `;
            return;
        }

        this.recentlyPlayed.forEach(item => {
            const flatIndex = this.flatPlaylist.findIndex(t => t.url === item.url);
            const isActive = flatIndex === this.currentIndex;

            const historyCard = document.createElement('div');
            historyCard.className = 'history-card';
            historyCard.innerHTML = `
                <div class="history-card-icon">
                    <i class="fas fa-history"></i>
                </div>
                <div class="history-card-content">
                    <div class="history-card-title">${item.title}</div>
                    <div class="history-card-subtitle">${item.teacher || item.folder}</div>
                    <div class="history-card-location">
                        <i class="fas fa-folder"></i>
                        <span>${item.folder} › ${item.subfolder}</span>
                    </div>
                </div>
                <div class="history-card-actions">
                    <button class="track-action-btn favorite-track-btn ${this.favorites.some(f => f.url === item.url) ? 'active' : ''}" data-url="${item.url}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            `;

            historyCard.addEventListener('click', (e) => {
                if (!e.target.closest('.track-action-btn')) {
                    this.playTrack(flatIndex);
                }
            });

            const favoriteBtn = historyCard.querySelector('.favorite-track-btn');
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavoriteTrack(item);
                favoriteBtn.classList.toggle('active');
            });

            historyContent.appendChild(historyCard);
        });
    }

    // ===== Search =====
    handleSearch() {
        const searchTerm = this.searchInput.value.trim();
        this.clearSearch.style.display = searchTerm ? 'block' : 'none';
        this.renderPlaylist(searchTerm);
    }

    clearSearchInput() {
        this.searchInput.value = '';
        this.clearSearch.style.display = 'none';
        this.renderPlaylist();
    }

    // ===== Error Handling =====
    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.style.display = 'flex';
        setTimeout(() => {
            this.errorMessage.style.display = 'none';
        }, 5000);
    }

    // ===== State Management =====
    saveState() {
        const state = {
            currentIndex: this.currentIndex,
            currentTime: this.audio.currentTime,
            url: this.flatPlaylist[this.currentIndex]?.url
        };
        localStorage.setItem('playerState', JSON.stringify(state));
    }

    loadState() {
        // Load volume
        const savedVolume = localStorage.getItem('volume');
        if (savedVolume) {
            this.audio.volume = parseFloat(savedVolume);
            this.volumeSlider.value = parseFloat(savedVolume) * 100;
            this.updateVolumeIcon(this.audio.volume);
        }

        // Load playback speed
        const savedSpeed = localStorage.getItem('playbackSpeed');
        if (savedSpeed) {
            this.setSpeed(parseFloat(savedSpeed));
        }

        // Load shuffle state
        const savedShuffle = localStorage.getItem('shuffle');
        if (savedShuffle === 'true') {
            this.isShuffled = true;
            this.shuffleBtn.classList.add('active');
        }

        // Load repeat mode
        const savedRepeat = localStorage.getItem('repeatMode');
        if (savedRepeat) {
            this.repeatMode = savedRepeat;
            if (this.repeatMode !== 'off') {
                this.repeatBtn.classList.add('active');
            }
        }

        // Load player state
        const savedState = localStorage.getItem('playerState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                const index = this.flatPlaylist.findIndex(t => t.url === state.url);
                if (index >= 0) {
                    this.currentIndex = index;
                    const track = this.flatPlaylist[index];
                    this.audio.src = track.url;
                    this.trackTitle.textContent = track.title;
                    this.trackFolder.textContent = `${track.folder} • ${track.subfolder}`;
                    this.audio.currentTime = state.currentTime || 0;
                    this.updateActiveTrack();
                }
            } catch (e) {
                console.error('Error loading state:', e);
            }
        }
    }

    // ===== Event Listeners =====
    setupEventListeners() {
        // Play/Pause
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.audio.addEventListener('play', () => {
            this.playBtn.querySelector('i').className = 'fas fa-pause';
            const albumArt = document.querySelector('.album-art-inner');
            if (albumArt) albumArt.classList.add('playing');
        });
        this.audio.addEventListener('pause', () => {
            this.playBtn.querySelector('i').className = 'fas fa-play';
            const albumArt = document.querySelector('.album-art-inner');
            if (albumArt) albumArt.classList.remove('playing');
        });

        // Previous/Next
        this.prevBtn.addEventListener('click', () => this.prevTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());

        // Auto play next with shuffle/repeat support
        this.audio.addEventListener('ended', () => this.nextTrackEnhanced());

        // Progress
        this.audio.addEventListener('timeupdate', () => {
            if (!this.isDragging) {
                this.updateProgress();
                this.saveState();
            }
        });
        this.audio.addEventListener('loadedmetadata', () => {
            this.durationEl.textContent = this.formatTime(this.audio.duration);
            if (this.miniDuration) {
                this.miniDuration.textContent = this.formatTime(this.audio.duration);
            }
        });

        // Progress bar click
        this.progressBar.addEventListener('click', (e) => this.seek(e));
        this.progressBar.addEventListener('mousedown', () => {
            this.isDragging = true;
        });
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
        this.progressBar.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.seek(e);
            }
        });

        // Volume
        this.volumeSlider.addEventListener('input', () => this.updateVolume());
        this.muteBtn.addEventListener('click', () => this.toggleMute());

        // Speed
        this.speedBtn.addEventListener('click', () => this.toggleSpeedMenu());
        document.querySelectorAll('.speed-menu button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setSpeed(parseFloat(btn.dataset.speed));
            });
        });

        // Close speed menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.speedBtn.contains(e.target) && !this.speedMenu.contains(e.target)) {
                this.speedMenu.classList.remove('show');
            }
        });

        // Search
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.clearSearch.addEventListener('click', () => this.clearSearchInput());

        // Theme
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        if (this.themeToggleDesktop) {
            this.themeToggleDesktop.addEventListener('click', () => this.toggleTheme());
        }

        // Mini Player Controls
        if (this.miniPlayBtn) {
            this.miniPlayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePlay();
            });
        }
        if (this.miniPrevBtn) {
            this.miniPrevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.prevTrack();
            });
        }
        if (this.miniNextBtn) {
            this.miniNextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.nextTrack();
            });
        }
        if (this.miniCloseBtn) {
            this.miniCloseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeMiniPlayer();
            });
        }
        // Click on mini player info (icon, tên bài, thời gian) to open full player
        // SIMPLE approach like app-ref.js - just click on .mini-player-info
        if (this.miniPlayerInfo) {
            console.log('✅ Setting up mini player info click handler');
            this.miniPlayerInfo.addEventListener('click', () => {
                console.log('🔵 Mini player info clicked - opening full player');
                this.openFullPlayer();
            });
        } else {
            console.error('❌ Mini player info element NOT FOUND!');
        }
        
        // Progress bar seek (separate handler)
        if (this.miniProgressBar) {
            this.miniProgressBar.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Progress bar clicked - seeking');
                this.seekMini(e);
            });
        }

        // Swipe down to close full player
        this.setupSwipeGesture();

        // Bottom Navigation
        if (this.bottomNav) {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.handleBottomNav(item.dataset.nav);
                });
            });
        }

        // Sync audio events with mini player
        this.audio.addEventListener('play', () => {
            if (this.miniPlayBtn) {
                this.miniPlayBtn.querySelector('i').className = 'fas fa-pause';
            }
            const miniAlbumArt = document.querySelector('.mini-album-art');
            if (miniAlbumArt) miniAlbumArt.classList.add('playing');
        });
        
        this.audio.addEventListener('pause', () => {
            if (this.miniPlayBtn) {
                this.miniPlayBtn.querySelector('i').className = 'fas fa-play';
            }
            const miniAlbumArt = document.querySelector('.mini-album-art');
            if (miniAlbumArt) miniAlbumArt.classList.remove('playing');
        });

        // Shuffle & Repeat
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());

        // Favorite
        this.favoriteBtn.addEventListener('click', () => this.toggleFavorite());

        // Share
        this.shareBtn.addEventListener('click', () => this.openShareModal());
        this.closeShareModal.addEventListener('click', () => this.closeShare());
        this.shareModal.addEventListener('click', (e) => {
            if (e.target === this.shareModal) this.closeShare();
        });
        this.copyLink.addEventListener('click', () => this.copyShareLink());
        document.getElementById('shareFacebook').addEventListener('click', () => this.shareToSocial('facebook'));
        document.getElementById('shareTwitter').addEventListener('click', () => this.shareToSocial('twitter'));
        document.getElementById('shareWhatsapp').addEventListener('click', () => this.shareToSocial('whatsapp'));

        // Download
        this.downloadBtn.addEventListener('click', () => this.downloadTrack());

        // Queue panel (keep for backward compatibility, but now mainly use tab)
        if (this.closeQueue) {
            this.closeQueue.addEventListener('click', () => this.queuePanel.classList.remove('show'));
        }

        // Filter tabs
        this.setupFilterTabs();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in search
            if (e.target === this.searchInput) return;

            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.audio.currentTime = Math.max(0, this.audio.currentTime - 10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + 10);
                    break;
                case 'KeyM':
                    e.preventDefault();
                    this.toggleMute();
                    break;
                case 'KeyS':
                    e.preventDefault();
                    this.toggleShuffle();
                    break;
                case 'KeyR':
                    e.preventDefault();
                    this.toggleRepeat();
                    break;
            }
        });

        // Error handling
        this.audio.addEventListener('error', (e) => {
            let errorMsg = 'Lỗi phát audio';
            switch(this.audio.error.code) {
                case 1:
                    errorMsg = 'Tải audio bị hủy';
                    break;
                case 2:
                    errorMsg = 'Lỗi mạng khi tải audio';
                    break;
                case 3:
                    errorMsg = 'Lỗi giải mã audio';
                    break;
                case 4:
                    errorMsg = 'Định dạng audio không được hỗ trợ hoặc CORS bị chặn';
                    break;
            }
            this.showError(errorMsg);
        });
    }

    // ===== Shuffle =====
    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        this.shuffleBtn.classList.toggle('active');
        localStorage.setItem('shuffle', this.isShuffled);
    }

    // ===== Repeat =====
    toggleRepeat() {
        const modes = ['off', 'all', 'one'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        
        this.repeatBtn.classList.toggle('active', this.repeatMode !== 'off');
        const icon = this.repeatBtn.querySelector('i');
        
        if (this.repeatMode === 'one') {
            icon.className = 'fas fa-redo';
            this.repeatBtn.innerHTML = '<i class="fas fa-redo"></i><span style="position:absolute;font-size:0.6rem;bottom:8px;">1</span>';
        } else {
            icon.className = 'fas fa-redo';
        }
        
        localStorage.setItem('repeatMode', this.repeatMode);
    }

    // ===== Favorites =====
    toggleFavorite() {
        if (this.currentIndex === -1) return;
        
        const track = this.flatPlaylist[this.currentIndex];
        const index = this.favorites.findIndex(f => f.url === track.url);
        
        if (index >= 0) {
            this.favorites.splice(index, 1);
            this.favoriteBtn.classList.remove('active');
            this.favoriteBtn.querySelector('i').className = 'far fa-star';
        } else {
            this.favorites.push(track);
            this.favoriteBtn.classList.add('active');
            this.favoriteBtn.querySelector('i').className = 'fas fa-star';
        }
        
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.updateStats();
        
        if (this.currentFilter === 'favorites') {
            this.renderPlaylist();
        }
    }

    updateFavoriteButton() {
        if (this.currentIndex === -1) return;
        
        const track = this.flatPlaylist[this.currentIndex];
        const isFavorite = this.favorites.some(f => f.url === track.url);
        
        this.favoriteBtn.classList.toggle('active', isFavorite);
        this.favoriteBtn.querySelector('i').className = isFavorite ? 'fas fa-star' : 'far fa-star';
    }

    // ===== Recently Played =====
    addToRecentlyPlayed(track) {
        this.recentlyPlayed = this.recentlyPlayed.filter(t => t.url !== track.url);
        this.recentlyPlayed.unshift(track);
        this.recentlyPlayed = this.recentlyPlayed.slice(0, 20);
        localStorage.setItem('recentlyPlayed', JSON.stringify(this.recentlyPlayed));
    }

    // ===== Queue Management =====
    toggleQueue() {
        this.queuePanel.classList.toggle('show');
        this.updateQueue();
    }

    updateQueue() {
        if (this.flatPlaylist.length === 0) {
            this.queueContent.innerHTML = '<p class="empty-queue">Chưa có bài nào trong hàng đợi</p>';
            return;
        }

        let html = '';
        const startIndex = this.currentIndex >= 0 ? this.currentIndex : 0;
        const queueItems = this.flatPlaylist.slice(startIndex, startIndex + 10);

        queueItems.forEach((track, idx) => {
            const actualIndex = startIndex + idx;
            const isPlaying = actualIndex === this.currentIndex;
            html += `
                <div class="queue-item ${isPlaying ? 'playing' : ''}" data-index="${actualIndex}">
                    <div class="queue-item-info">
                        <div class="queue-item-title">${track.title}</div>
                        <div class="queue-item-duration">${track.duration || ''}</div>
                    </div>
                    ${isPlaying ? '<i class="fas fa-volume-up"></i>' : ''}
                </div>
            `;
        });

        this.queueContent.innerHTML = html;

        document.querySelectorAll('.queue-item').forEach(el => {
            el.addEventListener('click', () => {
                const index = parseInt(el.dataset.index);
                this.playTrack(index);
            });
        });
    }

    // ===== Render Queue View =====
    renderQueueView() {
        const queueViewContent = document.getElementById('queueViewContent');
        if (!queueViewContent) return;

        if (this.flatPlaylist.length === 0 || this.currentIndex < 0) {
            queueViewContent.innerHTML = '<div class="empty-message"><p>Chưa có bài nào trong hàng đợi</p></div>';
            return;
        }

        let html = '';
        const startIndex = this.currentIndex;
        const queueItems = this.flatPlaylist.slice(startIndex);

        queueItems.forEach((track, idx) => {
            const actualIndex = startIndex + idx;
            const isPlaying = actualIndex === this.currentIndex;
            html += `
                <div class="track-item ${isPlaying ? 'playing' : ''}" data-index="${actualIndex}">
                    <div class="track-icon">
                        ${isPlaying ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-music"></i>'}
                    </div>
                    <div class="track-content">
                        <div class="track-title">${track.title}</div>
                        <div class="track-meta">
                            <span>${track.folder}</span>
                            ${track.duration ? `<span>${track.duration}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        queueViewContent.innerHTML = html;

        // Add click listeners
        queueViewContent.querySelectorAll('.track-item').forEach(el => {
            el.addEventListener('click', () => {
                const index = parseInt(el.dataset.index);
                this.playTrack(index);
            });
        });
    }

    // ===== Share =====
    openShareModal() {
        if (this.currentIndex === -1) return;
        
        const track = this.flatPlaylist[this.currentIndex];
        const url = window.location.href.split('?')[0] + '?track=' + encodeURIComponent(track.url);
        this.shareLink.value = url;
        this.shareModal.classList.add('show');
    }

    closeShare() {
        this.shareModal.classList.remove('show');
    }

    copyShareLink() {
        this.shareLink.select();
        document.execCommand('copy');
        
        const btn = this.copyLink;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Đã copy!';
        btn.classList.add('copied');
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('copied');
        }, 2000);
    }

    shareToSocial(platform) {
        if (this.currentIndex === -1) return;
        
        const track = this.flatPlaylist[this.currentIndex];
        const url = window.location.href.split('?')[0];
        const text = `Đang nghe: ${track.title} - ${track.folder}`;
        
        let shareUrl = '';
        switch(platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }

    // ===== Download =====
    downloadTrack() {
        if (this.currentIndex === -1) return;
        
        const track = this.flatPlaylist[this.currentIndex];
        const a = document.createElement('a');
        a.href = track.url;
        a.download = track.title + '.mp3';
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // ===== Filter Tabs =====
    setupFilterTabs() {
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentFilter = tab.dataset.filter;
                this.renderPlaylist();
            });
        });
    }

    // ===== Stats =====
    updateStats() {
        this.totalTracks.textContent = this.flatPlaylist.length;
        this.totalFavorites.textContent = this.favorites.length;
    }

    // ===== Enhanced Next Track with Shuffle/Repeat =====
    nextTrackEnhanced() {
        if (this.repeatMode === 'one') {
            this.audio.currentTime = 0;
            this.audio.play();
            return;
        }

        if (this.isShuffled) {
            const randomIndex = Math.floor(Math.random() * this.flatPlaylist.length);
            this.playTrack(randomIndex);
        } else if (this.currentIndex < this.flatPlaylist.length - 1) {
            this.playTrack(this.currentIndex + 1);
        } else if (this.repeatMode === 'all') {
            this.playTrack(0);
        }
    }
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    new AudioPlayer();
});

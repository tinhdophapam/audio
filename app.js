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
        this.queueBtn = document.getElementById('queueBtn');
        this.queuePanel = document.getElementById('queuePanel');
        this.closeQueue = document.getElementById('closeQueue');
        this.queueContent = document.getElementById('queueContent');
        this.shareModal = document.getElementById('shareModal');
        this.closeShareModal = document.getElementById('closeShareModal');
        this.shareLink = document.getElementById('shareLink');
        this.copyLink = document.getElementById('copyLink');
        this.totalTracks = document.getElementById('totalTracks');
        this.totalFavorites = document.getElementById('totalFavorites');
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');

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
    }

    // ===== Buddha Text Animation =====
    initBuddhaText() {
        const buddhaNameEl = document.querySelector('.buddha-name');
        if (!buddhaNameEl) return;

        const text = 'Nam Mô A Di Đà Phật';
        const words = text.split(' ').filter(w => w.length > 0);
        
        // 6 màu theo thứ tự từ Flutter
        const colors = [
            '#D84315', // Đỏ cam
            '#C62828', // Đỏ thẫm
            '#2E7D32', // Xanh lá
            '#00838F', // Xanh ngọc
            '#1565C0', // Xanh dương
            '#6A1B9A', // Tím
        ];

        let currentWordIndex = 0;
        let colorIndex = 0;
        let cycleCount = 0;

        const updateText = () => {
            // Hiển thị từ đầu đến từ hiện tại
            const displayText = words.slice(0, currentWordIndex + 1).join(' ');
            buddhaNameEl.textContent = displayText;
            buddhaNameEl.style.color = colors[colorIndex];

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

        // Chạy mỗi 1 giây (1000ms)
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

    // ===== Render Playlist =====
    renderPlaylist(searchTerm = '') {
        this.playlist.innerHTML = '';

        // Filter based on current filter
        let itemsToShow = this.flatPlaylist;
        
        if (this.currentFilter === 'favorites') {
            itemsToShow = this.favorites;
            if (itemsToShow.length === 0) {
                this.playlist.innerHTML = '<div class="loading"><p>Chưa có bài yêu thích nào</p></div>';
                return;
            }
        } else if (this.currentFilter === 'recent') {
            itemsToShow = this.recentlyPlayed;
            if (itemsToShow.length === 0) {
                this.playlist.innerHTML = '<div class="loading"><p>Chưa có lịch sử nghe</p></div>';
                return;
            }
        }

        // For favorites and recent, show flat list
        if (this.currentFilter !== 'all') {
            itemsToShow.forEach(item => {
                if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return;
                }

                const trackEl = document.createElement('div');
                trackEl.className = 'track-item';
                trackEl.innerHTML = `
                    <span class="track-title">${item.title}</span>
                    <span class="track-duration">${item.duration || ''}</span>
                `;

                const flatIndex = this.flatPlaylist.findIndex(t => t.url === item.url);
                trackEl.addEventListener('click', () => {
                    this.playTrack(flatIndex);
                });

                this.playlist.appendChild(trackEl);
            });
            this.updateActiveTrack();
            return;
        }

        this.lectures.forEach((folder, folderIndex) => {
            const folderEl = document.createElement('div');
            folderEl.className = 'folder';
            folderEl.dataset.folderIndex = folderIndex;

            const folderHeader = document.createElement('div');
            folderHeader.className = 'folder-header';
            folderHeader.innerHTML = `
                <i class="fas fa-chevron-down"></i>
                <span>${folder.folder}</span>
            `;

            const folderContent = document.createElement('div');
            folderContent.className = 'folder-content';

            let hasVisibleItems = false;

            if (folder.subfolders) {
                folder.subfolders.forEach((subfolder, subfolderIndex) => {
                    const subfolderEl = document.createElement('div');
                    subfolderEl.className = 'subfolder';

                    const subfolderHeader = document.createElement('div');
                    subfolderHeader.className = 'subfolder-header';
                    subfolderHeader.innerHTML = `
                        <i class="fas fa-chevron-down"></i>
                        <span>${subfolder.name}</span>
                    `;

                    const subfolderItems = document.createElement('div');
                    subfolderItems.className = 'subfolder-items';

                    if (subfolder.items) {
                        subfolder.items.forEach((item, itemIndex) => {
                            // Search filter
                            if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
                                return;
                            }

                            hasVisibleItems = true;

                            const trackEl = document.createElement('div');
                            trackEl.className = 'track-item';
                            trackEl.innerHTML = `
                                <span class="track-title">${item.title}</span>
                                <span class="track-duration">${item.duration || ''}</span>
                            `;

                            // Find index in flat playlist
                            const flatIndex = this.flatPlaylist.findIndex(
                                t => t.url === item.url
                            );

                            trackEl.addEventListener('click', () => {
                                this.playTrack(flatIndex);
                            });

                            subfolderItems.appendChild(trackEl);
                        });
                    }

                    if (subfolderItems.children.length > 0) {
                        subfolderHeader.addEventListener('click', () => {
                            subfolderEl.classList.toggle('collapsed');
                        });

                        subfolderEl.appendChild(subfolderHeader);
                        subfolderEl.appendChild(subfolderItems);
                        folderContent.appendChild(subfolderEl);
                    }
                });
            }

            if (hasVisibleItems || !searchTerm) {
                folderHeader.addEventListener('click', () => {
                    folderEl.classList.toggle('collapsed');
                });

                folderEl.appendChild(folderHeader);
                folderEl.appendChild(folderContent);
                this.playlist.appendChild(folderEl);
            }
        });

        // Update active track
        this.updateActiveTrack();
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
    }

    // ===== Update Active Track Highlight =====
    updateActiveTrack() {
        document.querySelectorAll('.track-item').forEach(el => {
            el.classList.remove('active');
        });

        if (this.currentIndex >= 0) {
            const currentTrack = this.flatPlaylist[this.currentIndex];
            document.querySelectorAll('.track-item').forEach(el => {
                const title = el.querySelector('.track-title').textContent;
                if (title === currentTrack.title) {
                    el.classList.add('active');
                }
            });
        }
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

    // ===== Mobile Sidebar Toggle =====
    toggleSidebar() {
        this.sidebar.classList.toggle('show');
        if (this.sidebarOverlay) {
            this.sidebarOverlay.classList.toggle('show');
        }
        // Prevent body scroll when sidebar is open
        if (this.sidebar.classList.contains('show')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    closeSidebar() {
        this.sidebar.classList.remove('show');
        if (this.sidebarOverlay) {
            this.sidebarOverlay.classList.remove('show');
        }
        document.body.style.overflow = '';
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

        // Mobile Menu Toggle
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Close sidebar when clicking overlay
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        }

        // Close sidebar when clicking on a track (mobile)
        this.playlist.addEventListener('click', (e) => {
            if (e.target.closest('.track-item') && window.innerWidth <= 968) {
                this.closeSidebar();
            }
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

        // Queue
        this.queueBtn.addEventListener('click', () => this.toggleQueue());
        this.closeQueue.addEventListener('click', () => this.queuePanel.classList.remove('show'));

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
            this.favoriteBtn.querySelector('i').className = 'far fa-heart';
        } else {
            this.favorites.push(track);
            this.favoriteBtn.classList.add('active');
            this.favoriteBtn.querySelector('i').className = 'fas fa-heart';
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
        this.favoriteBtn.querySelector('i').className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
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

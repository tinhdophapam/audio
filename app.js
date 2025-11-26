// ===== Audio Player Application =====

class AudioPlayer {
    constructor() {
        // DOM Elements
        this.audio = document.getElementById('audioPlayer');
        this.playBtn = document.getElementById('playBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
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
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');

        // State
        this.lectures = [];
        this.flatPlaylist = [];
        this.currentIndex = -1;
        this.isDragging = false;

        // Initialize
        this.init();
    }

    async init() {
        await this.loadLectures();
        this.setupEventListeners();
        this.loadState();
        this.applyTheme();
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
        this.saveState();
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
        
        const icon = this.themeToggle.querySelector('i');
        icon.className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
    }

    applyTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        const icon = this.themeToggle.querySelector('i');
        icon.className = savedTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
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
        });
        this.audio.addEventListener('pause', () => {
            this.playBtn.querySelector('i').className = 'fas fa-play';
        });

        // Previous/Next
        this.prevBtn.addEventListener('click', () => this.prevTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());

        // Auto play next
        this.audio.addEventListener('ended', () => this.nextTrack());

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
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    new AudioPlayer();
});

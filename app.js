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
        this.totalListenTime = document.getElementById('totalListenTime');
        this.nowPlayingSection = document.getElementById('nowPlayingSection');
        this.nowPlayingTitle = document.getElementById('nowPlayingTitle');
        this.nowPlayingFolder = document.getElementById('nowPlayingFolder');
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');

        // Mobile Sidebar Elements
        this.mobileSidebar = document.getElementById('mobileSidebar');
        this.mobileSidebarOverlay = document.getElementById('mobileSidebarOverlay');
        this.closeMobileSidebar = document.getElementById('closeMobileSidebar');

        // Mini Player Elements
        this.miniPlayer = document.getElementById('miniPlayer');
        this.miniMoreBtn = document.getElementById('miniMoreBtn');
        this.mobileMoreMenu = document.getElementById('mobileMoreMenu');
        this.mobileMoreMenuOverlay = document.getElementById('mobileMoreMenuOverlay');
        this.closeMobileMore = document.getElementById('closeMobileMore');
        this.mobileMoreRepeat = document.getElementById('mobileMoreRepeat');
        this.mobileMoreSpeed = document.getElementById('mobileMoreSpeed');
        this.mobileMoreTimer = document.getElementById('mobileMoreTimer');
        this.mobileRepeatValue = document.getElementById('mobileRepeatValue');
        this.mobileSpeedValue = document.getElementById('mobileSpeedValue');
        this.mobileTimerValue = document.getElementById('mobileTimerValue');
        this.miniPrevBtn = document.getElementById('miniPrevBtn');
        this.miniPlayBtn = document.getElementById('miniPlayBtn');
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

        // Sleep Timer Elements
        this.sleepTimerBtn = document.getElementById('sleepTimerBtn');
        this.timerMenu = document.getElementById('timerMenu');
        this.timerCountdown = document.getElementById('timerCountdown');
        this.customTimerInput = document.getElementById('customTimerInput');
        this.setCustomTimerBtn = document.getElementById('setCustomTimerBtn');

        // Sleep Timer State
        this.sleepTimer = null;
        this.sleepTimerEndTime = null;
        this.sleepTimerDuration = 0;

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
        this.bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        this.recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed')) || [];
        this.queue = [];
        this.currentFilter = 'all';
        this.currentBlobUrl = null; // Track blob URLs for cleanup

        // Bookmark Elements
        this.bookmarkBtn = document.getElementById('bookmarkBtn');
        this.bookmarksContent = document.getElementById('bookmarksContent');

        // Listen time tracking
        this.totalListenTimeSeconds = parseInt(localStorage.getItem('totalListenTime')) || 0;
        this.sessionStartTime = null;
        this.usingBackupUrl = false; // Track if currently using backup URL

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
        this.initializeDefaultView();
        this.initSleepTimer();
        this.initBookmarks();
        
        // Hide Now Playing section initially if no track is playing
        this.hideNowPlayingIfNeeded();
    }

    // ===== Sleep Timer =====
    initSleepTimer() {
        if (!this.sleepTimerBtn) return;

        // Toggle Menu
        this.sleepTimerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.timerMenu.classList.toggle('show');
            this.speedMenu.classList.remove('show'); // Close speed menu
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.timerMenu && this.timerMenu.classList.contains('show') &&
                !this.sleepTimerBtn.contains(e.target) &&
                !this.timerMenu.contains(e.target)) {
                this.timerMenu.classList.remove('show');
            }
        });

        // Preset Buttons
        const buttons = this.timerMenu.querySelectorAll('button[data-time]');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const minutes = parseInt(btn.dataset.time);
                this.setSleepTimer(minutes);
                this.timerMenu.classList.remove('show');
            });
        });

        // Custom Timer
        if (this.setCustomTimerBtn) {
            this.setCustomTimerBtn.addEventListener('click', () => {
                const minutes = parseInt(this.customTimerInput.value);
                if (minutes > 0) {
                    this.setSleepTimer(minutes);
                    this.timerMenu.classList.remove('show');
                }
            });
        }
    }

    // ===== Bookmarks Logic =====
    initBookmarks() {
        if (this.bookmarkBtn) {
            this.bookmarkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.saveBookmark();
            });
        }
    }

    saveBookmark() {
        if (this.currentIndex === -1) return;

        const track = this.flatPlaylist[this.currentIndex];
        const currentTime = this.audio.currentTime;
        const timestamp = Date.now();

        // Create bookmark object
        const bookmark = {
            id: timestamp, // Unique ID
            url: track.url,
            title: track.title,
            folder: track.folder,
            subfolder: track.subfolder,
            time: currentTime,
            createdAt: timestamp
        };

        this.bookmarks.unshift(bookmark);
        localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));

        this.showToast(`Đã ghi chú tại ${this.formatTime(currentTime)}`, 'success');

        // If currently viewing bookmarks, refresh
        if (this.currentFilter === 'bookmarks') {
            this.renderBookmarks();
        }
    }

    removeBookmark(id) {
        const index = this.bookmarks.findIndex(b => b.id === id);
        if (index >= 0) {
            this.bookmarks.splice(index, 1);
            localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
            if (this.currentFilter === 'bookmarks') {
                this.renderBookmarks();
            }
            this.showToast('Đã xóa ghi chú', 'info');
        }
    }

    playBookmark(bookmark) {
        // Find track in playlist
        const index = this.flatPlaylist.findIndex(t => t.url === bookmark.url);

        if (index >= 0) {
            if (this.currentIndex !== index) {
                this.playTrack(index);
            }

            // Wait a bit for track to load if necessary, or just seek
            // Since playTrack is async-ish (audio.play is promise), we might need to handle seek carefully.
            // But simple currentTime setting usually works after src is set.
            setTimeout(() => {
                this.audio.currentTime = bookmark.time;
                this.updateProgress();
            }, 100);
        } else {
            this.showToast('Không tìm thấy bài giảng này trong danh sách', 'error');
        }
    }

    // ===== Render Bookmarks =====
    renderBookmarks(searchTerm = '', container = this.playlist) {
        if (!container) return;
        container.innerHTML = '';

        if (this.bookmarks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bookmark"><\/i>
                    <h3>Chưa có ghi chú nào<\/h3>
                    <p>Nhấn vào biểu tượng bookmark khi nghe để lưu lại vị trí.<\/p>
                <\/div>
            `;
            return;
        }

        this.bookmarks.forEach(item => {
            if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
                return;
            }

            const bookmarkCard = document.createElement('div');
            bookmarkCard.className = 'bookmark-card';
            bookmarkCard.innerHTML = `
                <div class="bookmark-card-icon">
                    <i class="fas fa-bookmark"><\/i>
                <\/div>
                <div class="bookmark-card-content">
                    <div class="bookmark-card-title">${item.title}<\/div>
                    <div class="bookmark-card-time">
                        <i class="far fa-clock"><\/i>
                        ${this.formatTime(item.time)}
                        <span class="bookmark-card-subtitle">${new Date(item.createdAt).toLocaleDateString('vi-VN')}<\/span>
                    <\/div>
                <\/div>
                <button class="bookmark-card-remove" title="Xóa ghi chú">
                    <i class="fas fa-trash-alt"><\/i>
                <\/button>
            `;

            bookmarkCard.addEventListener('click', (e) => {
                if (!e.target.closest('.bookmark-card-remove')) {
                    this.playBookmark(item);
                }
            });

            const removeBtn = bookmarkCard.querySelector('.bookmark-card-remove');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Bạn có chắc muốn xóa ghi chú này?')) {
                    this.removeBookmark(item.id);
                }
            });

            container.appendChild(bookmarkCard);
        });

        // Update active track highlighting (only if using main playlist container)
        if (container === this.playlist) {
            this.updateActiveTrack();
        }
    }

    updateBookmarkButton() {
        if (this.bookmarkBtn) {
            if (this.currentIndex === -1) {
                this.bookmarkBtn.style.opacity = '0.5';
                this.bookmarkBtn.style.pointerEvents = 'none';
            } else {
                this.bookmarkBtn.style.opacity = '1';
                this.bookmarkBtn.style.pointerEvents = 'auto';
            }
        }
    }

    setSleepTimer(minutes) {
        // Clear existing timer
        if (this.sleepTimer) {
            clearInterval(this.sleepTimer);
            this.sleepTimer = null;
        }

        this.sleepTimerDuration = minutes;
        this.sleepTimerEndTime = minutes > 0 ? Date.now() + (minutes * 60 * 1000) : null;

        // Update UI buttons
        const buttons = this.timerMenu.querySelectorAll('button[data-time]');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.time) === minutes && !this.customTimerInput.value) {
                btn.classList.add('active');
            }
        });

        if (minutes === 0) {
            this.timerCountdown.style.display = 'none';
            this.sleepTimerBtn.classList.remove('active');
            this.customTimerInput.value = '';

            // Show toast
            this.showToast('Đã tắt hẹn giờ', 'info');
        } else {
            this.timerCountdown.style.display = 'inline';
            this.sleepTimerBtn.classList.add('active');
            this.updateTimerCountdown();

            // Start countdown interval
            this.sleepTimer = setInterval(() => {
                this.updateTimerCountdown();
            }, 1000);

            // Show toast
            this.showToast(`Hẹn giờ tắt sau ${minutes} phút`, 'success');
        }

        // Update Mobile More Menu
        if (this.mobileTimerValue) {
            if (minutes === 0) {
                this.mobileTimerValue.textContent = 'Tắt';
                this.mobileTimerValue.classList.remove('active');
            } else {
                this.mobileTimerValue.textContent = `${minutes} phút`;
                this.mobileTimerValue.classList.add('active');
            }
        }
    }

    updateTimerCountdown() {
        if (!this.sleepTimerEndTime) return;

        const now = Date.now();
        const timeLeft = this.sleepTimerEndTime - now;

        if (timeLeft <= 0) {
            this.stopPlaybackWithFade();
            this.setSleepTimer(0);
        } else {
            const minutesLeft = Math.floor(timeLeft / 60000);
            const secondsLeft = Math.floor((timeLeft % 60000) / 1000);

            if (minutesLeft >= 60) {
                const hours = Math.floor(minutesLeft / 60);
                const mins = minutesLeft % 60;
                this.timerCountdown.textContent = `${hours}h ${mins}m`;
            } else {
                this.timerCountdown.textContent = `${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`;
            }
        }
    }

    stopPlaybackWithFade() {
        if (this.audio.paused) return;

        // Fade out volume over 2 seconds
        const originalVolume = this.audio.volume;
        let vol = originalVolume;
        const fadeInterval = setInterval(() => {
            vol -= 0.05;
            if (vol <= 0) {
                clearInterval(fadeInterval);
                this.audio.pause();
                this.audio.volume = originalVolume; // Reset volume for next play
            } else {
                this.audio.volume = vol;
            }
        }, 100);
    }

    // ===== Toast Notification Helper =====
    showToast(message, type = 'info') {
        // Create toast container if not exists
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.style.position = 'fixed';
            toastContainer.style.top = '20px';
            toastContainer.style.right = '20px';
            toastContainer.style.zIndex = '2000';
            toastContainer.style.display = 'flex';
            toastContainer.style.flexDirection = 'column';
            toastContainer.style.gap = '10px';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '8px';
        toast.style.color = 'white';
        toast.style.fontSize = '0.9rem';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '10px';
        toast.style.minWidth = '250px';
        toast.style.animation = 'slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s, transform 0.3s';

        // Icon based on type
        let iconHtml = '';
        let bgColor = '';
        switch (type) {
            case 'success':
                iconHtml = '<i class="fas fa-check-circle"></i>';
                bgColor = 'var(--success, #4caf50)';
                break;
            case 'error':
                iconHtml = '<i class="fas fa-exclamation-circle"></i>';
                bgColor = 'var(--error, #f44336)';
                break;
            case 'info':
            default:
                iconHtml = '<i class="fas fa-info-circle"></i>';
                bgColor = 'var(--accent, #FF9500)';
                break;
        }

        toast.style.background = bgColor;
        toast.innerHTML = `${iconHtml}<span>${message}</span>`;

        toastContainer.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                toast.remove();
                if (toastContainer.children.length === 0) {
                    toastContainer.remove();
                }
            }, 300);
        }, 3000);
    }

    // ===== Initialize Default View Based on Screen Size =====
    initializeDefaultView() {
        // On mobile (width <= 968px), show library view by default
        if (window.innerWidth <= 968) {
            document.querySelectorAll('.content-view').forEach(view => {
                view.classList.remove('active');
            });
            document.getElementById('libraryView').classList.add('active');

            // Update bottom nav active state
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            const libraryNavItem = document.querySelector('[data-nav="library"]');
            if (libraryNavItem) {
                libraryNavItem.classList.add('active');
            }

            // Render library view
            if (this.libraryView !== 'folders') {
                this.navigateLibraryToFolders();
            } else {
                this.renderLibraryView();
            }
        }
        // On desktop, player view is already active by default (from HTML)
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
        } else if (this.currentFilter === 'bookmarks') {
            this.renderBookmarks(searchTerm);
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

        // Update active folder highlighting
        this.updateActiveTrack();
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

                // Check if all items in subfolder are favorited
                const allFavorited = subfolder.items && subfolder.items.length > 0 &&
                    subfolder.items.every(item => this.favorites.some(f => f.url === item.url));

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
                        <button class="track-action-btn favorite-subfolder-btn ${allFavorited ? 'active' : ''}" title="Thêm/Xóa tất cả bài vào playlist">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                    <div class="folder-card-arrow">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                `;

                // Click on card to navigate
                subfolderCard.addEventListener('click', (e) => {
                    if (!e.target.closest('.track-action-btn')) {
                        this.navigateToLectures(subfolderIndex);
                    }
                });

                // Favorite subfolder button
                const favoriteSubfolderBtn = subfolderCard.querySelector('.favorite-subfolder-btn');
                favoriteSubfolderBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFavoriteSubfolder(folder, subfolder);
                    favoriteSubfolderBtn.classList.toggle('active');
                    this.updateStats();
                });

                this.playlist.appendChild(subfolderCard);
            });
        }

        // Update active subfolder highlighting
        this.updateActiveTrack();
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
                trackCard.setAttribute('data-index', flatIndex); // ← Add data-index for quick scroll
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

            // Auto scroll to active track if in this folder
            setTimeout(() => {
                const activeCard = this.playlist.querySelector('.track-card.active');
                if (activeCard) this.scrollToActiveTrack();
            }, 100);
        }

        // Update active track highlighting
        this.updateActiveTrack();
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

        // Update active track highlighting
        this.updateActiveTrack();
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
                        <i class="fas fa-star"></i>
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

        // Update active track highlighting
        this.updateActiveTrack();
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

    // ===== Toggle Favorite Subfolder =====
    toggleFavoriteSubfolder(folder, subfolder) {
        if (!subfolder.items || subfolder.items.length === 0) return;

        // Check if all items are already favorited
        const allFavorited = subfolder.items.every(item =>
            this.favorites.some(f => f.url === item.url)
        );

        if (allFavorited) {
            // Remove all items from favorites
            subfolder.items.forEach(item => {
                const index = this.favorites.findIndex(f => f.url === item.url);
                if (index >= 0) {
                    this.favorites.splice(index, 1);
                }
            });
        } else {
            // Add all items to favorites with folder/subfolder info
            subfolder.items.forEach(item => {
                // Check if item already exists (might be standalone without folder info)
                const existingIndex = this.favorites.findIndex(f => f.url === item.url);

                if (existingIndex >= 0) {
                    // Update existing item with folder/subfolder info
                    this.favorites[existingIndex] = {
                        ...this.favorites[existingIndex],
                        ...item,
                        folder: folder.folder,
                        subfolder: subfolder.name
                    };
                } else {
                    // Add new item with folder and subfolder info
                    const itemWithInfo = {
                        ...item,
                        folder: folder.folder,
                        subfolder: subfolder.name
                    };
                    this.favorites.push(itemWithInfo);
                }
            });
        }

        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.updateStats();
    }

    // ===== Play Track =====
    playTrack(index) {
        if (index < 0 || index >= this.flatPlaylist.length) return;

        // Revoke previous blob URL to prevent memory leak
        if (this.currentBlobUrl) {
            URL.revokeObjectURL(this.currentBlobUrl);
            this.currentBlobUrl = null;
        }

        this.currentIndex = index;
        const track = this.flatPlaylist[index];

        // Reset backup URL flag when playing a new track
        this.usingBackupUrl = false;

        // Update UI immediately for better UX
        this.trackTitle.textContent = track.title;
        this.trackFolder.textContent = `${track.folder} • ${track.subfolder}`;
        
        // Update Now Playing section immediately
        this.updateNowPlaying(track);
        
        // Update mini player immediately
        this.updateMiniPlayer(track);

        this.audio.src = track.url;
        this.audio.play().catch(error => {
            this.showError('Không thể phát audio: ' + error.message);
        });

        this.updateActiveTrack();
        this.scrollToActiveTrack();
        this.updateFavoriteButton();
        this.addToRecentlyPlayed(track);
        this.updateQueue();
        this.saveState();
        this.updateBookmarkButton();

        // Start tracking listen time
        this.sessionStartTime = Date.now();

        // Add playing animation to album art
        const albumArt = document.querySelector('.album-art-inner');
        if (albumArt) albumArt.classList.add('playing');

        this.showMiniPlayer();

        // Update Media Session API for background playback
        this.updateMediaSession(track);
    }

    // ===== Update Active Track Highlight =====
    updateActiveTrack() {
        // Remove active class from all potential items
        document.querySelectorAll('.track-card.active, .custom-playlist-item.active, .history-card.active, .queue-item.active, .queue-item.playing, .folder-card.active-folder').forEach(el => {
            el.classList.remove('active');
            el.classList.remove('playing');
            el.classList.remove('active-folder');

            // Reset icons
            const icon = el.querySelector('.track-card-icon i, .custom-playlist-item-icon i, .history-card-icon i, .folder-card-icon i');
            if (icon) {
                if (el.classList.contains('history-card')) icon.className = 'fas fa-history';
                else if (el.classList.contains('folder-card')) {
                    // Reset folder icons based on context
                    if (this.currentView === 'folders') {
                        icon.className = 'fas fa-folder-open';
                    } else {
                        icon.className = 'fas fa-folder';
                    }
                }
                else icon.className = 'fas fa-music';
            }

            // Remove queue item specific icon
            if (el.className.includes('queue-item')) {
                const queueIcon = el.querySelector('.queue-item-info + i');
                if (queueIcon) queueIcon.remove();
            }
        });

        if (this.currentIndex === -1) {
            return;
        }

        // Get current track info
        const currentTrack = this.flatPlaylist[this.currentIndex];
        if (!currentTrack) return;

        // Add active class to matching items
        const activeElements = document.querySelectorAll(`[data-index="${this.currentIndex}"]`);
        activeElements.forEach(el => {
            el.classList.add('active');
            if (el.className.includes('queue-item')) el.classList.add('playing');

            // Update icons
            const icon = el.querySelector('.track-card-icon i, .custom-playlist-item-icon i, .history-card-icon i');
            if (icon) icon.className = 'fas fa-volume-up';

            // Add queue item icon if missing
            if (el.className.includes('queue-item') && !el.querySelector('.queue-item-info + i')) {
                el.insertAdjacentHTML('beforeend', '<i class="fas fa-volume-up"></i>');
            }
        });

        // Mark active folder and subfolder
        this.markActiveFolders(currentTrack);
    }

    // ===== Mark Active Folders =====
    markActiveFolders(currentTrack) {
        if (!currentTrack) return;

        // Mark active folder in folders view (sidebar)
        if (this.currentView === 'folders') {
            const folderCards = document.querySelectorAll('#playlist .folder-card');
            folderCards.forEach((card, index) => {
                const folderData = this.lectures[index];
                if (folderData && folderData.folder === currentTrack.folder) {
                    card.classList.add('active-folder');
                    const icon = card.querySelector('.folder-card-icon i');
                    if (icon) icon.className = 'fas fa-volume-up';
                }
            });
        }

        // Mark active subfolder in subfolders view (sidebar)
        if (this.currentView === 'subfolders' && this.currentFolderIndex >= 0) {
            const folder = this.lectures[this.currentFolderIndex];
            if (folder && folder.subfolders) {
                const subfolderCards = document.querySelectorAll('#playlist .folder-card');
                // Skip back button and folder title, start from index 0 for subfolders
                let subfolderIndex = 0;
                subfolderCards.forEach(card => {
                    // Skip back button and folder title elements
                    if (card.classList.contains('folder-card') && !card.classList.contains('back-button')) {
                        const subfolderData = folder.subfolders[subfolderIndex];
                        if (subfolderData && subfolderData.name === currentTrack.subfolder) {
                            card.classList.add('active-folder');
                            const icon = card.querySelector('.folder-card-icon i');
                            if (icon) icon.className = 'fas fa-volume-up';
                        }
                        subfolderIndex++;
                    }
                });
            }
        }

        // Mark active folder in library view (mobile)
        if (this.libraryView === 'folders') {
            const libraryFolderCards = document.querySelectorAll('#libraryContent .folder-card');
            libraryFolderCards.forEach((card, index) => {
                const folderData = this.lectures[index];
                if (folderData && folderData.folder === currentTrack.folder) {
                    card.classList.add('active-folder');
                    const icon = card.querySelector('.folder-card-icon i');
                    if (icon) icon.className = 'fas fa-volume-up';
                }
            });
        }

        // Mark active subfolder in library subfolders view (mobile)
        if (this.libraryView === 'subfolders' && this.libraryFolderIndex >= 0) {
            const folder = this.lectures[this.libraryFolderIndex];
            if (folder && folder.subfolders) {
                const librarySubfolderCards = document.querySelectorAll('#libraryContent .folder-card');
                // Skip back button and folder title, start from index 0 for subfolders
                let subfolderIndex = 0;
                librarySubfolderCards.forEach(card => {
                    // Skip back button and folder title elements
                    if (card.classList.contains('folder-card') && !card.classList.contains('back-button')) {
                        const subfolderData = folder.subfolders[subfolderIndex];
                        if (subfolderData && subfolderData.name === currentTrack.subfolder) {
                            card.classList.add('active-folder');
                            const icon = card.querySelector('.folder-card-icon i');
                            if (icon) icon.className = 'fas fa-volume-up';
                        }
                        subfolderIndex++;
                    }
                });
            }
        }
    }

    // ===== Scroll To Active Track =====
    scrollToActiveTrack() {
        const activeCard = this.playlist.querySelector('.track-card.active');
        if (activeCard) {
            activeCard.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
            });
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

    // ===== Sanitize HTML (XSS Protection) =====
    sanitizeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
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

        // Update Mobile More Menu
        if (this.mobileSpeedValue) {
            this.mobileSpeedValue.textContent = `${speed}x`;
            if (speed !== 1) {
                this.mobileSpeedValue.classList.add('active');
            } else {
                this.mobileSpeedValue.classList.remove('active');
            }
        }

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

    // ===== Mobile Sidebar Toggle (Menu) =====
    toggleMobileSidebar() {
        if (this.mobileSidebar) {
            this.mobileSidebar.classList.toggle('show');
        }
        if (this.mobileSidebarOverlay) {
            this.mobileSidebarOverlay.classList.toggle('show');
        }
        // Prevent body scroll when sidebar is open
        if (this.mobileSidebar && this.mobileSidebar.classList.contains('show')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    closeMobileSidebarMenu() {
        if (this.mobileSidebar) {
            this.mobileSidebar.classList.remove('show');
        }
        if (this.mobileSidebarOverlay) {
            this.mobileSidebarOverlay.classList.remove('show');
        }
        document.body.style.overflow = '';
    }

    // ===== Old Sidebar Toggle (Disabled) =====
    toggleSidebar() {
        // Old sidebar is disabled on mobile
        // this.sidebar.classList.toggle('show');
        // if (this.sidebarOverlay) {
        //     this.sidebarOverlay.classList.toggle('show');
        // }
    }

    closeSidebar() {
        // Old sidebar is disabled on mobile
        // this.sidebar.classList.remove('show');
        // if (this.sidebarOverlay) {
        //     this.sidebarOverlay.classList.remove('show');
        // }
    }

    // ===== Mini Player Functions =====
    updateMiniPlayer(track) {
        if (this.miniTrackTitle) {
            this.updateMiniPlayerTitle(track.title || 'Chọn bài giảng');
        }
        // Update duration if available, otherwise it will be updated by loadedmetadata event
        if (this.miniDuration) {
            if (this.audio.duration && !isNaN(this.audio.duration)) {
                this.miniDuration.textContent = this.formatTime(this.audio.duration);
            } else {
                this.miniDuration.textContent = '0:00';
            }
        }
    }

    // ===== Update Mini Player Title with Scrolling Effect =====
    updateMiniPlayerTitle(title) {
        if (!this.miniTrackTitle) return;

        // Reset previous state
        this.miniTrackTitle.classList.remove('scrolling');
        this.miniTrackTitle.innerHTML = '';
        this.miniTrackTitle.style.removeProperty('--scroll-distance');
        
        // Set initial text to measure
        this.miniTrackTitle.textContent = title;

        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
            // Create a temporary element to measure text width
            const tempSpan = document.createElement('span');
            tempSpan.style.visibility = 'hidden';
            tempSpan.style.position = 'absolute';
            tempSpan.style.fontSize = window.getComputedStyle(this.miniTrackTitle).fontSize;
            tempSpan.style.fontWeight = window.getComputedStyle(this.miniTrackTitle).fontWeight;
            tempSpan.style.fontFamily = window.getComputedStyle(this.miniTrackTitle).fontFamily;
            tempSpan.style.whiteSpace = 'nowrap';
            tempSpan.textContent = title;
            document.body.appendChild(tempSpan);

            const textWidth = tempSpan.offsetWidth;
            document.body.removeChild(tempSpan);

            // Get container width (mini player info area)
            const containerWidth = this.miniTrackTitle.offsetWidth;

            // If text is longer than container (with some margin), apply scrolling effect
            if (textWidth > (containerWidth - 10) && containerWidth > 0) {
                // Calculate how much we need to scroll to show the hidden part
                const scrollDistance = -(textWidth - containerWidth + 20); // +20 for some padding
                
                // Set CSS custom property for scroll distance
                this.miniTrackTitle.style.setProperty('--scroll-distance', `${scrollDistance}px`);
                
                this.miniTrackTitle.classList.add('scrolling');
                this.miniTrackTitle.innerHTML = `<span class="title-text">${title}</span>`;
            }
            // If text fits, keep the normal display (already set above)
        });
    }

    // ===== Media Session API for Lock Screen & Background Playback =====
    // Modern implementation with enhanced artwork and metadata
    updateMediaSession(track) {
        if (!('mediaSession' in navigator)) {
            console.warn('Media Session API not supported in this browser');
            return;
        }

        try {
            // Helper: Get absolute URL for assets (iOS compatible)
            const getAbsoluteUrl = (path) => {
                // iOS Safari prefers full absolute URLs
                const url = new URL(path, window.location.href);
                return url.href;
            };

            // iOS-optimized artwork
            // iOS Safari is VERY picky about artwork:
            // 1. Must be absolute URLs
            // 2. Must be accessible (CORS compliant)
            // 3. Prefers square images
            // 4. WebP support varies - include fallback types
            const artworkUrl = getAbsoluteUrl('Title Logo.webp');

            const artwork = [
                // iOS prefers these sizes for lock screen (high quality)
                { src: artworkUrl, sizes: '512x512', type: 'image/webp' },
                { src: artworkUrl, sizes: '1024x1024', type: 'image/webp' },
                { src: artworkUrl, sizes: '384x384', type: 'image/webp' },
                { src: artworkUrl, sizes: '256x256', type: 'image/webp' },
                { src: artworkUrl, sizes: '192x192', type: 'image/webp' },
                { src: artworkUrl, sizes: '128x128', type: 'image/webp' },
                { src: artworkUrl, sizes: '96x96', type: 'image/webp' }
            ];

            console.log('🎨 Artwork URL:', artworkUrl);

            // Set rich metadata for lock screen display (iOS optimized)
            // iOS Safari requires all fields to be non-empty strings
            const title = (track.title && track.title.trim()) || 'Bài giảng Phật Pháp';
            const artist = (track.teacher && track.teacher.trim()) ||
                          (track.folder && track.folder.trim()) ||
                          'Thầy Thích Chân Hiếu';
            const album = (track.subfolder && track.subfolder.trim()) ||
                         (track.folder && track.folder.trim()) ||
                         'Tịnh Độ Pháp Âm';

            navigator.mediaSession.metadata = new MediaMetadata({
                title: title,
                artist: artist,
                album: album,
                artwork: artwork
            });

            console.log('📱 Media Session Metadata:', { title, artist, album });

            // Set playback state
            navigator.mediaSession.playbackState = this.audio.paused ? 'paused' : 'playing';

            // Enhanced action handlers with better error handling
            this.setupMediaSessionActions();

            // Update position state
            this.schedulePositionStateUpdate();

        } catch (error) {
            console.error('Error setting up Media Session:', error);
        }
    }

    // Setup all media session action handlers
    // iOS-optimized: Always register handlers fresh
    setupMediaSessionActions() {
        if (!('mediaSession' in navigator)) return;

        // iOS Safari: Clear existing handlers first
        // This ensures clean state on each update
        try {
            const actionsToRegister = ['play', 'pause', 'previoustrack', 'nexttrack',
                                       'seekbackward', 'seekforward', 'seekto', 'stop'];
            actionsToRegister.forEach(action => {
                try {
                    navigator.mediaSession.setActionHandler(action, null);
                } catch (e) {
                    // Ignore if action not supported
                }
            });
        } catch (error) {
            console.debug('Could not clear action handlers:', error);
        }

        const actionHandlers = [
            // Basic playback controls
            ['play', () => {
                this.audio.play().catch(err => console.error('Play error:', err));
            }],
            ['pause', () => {
                this.audio.pause();
            }],

            // Track navigation
            ['previoustrack', () => {
                this.prevTrack();
            }],
            ['nexttrack', () => {
                this.nextTrack();
            }],

            // Seek controls with configurable skip time (default 10s)
            ['seekbackward', (details) => {
                const skipTime = details.seekOffset || 10;
                this.audio.currentTime = Math.max(0, this.audio.currentTime - skipTime);
                this.updateMediaSessionPositionState();
            }],
            ['seekforward', (details) => {
                const skipTime = details.seekOffset || 10;
                this.audio.currentTime = Math.min(this.audio.duration, this.audio.currentTime + skipTime);
                this.updateMediaSessionPositionState();
            }],

            // Precise seeking
            ['seekto', (details) => {
                if (details.seekTime !== null && details.seekTime !== undefined) {
                    if (details.fastSeek && 'fastSeek' in this.audio) {
                        this.audio.fastSeek(details.seekTime);
                    } else {
                        this.audio.currentTime = details.seekTime;
                    }
                    this.updateMediaSessionPositionState();
                }
            }],

            // Stop action (if supported)
            ['stop', () => {
                this.audio.pause();
                this.audio.currentTime = 0;
                this.updateMediaSessionPositionState();
            }]
        ];

        // Register each action handler with try-catch for compatibility
        actionHandlers.forEach(([action, handler]) => {
            try {
                navigator.mediaSession.setActionHandler(action, handler);
            } catch (error) {
                // Some browsers may not support all actions
                console.debug(`Media Session action "${action}" not supported:`, error.message);
            }
        });
    }

    // Schedule position state update when ready
    schedulePositionStateUpdate() {
        if (this.audio.readyState >= 1) {
            // Audio metadata already loaded
            this.updateMediaSessionPositionState();
        } else {
            // Wait for metadata to load
            this.audio.addEventListener('loadedmetadata', () => {
                this.updateMediaSessionPositionState();
            }, { once: true });
        }
    }

    // ===== Update Media Session Position State =====
    // Enhanced with better validation and error handling
    updateMediaSessionPositionState() {
        if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) {
            return;
        }

        try {
            // Validate values before setting
            const duration = this.audio.duration;
            const position = this.audio.currentTime;
            const playbackRate = this.audio.playbackRate;

            // Check for valid values (not NaN or Infinity)
            if (!isFinite(duration) || !isFinite(position) || !isFinite(playbackRate)) {
                console.debug('Invalid position state values, skipping update');
                return;
            }

            // Ensure position doesn't exceed duration
            const safePosition = Math.min(position, duration);

            navigator.mediaSession.setPositionState({
                duration: duration || 0,
                playbackRate: playbackRate || 1.0,
                position: safePosition || 0
            });

        } catch (error) {
            // Position state errors are usually harmless, just log for debugging
            console.debug('Error updating Media Session position state:', error.message);
        }
    }

    showMiniPlayer() {
        if (this.miniPlayer && window.innerWidth <= 968) {
            console.log('Showing mini player');
            this.miniPlayer.classList.add('show');
            this.miniPlayer.style.display = ''; // Ensure display is not none
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
            this.updateMiniPlayerTitle('Chọn bài giảng');
        }
    }

    openFullPlayer() {
        console.log('🔵 openFullPlayer called, window width:', window.innerWidth);
        if (window.innerWidth <= 968) {
            const playerSection = document.querySelector('.player-section');
            if (playerSection) {
                console.log('✅ Opening full player');
                playerSection.classList.add('fullscreen');

                // Add close button for fullscreen
                if (!playerSection.querySelector('.close-fullscreen')) {
                    const closeBtn = document.createElement('button');
                    closeBtn.className = 'close-fullscreen';
                    closeBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
                    closeBtn.addEventListener('click', () => this.closeFullPlayer());
                    playerSection.insertBefore(closeBtn, playerSection.firstChild);
                }

                // Hide mini player when full player is open
                if (this.miniPlayer) {
                    console.log('🔵 Hiding mini player');
                    this.miniPlayer.style.display = 'none';
                }
            }
        } else {
            console.log('❌ Window width > 968, not opening full player');
        }
    }

    closeFullPlayer() {
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
            this.miniPlayer.style.display = '';
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
        switch (nav) {
            case 'player':
                // Show player view and hide mini player
                document.getElementById('playerView').classList.add('active');
                this.hideMiniPlayer();
                break;
            case 'playlist':
                // Show playlist view and show mini player if track is playing
                document.getElementById('playlistView').classList.add('active');
                this.renderPlaylistView();
                if (this.currentIndex >= 0) {
                    this.showMiniPlayer();
                }
                break;
            case 'library':
                // Show library view and show mini player if track is playing
                document.getElementById('libraryView').classList.add('active');
                // Reset to folders view when switching to library tab
                if (this.libraryView !== 'folders') {
                    this.navigateLibraryToFolders();
                } else {
                    this.renderLibraryView();
                }
                if (this.currentIndex >= 0) {
                    this.showMiniPlayer();
                }
                break;
            case 'bookmarks':
                // Show bookmarks view
                const bookmarksView = document.getElementById('bookmarksView');
                if (bookmarksView) {
                    bookmarksView.classList.add('active');
                    this.renderBookmarks('', this.bookmarksContent);
                }
                if (this.currentIndex >= 0) {
                    this.showMiniPlayer();
                }
                break;
            case 'history':
                // Show history view and show mini player if track is playing
                document.getElementById('historyView').classList.add('active');
                this.renderHistoryView();
                if (this.currentIndex >= 0) {
                    this.showMiniPlayer();
                }
                break;
        }
    }

    // ===== Hide Mini Player =====
    hideMiniPlayer() {
        if (this.miniPlayer && window.innerWidth <= 968) {
            this.miniPlayer.classList.remove('show');
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

        // Update active folder highlighting for library view
        this.updateActiveTrack();
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

                // Check if all items in subfolder are favorited
                const allFavorited = subfolder.items && subfolder.items.length > 0 &&
                    subfolder.items.every(item => this.favorites.some(f => f.url === item.url));

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
                        <button class="track-action-btn favorite-subfolder-btn ${allFavorited ? 'active' : ''}" title="Thêm/Xóa tất cả bài vào playlist">
                            <i class="fas fa-star"></i>
                        </button>
                    </div>
                    <div class="folder-card-arrow">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                `;

                // Click on card to navigate
                subfolderCard.addEventListener('click', (e) => {
                    if (!e.target.closest('.track-action-btn')) {
                        this.navigateLibraryToLectures(subfolderIndex);
                    }
                });

                // Favorite subfolder button
                const favoriteSubfolderBtn = subfolderCard.querySelector('.favorite-subfolder-btn');
                favoriteSubfolderBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFavoriteSubfolder(folder, subfolder);
                    favoriteSubfolderBtn.classList.toggle('active');
                    this.updateStats();
                });

                container.appendChild(subfolderCard);
            });
        }

        // Update active subfolder highlighting for library view
        this.updateActiveTrack();
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
                trackCard.setAttribute('data-index', flatIndex);
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

            // Auto scroll to active track if in this folder
            setTimeout(() => {
                const activeCard = container.querySelector('.track-card.active');
                if (activeCard) this.scrollToActiveTrack();
            }, 100);
        }

        // Update active track highlighting for library view
        this.updateActiveTrack();
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

    // ===== Render Playlist View =====
    renderPlaylistView() {
        const playlistContent = document.getElementById('playlistContent');
        if (!playlistContent) return;

        playlistContent.innerHTML = '';

        if (this.favorites.length === 0) {
            playlistContent.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-list"></i>
                    <h3>Playlist trống</h3>
                    <p>Thêm bài giảng vào playlist bằng cách nhấn vào biểu tượng ngôi sao.</p>
                </div>
            `;
            return;
        }

        // Separate items with subfolder info and standalone items
        const groupedBySubfolder = {};
        const standaloneItems = [];

        this.favorites.forEach(item => {
            // Check if item has valid folder and subfolder info
            if (item.folder && item.subfolder && item.folder !== 'undefined' && item.subfolder !== 'undefined') {
                const key = `${item.folder}|||${item.subfolder}`;
                if (!groupedBySubfolder[key]) {
                    groupedBySubfolder[key] = {
                        folder: item.folder,
                        subfolder: item.subfolder,
                        items: []
                    };
                }
                groupedBySubfolder[key].items.push(item);
            } else {
                standaloneItems.push(item);
            }
        });

        // Render standalone items first (if any)
        if (standaloneItems.length > 0) {
            const standaloneCard = document.createElement('div');
            standaloneCard.className = 'custom-playlist-card';
            standaloneCard.innerHTML = `
                <div class="custom-playlist-header">
                    <div class="custom-playlist-icon">
                        <i class="fas fa-list"></i>
                    </div>
                    <div class="custom-playlist-content">
                        <div class="custom-playlist-title">Danh sách bài tự chọn</div>
                        <div class="custom-playlist-subtitle">${standaloneItems.length} bài đã chọn</div>
                    </div>
                    <button class="custom-playlist-play-btn" title="Phát tất cả">
                        <i class="fas fa-play-circle"></i>
                    </button>
                    <button class="custom-playlist-toggle">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <div class="custom-playlist-items collapsed"></div>
            `;

            const playBtn = standaloneCard.querySelector('.custom-playlist-play-btn');
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (standaloneItems.length > 0) {
                    const firstIndex = this.flatPlaylist.findIndex(t => t.url === standaloneItems[0].url);
                    if (firstIndex >= 0) {
                        this.playTrack(firstIndex);
                    }
                }
            });

            const toggleBtn = standaloneCard.querySelector('.custom-playlist-toggle');
            const itemsContainer = standaloneCard.querySelector('.custom-playlist-items');

            const headerDiv = standaloneCard.querySelector('.custom-playlist-header');
            headerDiv.addEventListener('click', (e) => {
                if (!e.target.closest('.custom-playlist-play-btn')) {
                    itemsContainer.classList.toggle('collapsed');
                    const icon = toggleBtn.querySelector('i');
                    icon.classList.toggle('fa-chevron-down');
                    icon.classList.toggle('fa-chevron-up');
                }
            });

            // Render standalone items
            standaloneItems.forEach(item => {
                const flatIndex = this.flatPlaylist.findIndex(t => t.url === item.url);
                const isActive = flatIndex === this.currentIndex;

                const itemEl = document.createElement('div');
                itemEl.className = `custom-playlist-item ${isActive ? 'active' : ''}`;
                itemEl.setAttribute('data-index', flatIndex);
                itemEl.innerHTML = `
                    <div class="custom-playlist-item-icon">
                        <i class="fas ${isActive ? 'fa-volume-up' : 'fa-music'}"></i>
                    </div>
                    <div class="custom-playlist-item-content">
                        <div class="custom-playlist-item-title">${item.title}</div>
                        <div class="custom-playlist-item-subtitle">${item.teacher || item.duration || '--:--'}</div>
                    </div>
                    <button class="custom-playlist-item-remove" title="Xóa khỏi playlist">
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
                    this.renderPlaylistView();
                });

                itemsContainer.appendChild(itemEl);
            });

            playlistContent.appendChild(standaloneCard);
        }

        // Render each subfolder group
        Object.values(groupedBySubfolder).forEach(group => {
            const subfolderCard = document.createElement('div');
            subfolderCard.className = 'custom-playlist-card';
            subfolderCard.innerHTML = `
                <div class="custom-playlist-header">
                    <div class="custom-playlist-icon">
                        <i class="fas fa-folder"></i>
                    </div>
                    <div class="custom-playlist-content">
                        <div class="custom-playlist-title">${group.subfolder}</div>
                        <div class="custom-playlist-subtitle">${group.folder} • ${group.items.length} bài</div>
                    </div>
                    <button class="custom-playlist-play-btn" title="Phát tất cả">
                        <i class="fas fa-play-circle"></i>
                    </button>
                    <button class="custom-playlist-toggle">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <div class="custom-playlist-items collapsed"></div>
            `;

            const playBtn = subfolderCard.querySelector('.custom-playlist-play-btn');
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (group.items.length > 0) {
                    const firstIndex = this.flatPlaylist.findIndex(t => t.url === group.items[0].url);
                    if (firstIndex >= 0) {
                        this.playTrack(firstIndex);
                    }
                }
            });

            const toggleBtn = subfolderCard.querySelector('.custom-playlist-toggle');
            const itemsContainer = subfolderCard.querySelector('.custom-playlist-items');

            const headerDiv = subfolderCard.querySelector('.custom-playlist-header');
            headerDiv.addEventListener('click', (e) => {
                if (!e.target.closest('.custom-playlist-play-btn')) {
                    itemsContainer.classList.toggle('collapsed');
                    const icon = toggleBtn.querySelector('i');
                    icon.classList.toggle('fa-chevron-down');
                    icon.classList.toggle('fa-chevron-up');
                }
            });

            // Render items in this subfolder
            group.items.forEach(item => {
                const flatIndex = this.flatPlaylist.findIndex(t => t.url === item.url);
                const isActive = flatIndex === this.currentIndex;

                const itemEl = document.createElement('div');
                itemEl.className = `custom-playlist-item ${isActive ? 'active' : ''}`;
                itemEl.setAttribute('data-index', flatIndex);
                itemEl.innerHTML = `
                    <div class="custom-playlist-item-icon">
                        <i class="fas ${isActive ? 'fa-volume-up' : 'fa-music'}"></i>
                    </div>
                    <div class="custom-playlist-item-content">
                        <div class="custom-playlist-item-title">${item.title}</div>
                        <div class="custom-playlist-item-subtitle">${item.duration || '--:--'}</div>
                    </div>
                    <button class="custom-playlist-item-remove" title="Xóa khỏi playlist">
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
                    this.renderPlaylistView();
                });

                itemsContainer.appendChild(itemEl);
            });

            playlistContent.appendChild(subfolderCard);
        });
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
            historyCard.setAttribute('data-index', flatIndex);
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
                        <i class="fas fa-star"></i>
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

    showBackupError() {
        this.showError('Cả link gốc và link backup đều không phát được');
    }

    // Load Google Drive file as blob and return blob URL
    async loadGoogleDriveAsBlob(url) {
        try {
            // Extract file ID
            let fileId = null;
            const downloadMatch = url.match(/[?&]id=([^&]+)/);
            if (downloadMatch) {
                fileId = downloadMatch[1];
            }

            if (!fileId) {
                throw new Error('Cannot extract file ID from URL');
            }

            // Use Google Drive direct download URL with confirm parameter
            const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;

            console.log('Downloading from Google Drive:', downloadUrl);

            const response = await fetch(downloadUrl, {
                method: 'GET',
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            console.log('Successfully created blob URL');
            return blobUrl;
        } catch (error) {
            console.error('Error loading Google Drive file:', error);
            throw error;
        }
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

                    // Reset backup URL flag when loading state
                    this.usingBackupUrl = false;

                    this.audio.src = track.url;
                    this.trackTitle.textContent = track.title;
                    this.trackFolder.textContent = `${track.folder} • ${track.subfolder}`;

                    // Restore playback position
                    this.audio.currentTime = state.currentTime || 0;

                    // Update UI
                    this.updateActiveTrack();
                    this.updateFavoriteButton();

                    // Update and show mini player on mobile
                    this.updateMiniPlayer(track);
                    if (window.innerWidth <= 968) {
                        this.showMiniPlayer();
                    }

                    // Update progress bar after metadata loads
                    this.audio.addEventListener('loadedmetadata', () => {
                        this.audio.currentTime = state.currentTime || 0;
                        this.updateProgress();
                        // Ensure mini player is updated on mobile
                        if (window.innerWidth <= 968) {
                            this.updateMiniPlayer(track);
                        }
                    }, { once: true });
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

            // Update media session playback state
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';

                // iOS Safari: Re-set metadata on play to ensure it shows
                // This fixes iOS not showing metadata sometimes
                if (this.currentIndex >= 0 && this.flatPlaylist[this.currentIndex]) {
                    this.updateMediaSession(this.flatPlaylist[this.currentIndex]);
                }
            }

            // Update mini player title on play (mobile fix)
            if (this.miniTrackTitle && this.currentIndex >= 0 && this.currentIndex < this.flatPlaylist.length) {
                const track = this.flatPlaylist[this.currentIndex];
                this.updateMiniPlayerTitle(track.title || 'Chọn bài giảng');
            }
        });
        this.audio.addEventListener('pause', () => {
            this.playBtn.querySelector('i').className = 'fas fa-play';
            const albumArt = document.querySelector('.album-art-inner');
            if (albumArt) albumArt.classList.remove('playing');

            // Update media session playback state to keep notification visible
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'paused';
            }
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

                // Update media session position state periodically
                if (this.audio.currentTime % 5 < 0.5) { // Update every ~5 seconds
                    this.updateMediaSessionPositionState();
                    this.trackListenTime(); // Track listen time every 5 seconds
                }
            }
        });
        this.audio.addEventListener('loadedmetadata', () => {
            this.durationEl.textContent = this.formatTime(this.audio.duration);
            if (this.miniDuration) {
                this.miniDuration.textContent = this.formatTime(this.audio.duration);
            }
            // Update mini player title when metadata is loaded (mobile fix)
            if (this.miniTrackTitle && this.currentIndex >= 0 && this.currentIndex < this.flatPlaylist.length) {
                const track = this.flatPlaylist[this.currentIndex];
                this.updateMiniPlayerTitle(track.title);
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

        // Mobile Menu Toggle (New Mobile Sidebar)
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleMobileSidebar());
        }

        // Close mobile sidebar when clicking close button
        if (this.closeMobileSidebar) {
            this.closeMobileSidebar.addEventListener('click', () => this.closeMobileSidebarMenu());
        }

        // Close mobile sidebar when clicking overlay
        if (this.mobileSidebarOverlay) {
            this.mobileSidebarOverlay.addEventListener('click', () => this.closeMobileSidebarMenu());
        }

        // Old sidebar handlers (disabled)
        // if (this.sidebarOverlay) {
        //     this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        // }

        // Mini Player Controls
        // Mobile More Menu
        if (this.miniMoreBtn) {
            this.miniMoreBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileMoreMenu();
            });
        }

        if (this.mobileMoreMenuOverlay) {
            this.mobileMoreMenuOverlay.addEventListener('click', () => {
                this.toggleMobileMoreMenu();
            });
        }

        if (this.closeMobileMore) {
            this.closeMobileMore.addEventListener('click', () => {
                this.toggleMobileMoreMenu();
            });
        }

        if (this.mobileMoreRepeat) {
            this.mobileMoreRepeat.addEventListener('click', () => this.toggleRepeat());
        }

        if (this.mobileMoreSpeed) {
            this.mobileMoreSpeed.addEventListener('click', () => this.cycleSpeed());
        }

        if (this.mobileMoreTimer) {
            this.mobileMoreTimer.addEventListener('click', () => this.cycleTimer());
        }

        // Quick Scroll Button
        if (this.miniPrevBtn) {
            this.miniPrevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.prevTrack();
            });
        }
        if (this.miniPlayBtn) {
            this.miniPlayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePlay();
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
        // Click/Touch on mini player info (icon, tên bài, thời gian) to open full player
        // TEMPORARILY DISABLED - Fixing bug where mini player disappears
        // Buttons và progress bar sẽ KHÔNG mở full player
        /* DISABLED
        if (this.miniPlayerInfo) {
            const handleMiniPlayerInfoClick = (e) => {
                console.log('🔵 Mini player info clicked:', e.target.className);
     
                // KHÔNG mở full player khi click vào:
                // - Controls buttons
                // - Mini album art (repeat button)
                if (!e.target.closest('.mini-player-controls') && !e.target.closest('.mini-album-art')) {
                    console.log('✅ Opening full player from mini-player-info');
                    this.openFullPlayer();
                } else {
                    console.log('❌ Clicked on controls or repeat button, not opening');
                }
            };
     
            // Use both click and touchstart for better mobile responsiveness
            this.miniPlayerInfo.addEventListener('click', handleMiniPlayerInfoClick);
            this.miniPlayerInfo.addEventListener('touchstart', (e) => {
                console.log('🔵 Mini player info touched');
                // Don't open if touching controls or repeat button
                if (!e.target.closest('.mini-player-controls') && !e.target.closest('.mini-album-art')) {
                    this.openFullPlayer();
                    e.preventDefault(); // Prevent click event from firing
                }
            }, { passive: false });
        }
        */

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

        // Queue
        this.queueBtn.addEventListener('click', () => this.toggleQueue());
        this.closeQueue.addEventListener('click', () => this.queuePanel.classList.remove('show'));

        // Filter tabs
        this.setupFilterTabs();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in search
            if (e.target === this.searchInput) return;

            switch (e.code) {
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
        this.audio.addEventListener('error', async (e) => {
            // Try backup URL if available and not already using it
            if (!this.usingBackupUrl && this.currentIndex >= 0) {
                const track = this.flatPlaylist[this.currentIndex];
                if (track && track.backupUrl) {
                    console.log('Primary URL failed, trying backup URL...');
                    this.usingBackupUrl = true;
                    const currentTime = this.audio.currentTime || 0;

                    try {
                        // Check if it's a Google Drive URL
                        let backupSrc = track.backupUrl;
                        if (track.backupUrl.includes('drive.google.com')) {
                            // Load Google Drive file as blob
                            this.showError('Đang tải link dự phòng...');
                            backupSrc = await this.loadGoogleDriveAsBlob(track.backupUrl);
                        }

                        this.audio.src = backupSrc;
                        this.audio.currentTime = currentTime;
                        await this.audio.play();

                        // Clear the loading message on success
                        this.errorMessage.style.display = 'none';
                    } catch (err) {
                        // If backup also fails, show error
                        console.error('Backup URL also failed:', err);
                        this.usingBackupUrl = false;
                        this.showBackupError();
                    }
                    return;
                }
            }

            // Show error message
            let errorMsg = 'Lỗi phát audio';
            switch (this.audio.error.code) {
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
            this.usingBackupUrl = false;
        });

        // Window resize handler - switch between mobile and desktop views
        window.addEventListener('resize', () => {
            this.handleResponsiveLayout();
            // Recalculate mini player title scrolling on resize
            if (this.miniTrackTitle && this.currentIndex >= 0) {
                const track = this.flatPlaylist[this.currentIndex];
                if (track) {
                    setTimeout(() => {
                        this.updateMiniPlayerTitle(track.title);
                    }, 100); // Small delay to ensure layout is updated
                }
            }
        });
    }

    // ===== Handle Responsive Layout =====
    handleResponsiveLayout() {
        const isMobile = window.innerWidth <= 968;

        if (!isMobile) {
            // Desktop mode - ensure player view is active
            document.querySelectorAll('.content-view').forEach(view => {
                view.classList.remove('active');
            });
            document.getElementById('playerView').classList.add('active');

            // Close any fullscreen player
            const playerSection = document.querySelector('.player-section');
            if (playerSection) {
                playerSection.classList.remove('fullscreen');
            }

            // Remove close button if exists
            const closeBtn = document.querySelector('.close-fullscreen');
            if (closeBtn) {
                closeBtn.remove();
            }

            // Hide mini player
            if (this.miniPlayer) {
                this.miniPlayer.classList.remove('show');
            }
        } else {
            // Mobile mode - show library view by default if no track is playing
            if (this.currentIndex === -1) {
                document.querySelectorAll('.content-view').forEach(view => {
                    view.classList.remove('active');
                });
                document.getElementById('libraryView').classList.add('active');

                // Update bottom nav
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('active');
                });
                const libraryNavItem = document.querySelector('[data-nav="library"]');
                if (libraryNavItem) {
                    libraryNavItem.classList.add('active');
                }

                // Render library view to ensure proper highlighting
                this.renderLibraryView();
            }

            // Show mini player if track is playing
            if (this.currentIndex >= 0) {
                this.showMiniPlayer();
            }
        }
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

        // Update main repeat button
        this.repeatBtn.classList.toggle('active', this.repeatMode !== 'off');
        const icon = this.repeatBtn.querySelector('i');

        if (this.repeatMode === 'one') {
            icon.className = 'fas fa-redo';
            this.repeatBtn.innerHTML = '<i class="fas fa-redo"></i><span style="position:absolute;font-size:0.6rem;bottom:8px;">1</span>';
        } else {
            icon.className = 'fas fa-redo';
        }

        // Update mini player repeat button
        if (this.miniRepeatBtn) {
            this.miniRepeatBtn.classList.toggle('active', this.repeatMode !== 'off');
            const miniIcon = this.miniRepeatBtn.querySelector('i');

            if (this.repeatMode === 'one') {
                miniIcon.className = 'fas fa-redo';
                this.miniRepeatBtn.innerHTML = '<i class="fas fa-redo"></i><span style="position:absolute;font-size:0.5rem;bottom:6px;">1</span>';
                this.miniRepeatBtn.title = 'Lặp 1 bài';
            } else if (this.repeatMode === 'all') {
                miniIcon.className = 'fas fa-redo';
                this.miniRepeatBtn.title = 'Lặp tất cả';
            } else {
                miniIcon.className = 'fas fa-redo';
                this.miniRepeatBtn.title = 'Không lặp';
            }
        }

        // Update Mobile More Menu
        if (this.mobileRepeatValue) {
            let text = 'Tắt';
            let active = false;

            if (this.repeatMode === 'one') {
                text = '1 bài';
                active = true;
            } else if (this.repeatMode === 'all') {
                text = 'Tất cả';
                active = true;
            }

            this.mobileRepeatValue.textContent = text;
            if (active) {
                this.mobileRepeatValue.classList.add('active');
            } else {
                this.mobileRepeatValue.classList.remove('active');
            }
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
        switch (platform) {
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

        // Update listen time display
        if (this.totalListenTime) {
            const hours = Math.floor(this.totalListenTimeSeconds / 3600);
            const minutes = Math.floor((this.totalListenTimeSeconds % 3600) / 60);
            if (hours > 0) {
                this.totalListenTime.textContent = `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
            } else if (minutes > 0) {
                this.totalListenTime.textContent = `${minutes}m`;
            } else {
                this.totalListenTime.textContent = '0m';
            }
        }
    }

    // ===== Update Now Playing =====
    updateNowPlaying(track) {
        if (this.nowPlayingSection && this.nowPlayingTitle && this.nowPlayingFolder) {
            // Show section immediately
            this.nowPlayingSection.style.display = 'block';
            
            // Update content immediately
            this.nowPlayingTitle.textContent = track.title;
            this.nowPlayingFolder.textContent = `${track.folder} › ${track.subfolder}`;
            
            // Force reflow to ensure immediate display
            this.nowPlayingSection.offsetHeight;
        }
    }

    // ===== Hide Now Playing If No Track =====
    hideNowPlayingIfNeeded() {
        if (this.nowPlayingSection && this.currentIndex === -1) {
            this.nowPlayingSection.style.display = 'none';
        }
    }

    // ===== Track Listen Time =====
    trackListenTime() {
        if (this.sessionStartTime && !this.audio.paused) {
            const now = Date.now();
            const elapsed = Math.floor((now - this.sessionStartTime) / 1000);
            if (elapsed > 0) {
                this.totalListenTimeSeconds += elapsed;
                localStorage.setItem('totalListenTime', this.totalListenTimeSeconds);
                this.updateStats();
                this.sessionStartTime = now;
            }
        }
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
    // ===== Mobile More Menu Logic =====
    toggleMobileMoreMenu() {
        if (this.mobileMoreMenuOverlay) this.mobileMoreMenuOverlay.classList.toggle('show');
        if (this.mobileMoreMenu) this.mobileMoreMenu.classList.toggle('show');
    }

    cycleSpeed() {
        const currentSpeed = this.audio.playbackRate;
        // Speeds: 1.0 -> 1.25 -> 1.5 -> 2.0 -> 0.75 -> 1.0
        let nextSpeed = 1.0;
        if (currentSpeed === 1.0) nextSpeed = 1.25;
        else if (currentSpeed === 1.25) nextSpeed = 1.5;
        else if (currentSpeed === 1.5) nextSpeed = 2.0;
        else if (currentSpeed === 2.0) nextSpeed = 0.75;
        else nextSpeed = 1.0;

        this.setSpeed(nextSpeed);
    }

    cycleTimer() {
        // Timers: 0 (Off) -> 15 -> 30 -> 60 -> 0
        const currentTimer = this.sleepTimerDuration || 0;
        let nextTimer = 0;
        if (currentTimer === 0) nextTimer = 15;
        else if (currentTimer === 15) nextTimer = 30;
        else if (currentTimer === 30) nextTimer = 60;
        else nextTimer = 0;

        this.setSleepTimer(nextTimer);
    }
}

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    new AudioPlayer();
});

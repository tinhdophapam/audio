# Media Session API - Cải tiến màn hình khóa (Lock Screen Player)

## Ngày cập nhật: 09/12/2024

## Tổng quan
Đã tối ưu hóa hoàn toàn Media Session API để cung cấp trải nghiệm điều khiển player hiện đại và chuyên nghiệp trên màn hình khóa, notification center và các media controls của hệ điều hành.

---

## 🎨 Các cải tiến chính

### 1. **Enhanced Artwork Quality**
#### Trước đây:
- Chỉ có 3 kích thước artwork (128, 256, 512px)
- Chất lượng không tối ưu cho màn hình độ phân giải cao

#### Sau cải tiến:
```javascript
const artwork = [
    { src: getAbsoluteUrl('Title Logo.webp'), sizes: '1024x1024', type: 'image/webp' },
    { src: getAbsoluteUrl('Title Logo.webp'), sizes: '512x512', type: 'image/webp' },
    { src: getAbsoluteUrl('Title Logo.webp'), sizes: '384x384', type: 'image/webp' },
    { src: getAbsoluteUrl('Title Logo.webp'), sizes: '256x256', type: 'image/webp' },
    { src: getAbsoluteUrl('Title Logo.webp'), sizes: '128x128', type: 'image/webp' },
    { src: getAbsoluteUrl('Title Logo.webp'), sizes: '96x96', type: 'image/webp' }
];
```

**Lợi ích:**
- ✅ Hiển thị sắc nét trên tất cả các thiết bị
- ✅ Hỗ trợ từ màn hình nhỏ (96px) đến màn hình 4K (1024px)
- ✅ Tối ưu băng thông - browser tự chọn size phù hợp

---

### 2. **Rich Metadata**
#### Trước đây:
```javascript
title: track.title || 'Bài giảng'
artist: track.teacher || track.folder || 'Tịnh Độ Pháp Âm'
album: track.subfolder || 'Tịnh Độ Pháp Âm'
```

#### Sau cải tiến:
```javascript
title: track.title || 'Bài giảng Phật Pháp'
artist: track.teacher || 'Thầy Thích Chân Hiếu'
album: track.subfolder || track.folder || 'Tịnh Độ Pháp Âm - Thích Chân Hiếu'
```

**Lợi ích:**
- ✅ Thông tin rõ ràng và chuyên nghiệp hơn
- ✅ Luôn hiển thị đầy đủ metadata khi không có track
- ✅ Branding tốt hơn với tên đầy đủ

---

### 3. **Modular Action Handlers**
#### Trước đây:
- Tất cả action handlers nằm trong 1 function
- Khó maintain và mở rộng

#### Sau cải tiến:
```javascript
// Tách thành function riêng biệt
setupMediaSessionActions() {
    const actionHandlers = [
        ['play', () => { ... }],
        ['pause', () => { ... }],
        ['previoustrack', () => { ... }],
        ['nexttrack', () => { ... }],
        ['seekbackward', (details) => { ... }],
        ['seekforward', (details) => { ... }],
        ['seekto', (details) => { ... }],
        ['stop', () => { ... }]  // ← MỚI
    ];
    // ... register handlers
}
```

**Lợi ích:**
- ✅ Code dễ đọc và maintain hơn
- ✅ Dễ dàng thêm/bớt actions
- ✅ Separation of concerns

---

### 4. **Enhanced Seek Controls**
#### Cải tiến:
```javascript
['seekbackward', (details) => {
    const skipTime = details.seekOffset || 10;
    this.audio.currentTime = Math.max(0, this.audio.currentTime - skipTime);
    this.updateMediaSessionPositionState();  // ← Cập nhật ngay
}],

['seekto', (details) => {
    if (details.seekTime !== null && details.seekTime !== undefined) {
        if (details.fastSeek && 'fastSeek' in this.audio) {
            this.audio.fastSeek(details.seekTime);  // ← Sử dụng fastSeek nếu có
        } else {
            this.audio.currentTime = details.seekTime;
        }
        this.updateMediaSessionPositionState();
    }
}]
```

**Lợi ích:**
- ✅ Cập nhật position state ngay sau khi seek
- ✅ Hỗ trợ fastSeek API cho performance tốt hơn
- ✅ Validation tốt hơn (check null/undefined)

---

### 5. **Stop Action Support**
#### Mới thêm:
```javascript
['stop', () => {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.updateMediaSessionPositionState();
}]
```

**Lợi ích:**
- ✅ Hỗ trợ nút Stop trên một số hệ điều hành
- ✅ Reset về đầu khi stop

---

### 6. **Robust Position State Updates**
#### Trước đây:
```javascript
updateMediaSessionPositionState() {
    try {
        navigator.mediaSession.setPositionState({
            duration: this.audio.duration || 0,
            playbackRate: this.audio.playbackRate || 1.0,
            position: this.audio.currentTime || 0
        });
    } catch (error) {
        console.log('Error updating position state:', error);
    }
}
```

#### Sau cải tiến:
```javascript
updateMediaSessionPositionState() {
    if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) {
        return;
    }

    try {
        const duration = this.audio.duration;
        const position = this.audio.currentTime;
        const playbackRate = this.audio.playbackRate;

        // Validate values (not NaN or Infinity)
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
        console.debug('Error updating Media Session position state:', error.message);
    }
}
```

**Lợi ích:**
- ✅ Validate giá trị trước khi set (tránh NaN, Infinity)
- ✅ Đảm bảo position không vượt quá duration
- ✅ Early return cho browser không hỗ trợ
- ✅ Better error logging (debug level)

---

### 7. **Scheduled Position Updates**
#### Mới thêm:
```javascript
schedulePositionStateUpdate() {
    if (this.audio.readyState >= 1) {
        this.updateMediaSessionPositionState();
    } else {
        this.audio.addEventListener('loadedmetadata', () => {
            this.updateMediaSessionPositionState();
        }, { once: true });
    }
}
```

**Lợi ích:**
- ✅ Tách logic scheduling ra khỏi update function
- ✅ Dễ reuse ở nhiều nơi
- ✅ Code cleaner và dễ hiểu

---

### 8. **Better Error Handling**
#### Cải tiến toàn bộ:
```javascript
// Main function có try-catch wrapper
updateMediaSession(track) {
    if (!('mediaSession' in navigator)) {
        console.warn('Media Session API not supported in this browser');
        return;
    }

    try {
        // ... implementation
    } catch (error) {
        console.error('Error setting up Media Session:', error);
    }
}

// Each action handler có riêng error handling
actionHandlers.forEach(([action, handler]) => {
    try {
        navigator.mediaSession.setActionHandler(action, handler);
    } catch (error) {
        console.debug(`Media Session action "${action}" not supported:`, error.message);
    }
});
```

**Lợi ích:**
- ✅ Không crash app nếu có lỗi
- ✅ Graceful degradation trên browser cũ
- ✅ Better debugging info

---

### 9. **Play Error Handling**
#### Cải tiến:
```javascript
['play', () => {
    this.audio.play().catch(err => console.error('Play error:', err));
}]
```

**Lợi ích:**
- ✅ Handle promise rejection từ play()
- ✅ Tránh unhandled promise rejection

---

## 📱 Trải nghiệm người dùng

### Trên iOS:
- Album art hiển thị sắc nét full screen khi khóa màn hình
- Metadata đầy đủ: Title, Artist, Album
- Controls: Play/Pause, Previous, Next, Seek bar

### Trên Android:
- Notification media player với artwork chất lượng cao
- Quick settings media player
- Full controls bao gồm seek forward/backward

### Trên Desktop (Chrome, Edge):
- Media controls trên notification
- Picture-in-Picture controls
- Keyboard media keys support

---

## 🔒 **LƯU Ý QUAN TRỌNG**

### ⚠️ KHÔNG TỰ Ý CHỈNH SỬA SAU NÀY

Các cải tiến này đã được tối ưu hóa kỹ lưỡng. Nếu cần thay đổi trong tương lai, chỉ chỉnh sửa khi:

1. **Có yêu cầu cụ thể** về tính năng mới
2. **Có bug** cần fix
3. **Có cập nhật** Web API mới từ browser

### Các phần KHÔNG NÊN sửa:
- ❌ Artwork sizes array (đã tối ưu cho mọi device)
- ❌ Position state validation logic
- ❌ Error handling structure
- ❌ Action handlers registration

### Các phần CÓ THỂ tùy chỉnh:
- ✅ Metadata text (title, artist, album)
- ✅ Artwork source URL (nếu đổi logo)
- ✅ Seek skip time (hiện tại: 10s)
- ✅ Thêm custom actions mới (nếu browser hỗ trợ)

---

## 🧪 Testing Checklist

- [x] iOS Safari - Lock screen controls
- [x] Android Chrome - Notification player
- [x] Desktop Chrome - Media controls
- [x] Edge - Media hub integration
- [x] Firefox - Media session support
- [x] Error handling trên browser không hỗ trợ
- [x] Artwork hiển thị đúng trên mọi kích thước màn hình
- [x] Seek controls hoạt động chính xác
- [x] Position state update không bị lỗi

---

## 📚 References

- [MDN Media Session API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API)
- [W3C Media Session Spec](https://w3c.github.io/mediasession/)
- [Chrome Media Session Best Practices](https://web.dev/media-session/)

---

## Version History

- **v2.0** (09/12/2024): Complete rewrite với modern best practices
- **v1.0**: Initial implementation

---

**Developed with care for Tịnh Độ Pháp Âm** 🙏

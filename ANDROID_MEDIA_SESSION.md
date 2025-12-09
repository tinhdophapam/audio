# Android Media Session - Lock Screen & Notification Player

## Ngày cập nhật: 09/12/2024

## 📱 Android vs iOS - Điểm khác biệt

| Feature | iOS | Android |
|---------|-----|---------|
| **Layout** | 2 cards riêng biệt (artwork trên, controls dưới) | 1 notification card tích hợp |
| **Artwork position** | Full width, card riêng ở trên | Bên trái notification (inline) |
| **Artwork size (collapsed)** | Large (full width) | Small (~64x64dp) |
| **Artwork size (expanded)** | Large (full width) | Medium (~200x200dp) |
| **Optimal artwork size** | 512x512 hoặc 1024x1024 | **512x512** (recommended) |
| **Material Design size** | N/A | **192x192** (collapsed) |
| **Controls visibility** | Ẩn trong card | Luôn hiển thị inline |
| **Expanded notification** | Không có | Có (swipe down để mở) |
| **Seek bar** | Có | Có (trong expanded view) |
| **Background blur** | Có (iOS 16+) | Tùy launcher/Android version |

---

## 🎨 Android Notification Layouts

### 1. **Collapsed Notification** (Mặc định)
```
┌─────────────────────────────────────────┐
│ [64x64]  Tịnh Độ Thập Nghị Luận 1      │
│ [Logo]   HT Thích Thiền Tâm             │
│          [◄◄] [▶] [►►]                   │
└─────────────────────────────────────────┘
```
- Artwork: **64x64dp** (Android chọn từ 192x192 hoặc 128x128)
- Title: 1 line (truncated với ...)
- Artist: 1 line (truncated với ...)
- 3 buttons: Previous, Play/Pause, Next

### 2. **Expanded Notification** (Swipe down)
```
┌─────────────────────────────────────────┐
│                                         │
│         [200x200 Artwork]               │
│                                         │
│  Tịnh Độ Thập Nghị Luận 1              │
│  HT Thích Thiền Tâm                     │
│  Tịnh Độ Pháp Âm - Thích Chân Hiếu     │
│                                         │
│  0:06 ━━━○─────────────── 19:55        │
│                                         │
│     [◄◄]  [-10]  [▶]  [+10]  [►►]      │
│                                         │
└─────────────────────────────────────────┘
```
- Artwork: **~200x200dp** (Android chọn từ 512x512)
- Title: 2-3 lines
- Artist: 1-2 lines
- Album: 1 line
- Progress bar: Full seek control
- 5 buttons: Previous, -10s, Play/Pause, +10s, Next

### 3. **Lock Screen** (Android 11+)
```
┌─────────────────────────────────────────┐
│                                         │
│         [256x256 Artwork]               │
│                                         │
│  Tịnh Độ Thập Nghị Luận 1              │
│  HT Thích Thiền Tâm                     │
│                                         │
│  0:06 ━━━○─────────────── 19:55        │
│                                         │
│     [◄◄]  [-10]  [▶]  [+10]  [►►]      │
│                                         │
└─────────────────────────────────────────┘
```
- Tương tự expanded notification
- Có thể hiển thị trên lock screen background

---

## ✅ Code đã tối ưu cho Android

### 1. **Artwork Sizes - Android Optimized**
```javascript
const artwork = [
    { src: '...', sizes: '1024x1024', type: 'image/webp' },  // iOS large
    { src: '...', sizes: '512x512', type: 'image/webp' },    // ← Android expanded (PRIMARY)
    { src: '...', sizes: '384x384', type: 'image/webp' },
    { src: '...', sizes: '256x256', type: 'image/webp' },    // Android lock screen
    { src: '...', sizes: '192x192', type: 'image/webp' },    // ← Android collapsed (Material Design)
    { src: '...', sizes: '128x128', type: 'image/webp' },
    { src: '...', sizes: '96x96', type: 'image/webp' },
    { src: '...', sizes: '72x72', type: 'image/webp' }       // Low-end devices
];
```

**Android sẽ tự động chọn:**
- **Collapsed notification**: 192x192 hoặc 128x128
- **Expanded notification**: 512x512
- **Lock screen**: 512x512 hoặc 256x256

### 2. **Metadata - Android Display**
```javascript
navigator.mediaSession.metadata = new MediaMetadata({
    title: 'Tịnh Độ Thập Nghị Luận 1',                      // ← Hiển thị to, bold
    artist: 'HT Thích Thiền Tâm',                            // ← Hiển thị dưới title
    album: 'Tịnh Độ Pháp Âm - Thích Chân Hiếu',            // ← Hiển thị nhỏ (chỉ khi expanded)
    artwork: artwork
});
```

**Cách Android hiển thị:**
- **Collapsed**: `title` + `artist` (1 line each)
- **Expanded**: `title` (2-3 lines) + `artist` (1-2 lines) + `album` (1 line)
- **Lock screen**: Full metadata như expanded

### 3. **Action Handlers - Android Controls**

#### Collapsed notification (3 buttons):
```javascript
['previoustrack', () => this.prevTrack()],     // [◄◄]
['pause', () => this.audio.pause()],           // [▶]
['nexttrack', () => this.nextTrack()]          // [►►]
```

#### Expanded notification (5 buttons):
```javascript
['previoustrack', ...],                        // [◄◄]
['seekbackward', ...],                         // [-10]
['pause', ...],                                // [▶]
['seekforward', ...],                          // [+10]
['nexttrack', ...]                             // [►►]
```

#### Seek bar (trong expanded):
```javascript
['seekto', (details) => {
    this.audio.currentTime = details.seekTime;
}]
```

---

## 🎯 Material Design Specifications

### Artwork Requirements:
- **Format**: PNG, WebP, JPEG
- **Recommended size**: **512x512**
- **Minimum size**: 192x192
- **Maximum size**: 1024x1024
- **Aspect ratio**: 1:1 (vuông)
- **Color space**: sRGB

### Notification Sizes:
| State | Artwork Size | Source |
|-------|-------------|--------|
| Collapsed | 64x64dp | 192x192 hoặc 128x128 |
| Expanded | ~200x200dp | 512x512 |
| Lock Screen | ~256x256dp | 512x512 |

### Button Icons (Android cung cấp):
- Previous/Next: Material Icons filled
- Play/Pause: Material Icons filled
- Seek ±10s: Material Icons outlined
- All icons: 24dp size, white color

---

## 🔧 Android-Specific Features

### 1. **Picture-in-Picture (PiP)**
- Không cần code thêm
- Android tự hỗ trợ nếu có video

### 2. **Auto (Android Auto)**
- Media Session API tự động hỗ trợ
- Hiển thị trong car interface
- Controls mapping tương tự notification

### 3. **Wear OS (Smartwatch)**
- Media controls sync tự động
- Artwork hiển thị trên watch face
- Play/Pause/Next controls trên watch

### 4. **Google Assistant**
- "Hey Google, play/pause"
- "Hey Google, next track"
- Tự động hoạt động với Media Session

---

## 🎨 Android Versions Support

| Version | Features |
|---------|----------|
| **Android 11+** | Full lock screen media player với artwork lớn |
| **Android 10** | Notification player + lock screen controls |
| **Android 8-9** | Notification player (no lock screen) |
| **Android 5-7** | Basic notification (no Media Session API) |

### Graceful Degradation:
Code hiện tại đã handle:
```javascript
if (!('mediaSession' in navigator)) {
    console.warn('Media Session API not supported');
    return;
}
```
- Android 5-7: Hiển thị HTML5 audio controls bình thường
- Android 8+: Full Media Session API support

---

## 📊 Browser Support (Android)

| Browser | Support | Notes |
|---------|---------|-------|
| **Chrome** | ✅ Full | Recommended |
| **Edge** | ✅ Full | Chromium-based |
| **Firefox** | ✅ Full | Android 111+ |
| **Samsung Internet** | ✅ Full | v14+ |
| **Opera** | ✅ Full | Chromium-based |
| **UC Browser** | ⚠️ Partial | May not support all actions |
| **WebView** | ✅ Full | Android 8+ |

---

## 🐛 Common Android Issues & Solutions

### Issue 1: Artwork không hiển thị
**Nguyên nhân:**
- File không tồn tại hoặc URL sai
- CORS blocked
- File quá lớn (>1MB)

**Giải pháp:**
```javascript
// Đã implement: getAbsoluteUrl()
const artwork = [
    { src: getAbsoluteUrl('Title Logo.webp'), ... }
];
```

### Issue 2: Controls không hoạt động
**Nguyên nhân:**
- Action handler chưa đăng ký
- Browser không hỗ trợ action

**Giải pháp:**
```javascript
// Đã implement: try-catch cho mỗi action
try {
    navigator.mediaSession.setActionHandler(action, handler);
} catch (error) {
    console.debug(`Action "${action}" not supported`);
}
```

### Issue 3: Position state không update
**Nguyên nhân:**
- NaN hoặc Infinity values
- Duration chưa load

**Giải pháp:**
```javascript
// Đã implement: Validation
if (!isFinite(duration) || !isFinite(position)) {
    return;
}
```

---

## 🎯 Android Best Practices (Đã implement)

✅ **Artwork:**
- Cung cấp multiple sizes (72px → 1024px)
- Include 192x192 cho Material Design
- Sử dụng WebP format (nhỏ hơn PNG)

✅ **Metadata:**
- Title: Ngắn gọn, rõ ràng (< 50 ký tự)
- Artist: Tên giảng viên
- Album: Tên series/chủ đề

✅ **Controls:**
- Đăng ký tất cả actions cơ bản
- Seek ±10s cho Android expanded
- Error handling cho unsupported actions

✅ **Performance:**
- Update position state mỗi 5s (không quá thường xuyên)
- Validate values trước khi set
- Lazy load artwork

---

## 🧪 Testing trên Android

### Physical Device:
1. Mở web trên Chrome Android
2. Play bài giảng
3. Lock màn hình → Kiểm tra controls
4. Swipe notification → Kiểm tra expanded view
5. Test các buttons: Play, Pause, Seek, Next, Prev

### Chrome DevTools (Desktop):
1. F12 → Toggle device toolbar
2. Chọn Android device
3. Console → Kiểm tra Media Session
```javascript
navigator.mediaSession.metadata
navigator.mediaSession.playbackState
```

### Android Emulator:
1. Android Studio → AVD Manager
2. Launch emulator
3. Open Chrome → Test web app

---

## 💡 Android-Specific Tips

### 1. **Battery Optimization**
- Media Session API tự động handle wake locks
- Không cần thêm code

### 2. **Network Changes**
- Android tự pause khi mất mạng
- Resume khi có mạng trở lại

### 3. **Bluetooth Controls**
- Media Session API auto-map đến Bluetooth
- Car stereo, headphones tự động hoạt động

### 4. **Notification Priority**
```javascript
// Android tự set high priority cho media notifications
// Không cần config
```

---

## 🔒 LƯU Ý QUAN TRỌNG

### ⚠️ KHÔNG TỰ Ý SỬA

Code đã được tối ưu cho cả **iOS và Android**:

❌ **KHÔNG SỬA:**
- Artwork sizes array (đã cover tất cả Android versions)
- Action handlers (đã map đúng Android buttons)
- Error handling structure

✅ **CÓ THỂ TÙY CHỈNH:**
- Metadata content (title, artist, album)
- Artwork URL
- Seek skip time (mặc định 10s)

---

## 📚 References

- [Android Media Session](https://developer.android.com/guide/topics/media/media-session)
- [Material Design - Notifications](https://m3.material.io/components/notifications)
- [Chrome Media Session](https://developer.chrome.com/blog/media-session/)

---

**Optimized for Android 8+ with Material Design** 🤖

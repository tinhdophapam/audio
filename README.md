# 🎧 Audio Lectures Player

Website phát audio chuyên nghiệp với giao diện hiện đại, được xây dựng bằng HTML5, CSS3 và Vanilla JavaScript. Hoàn toàn tĩnh và có thể deploy trên GitHub Pages.

## ✨ Tính Năng

### 🎵 Audio Player
- **Play/Pause** - Phát và tạm dừng audio
- **Next/Previous** - Chuyển bài tiếp theo/trước đó
- **Progress Bar** - Thanh tiến trình với khả năng tua
- **Volume Control** - Điều chỉnh âm lượng và mute/unmute
- **Playback Speed** - Tốc độ phát: 0.75x, 1x, 1.25x, 1.5x, 2.0x
- **Auto Play Next** - Tự động phát bài tiếp theo khi kết thúc

### 📚 Playlist
- **Tree Structure** - Hiển thị theo cấu trúc folder/subfolder có thể collapse/expand
- **Search** - Tìm kiếm real-time theo tên bài giảng
- **Active Highlight** - Đánh dấu bài đang phát
- **Auto Scroll** - Tự động cuộn đến bài đang phát

### 💾 State Management
- **LocalStorage** - Lưu trạng thái phát
- **Resume Playback** - Tiếp tục từ vị trí đã nghe khi reload
- **Remember Settings** - Lưu volume, speed, theme

### 🎨 Giao Diện
- **Dark/Light Mode** - Chuyển đổi theme sáng/tối
- **Responsive Design** - Tương thích mobile hoàn chỉnh
- **Modern UI** - Giao diện đẹp với hiệu ứng mượt mà
- **Smooth Animations** - Transition và hover effects

### ⌨️ Keyboard Shortcuts
- `Space` - Play/Pause
- `←` - Tua lùi 10 giây
- `→` - Tua tới 10 giây
- `M` - Mute/Unmute

### 🛡️ Error Handling
- Hiển thị thông báo lỗi rõ ràng
- Xử lý CORS errors
- Xử lý file không tồn tại
- Xử lý JSON không hợp lệ

## 📁 Cấu Trúc File

```
/
├── index.html          # HTML chính
├── style.css           # CSS styling
├── app.js              # JavaScript logic
├── lectures.json       # Dữ liệu bài giảng
└── README.md           # Tài liệu này
```

## 🚀 Cách Sử Dụng

### 1. Chạy Local

Mở file `index.html` trực tiếp trong trình duyệt, hoặc sử dụng local server:

```bash
# Python 3
python -m http.server 8000

# Node.js (với npx)
npx serve

# VS Code Live Server
# Click chuột phải vào index.html -> Open with Live Server
```

Sau đó truy cập: `http://localhost:8000`

### 2. Deploy lên GitHub Pages

#### Bước 1: Tạo Repository
1. Tạo repository mới trên GitHub
2. Upload tất cả files (index.html, style.css, app.js, lectures.json)

#### Bước 2: Enable GitHub Pages
1. Vào **Settings** của repository
2. Chọn **Pages** ở sidebar
3. Trong **Source**, chọn **main** branch
4. Click **Save**

#### Bước 3: Truy Cập
Website sẽ có địa chỉ: `https://[username].github.io/[repository-name]`

Ví dụ: `https://johndoe.github.io/audio-player`

## 📝 Format File lectures.json

File `lectures.json` cần có cấu trúc như sau:

```json
[
  {
    "folder": "Tên Folder Chính",
    "subfolders": [
      {
        "name": "Tên Subfolder",
        "items": [
          {
            "title": "Tên Bài Giảng",
            "url": "https://example.com/audio.mp3",
            "duration": "45:30"
          }
        ]
      }
    ]
  }
]
```

### Lưu Ý:
- `folder`: Tên thư mục chính (bắt buộc)
- `subfolders`: Mảng các thư mục con (bắt buộc)
- `name`: Tên thư mục con (bắt buộc)
- `items`: Mảng các bài giảng (bắt buộc)
- `title`: Tiêu đề bài giảng (bắt buộc)
- `url`: Link đến file audio MP3 (bắt buộc)
- `duration`: Thời lượng (tùy chọn, format: "MM:SS" hoặc "HH:MM:SS")

## 🔧 Tùy Chỉnh

### Thay Đổi Màu Sắc

Chỉnh sửa CSS variables trong `style.css`:

```css
:root {
    --accent: #6366f1;        /* Màu chủ đạo */
    --accent-hover: #4f46e5;  /* Màu hover */
    --bg-primary: #0f0f23;    /* Màu nền chính */
    /* ... */
}
```

### Thêm Icon/Logo

Thay thế icon trong `.album-art`:

```css
.album-art {
    background: url('path/to/logo.png') center/cover;
}
```

### Thay Đổi Font

Thêm Google Font vào `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

Và cập nhật CSS:

```css
body {
    font-family: 'Inter', sans-serif;
}
```

## 🐛 Xử Lý Lỗi Thường Gặp

### CORS Error
Nếu audio không phát được do CORS:
- Đảm bảo server audio cho phép CORS
- Hoặc host audio cùng domain với website
- Hoặc sử dụng proxy CORS

### File JSON Không Load
- Kiểm tra file `lectures.json` nằm cùng thư mục với `index.html`
- Kiểm tra JSON syntax hợp lệ (dùng JSONLint.com)
- Nếu chạy local, dùng local server thay vì mở file trực tiếp

### Audio Không Phát
- Kiểm tra URL audio có hợp lệ
- Kiểm tra định dạng audio (MP3 được hỗ trợ tốt nhất)
- Mở Console (F12) để xem lỗi chi tiết

## 🌐 Trình Duyệt Hỗ Trợ

- ✅ Chrome/Edge (phiên bản mới nhất)
- ✅ Firefox (phiên bản mới nhất)
- ✅ Safari (phiên bản mới nhất)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Responsive

Website hoàn toàn responsive và hoạt động tốt trên:
- 💻 Desktop (1920px+)
- 💻 Laptop (1366px - 1920px)
- 📱 Tablet (768px - 1366px)
- 📱 Mobile (320px - 768px)

## 🎯 Performance

- ⚡ Tải nhanh (< 100KB tổng dung lượng)
- 🚀 Không dependencies nặng
- 💾 LocalStorage cho state management
- 🎨 CSS animations mượt mà (60fps)

## 📄 License

MIT License - Tự do sử dụng cho mục đích cá nhân và thương mại.

## 🤝 Đóng Góp

Mọi đóng góp đều được chào đón! Hãy tạo Pull Request hoặc Issue nếu bạn có ý tưởng cải thiện.

## 📧 Liên Hệ

Nếu có vấn đề hoặc câu hỏi, vui lòng tạo Issue trên GitHub.

---

**Chúc bạn sử dụng vui vẻ! 🎉**

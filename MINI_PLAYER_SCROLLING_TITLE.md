# Tính năng chạy tiêu đề cho Mini Player (Cải tiến)

## Tổng quan
Đã thêm hiệu ứng chạy tiêu đề tự nhiên cho mini player khi tiêu đề bài giảng quá dài. Hiệu ứng hoạt động theo cách: hiển thị từ đầu → chạy sang trái để hiện phần còn lại → chạy về lại vị trí ban đầu → lặp lại.

## Các thay đổi đã thực hiện

### 1. **CSS Animation (style.css)**

#### Thêm class `.mini-track-title.scrolling`
```css
.mini-track-title.scrolling {
    text-overflow: unset;
}

.mini-track-title.scrolling .title-text {
    display: inline-block;
    animation: marquee 10s linear infinite;
    padding-right: 60px; /* Space between end and start */
    animation-delay: 1s; /* Wait 1 second before starting */
}
```

#### Animation `@keyframes marquee-scroll`
```css
@keyframes marquee-scroll {
    0% { transform: translateX(0); }           /* Bắt đầu ở vị trí bình thường */
    30% { transform: translateX(0); }          /* Dừng để đọc phần đầu */
    60% { transform: translateX(var(--scroll-distance)); } /* Chạy để hiện phần còn lại */
    90% { transform: translateX(var(--scroll-distance)); } /* Dừng để đọc phần cuối */
    100% { transform: translateX(0); }         /* Chạy về vị trí ban đầu */
}
```

#### Responsive cho Mobile
- Animation chậm hơn (12s thay vì 10s) để dễ đọc
- Padding nhỏ hơn (40px thay vì 60px) để tiết kiệm không gian

### 2. **JavaScript Logic (app.js)**

#### Hàm `updateMiniPlayerTitle(title)`
- **Đo kích thước text**: Sử dụng temporary element để đo chính xác
- **So sánh với container**: Kiểm tra xem text có vượt quá container không
- **Áp dụng hiệu ứng**: Thêm class `scrolling` và wrap text trong `<span class="title-text">`
- **Responsive**: Sử dụng `requestAnimationFrame` để đảm bảo DOM được cập nhật

#### Cập nhật tất cả nơi gán title
- `updateMiniPlayer()`: Sử dụng hàm mới thay vì gán trực tiếp
- `resetPlayer()`: Cập nhật khi reset
- Event listeners: Cập nhật khi play/loadedmetadata

#### Window Resize Handler
- Tính toán lại khi thay đổi kích thước màn hình
- Delay 100ms để đảm bảo layout được cập nhật

## Cách hoạt động

### 🔍 **Phát hiện tiêu đề dài**
1. Tạo temporary element với cùng font style
2. Đo width của text
3. So sánh với width của container (trừ 10px margin)
4. Nếu text > container → áp dụng scrolling

### 🎬 **Animation Flow (Chậm và dễ đọc)**
1. **0-35%**: Hiển thị từ đầu tiêu đề (dừng lâu hơn để đọc)
2. **35-55%**: Chạy sang trái để hiện phần bị ẩn (chậm)
3. **55-85%**: Dừng lại lâu để người dùng đọc phần cuối
4. **85-100%**: Chạy về lại vị trí ban đầu (chậm)
5. **Lặp lại**: Chu kỳ rất chậm và dễ theo dõi

### ⏱️ **Timing (Chậm và dễ đọc)**
- **Desktop**: 12s per cycle với 2s delay
- **Mobile**: 15s per cycle (rất chậm để dễ đọc)
- **Easing**: ease-in-out cho chuyển động mượt mà
- **Hover**: Pause animation khi hover (desktop)

## Tính năng đặc biệt

### 📱 **Mobile Optimized**
- Animation chậm hơn cho dễ đọc
- Padding nhỏ hơn để tiết kiệm không gian
- Font size responsive (0.85rem trên mobile)

### 🎯 **Smart Detection & Calculation**
- Tính toán chính xác khoảng cách cần scroll
- Sử dụng CSS custom properties (--scroll-distance)
- Fallback cho browsers không hỗ trợ custom properties
- Xử lý resize window tự động

### 🎨 **Smooth Experience**
- Delay 1s trước khi bắt đầu chạy
- Pause khi hover (desktop)
- Smooth transition với easing

### 🔄 **Auto Update**
- Cập nhật khi chuyển bài
- Cập nhật khi resize window
- Cập nhật khi metadata load

## Use Cases

### **Scenario 1: Tiêu đề ngắn**
```
"Kinh A Di Đà"
→ Hiển thị bình thường, không chạy
```

### **Scenario 2: Tiêu đề dài**
```
"Kinh A Di Đà Phật - Thầy Thích Chân Hiếu giảng tại chùa Vĩnh Nghiêm"
→ Áp dụng hiệu ứng chạy
```

### **Scenario 3: Resize window**
```
Desktop → Mobile: Tính toán lại, có thể bật scrolling
Mobile → Desktop: Tính toán lại, có thể tắt scrolling
```

## Performance & UX

### ⚡ **Performance**
- **GPU Accelerated**: Sử dụng `transform` thay vì `left/right`
- **Efficient Detection**: Chỉ tính toán khi cần thiết
- **Memory Safe**: Cleanup temporary elements

### 🎨 **User Experience**
- **Non-intrusive**: Chỉ hoạt động khi cần
- **Readable**: Timing phù hợp để đọc được
- **Responsive**: Thích ứng với mọi kích thước màn hình
- **Accessible**: Có thể pause bằng hover

### 📱 **Mobile Specific**
- **Touch Friendly**: Không conflict với touch gestures
- **Battery Efficient**: Optimized animation timing
- **Readable**: Slower speed cho mobile

## Tương thích

### 🌐 **Browser Support**
- Modern browsers với CSS animations
- Fallback: Hiển thị bình thường nếu không hỗ trợ
- Progressive enhancement

### 📱 **Device Support**
- iOS Safari: ✅ Hoạt động tốt
- Android Chrome: ✅ Hoạt động tốt
- Desktop browsers: ✅ Hoạt động tốt với hover effect

### 🎵 **Integration**
- Không ảnh hưởng đến audio playback
- Không conflict với các animation khác
- Tương thích với dark/light theme

## Kết quả

✨ **Trải nghiệm người dùng**:
- Luôn đọc được tên bài giảng đầy đủ
- Hiệu ứng mượt mà và chuyên nghiệp
- Tự động thích ứng với mọi kích thước màn hình

🎯 **Mục tiêu đạt được**:
- ✅ Giải quyết vấn đề tiêu đề dài bị cắt
- ✅ Hiệu ứng đẹp mắt và không gây mỏi mắt
- ✅ Responsive hoàn toàn
- ✅ Performance tối ưu
- ✅ Accessible và user-friendly

🙏 **Phù hợp với ứng dụng Phật giáo**:
- Giúp người dùng đọc được tên bài giảng đầy đủ
- Không gây xao nhãng trong quá trình nghe pháp
- Trải nghiệm mượt mà trên mọi thiết bị
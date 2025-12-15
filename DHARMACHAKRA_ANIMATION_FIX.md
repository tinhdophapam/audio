# Cải tiến Animation Bánh Xe Chuyển Pháp (Dharmachakra)

## Vấn đề
Animation bánh xe chuyển pháp (Dharmachakra) quay quá nhanh và có hiệu ứng lắc (scale) không phù hợp với tính thiêng liêng của biểu tượng Phật giáo.

## Yêu cầu
- Chỉ xoay tròn đều đặn, không lắc
- Chậm hơn để tạo cảm giác trang nghiêm
- Giữ hiệu ứng ánh sáng nhẹ nhàng

## Các cải tiến đã thực hiện

### 1. **Album Art Dharmachakra (Player chính)**

#### Trước (nhanh và lắc):
```css
.album-art-inner.playing i {
    animation: dharmachakra-spin 3s linear infinite;
}

@keyframes dharmachakra-spin {
    0% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(90deg) scale(1.05); }
    50% { transform: rotate(180deg) scale(1.1); }
    75% { transform: rotate(270deg) scale(1.05); }
    100% { transform: rotate(360deg) scale(1); }
}
```

#### Sau (chậm và mượt):
```css
.album-art-inner.playing i {
    animation: dharmachakra-spin 8s linear infinite;
}

@keyframes dharmachakra-spin {
    0% {
        transform: rotate(0deg);
        text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
    }
    100% {
        transform: rotate(360deg);
        text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
    }
}
```

### 2. **Sidebar Now Playing Icon**

#### Trước (nhanh và lắc):
```css
.now-playing-icon i.spinning {
    animation: spin 3s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(90deg) scale(1.05); }
    50% { transform: rotate(180deg) scale(1.1); }
    75% { transform: rotate(270deg) scale(1.05); }
    100% { transform: rotate(360deg) scale(1); }
}
```

#### Sau (chậm và mượt):
```css
.now-playing-icon i.spinning {
    animation: spin 6s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
        text-shadow: 0 0 4px var(--accent);
    }
    100% {
        transform: rotate(360deg);
        text-shadow: 0 0 4px var(--accent);
    }
}
```

### 3. **Loading Animation**

#### Cũng được cải tiến:
```css
@keyframes spin-loading {
    0% {
        transform: rotate(0deg);
        opacity: 0.8;
    }
    50% {
        transform: rotate(180deg);
        opacity: 1;
    }
    100% {
        transform: rotate(360deg);
        opacity: 0.8;
    }
}
```

## So sánh cải tiến

### ⏱️ **Timing**
| Vị trí | Trước | Sau | Cải tiến |
|--------|-------|-----|----------|
| Album Art | 3s | 8s | +167% chậm hơn |
| Sidebar | 3s | 6s | +100% chậm hơn |
| Loading | Không đổi | Không đổi | Chỉ bỏ scale |

### 🎨 **Visual Effects**
| Hiệu ứng | Trước | Sau |
|----------|-------|-----|
| Scale (lắc) | ✅ Có | ❌ Bỏ |
| Rotation | ✅ Có | ✅ Có |
| Text-shadow | ✅ Phức tạp | ✅ Đơn giản |
| Smoothness | ⚠️ Giật | ✅ Mượt |

### 🙏 **Ý nghĩa Phật giáo**
| Khía cạnh | Trước | Sau |
|-----------|-------|-----|
| Trang nghiêm | ⚠️ Hơi vội | ✅ Trang nghiêm |
| Thiền định | ⚠️ Xao nhãng | ✅ Yên tĩnh |
| Liên tục | ✅ Tốt | ✅ Tốt hơn |

## Lợi ích của cải tiến

### 🎯 **User Experience**
- **Không gây mỏi mắt**: Animation chậm và đều đặn
- **Trang nghiêm**: Phù hợp với không gian tâm linh
- **Mượt mà**: Không có hiệu ứng giật lag

### 🔋 **Performance**
- **GPU friendly**: Chỉ sử dụng `transform: rotate()`
- **Smooth animation**: 60fps với `linear` timing
- **Battery efficient**: Animation đơn giản hơn

### 📱 **Cross-platform**
- **Mobile optimized**: Hoạt động mượt trên điện thoại
- **Desktop smooth**: Không lag trên máy tính
- **Browser compatible**: Hỗ trợ tất cả browsers hiện đại

## Ý nghĩa tâm linh

### ☸️ **Bánh Xe Chuyển Pháp (Dharmachakra)**
- **Biểu tượng**: Giáo pháp của Đức Phật
- **Chuyển động**: Sự lan tỏa của chánh pháp
- **Liên tục**: Pháp luân thường chuyển

### 🧘 **Thiền định và Tập trung**
- **Chậm rãi**: Giúp tâm an tĩnh
- **Đều đặn**: Như nhịp thở trong thiền
- **Không xao nhãng**: Tập trung vào pháp âm

### 🕉️ **Trang nghiêm**
- **Không vội vã**: Phù hợp với không gian tâm linh
- **Uy nghiêm**: Thể hiện sự tôn kính với Tam Bảo
- **Thanh tịnh**: Giao diện trong sáng, không rối mắt

## Kết quả

✨ **Trải nghiệm người dùng**:
- Bánh xe chuyển pháp quay chậm rãi và trang nghiêm
- Không có hiệu ứng lắc gây xao nhãng
- Animation mượt mà và dễ chịu cho mắt

🎯 **Mục tiêu đạt được**:
- ✅ Chỉ xoay tròn, không lắc
- ✅ Chậm hơn (8s thay vì 3s cho album art)
- ✅ Giữ hiệu ứng ánh sáng nhẹ nhàng
- ✅ Phù hợp với tính thiêng liêng của biểu tượng

🙏 **Ý nghĩa Phật giáo**:
- Thể hiện sự tôn kính với biểu tượng Dharmachakra
- Tạo không gian tâm linh yên tĩnh
- Giúp người dùng tập trung vào việc nghe pháp
- Animation trang nghiêm và uy nghiêm
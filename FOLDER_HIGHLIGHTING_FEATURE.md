# Tính năng đánh dấu thư mục chứa bài đang phát

## Mô tả
Đã thêm tính năng đánh dấu thư mục và thư mục con chứa bài giảng đang được phát, tương tự như cách đánh dấu bài đang phát hiện tại.

## Các thay đổi đã thực hiện

### 1. CSS (style.css)
- Thêm class `.folder-card.active-folder` để đánh dấu thư mục đang chứa bài phát
- Thêm hiệu ứng animation `pulse-folder` cho thư mục active
- Thêm styling cho icon, title, subtitle và arrow của thư mục active

### 2. JavaScript (app.js)
- Cập nhật hàm `updateActiveTrack()`:
  - Thêm việc remove class `active-folder` khi reset
  - Thêm hàm `markActiveFolders()` để đánh dấu thư mục chứa bài đang phát
- Thêm hàm `markActiveFolders()`:
  - Đánh dấu thư mục chính trong view "folders"
  - Đánh dấu thư mục con trong view "subfolders"
- Cập nhật các hàm render:
  - `renderFolders()`: Gọi `updateActiveTrack()` sau khi render
  - `renderSubfolders()`: Gọi `updateActiveTrack()` sau khi render
  - `renderLectures()`: Gọi `updateActiveTrack()` sau khi render
  - `renderFavorites()`: Gọi `updateActiveTrack()` sau khi render
  - `renderRecents()`: Gọi `updateActiveTrack()` sau khi render
  - `renderBookmarks()`: Gọi `updateActiveTrack()` khi dùng container chính

## Cách hoạt động

### Khi ở view "Thư mục" (folders):
- Thư mục chứa bài đang phát sẽ được đánh dấu với:
  - Background màu cam nhạt
  - Border màu cam
  - Icon đổi thành `fa-volume-up` với animation pulse
  - Title màu cam và đậm hơn
  - Arrow màu cam

### Khi ở view "Thư mục con" (subfolders):
- Thư mục con chứa bài đang phát sẽ được đánh dấu tương tự như trên

### Khi ở view "Bài giảng" (lectures):
- Bài đang phát vẫn được đánh dấu như trước (không thay đổi)

## Lợi ích
1. **Dễ dàng định hướng**: Người dùng có thể nhanh chóng biết bài đang phát thuộc thư mục nào
2. **Trải nghiệm nhất quán**: Tính năng đánh dấu được áp dụng ở tất cả các cấp độ (thư mục, thư mục con, bài giảng)
3. **Giao diện trực quan**: Sử dụng màu sắc và animation để thu hút sự chú ý một cách tự nhiên

## Tương thích
- Tính năng hoạt động trên cả desktop và mobile
- Không ảnh hưởng đến các tính năng hiện có
- Tự động cập nhật khi chuyển bài hoặc chuyển view
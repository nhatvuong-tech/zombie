THƯ MỤC ẢNH NỀN GAMEPLAY
==========================

Đặt ảnh nền vào CHÍNH thư mục này (assets/), với tên là:

    background.png

Hoặc một trong các tên sau (code tự dò theo thứ tự):
    background.jpg
    background.jpeg
    background.webp

GHI CHÚ: ảnh đang dùng hiện tại nằm ở
    ZOMBIE-SURVIVAL/anh/Apocalyptic Street of Last Day.png
Code ưu tiên ảnh đó trước; nếu không thấy mới dò tới thư mục assets/ này.
Muốn đổi ảnh mà không sửa code: chép ảnh mới vào assets/background.png
rồi xóa/đổi tên ảnh trong thư mục anh/.

VÍ DỤ ĐƯỜNG DẪN ĐÚNG:
    ZOMBIE-SURVIVAL/assets/background.png

LƯU Ý:
- Tên file phải viết thường đúng như trên (background.png).
- Ảnh sẽ tự co giãn để phủ kín màn hình (giữ tỉ lệ, cắt phần thừa).
- Code tự làm tối ảnh và thêm vignette để zombie/người chơi dễ nhìn.
- Nếu KHÔNG có ảnh, game tự dùng nền lưới xanh cũ (không bị lỗi).

KHUYẾN NGHỊ:
- Kích thước: 1600x900 hoặc 1920x1080 (tỉ lệ 16:9).
- Định dạng PNG hoặc JPG, dung lượng dưới 2MB để tải nhanh.

Muốn đổi độ tối của ảnh: mở javascript/game.js, tìm dòng
    ctx.fillStyle = "rgba(4, 8, 10, 0.38)";
và tăng/giảm số 0.38 (0 = sáng nhất, 0.7 = tối nhất).

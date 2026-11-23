LAST DAY - ZOMBIE SURVIVAL

CÁCH CHƠI:
- Local:  mo ZOMBIE-SURVIVAL/index.html hoac html/index.html bang trinh duyet (hoac Live Server).
- Online: https://nhatvuong-tech.github.io/zombie/  (GitHub Pages, tu dong cap nhat khi push len nhanh main)

CẤU TRÚC:
ZOMBIE-SURVIVAL/
  html/index.html
  css/styles.css
  javascript/shop.js
  javascript/game.js
  anh/Zombie Survival Game Asset Atlas.png (atlas nhân vật, súng, phụ kiện)
  anh/Apocalyptic Street of Last Day.png   (ảnh nền gameplay)
  assets/                                  (chỗ lưu ảnh nền thay thế)

CÁCH CHẠY:
1. Giải nén ZIP.
2. Mở thư mục ZOMBIE-SURVIVAL bằng VS Code.
3. Mở html/index.html bằng Live Server.
4. Trang giới thiệu là màn hình đầu tiên. Nhấn CHƠI NGAY để vào game.

TÍNH NĂNG MỚI - MÀN CHẠY SINH TỒN (SURVIVAL RUN):
- Từng wave là một chặng chạy liên tục từ trái sang phải để tới Trạm Cứu Trợ an toàn (Relief Station).
- Bầy Zombie truy đuổi gắt gao phía sau và chặn đầu phía trước với nhiều chủng loại (Runner chạy nhanh, Tanker trâu máu).
- Người chơi có thể Tăng tốc (D / Phím phải) hoặc Chạy chậm (A / Phím trái), Đổi làn (W/S hoặc Phím lên/xuống) để né zombie.
- Thanh tiến trình HUD hiển thị chính xác cự ly còn lại tới Trạm Cứu Trợ.
- Đến Trạm Cứu Trợ: Kích hoạt hệ thống phòng thủ tiêu diệt bầy quái phía sau, hồi phục 100% máu, thưởng điểm và chuẩn bị xuất phát màn kế tiếp.
- Giữ đầy đủ tính năng: Tự động bắn zombie gần nhất, nhặt túi cứu trợ hồi máu, điểm cao lưu LocalStorage, trang giới thiệu và tùy chỉnh.

TÀI KHOẢN / ĐĂNG NHẬP (AUTH):
- Vào bằng nút "👤 ĐĂNG NHẬP" trên thanh menu trang chủ.
- ĐĂNG KÝ: tên tối thiểu 3 ký tự (chữ, số, _ và .), mật khẩu tối thiểu 4 ký tự.
  Đăng ký sẽ MANG THEO điểm & đồ đang có ở chế độ Khách sang tài khoản mới.
- ĐĂNG NHẬP: tên không phân biệt hoa/thường. Phiên được giữ khi tải lại trang.
- ĐĂNG XUẤT: cùng nút đó trên menu, quay về chế độ Khách.
- MẬT KHẨU được băm SHA-256 + salt (không lưu plaintext).
- "DATABASE" là localStorage trên máy người chơi:
  • lastDayAccounts_v1 : toàn bộ tài khoản (tên, salt, hash, hồ sơ riêng từng người).
  • lastDaySession_v1   : phiên đăng nhập hiện tại.
  • lastDayBest@<tên>   : điểm cao riêng của từng tài khoản (khách dùng lastDayBest).
- Chế độ KHÁCH vẫn chơi bình thường, hồ sơ ở khóa lastDayProfile_v1.
- XUẤT / NHẬP FILE BACKUP (trong modal Đăng nhập): tải toàn bộ tài khoản + điểm cao + hồ sơ
  khách ra file JSON, nhập lại ở link/trình duyệt/máy khác. Chống mất dữ liệu khi đổi link.
- LƯU Ý: localStorage là KHO THEO LINK (origin). Tài khoản tạo ở localhost:8765 không hiện ở
  link GitHub Pages hay khi mở file trực tiếp (và ngược lại). Luôn chơi bằng 1 link cố định,
  hoặc dùng XUẤT FILE ở link cũ + NHẬP FILE ở link mới. Đóng tab KHÔNG mất dữ liệu;
  dữ liệu chỉ mất khi dùng ẩn danh (incognito) hoặc trình duyệt đặt "xóa dữ liệu khi thoát".
- GAME CHẠY NỀN KHI CHUYỂN TAB: requestAnimationFrame dừng khi tab ẩn nên game dùng thêm
  vòng setInterval bù thời gian thực (update() chạy nền, hiển thị khi quay lại tab).
  Vòng lặp chính tách bằng ensureLoop() để không bao giờ chạy trùng.

ÂM THANH & ẢNH TRẠM CỨU TRỢ:
- Nhạc nền: anh/nhacgame.mp3 tự chạy khi bấm CHƠI NGAY / CHƠI LẠI (loop, volume 0.35),
  dừng khi Game Over / về menu. Trình duyệt chặn autoplay thì game vẫn chơi bình thường.
- Tiếng kêu zombie: anh/anhtiengkeuzombie.mp3 phát ngẫu nhiên mỗi 9-21 giây khi có quái gần,
  mỗi lần random volume + tốc độ cho tự nhiên.
- Nút "🔊 ÂM THANH" trên HUD để bật/tắt cả nhạc + tiếng kêu, lưu lựa chọn vào localStorage (lastDayMuted).
- Ảnh trạm cứu trợ: anh/tram-cuu-tro.png vẽ tại Trạm Cứu Trợ cuối mỗi màn, NHỎ KHI CÒN XA và
  TO DẦN + RÕ DẦN theo đúng chiều người chơi chạy tới (cảm giác lao về phía trạm).
  LƯU Ý: ảnh này đối xứng ~91% nên lật ngang nhìn gần như không đổi — muốn đổi chiều thì bấm
  PHÍM F khi đang chơi hoặc nút "🔀 LẬT ẢNH TRẠM CỨU TRỢ" trong menu Tạm Dừng (lưu vào localStorage).
  Nếu ảnh không nạp được thì tự vẽ lều cứu trợ cũ.

MÀN ĐẶC BIỆT - GIẢI MÃ MẬT KHẨU TRẠM (mỗi 3 màn: 3, 6, 9...):
- Màn đặc biệt có nhãn "🔐" ở HUD; chạy tới trạm sẽ gặp modal "CỬA TRẠM BỊ KHOÁ".
- Mật khẩu là một từ 3-4 chữ (SOS, SAVE, HOME, HELP...) hiện dưới dạng MÃ SỐ A=1..Z=26,
  kèm độ dài từ + gợi ý nghĩa tiếng Việt. Giải đúng -> nhận chìa khóa, +150 điểm, vào trạm bình thường.
- Mỗi lần sai: mất 10+ HP (càng sai càng mất nhiều), đọc mã rồi thử lại. HP về 0 = chết ngay tại cửa.

CỬA HÀNG SINH TỒN (SHOP) - ĐIỂM TÍCH LŨY:
- Điểm sau mỗi ván được quy đổi tự động: ĐIỂM NHẬN = sàn(Điểm ván / 5). Ví dụ 1.500 điểm -> 300 điểm tích lũy.
- Điểm tích lũy lưu trong LocalStorage (khóa lastDayProfile_v1) nên giữ nguyên khi tải lại trang.
- Mở cửa hàng: nút "🛒 CỬA HÀNG" ở trang chủ, nút ngay trên HUD khi đang chơi, trong menu Tạm Dừng, và ở màn Game Over.
- 3 tab:
  • NHÂN VẬT (4): Nam Sinh Tồn (miễn phí), Nữ Xạ Thủ (900), Biệt Kích SWAT (2.200), Cao Bồi Hoang Dã (3.200).
    Mỗi nhân vật có máu / tốc độ / sát thương riêng, hiển thị sprite tương ứng trong game.
  • SÚNG (14): Súng Lục Cũ (0), Lục Im Lặng (650), SMG (1.300), Súng Trường Cũ (1.800), AK-47 (3.000),
    Bullpup (4.200), Súng Đặc Nhiệm (4.500), Sniper (4.600), Burst 3 (5.000), Súng Tỉa Hạng Nặng (5.600),
    Nỏ Xuyên Phá (6.000), Minigun (7.200), Súng Xung Kích (8.200), RPG (9.800).
    Súng quyết định tốc độ bắn, sát thương, số tia đạn, độ xuyên và độ tản; RPG có đạn nổ diện rộng.
  • PHỤ KIỆN (12): Giáp (+30 máu), Mũ Bảo Hộ (-20% sát thương nhận), Áo Khoác Da (+15 máu, +5% tốc độ),
    Ba Lô Tiếp Tế (+20% điểm), Mũ Rơm (+15% điểm), Giày Chạy Nhanh (+12% tốc độ),
    Mặt Nạ Phòng Độc (miễn nhiễm độc), Kính Xạ Thủ (+12% sát thương),
    Ba Lô Cứu Thương (hồi 2 máu/giây + hút quân nhu), Giáp Hạng Nặng (-30% sát thương, -5% tốc độ),
    Mặt Nạ Chiến Thuật (miễn độc + -10% sát thương), Giày Da Viễn Chinh (+18% tốc độ).
- Chỉ được TRANG BỊ tối đa 2 phụ kiện cùng lúc; bấm vào món đang dùng để tháo ra.
- Mua xong tự trang bị ngay. Trang bị thay đổi giữa ván sẽ được áp dụng tức thì (máu, tốc độ, sát thương, giáp, hồi máu).
- HUD và menu hiển thị số điểm tích lũy hiện có.

TÙY CHỈNH:
- Ảnh nền gameplay: đang dùng anh/Apocalyptic Street of Last Day.png.
  Muốn đổi ảnh: lưu ảnh mới vào assets/ với tên background.png (hoặc .jpg/.jpeg/.webp).
  Code tự dò ảnh; không có ảnh thì dùng nền lưới cũ. Xem assets/README.txt để biết chi tiết.
- Mở html/index.html, tìm YOUR NAME và thay bằng tên người sáng tác.
- Background hero dùng ảnh từ Unsplash qua internet; nếu không có mạng, màu nền gradient vẫn hiển thị.

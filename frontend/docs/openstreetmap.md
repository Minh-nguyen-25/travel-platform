# Bản đồ và dữ liệu địa điểm

Ảnh nền dùng dữ liệu OpenStreetMap thật. Mặc định ưu tiên HOT của OpenStreetMap France,
sau đó chuyển một lần sang OpenStreetMap standard nếu ảnh lỗi hoặc quá 8 giây.
Thay lớp ảnh giữ nguyên điểm đánh dấu, popup và trạng thái Leaflet. Nếu cả hai nguồn lỗi,
web dừng spinner và hiển thị nút thử lại; sự kiện từ lớp cũ không ảnh hưởng lượt mới.

## Cấu hình nguồn ảnh

Trong frontend/.env, có thể đặt:

```dotenv
VITE_MAP_TILE_URL=https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png
VITE_MAP_FALLBACK_TILE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_MAP_TILE_TIMEOUT_MS=8000
```

URL nguồn riêng phải có {z}, {x}, {y} và attribution tương ứng trong
VITE_MAP_TILE_ATTRIBUTION / VITE_MAP_FALLBACK_TILE_ATTRIBUTION. Chỉ chấp nhận HTTP(S),
không chèn username/password vào URL. Các biến VITE_* công khai trong trình duyệt;
không dùng khóa bí mật. Khởi động lại Vite khi đổi .env; production cần build lại.
Attribution luôn hiển thị theo nguồn đang dùng. CSP cần cho phép img-src đến các
nguồn đã cấu hình; mặc định là a.tile.openstreetmap.fr và tile.openstreetmap.org.

## Tọa độ có nguồn

backend/data/verified-destinations.json chứa tọa độ 9 địa danh đã đối chiếu với các
Wikidata entity được chọn cụ thể, kèm URL phiên bản và thời điểm lấy dữ liệu.
Chỉ dùng tọa độ trên Trái Đất có độ chính xác khai báo <= 0,001 độ. Đây là vị trí
địa danh, không mặc định là cổng vào hoặc điểm đỗ xe. Giá vé, đánh giá và giờ mở cửa
của seed vẫn là dữ liệu mẫu, không được xác minh bởi quy trình này.

Chạy từ thư mục backend:

```powershell
npx prisma generate
npx prisma migrate deploy
npm run map:data:preview
npm run map:data:import
```

Migration thêm hai trường nullable coordinateSourceUrl và coordinatesVerifiedAt.
Import chỉ cập nhật tọa độ và hai trường này cho tên khớp duy nhất, cách tọa độ hiện có
không quá 2 km. Không tạo địa điểm, sửa giá vé, ảnh hoặc lịch trình. Import chạy trong
transaction, bỏ qua bản ghi không đổi hoặc đã có xác minh mới hơn. API trả nguồn và ngày
đối chiếu; trang chi tiết phân biệt vị trí có nguồn với vị trí dự án chưa đối chiếu.
Thay đổi tên hoặc tọa độ thực sự qua trang quản trị sẽ xóa xác minh cũ; gửi lại cùng
tọa độ hoặc chỉnh giá vé vẫn giữ nguồn. Nhập tọa độ rỗng/null/boolean bị từ chối thay vì thành 0.

Seed sử dụng snapshot cục bộ và giữ tọa độ đã có nguồn, không cần internet mỗi lần seed.
Để chủ động làm mới snapshot từ Wikidata, chạy npm run map:data:refresh, xem diff và
preview trước khi import. Lệnh refresh không ghi database. Địa danh thiếu tọa độ đủ
chính xác bị bỏ qua; không tạo dữ liệu thay thế. Thêm địa danh cần đối chiếu đúng
entity trong danh sách của backend/scripts/refresh-map-data.ts.

## Cache tuyến đường

Backend cache tối đa 256 tuyến trong bộ nhớ, giữ kết quả mới trong 15 phút và gộp
yêu cầu trùng nhau. Khóa gồm thứ tự tọa độ, phương tiện, tùy chọn hình học và cấu hình
OSRM; đổi nguồn hoặc profile không dùng nhầm kết quả. Yêu cầu có AbortSignal riêng
không gộp để việc hủy không ảnh hưởng yêu cầu khác. Cache mất khi backend khởi động lại.

Trình duyệt lưu tối đa 24 tuyến trong sessionStorage của tab, dùng lại trong 15 phút
và giữ qua tải lại trang. Khi API lỗi kết nối/429/5xx, chỉ dùng kết quả thành công trong
vòng 24 giờ, giữ thời điểm gốc và hiển thị thông báo dữ liệu đã lưu cùng nút cập nhật.
Lỗi xác thực/validation/không có tuyến vẫn được hiển thị; kết quả không còn hợp lệ
bị loại khỏi cache. Request đã hủy không ghi cache. Storage bị chặn/hết dung lượng
không làm hỏng kết quả lấy trực tiếp từ API. API request phía frontend giới hạn 30 giây.

OSRM vẫn cần backend đang chạy, phiên đăng nhập hợp lệ và provider có profile phù hợp.
Public demo không thay thế dịch vụ có cam kết vận hành; không mặc định là dữ liệu
giao thông trực tiếp. Điểm đánh dấu và ảnh nền hoạt động độc lập với việc tính tuyến.

## Giới hạn vận hành

Trình duyệt cache ảnh nền theo HTTP headers của provider. Không tải trước hàng loạt
tile từ máy chủ OSM công cộng. Cache tuyến không bảo đảm ảnh nền có sẵn khi mất mạng;
offline hoàn chỉnh cần tự lưu trữ hoặc provider cho phép, cùng dữ liệu định tuyến cục bộ.

Nguồn và điều kiện sử dụng:
[OSM Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/),
[OpenStreetMap France](https://www.openstreetmap.fr/fonds-de-carte/),
[Wikidata data access / CC0](https://www.wikidata.org/wiki/Wikidata:Data_access).

Kiểm tra bằng npm test ở cả frontend và backend, npm run lint ở frontend và build.

import hoiAnHeroImg from '@/assets/images/auth/hoi-an-auth.webp';
import haLongHeroImg from '@/assets/images/auth/ha-long-auth.webp';
import trangAnHeroImg from '@/assets/images/auth/trang-an-auth.webp';
import daLatHeroImg from '@/assets/images/auth/da-lat-auth.webp';
import saPaHeroImg from '@/assets/images/auth/sa-pa-auth.webp';
import daNangHeroImg from '@/assets/images/auth/da-nang-auth.webp';

/**
 * Cấu trúc dữ liệu cho hero panel của trang authentication.
 * Thiết kế mở rộng: Thêm địa danh mới chỉ cần thêm 1 ảnh local và 1 entry vào AUTH_HEROES.
 */
export interface AuthHero {
  id: string;
  image: string;
  alt: string;
  destination: string;
  descriptor: string;
  quotation: string;
  quotationAuthor?: string;
  objectPosition: string;
  /** Static gradient classes for contrast and atmospheric depth */
  gradientOverlayClass: string;
}

export const AUTH_HEROES: readonly AuthHero[] = [
  {
    id: 'hoi-an',
    image: hoiAnHeroImg,
    alt: 'Phố cổ Hội An với đèn lồng rực rỡ bên dòng sông Hoài về đêm',
    destination: 'Phố cổ Hội An',
    descriptor: 'Di sản Văn hóa Thế giới',
    quotation: 'Hành trình mười vạn dặm bắt đầu từ một bước chân đơn giản đầu tiên.',
    quotationAuthor: 'Lão Tử',
    objectPosition: 'center center',
    gradientOverlayClass: 'bg-gradient-to-t from-black/90 via-black/40 to-stone-950/25',
  },
  {
    id: 'ha-long',
    image: haLongHeroImg,
    alt: 'Vịnh Hạ Long — Kỳ quan thiên nhiên thế giới với những đảo đá vôi kỳ vĩ',
    destination: 'Vịnh Hạ Long',
    descriptor: 'Kỳ quan Thiên nhiên Thế giới',
    quotation: 'Thế giới là một cuốn sách, và ai không đi du lịch thì chỉ đọc được một trang.',
    quotationAuthor: 'Thánh Augustine',
    objectPosition: 'center center',
    gradientOverlayClass: 'bg-gradient-to-t from-black/90 via-black/40 to-stone-950/20',
  },
  {
    id: 'trang-an',
    image: trangAnHeroImg,
    alt: 'Thuyền chèo trên dòng nước Tràng An uốn lượn giữa những dãy núi đá vôi kỳ vĩ và thủy đình cổ kính',
    destination: 'Tràng An',
    descriptor: 'Di sản văn hóa và thiên nhiên thế giới',
    quotation: 'Có những con đường không dành cho bước chân, mà dành cho mái chèo và những giấc mơ.',
    objectPosition: 'center 40%',
    gradientOverlayClass: 'bg-gradient-to-t from-black/90 via-black/40 to-stone-950/25',
  },
  {
    id: 'da-lat',
    image: daLatHeroImg,
    alt: 'Biển mây bồng bềnh phủ trên những ngọn đồi thông và thung lũng cỏ hồng Đà Lạt lúc bình minh',
    destination: 'Đà Lạt',
    descriptor: 'Thành phố ngàn hoa',
    quotation: 'Đi thật xa để tìm thấy một khoảng trời đủ chậm cho tâm hồn nghỉ ngơi.',
    objectPosition: 'center 45%',
    gradientOverlayClass: 'bg-gradient-to-t from-black/90 via-black/40 to-stone-950/25',
  },
  {
    id: 'sa-pa',
    image: saPaHeroImg,
    alt: 'Những thửa ruộng bậc thang Sa Pa chín vàng rực rỡ uốn lượn trên sườn núi dưới ánh nắng ban mai',
    destination: 'Sa Pa',
    descriptor: 'Nơi gặp gỡ đất trời',
    quotation: 'Phía sau những tầng mây luôn là một chân trời đang chờ được khám phá.',
    objectPosition: 'center 35%',
    gradientOverlayClass: 'bg-gradient-to-t from-black/90 via-black/40 to-stone-950/25',
  },
  {
    id: 'da-nang',
    image: daNangHeroImg,
    alt: 'Bãi biển Mỹ Khê Đà Nẵng với bờ cát trắng mịn, biển xanh trong vắt và biểu tượng chữ DANANG rực rỡ',
    destination: 'Đà Nẵng',
    descriptor: 'Thành phố bên bờ biển',
    quotation: 'Bình minh trên biển nhắc ta rằng mỗi ngày đều có thể là một hành trình mới.',
    objectPosition: 'center 55%',
    gradientOverlayClass: 'bg-gradient-to-t from-black/90 via-black/40 to-stone-950/30',
  },
] as const;

/**
 * Lựa chọn 1 hero duy nhất tại thời điểm khởi tạo module (ngoài React runtime).
 * - Ổn định tuyệt đối khi chuyển đổi Login <-> Register.
 * - Ổn định qua các lần React StrictMode rerender trong development.
 * - Không bị thay đổi khi gõ input, validation lỗi hoặc hiển thị banner.
 * - Full browser reload sẽ random lựa chọn hero mới.
 */
export const SELECTED_HERO: AuthHero =
  AUTH_HEROES[Math.floor(Math.random() * AUTH_HEROES.length)];

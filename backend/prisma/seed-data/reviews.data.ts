export interface ReviewSeedItem {
  userEmail: string;
  destinationName: string;
  rating: number;
  comment: string;
  daysAgo: number;
}

export interface FavoriteSeedItem {
  userEmail: string;
  destinationName: string;
}

export const REVIEWS_DATA: ReviewSeedItem[] = [
  // Vịnh Hạ Long
  {
    userEmail: 'demo.binh@example.com',
    destinationName: 'Vịnh Hạ Long',
    rating: 5,
    comment: 'Cảnh sắc vịnh Hạ Long lúc bình minh đẹp đến ngỡ ngàng. Đi thuyền luồn qua các hòn đảo đá vôi, không khí trong lành mát rượi.',
    daysAgo: 14,
  },
  {
    userEmail: 'demo.linh@example.com',
    destinationName: 'Vịnh Hạ Long',
    rating: 5,
    comment: 'Trải nghiệm chèo kayak vào hang Luồn và ngắm hoàng hôn buông xuống trên mặt vịnh là kỷ niệm khó quên nhất trong chuyến đi.',
    daysAgo: 28,
  },
  {
    userEmail: 'demo.dung@example.com',
    destinationName: 'Vịnh Hạ Long',
    rating: 4,
    comment: 'Thắng cảnh tuyệt vời, dịch vụ du thuyền chuyên nghiệp. Mùa cao điểm cuối tuần bến cảng hơi đông đúc nhưng vẫn rất đáng giá.',
    daysAgo: 45,
  },

  // Quần thể danh thắng Tràng An
  {
    userEmail: 'demo.an@example.com',
    destinationName: 'Quần thể danh thắng Tràng An',
    rating: 5,
    comment: 'Non nước hữu tình, nước trong vắt nhìn thấy cả rong rêu dưới đáy. Các cô chèo thuyền rất nhiệt tình giới thiệu về lịch sử đền chùa.',
    daysAgo: 10,
  },
  {
    userEmail: 'demo.ha@example.com',
    destinationName: 'Quần thể danh thắng Tràng An',
    rating: 5,
    comment: 'Tuyến thuyền số 2 đi qua các hang động kỳ vĩ và phim trường Đảo Đầu Lâu rất đẹp, chụp góc nào cũng như tranh thủy mặc.',
    daysAgo: 22,
  },

  // Tam Cốc – Bích Động
  {
    userEmail: 'demo.ha@example.com',
    destinationName: 'Tam Cốc – Bích Động',
    rating: 5,
    comment: 'Đi đúng dịp lúa chín vàng ươm hai bên bờ sông Ngô Đồng, cảm giác ngồi trên thuyền ngắm đồng quê Việt Nam thật thanh bình.',
    daysAgo: 35,
  },
  {
    userEmail: 'demo.minh@example.com',
    destinationName: 'Tam Cốc – Bích Động',
    rating: 4,
    comment: 'Chùa Bích Động cổ kính ẩn trong vách núi rất tĩnh mịch. Nên đi từ sáng sớm để tránh nắng và tận hưởng không gian yên ả.',
    daysAgo: 60,
  },

  // Phố cổ Hà Nội
  {
    userEmail: 'demo.chi@example.com',
    destinationName: 'Phố cổ Hà Nội',
    rating: 5,
    comment: 'Thiên đường cho những ai mê ẩm thực đường phố! Bún chả Hàng Quạt, cà phê trứng Giảng và bia hơi Tạ Hiện đều mang phong vị rất riêng.',
    daysAgo: 7,
  },
  {
    userEmail: 'demo.an@example.com',
    destinationName: 'Phố cổ Hà Nội',
    rating: 5,
    comment: 'Kiến trúc nhà ống mái ngói thâm nâu phủ rêu phong, dạo quanh vào một sáng mùa thu se lạnh thì không còn gì tuyệt vời hơn.',
    daysAgo: 18,
  },
  {
    userEmail: 'demo.dung@example.com',
    destinationName: 'Phố cổ Hà Nội',
    rating: 4,
    comment: 'Phố đi bộ cuối tuần rất nhộn nhịp, nhiều hoạt động nghệ thuật biểu diễn dân gian thú vị. Đường phố đông đúc nên cần chú ý tư trang.',
    daysAgo: 40,
  },

  // Văn Miếu – Quốc Tử Giám
  {
    userEmail: 'demo.an@example.com',
    destinationName: 'Văn Miếu – Quốc Tử Giám',
    rating: 5,
    comment: 'Không gian văn hóa tôn nghiêm giữa lòng thủ đô. 82 tấm bia tiến sĩ là minh chứng lịch sử trường tồn về truyền thống hiếu học của dân tộc.',
    daysAgo: 12,
  },
  {
    userEmail: 'demo.khanh@example.com',
    destinationName: 'Văn Miếu – Quốc Tử Giám',
    rating: 5,
    comment: 'Kiến trúc Khuê Văn Các và giếng Thiên Quang rợp bóng cây cổ thụ. Buổi tối có tour đêm trải nghiệm công nghệ 3D mapping rất ấn tượng.',
    daysAgo: 25,
  },

  // Hồ Hoàn Kiếm
  {
    userEmail: 'demo.chi@example.com',
    destinationName: 'Hồ Hoàn Kiếm',
    rating: 5,
    comment: 'Đi bộ quanh hồ sáng sớm ngắm các cụ tập dưỡng sinh và thưởng thức một cây kem Tràng Tiền là trải nghiệm rất đỗi bình dị mà ấm áp.',
    daysAgo: 5,
  },
  {
    userEmail: 'demo.minh@example.com',
    destinationName: 'Hồ Hoàn Kiếm',
    rating: 4,
    comment: 'Cầu Thê Húc son đỏ dẫn sang đền Ngọc Sơn rất thơ mộng. Buổi tối tháp Rùa lên đèn lung linh soi bóng mặt nước tĩnh lặng.',
    daysAgo: 30,
  },

  // Thị trấn Sa Pa
  {
    userEmail: 'demo.minh@example.com',
    destinationName: 'Thị trấn Sa Pa',
    rating: 5,
    comment: 'Không khí se lạnh mát mẻ quanh năm. Đi bản Cát Cát hay Tả Van ngắm ruộng bậc thang ngút ngàn, ăn đồ nướng nóng hổi giữa trời sương.',
    daysAgo: 15,
  },
  {
    userEmail: 'demo.dung@example.com',
    destinationName: 'Thị trấn Sa Pa',
    rating: 4,
    comment: 'Khu vực trung tâm thị trấn đang phát triển nhiều khách sạn mới, nên di chuyển về các bản vùng ven để cảm nhận trọn vẹn sự mộc mạc.',
    daysAgo: 50,
  },

  // Đỉnh Fansipan
  {
    userEmail: 'demo.dung@example.com',
    destinationName: 'Đỉnh Fansipan',
    rating: 5,
    comment: 'Chạm tay vào chóp inox 3.143m trên đỉnh mây bồng bềnh là cảm xúc vỡ òa! Hệ thống cáp treo vượt qua thung lũng Mường Hoa ngoạn mục.',
    daysAgo: 8,
  },
  {
    userEmail: 'demo.linh@example.com',
    destinationName: 'Đỉnh Fansipan',
    rating: 5,
    comment: 'Đại tượng Phật A Di Đà bằng đồng uy nghiêm giữa biển mây tạo cảm giác linh thiêng và thanh thản vô cùng.',
    daysAgo: 20,
  },

  // Cao nguyên đá Đồng Văn
  {
    userEmail: 'demo.dung@example.com',
    destinationName: 'Cao nguyên đá Đồng Văn',
    rating: 5,
    comment: 'Cung đường phượt huyền thoại của đời người. Đứng trên đỉnh Mã Pí Lèng nhìn xuống dòng sông Nho Quế xanh ngọc bích thấy non sông đất nước ta quá đỗi tự hào.',
    daysAgo: 11,
  },
  {
    userEmail: 'demo.ha@example.com',
    destinationName: 'Cao nguyên đá Đồng Văn',
    rating: 5,
    comment: 'Mùa hoa tam giác mạch phủ sắc hồng tím lên nền đá xám tai mèo. Người dân bản địa vô cùng hiền hậu, mến khách.',
    daysAgo: 32,
  },

  // Thác Bản Giốc
  {
    userEmail: 'demo.ha@example.com',
    destinationName: 'Thác Bản Giốc',
    rating: 5,
    comment: 'Dòng thác hùng vĩ đổ xuống ba tầng tung bọt trắng xóa giữa thung lũng xanh ngát. Đi bè mảng đến gần chân thác cảm giác bọt nước mát lạnh sảng khoái.',
    daysAgo: 16,
  },
  {
    userEmail: 'demo.an@example.com',
    destinationName: 'Thác Bản Giốc',
    rating: 4,
    comment: 'Đường đi từ Cao Bằng lên khá xa nhưng bù lại cảnh quan dọc đường tuyệt đẹp. Mùa nước nhiều từ tháng 8 đến tháng 10 ngắm thác đẹp nhất.',
    daysAgo: 55,
  },

  // Phố cổ Hội An
  {
    userEmail: 'demo.khanh@example.com',
    destinationName: 'Phố cổ Hội An',
    rating: 5,
    comment: 'Đêm rằm phố cổ tắt hết đèn điện, chỉ còn ánh sáng hoa đăng lững lờ trôi trên sông Hoài. Bánh mì Phượng và cao lầu ở đây ngon khó cưỡng.',
    daysAgo: 6,
  },
  {
    userEmail: 'demo.chi@example.com',
    destinationName: 'Phố cổ Hội An',
    rating: 5,
    comment: 'Những bức tường vàng hoa giấy rực rỡ dưới nắng miền Trung, đạp xe qua các con ngõ nhỏ ngắm Chùa Cầu là trải nghiệm chữa lành tuyệt vời.',
    daysAgo: 19,
  },
  {
    userEmail: 'demo.linh@example.com',
    destinationName: 'Phố cổ Hội An',
    rating: 5,
    comment: 'Góc nào ở Hội An lên hình cũng mang hơi thở hoài niệm sâu lắng. Người dân chất phác và hiếu khách.',
    daysAgo: 42,
  },

  // Thánh địa Mỹ Sơn
  {
    userEmail: 'demo.khanh@example.com',
    destinationName: 'Thánh địa Mỹ Sơn',
    rating: 5,
    comment: 'Bí ẩn kỹ thuật xây đền tháp bằng gạch nung không mạch vữa của người Chăm cổ đại vẫn làm giới khảo cổ thán phục. Suất múa Shiva rất cuốn hút.',
    daysAgo: 17,
  },
  {
    userEmail: 'demo.an@example.com',
    destinationName: 'Thánh địa Mỹ Sơn',
    rating: 4,
    comment: 'Nằm gọn trong thung lũng tĩnh lặng. Nên đi cùng hướng dẫn viên thuyết minh để hiểu sâu về văn hóa Chăm Pa rực rỡ.',
    daysAgo: 48,
  },

  // Đại Nội Huế
  {
    userEmail: 'demo.khanh@example.com',
    destinationName: 'Đại Nội Huế',
    rating: 5,
    comment: 'Quy mô cung điện nguy nga, điện Thái Hòa và Thế Miếu giữ được vẻ uy nghiêm tôn kính của một vương triều phong kiến lịch sử.',
    daysAgo: 9,
  },
  {
    userEmail: 'demo.an@example.com',
    destinationName: 'Đại Nội Huế',
    rating: 4,
    comment: 'Khuôn viên rất rộng, đi bộ cần chuẩn bị mũ nón và nước uống. Công tác trùng tu các cung điện đang được thực hiện tỉ mỉ.',
    daysAgo: 38,
  },

  // Cố đô Huế
  {
    userEmail: 'demo.khanh@example.com',
    destinationName: 'Cố đô Huế',
    rating: 5,
    comment: 'Lăng Khải Định với kiến trúc giao thoa Đông Tây tinh xảo, chùa Thiên Mụ soi bóng sông Hương lúc chiều tà đẹp như một khúc nhạc trầm tư.',
    daysAgo: 13,
  },
  {
    userEmail: 'demo.chi@example.com',
    destinationName: 'Cố đô Huế',
    rating: 5,
    comment: 'Ẩm thực cố đô quả thực đỉnh cao: bún bò Huế thơm mùi sả ruốc, bánh bèo chén, chè bột lọc bọc heo quay ăn một lần nhớ mãi.',
    daysAgo: 27,
  },

  // Động Phong Nha
  {
    userEmail: 'demo.dung@example.com',
    destinationName: 'Động Phong Nha',
    rating: 5,
    comment: 'Thuyền máy tắt động cơ lướt nhẹ vào lòng hang, những cột thạch nhũ lung linh dưới ánh đèn chiếu sáng tạo hình cung điện ngầm tráng lệ.',
    daysAgo: 21,
  },
  {
    userEmail: 'demo.ha@example.com',
    destinationName: 'Động Phong Nha',
    rating: 4,
    comment: 'Không khí bên trong hang mát lạnh dễ chịu. Thạch nhũ tự nhiên muôn hình vạn trạng gợi trí tưởng tượng phong phú.',
    daysAgo: 44,
  },

  // Hang Sơn Đoòng
  {
    userEmail: 'demo.dung@example.com',
    destinationName: 'Hang Sơn Đoòng',
    rating: 5,
    comment: 'Hành trình thám hiểm để đời! Đứng dưới giếng trời Hố sụt 1 nhìn lên vạt rừng nguyên sinh bên trong hang thực sự khiến con người thấy mình nhỏ bé trước tự nhiên.',
    daysAgo: 31,
  },

  // Bà Nà Hills
  {
    userEmail: 'demo.linh@example.com',
    destinationName: 'Bà Nà Hills',
    rating: 5,
    comment: 'Được dạo bước trên Cầu Vàng lúc sáng sớm khi mây còn vương trên những bàn tay đá khổng lồ là một trải nghiệm như bước vào chốn bồng lai.',
    daysAgo: 4,
  },
  {
    userEmail: 'demo.binh@example.com',
    destinationName: 'Bà Nà Hills',
    rating: 4,
    comment: 'Làng Pháp kiến trúc đẹp, khí hậu mát lạnh dễ chịu. Các nhà hàng buffet trên đỉnh núi phục vụ phong phú và chu đáo.',
    daysAgo: 23,
  },

  // Bán đảo Sơn Trà
  {
    userEmail: 'demo.binh@example.com',
    destinationName: 'Bán đảo Sơn Trà',
    rating: 5,
    comment: 'Chạy xe máy lên đỉnh Bàn Cờ ngắm toàn cảnh thành phố Đà Nẵng từ trên cao, may mắn bắt gặp đàn voọc chà vá chân nâu chuyền cành tuyệt đẹp.',
    daysAgo: 15,
  },
  {
    userEmail: 'demo.dung@example.com',
    destinationName: 'Bán đảo Sơn Trà',
    rating: 5,
    comment: 'Cây đa nghìn năm tuổi và bãi Bụt nước trong vắt. Điểm đến giữ được nét hoang sơ rất quý giá của Đà Nẵng.',
    daysAgo: 39,
  },

  // Bãi biển Mỹ Khê
  {
    userEmail: 'demo.binh@example.com',
    destinationName: 'Bãi biển Mỹ Khê',
    rating: 5,
    comment: 'Bãi biển sạch, cát trắng mịn, độ dốc thoai thoải và sóng êm. Dọc bờ biển có đường dạo bộ và dịch vụ thể thao biển phát triển đồng bộ.',
    daysAgo: 3,
  },
  {
    userEmail: 'demo.linh@example.com',
    destinationName: 'Bãi biển Mỹ Khê',
    rating: 5,
    comment: 'Bình minh trên biển Mỹ Khê lúc 5 giờ sáng đẹp nao lòng. Tắm biển xong lên bờ thưởng thức hải sản tươi ngon với giá cả hợp lý.',
    daysAgo: 16,
  },

  // Eo Gió Quy Nhơn
  {
    userEmail: 'demo.linh@example.com',
    destinationName: 'Eo Gió Quy Nhơn',
    rating: 5,
    comment: 'Cung đường đi bộ ven biển đẹp ngoạn mục với lan can đỏ uốn lượn quanh vách đá. Gió biển thổi lồng lộng, nước biển trong xanh màu ngọc bích.',
    daysAgo: 26,
  },
  {
    userEmail: 'demo.binh@example.com',
    destinationName: 'Eo Gió Quy Nhơn',
    rating: 4,
    comment: 'Cảnh sắc thiên nhiên hùng tráng, hoang sơ. Nên kết hợp đi cùng Kỳ Co để có một ngày trọn vẹn tại bán đảo Phương Mai.',
    daysAgo: 52,
  },

  // Chợ Bến Thành
  {
    userEmail: 'demo.chi@example.com',
    destinationName: 'Chợ Bến Thành',
    rating: 4,
    comment: 'Khu ẩm thực trong chợ có đầy đủ bánh xèo, bún riêu, gỏi cuốn chuẩn vị Nam Bộ. Không khí tấp nập đặc trưng của đô thị Sài Gòn.',
    daysAgo: 12,
  },
  {
    userEmail: 'demo.an@example.com',
    destinationName: 'Chợ Bến Thành',
    rating: 3,
    comment: 'Kiến trúc tháp đồng hồ biểu tượng rất đẹp. Mua sắm hàng lưu niệm nên hỏi giá và thương lượng khéo léo trước khi mua.',
    daysAgo: 41,
  },

  // Dinh Độc Lập
  {
    userEmail: 'demo.an@example.com',
    destinationName: 'Dinh Độc Lập',
    rating: 5,
    comment: 'Không gian lưu giữ trọn vẹn hiện vật lịch sử của ngày toàn thắng 1975. Khuôn viên rợp bóng cây cổ thụ giữa trung tâm quận 1.',
    daysAgo: 24,
  },
  {
    userEmail: 'demo.khanh@example.com',
    destinationName: 'Dinh Độc Lập',
    rating: 4,
    comment: 'Kiến trúc hiện đại của kiến trúc sư Ngô Viết Thụ rất tài hoa, kết hợp triết lý chữ Hán khéo léo vào mặt bằng công trình.',
    daysAgo: 47,
  },

  // Địa đạo Củ Chi
  {
    userEmail: 'demo.dung@example.com',
    destinationName: 'Địa đạo Củ Chi',
    rating: 5,
    comment: 'Chui vào đường hầm thực tế mới thấu hiểu sự kiên cường và tài trí phi thường của cha ông trong những năm tháng kháng chiến gian lao.',
    daysAgo: 29,
  },

  // Thành phố Đà Lạt
  {
    userEmail: 'demo.minh@example.com',
    destinationName: 'Thành phố Đà Lạt',
    rating: 5,
    comment: 'Đà Lạt luôn là nơi tìm về mỗi khi muốn trút bỏ mệt mỏi phố thị. Tiết trời se lạnh, một ly sữa đậu nành nóng và bánh tráng nướng thơm phức.',
    daysAgo: 2,
  },
  {
    userEmail: 'demo.chi@example.com',
    destinationName: 'Thành phố Đà Lạt',
    rating: 5,
    comment: 'Những quán cà phê thung lũng view đồi thông săn hoàng hôn lãng mạn vô cùng. Hoa dã quỳ nở rộ khắp các triền đồi.',
    daysAgo: 18,
  },

  // Hồ Xuân Hương
  {
    userEmail: 'demo.minh@example.com',
    destinationName: 'Hồ Xuân Hương',
    rating: 5,
    comment: 'Đi dạo hoặc đạp xe quanh hồ vào sáng sớm lúc mặt hồ còn phủ làn sương mỏng tang, cảm giác yên bình đến từng nhịp thở.',
    daysAgo: 14,
  },

  // Đồi cát Mũi Né
  {
    userEmail: 'demo.dung@example.com',
    destinationName: 'Đồi cát Mũi Né',
    rating: 4,
    comment: 'Trượt cát và chạy xe ATV trên đồi cát bay rất phấn khích. Màu cát thay đổi theo từng thời khắc trong ngày rất thú vị.',
    daysAgo: 33,
  },

  // Chợ nổi Cái Răng
  {
    userEmail: 'demo.ha@example.com',
    destinationName: 'Chợ nổi Cái Răng',
    rating: 5,
    comment: 'Thưởng thức tô hủ tiếu nóng hổi ngay trên ghe chòng chành giữa sông nước buổi sớm là trải nghiệm văn hóa miền Tây đích thực.',
    daysAgo: 11,
  },
  {
    userEmail: 'demo.chi@example.com',
    destinationName: 'Chợ nổi Cái Răng',
    rating: 4,
    comment: 'Tiếng cười nói rộn ràng, trái cây miệt vườn tươi rói. Cây bẹo treo gì bán nấy thể hiện nét hào sảng chân chất của người Nam Bộ.',
    daysAgo: 37,
  },

  // Đảo Phú Quốc
  {
    userEmail: 'demo.binh@example.com',
    destinationName: 'Đảo Phú Quốc',
    rating: 5,
    comment: 'Bãi Sao cát trắng mịn như kem, biển lặng sóng và xanh biếc. Hải sản ở làng chài Hàm Ninh tươi ngon, giá cả rất dễ chịu.',
    daysAgo: 5,
  },
  {
    userEmail: 'demo.linh@example.com',
    destinationName: 'Đảo Phú Quốc',
    rating: 5,
    comment: 'Hoàng hôn ở Sunset Sanato và Bãi Dài xứng danh ngoạn mục nhất Việt Nam. Cáp treo Hòn Thơm vượt biển ngắm quần đảo từ trên cao cực kỳ mãn nhãn.',
    daysAgo: 21,
  },

  // Côn Đảo
  {
    userEmail: 'demo.an@example.com',
    destinationName: 'Côn Đảo',
    rating: 5,
    comment: 'Mảnh đất thiêng liêng vừa hào hùng vừa linh thiêng. Viếng nghĩa trang Hàng Dương lúc nửa đêm để lại niềm xúc động sâu sắc trong lòng.',
    daysAgo: 16,
  },
  {
    userEmail: 'demo.binh@example.com',
    destinationName: 'Côn Đảo',
    rating: 5,
    comment: 'Biển Đầm Trầu nước xanh màu ngọc bích, máy bay hạ cánh ngay sát bãi tắm độc nhất vô nhị. Thiên nhiên hoang sơ chưa bị bê tông hóa.',
    daysAgo: 34,
  },

  // Núi Bà Đen
  {
    userEmail: 'demo.khanh@example.com',
    destinationName: 'Núi Bà Đen',
    rating: 5,
    comment: 'Đại tượng Phật Bà Tây Bổ Đà Sơn bằng đồng uy nghiêm trên đỉnh núi mây vờn. Hệ thống hoa tươi rực rỡ và nhà ga cáp treo đạt kỷ lục Guinness.',
    daysAgo: 13,
  },
  {
    userEmail: 'demo.dung@example.com',
    destinationName: 'Núi Bà Đen',
    rating: 4,
    comment: 'Có thể đi cáp treo tiện lợi hoặc leo núi theo đường chùa / đường cột điện để rèn luyện sức bền. Cảnh nhìn từ đỉnh bao trọn đồng bằng Tây Ninh.',
    daysAgo: 46,
  },
];

export const FAVORITES_DATA: FavoriteSeedItem[] = [
  // User An (Lịch sử & Văn hóa)
  { userEmail: 'demo.an@example.com', destinationName: 'Văn Miếu – Quốc Tử Giám' },
  { userEmail: 'demo.an@example.com', destinationName: 'Quần thể danh thắng Tràng An' },
  { userEmail: 'demo.an@example.com', destinationName: 'Cố đô Huế' },
  { userEmail: 'demo.an@example.com', destinationName: 'Côn Đảo' },

  // User Binh (Biển đảo & Nghỉ dưỡng)
  { userEmail: 'demo.binh@example.com', destinationName: 'Vịnh Hạ Long' },
  { userEmail: 'demo.binh@example.com', destinationName: 'Bãi biển Mỹ Khê' },
  { userEmail: 'demo.binh@example.com', destinationName: 'Đảo Phú Quốc' },
  { userEmail: 'demo.binh@example.com', destinationName: 'Eo Gió Quy Nhơn' },

  // User Chi (Ẩm thực & Thành phố)
  { userEmail: 'demo.chi@example.com', destinationName: 'Phố cổ Hà Nội' },
  { userEmail: 'demo.chi@example.com', destinationName: 'Chợ Bến Thành' },
  { userEmail: 'demo.chi@example.com', destinationName: 'Chợ nổi Cái Răng' },

  // User Dung (Phiêu lưu & Trekking)
  { userEmail: 'demo.dung@example.com', destinationName: 'Đỉnh Fansipan' },
  { userEmail: 'demo.dung@example.com', destinationName: 'Cao nguyên đá Đồng Văn' },
  { userEmail: 'demo.dung@example.com', destinationName: 'Hang Sơn Đoòng' },
  { userEmail: 'demo.dung@example.com', destinationName: 'Thác Bản Giốc' },

  // User Ha (Sinh thái & Thiên nhiên)
  { userEmail: 'demo.ha@example.com', destinationName: 'Tam Cốc – Bích Động' },
  { userEmail: 'demo.ha@example.com', destinationName: 'Chợ nổi Cái Răng' },
  { userEmail: 'demo.ha@example.com', destinationName: 'Thác Bản Giốc' },

  // User Khanh (Cố đô & Di sản)
  { userEmail: 'demo.khanh@example.com', destinationName: 'Phố cổ Hội An' },
  { userEmail: 'demo.khanh@example.com', destinationName: 'Thánh địa Mỹ Sơn' },
  { userEmail: 'demo.khanh@example.com', destinationName: 'Đại Nội Huế' },

  // User Linh (Check-in & Nhiếp ảnh)
  { userEmail: 'demo.linh@example.com', destinationName: 'Bà Nà Hills' },
  { userEmail: 'demo.linh@example.com', destinationName: 'Eo Gió Quy Nhơn' },
  { userEmail: 'demo.linh@example.com', destinationName: 'Đảo Phú Quốc' },

  // User Minh (Du lịch chậm & Bình yên)
  { userEmail: 'demo.minh@example.com', destinationName: 'Thành phố Đà Lạt' },
  { userEmail: 'demo.minh@example.com', destinationName: 'Hồ Xuân Hương' },
  { userEmail: 'demo.minh@example.com', destinationName: 'Thị trấn Sa Pa' },
];

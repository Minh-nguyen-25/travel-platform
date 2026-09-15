export interface DestinationPhotoCredit {
  slug: string;
  filename: string;
  author: string;
  sourceName: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  modificationNote?: string;
}

export const DESTINATION_PHOTO_CREDITS: Record<string, DestinationPhotoCredit> = {
  'ho-hoan-kiem': {
    slug: 'ho-hoan-kiem',
    filename: 'ho-hoan-kiem.jpg',
    author: 'Mig Gilbert',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:The_Turtle_Tower_(39558135494).jpg',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
  'van-mieu': {
    slug: 'van-mieu',
    filename: 'van-mieu.jpg',
    author: 'Jakub Hałun',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Main_gate_of_the_Temple_of_Literature,_Hanoi,_Vietnam,_20240123_0929_3068.jpg',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
  'hoang-thanh-thang-long': {
    slug: 'hoang-thanh-thang-long',
    filename: 'hoang-thanh-thang-long.jpg',
    author: 'katiebordner',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Central_Sector_of_the_Imperial_Citadel_of_Thang_Long_-_Hanoi.jpg',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
  'bao-tang-dan-toc-hoc': {
    slug: 'bao-tang-dan-toc-hoc',
    filename: 'bao-tang-dan-toc-hoc.jpg',
    author: 'Nam Hy Hoàng Phong',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tr%E1%BB%91ng_%C4%90%E1%BB%93ng_building,_Vietnam_Museum_of_Ethnology.jpg',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
  'ta-hien': {
    slug: 'ta-hien',
    filename: 'ta-hien.jpg',
    author: 'Christophe95',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:T%E1%BA%A1_Hi%E1%BB%87n_Street.jpg',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
  'my-khe': {
    slug: 'my-khe',
    filename: 'my-khe.jpg',
    author: 'Jpatokal',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:My_Khe_Beach_Danang_Coastline.jpg',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
  'ngu-hanh-son': {
    slug: 'ngu-hanh-son',
    filename: 'ngu-hanh-son.jpg',
    author: 'Hiroki Ogawa',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:The_Marble_Mountains_Da_Nang_Viet_Nam_-_panoramio.jpg',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
  'linh-ung-son-tra': {
    slug: 'linh-ung-son-tra',
    filename: 'linh-ung-son-tra.jpg',
    author: 'CEphoto, Uwe Aranas',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Son-Tra-Peninsula_Da-Nang_Vietnam_Linh-Ung-Pagoda-01.jpg',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
  'cau-rong': {
    slug: 'cau-rong',
    filename: 'cau-rong.jpg',
    author: 'Person-with-No Name',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Da_Nang_Dragon_Bridge.jpg',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
  'cho-han': {
    slug: 'cho-han',
    filename: 'cho-han.jpg',
    author: 'Dragfyre',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Cho_Han_Entrance.JPG',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
  'dinh-doc-lap': {
    slug: 'dinh-doc-lap',
    filename: 'dinh-doc-lap.jpg',
    author: 'Diego Delso',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Palacio_de_la_Reunificaci%C3%B3n,_Ciudad_Ho_Chi_Minh,_Vietnam,_2013-08-14,_DD_03.JPG',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
  'bao-tang-chung-tich': {
    slug: 'bao-tang-chung-tich',
    filename: 'bao-tang-chung-tich.jpg',
    author: 'Prenn',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:War_Remnants_Museum,_HCMC,_front.JPG',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
  'cho-ben-thanh': {
    slug: 'cho-ben-thanh',
    filename: 'cho-ben-thanh.jpg',
    author: 'Diego Delso',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ben_Thanh,_Ciudad_Ho_Chi_Minh,_Vietnam,_2013-08-14,_DD_01.JPG',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
  'nguyen-hue': {
    slug: 'nguyen-hue',
    filename: 'nguyen-hue.jpg',
    author: 'Steffen Schmitz',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ho_Chi_Minh_City,_Nguyen_Hue_Street,_2020-01_CN-04.jpg',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
  'buu-dien-sai-gon': {
    slug: 'buu-dien-sai-gon',
    filename: 'buu-dien-sai-gon.jpg',
    author: 'Diego Delso',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Oficina_Central_de_Correos,_Ciudad_Ho_Chi_Minh,_Vietnam,_2013-08-14,_DD_06.JPG',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
  'ha-giang': {
    slug: 'ha-giang',
    filename: 'ha-giang.jpg',
    author: 'Khánh Hmoong',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ma_Pi_Leng_Pass_winding_road_Ha_Giang_Vietnam.jpg',
    license: 'CC BY 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
  'hoi-an': {
    slug: 'hoi-an',
    filename: 'hoi-an.jpg',
    author: 'Steffen Schmitz',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:H%E1%BB%99i_An,_Ancient_Town,_2020-01_CN-06.jpg',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
  'ninh-binh': {
    slug: 'ninh-binh',
    filename: 'ninh-binh.jpg',
    author: 'Vyacheslav Argenberg',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Vietnam,_Ninh_Binh,_Trang_An_River.jpg',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
  'da-lat': {
    slug: 'da-lat',
    filename: 'da-lat.jpg',
    author: 'P. Hughes',
    sourceName: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Da_Lat_-_Xuan_Huong_Lake.jpg',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
    modificationNote: 'đã điều chỉnh kích thước/cắt ảnh',
  },
};

/**
 * Extracts destination photo credit metadata from an image URL or filename.
 * Returns null if the image does not belong to the local destination photos set.
 */
export function getDestinationPhotoCredit(imageUrl?: string | null): DestinationPhotoCredit | null {
  if (!imageUrl) return null;
  const cleanPath = imageUrl.split('?')[0].split('#')[0];
  const filename = cleanPath.split('/').pop();
  if (!filename || !filename.endsWith('.jpg')) return null;

  const slug = filename.replace(/\.jpg$/, '');
  return DESTINATION_PHOTO_CREDITS[slug] ?? null;
}

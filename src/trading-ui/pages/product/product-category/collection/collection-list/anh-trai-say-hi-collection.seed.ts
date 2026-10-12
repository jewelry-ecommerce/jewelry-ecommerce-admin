export type AnhTraiSayHiCollectionSeed = {
  name: string;
  slug: string;
  description: string;
  /** UUID sản phẩm — ưu tiên cao nhất khi seed. */
  productIds?: string[];
  /** Gợi ý match slug SP (vd. `quang-hung-masterd`, `tinh-ha-ali`). */
  productSlugHints?: string[];
  productSearch?: string;
};

const buildDescription = (artistName: string): string => `Sở hữu trọn bộ full-look Heartlock để toả sáng trọn vẹn phong cách riêng của ${artistName} trên sân khấu Tinh Hà — Anh Trai Say Hi.`;

/** 24 nghệ sĩ Anh Trai Say Hi — mùa Heartlock / Tinh Hà. */
export const ANH_TRAI_SAY_HI_COLLECTION_SEEDS: AnhTraiSayHiCollectionSeed[] = [
  { name: 'Quang Hùng MasterD', slug: 'quang-hung-masterd', description: buildDescription('Quang Hùng MasterD'), productSlugHints: ['quang-hung-masterd', 'quang-hung'] },
  { name: 'Wren Evans', slug: 'wren-evans', description: buildDescription('Wren Evans'), productSlugHints: ['wren-evans'] },
  { name: 'Dương Domic', slug: 'duong-domic', description: buildDescription('Dương Domic'), productSlugHints: ['duong-domic'] },
  { name: 'JSOL', slug: 'jsol', description: buildDescription('JSOL'), productSlugHints: ['jsol'] },
  { name: 'buitruonglinh', slug: 'bui-truong-linh', description: buildDescription('buitruonglinh'), productSlugHints: ['bui-truong-linh', 'buitruonglinh'] },
  { name: 'HURRYKNG', slug: 'hurrykng', description: buildDescription('HURRYKNG'), productSlugHints: ['hurrykng'] },
  { name: 'Pháp Kiều', slug: 'phap-kieu', description: buildDescription('Pháp Kiều'), productSlugHints: ['phap-kieu'] },
  { name: 'Song Luân', slug: 'song-luan', description: buildDescription('Song Luân'), productSlugHints: ['song-luan'] },
  { name: 'CONGB', slug: 'congb', description: buildDescription('CONGB'), productSlugHints: ['congb'] },
  { name: 'Sơn.K', slug: 'son-k', description: buildDescription('Sơn.K'), productSlugHints: ['son-k', 'sonk'] },
  { name: 'CAPTAIN BOY', slug: 'captain-boy', description: buildDescription('CAPTAIN BOY'), productSlugHints: ['captain-boy'] },
  { name: 'WEAN', slug: 'wean', description: buildDescription('WEAN'), productSlugHints: ['wean'] },
  {
    name: 'Ali Hoàng Dương',
    slug: 'ali-hoang-duong',
    description: 'Sở hữu trọn bộ full-look Heartlock để toả sáng trọn vẹn phong cách riêng trên sân khấu Tinh Hà.',
    productIds: ['019f03b2-93f4-7619-9914-c83cdf2c692c', '019e9224-3456-7601-bd72-ac182d5cc618', '019ed4b0-12bc-729e-8c34-8350d565a491'],
    productSlugHints: ['ali-hoang-duong'],
  },
  { name: 'Vương Bình', slug: 'vuong-binh', description: buildDescription('Vương Bình'), productSlugHints: ['vuong-binh'] },
  { name: 'Cody Nam Võ', slug: 'cody-nam-vo', description: buildDescription('Cody Nam Võ'), productSlugHints: ['cody-nam-vo'] },
  { name: 'Jaysonlei', slug: 'jaysonlei', description: buildDescription('Jaysonlei'), productSlugHints: ['jaysonlei'] },
  { name: 'DILLAN', slug: 'dillan', description: buildDescription('DILLAN'), productSlugHints: ['dillan'] },
  { name: 'Đặng Hồng Hải', slug: 'dang-hong-hai', description: buildDescription('Đặng Hồng Hải'), productSlugHints: ['dang-hong-hai'] },
  { name: 'IVAN', slug: 'ivan', description: buildDescription('IVAN'), productSlugHints: ['ivan'] },
  { name: 'Thể Thiên', slug: 'the-thien', description: buildDescription('Thể Thiên'), productSlugHints: ['the-thien'] },
  { name: 'HYO', slug: 'hyo', description: buildDescription('HYO'), productSlugHints: ['hyo'] },
  { name: 'CoolKid', slug: 'coolkid', description: buildDescription('CoolKid'), productSlugHints: ['coolkid'] },
  { name: 'KIMLONG', slug: 'kim-long', description: buildDescription('KIMLONG'), productSlugHints: ['kim-long', 'kimlong'] },
  { name: 'XUÂN ĐỊNH K.Y.', slug: 'xuan-dinh-ky', description: buildDescription('XUÂN ĐỊNH K.Y.'), productSlugHints: ['xuan-dinh-ky', 'xuan-dinh'] },
];

export const ANH_TRAI_SAY_HI_SEED_SLUGS = new Set(ANH_TRAI_SAY_HI_COLLECTION_SEEDS.map((item) => item.slug));

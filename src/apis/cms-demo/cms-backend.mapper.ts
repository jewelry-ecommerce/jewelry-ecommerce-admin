
import type { CmsDemoPage } from "./cms-demo.interface";
export function pageWrite(page: CmsDemoPage) {
  const existing = /^[1-9]\d*$/.test(page.id);
  return { name: page.name, slug: page.slug, locale: page.locale || "vi-VN",
    status: page.status, isActive: page.isActive ?? true, seo: page.seo,
    ...(existing ? { revision: page.revision } : {}),
    blocks: page.blocks.map(block => ({ ...block,
      id: /^[1-9]\d*$/.test(block.id) ? Number(block.id) : undefined,
    })),
  };
}

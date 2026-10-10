import { useState } from "react";
import useSWR from "swr";
import { getCmsDemoPages, saveCmsDemoPage } from "@/apis/cms-demo/cms-demo.api";
import { CmsDemoStatus, type CmsDemoPage } from "@/apis/cms-demo/cms-demo.interface";

export function useCmsDemo() {
  const { data: pages = [], error, isLoading, mutate } = useSWR("cms-demo/pages", getCmsDemoPages);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function save(page: CmsDemoPage, status: CmsDemoStatus): Promise<CmsDemoPage | undefined> {
    setSaving(true);
    setMessage("");
    try {
      const saved = await saveCmsDemoPage({
        ...page,
        status,
        blocks: page.blocks.map((block, index) => ({ ...block, sortOrder: index + 1 })),
      });
      await mutate();
      setMessage(
        status === CmsDemoStatus.PUBLISHED ? "Đã xuất bản. Mở client để kiểm tra." : "Đã lưu. Chỉ trang published hiển thị trên client.",
      );
      return saved;
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Không thể lưu CMS");
    } finally {
      setSaving(false);
    }
  }
  return { pages, error: error instanceof Error ? error.message : "", isLoading, mutate, save, message, saving };
}

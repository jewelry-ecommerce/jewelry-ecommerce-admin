import { Alert, Stack } from "@mui/material";
import { useState } from "react";
import dayjs from "dayjs";
import { CustomButton } from "@/components/button/custom-button.component";
import { TextInput, SelectInput } from "@/trading-ui/components/form";
import { CmsManualProductPicker } from "@/trading-ui/pages/content-display/cms/components/cms-manual-product-picker.component";
import { JAVA_DISCOUNT_POLICY, JavaDiscountKind, JavaDiscountStatus, JavaDiscountType, javaSaveDiscount, type JavaDiscount } from "@/apis/java/java-discount.api";
function useDiscountEditor(kind: JavaDiscountKind, initial?: JavaDiscount) {
  const [name, setName] = useState(initial?.name ?? initial?.code ?? "");
  const [type, setType] = useState(initial?.discountType ?? JavaDiscountType.PERCENT), [status, setStatus] = useState(initial?.status ?? JavaDiscountStatus.DRAFT);
  const [amount, setAmount] = useState(String(initial?.discountValue ?? "")), [maximum, setMaximum] = useState(initial?.maxDiscountAmount == null ? "" : String(initial.maxDiscountAmount));
  const [minimum, setMinimum] = useState(initial?.minOrderValue == null ? "" : String(initial.minOrderValue));
  const [usage, setUsage] = useState(initial?.usageLimit == null ? "" : String(initial.usageLimit));
  const [start, setStart] = useState(initial?.startsAt ? dayjs(initial.startsAt).format("YYYY-MM-DDTHH:mm") : "");
  const [end, setEnd] = useState(initial?.endsAt ? dayjs(initial.endsAt).format("YYYY-MM-DDTHH:mm") : "");
  const [ids, setIds] = useState(initial?.productIds?.map(String) ?? []), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const save = async (onSaved: () => void) => {
    if (busy) return; setBusy(true); setError("");
    try {
      if (!amount.trim()) throw new Error("Nhập giá trị giảm giá.");
      await javaSaveDiscount(kind, { name: kind === JavaDiscountKind.PROMOTION ? name.trim() : undefined,
        code: kind === JavaDiscountKind.VOUCHER ? name.trim() : undefined, discountType: type, discountValue: Number(amount),
        maxDiscountAmount: maximum.trim() ? Number(maximum) : null, minOrderValue: minimum.trim() ? Number(minimum) : null,
        usageLimit: usage.trim() ? Number(usage) : null, productIds: kind === JavaDiscountKind.PROMOTION ? ids.map(Number) : undefined,
        status, startsAt: start ? new Date(start).toISOString() : "", endsAt: end ? new Date(end).toISOString() : "" }, initial?.id);
      onSaved();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Không thể lưu khuyến mãi."); }
    finally { setBusy(false); }
  };
  return { name, setName, type, setType, status, setStatus, amount, setAmount, maximum, setMaximum, minimum, setMinimum,
    usage, setUsage, start, setStart, end, setEnd, ids, setIds, busy, error, save };
}
export function JavaDiscountForm({ kind, initial, onSaved }: { kind: JavaDiscountKind; initial?: JavaDiscount; onSaved: () => void }) {
  const editor = useDiscountEditor(kind, initial), promotion = kind === JavaDiscountKind.PROMOTION;
  const types = Object.values(JavaDiscountType).filter(value => promotion || value !== JavaDiscountType.FLAT_PRICE);
  return <Stack gap={2} sx={{ pt: 1 }}>
    {editor.error && <Alert severity="error">{editor.error}</Alert>}
    <TextInput requiredMark label={promotion ? "Tên chương trình" : "Mã giảm giá"} value={editor.name} onChange={event => editor.setName(event.target.value)} disabled={editor.busy} />
    <SelectInput label="Loại giảm giá" value={editor.type} options={types.map(value => ({ value, label: { PERCENT: "Giảm theo %", FIXED: "Giảm số tiền", FLAT_PRICE: "Đồng giá" }[value] }))}
      onChange={event => editor.setType(event.target.value as JavaDiscountType)} disabled={editor.busy} />
    <TextInput label={editor.type === JavaDiscountType.PERCENT ? "Tỷ lệ (%)" : "Giá trị (VND)"} type="number" value={editor.amount} onChange={event => editor.setAmount(event.target.value)} disabled={editor.busy} />
    <TextInput label="Giảm tối đa (bỏ trống: không giới hạn)" type="number" value={editor.maximum} onChange={event => editor.setMaximum(event.target.value)} disabled={editor.busy} />
    {!promotion && <>
      <TextInput label="Giá trị đơn tối thiểu" type="number" value={editor.minimum} onChange={event => editor.setMinimum(event.target.value)} disabled={editor.busy} />
      <TextInput label="Giới hạn lượt dùng (bỏ trống: không giới hạn)" type="number" value={editor.usage} onChange={event => editor.setUsage(event.target.value)} disabled={editor.busy} />
    </>}
    <Stack direction="row" gap={2}>
      <TextInput label="Bắt đầu" type="datetime-local" value={editor.start} onChange={event => editor.setStart(event.target.value)} disabled={editor.busy} fullWidth />
      <TextInput label="Kết thúc" type="datetime-local" value={editor.end} onChange={event => editor.setEnd(event.target.value)} disabled={editor.busy} fullWidth />
    </Stack>
    <SelectInput label="Trạng thái" value={editor.status} options={[{ value: JavaDiscountStatus.DRAFT, label: "Nháp" }, { value: JavaDiscountStatus.PUBLISHED, label: "Xuất bản" }]}
      onChange={event => editor.setStatus(event.target.value as JavaDiscountStatus)} disabled={editor.busy} />
    {promotion && <CmsManualProductPicker productIds={editor.ids} onChange={editor.setIds} disabled={editor.busy} maxItems={JAVA_DISCOUNT_POLICY.productPickerLimit} />}
    <CustomButton variant="primary" disabled={editor.busy} onClick={() => void editor.save(onSaved)}>Lưu</CustomButton>
  </Stack>;
}

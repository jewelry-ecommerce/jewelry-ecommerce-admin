import { useRef, useState } from "react";
import { javaAdjustStock, type JavaStock } from "@/apis/java/java-operations.api";

export function useJavaStockAdjustment(stock: JavaStock | null, onSaved: () => void, onClose: () => void) {
  const [quantity, setQuantity] = useState(""), [reason, setReason] = useState("RECEIPT");
  const [reference, setReference] = useState(""), [note, setNote] = useState("");
  const [error, setError] = useState(""), [busy, setBusy] = useState(false);
  const pending = useRef(false), attempt = useRef({ fingerprint: "", key: "" });
  const save = async () => {
    if (!stock || pending.current) return;
    pending.current = true; setBusy(true); setError("");
    const fingerprint = JSON.stringify([stock.skuId, quantity, reason, reference.trim(), note.trim()]);
    try {
      if (attempt.current.fingerprint !== fingerprint) attempt.current = { fingerprint, key: crypto.randomUUID() };
      await javaAdjustStock(stock.skuId, Number(quantity), reason, {
        reference: reference.trim(), note: note.trim(), idempotencyKey: attempt.current.key,
      });
      onSaved(); onClose();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Không thể điều chỉnh tồn kho.");
    } finally {
      pending.current = false; setBusy(false);
    }
  };
  return { quantity, setQuantity, reason, setReason, reference, setReference, note, setNote, error, busy, save };
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SANDBOX_AUTO_EVALUATE_DEBOUNCE_MS } from '../../promotion-sandbox/sandbox.constants';
import {
  promotionApi,
  PromotionScope,
  type PromotionSimulationVoucherDiscoverResponseDto,
  type PromotionSimulationVoucherItemDto,
  type RuntimeEvaluateLineDto,
  type RuntimeEvaluateRequestDto,
  type RuntimeEvaluateResponseDto,
  type WmsSkuSearchListItem,
} from '../../../../apis';
import { resolveWmsSkuDisplayName, resolveWmsSkuImageUrl, resolveWmsSkuPriceMinor } from '../../../../apis/product/sku-search.util';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { computeLineSubtotal, sumLinesSubtotal } from './promotion-simulation.helpers';
import { normalizeVoucherCodeInput, validateVoucherCodeInput } from '../promotion-voucher-code-card/voucher-code-authoring.utils';

export type SandboxVoucherValidateStatus = 'idle' | 'validating' | 'valid' | 'invalid';

export interface SandboxVoucherState {
  input: string;
  status: SandboxVoucherValidateStatus;
  message: string;
  appliedCode: string | null;
  cardTitle: string | null;
}

export interface RuntimeSimulationLine extends RuntimeEvaluateLineDto {
  readonly skuCode?: string;
  readonly skuName?: string;
  readonly skuImageUrl?: string | null;
  readonly categoryNames?: readonly string[];
  readonly collectionNames?: readonly string[];
}

export type RuntimeSimulationMode = 'runtime' | 'draft';

const CHECKOUT_PIPELINE_SCOPES: readonly PromotionScope[] = [
  PromotionScope.SKU_ITEM,
  PromotionScope.LINE_ITEM,
  PromotionScope.CART,
  PromotionScope.SHIPPING,
  PromotionScope.PAYMENT,
  PromotionScope.BUNDLE,
];

const INITIAL_VOUCHER_STATE: SandboxVoucherState = {
  input: '',
  status: 'idle',
  message: '',
  appliedCode: null,
  cardTitle: null,
};

const createEmptyLine = (index: number): RuntimeSimulationLine => ({
  lineId: `line-${Date.now()}-${index}`,
  skuId: '',
  quantity: 1,
  unitPriceMinor: '0',
  lineSubtotalMinor: '0',
  categoryIds: [],
  collectionIds: [],
});

const nonEmptyString = (value: string | null | undefined): string | null => {
  const trimmed = String(value ?? '').trim();
  return trimmed || null;
};

const resolveCategoryIds = (item: WmsSkuSearchListItem): string[] => {
  const direct = item.categoryIds?.map((id) => nonEmptyString(id)).filter((id): id is string => Boolean(id)) ?? [];
  const productCategory = nonEmptyString(item.product?.categoryId);
  return direct.length > 0 ? direct : productCategory ? [productCategory] : [];
};

const resolveCollectionIds = (item: WmsSkuSearchListItem): string[] => {
  const direct = item.collectionIds?.map((id) => nonEmptyString(id)).filter((id): id is string => Boolean(id)) ?? [];
  if (direct.length > 0) return direct;
  return item.collections?.map((collection) => nonEmptyString(collection.id)).filter((id): id is string => Boolean(id)) ?? [];
};

const resolveCollectionNames = (item: WmsSkuSearchListItem): string[] => item.collections?.map((collection) => nonEmptyString(collection.name)).filter((name): name is string => Boolean(name)) ?? [];

const mapSkuToPick = (item: WmsSkuSearchListItem) => {
  const skuId = nonEmptyString(item.id);
  const skuCode = nonEmptyString(item.skuCode);
  if (!skuId || !skuCode) return null;

  const categoryName = nonEmptyString(item.product?.categoryName);
  const skuName = resolveWmsSkuDisplayName(item, skuCode);

  return {
    skuId,
    skuCode,
    skuName,
    imageUrl: resolveWmsSkuImageUrl(item),
    priceMinor: resolveWmsSkuPriceMinor(item),
    categoryIds: resolveCategoryIds(item),
    categoryNames: categoryName ? [categoryName] : [],
    collectionIds: resolveCollectionIds(item),
    collectionNames: resolveCollectionNames(item),
  };
};

const deriveCartLineSubtotal = (line: RuntimeEvaluateLineDto): string => computeLineSubtotal(Math.max(1, line.quantity), line.unitPriceMinor);

const resolveEvaluatedAtIso = (value: string): string => {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error !== 'object' || error === null) return fallback;
  const maybePayload = error as { message?: unknown; code?: unknown };
  const message = typeof maybePayload.message === 'string' ? maybePayload.message.trim() : '';
  const code = typeof maybePayload.code === 'string' ? maybePayload.code.trim() : '';
  if (code && message) return `${code}: ${message}`;
  if (message) return message;
  if (code) return code;
  return fallback;
};

const normalizeVoucherCode = (code: string): string => code.trim();

const isSelectableVoucher = (voucher: PromotionSimulationVoucherItemDto): boolean => Boolean(normalizeVoucherCode(voucher.code)) && !voucher.disabled;

const buildRuntimeLine = (line: RuntimeSimulationLine): RuntimeEvaluateLineDto => ({
  lineId: line.lineId,
  skuId: line.skuId,
  quantity: Number(line.quantity),
  unitPriceMinor: String(line.unitPriceMinor),
  lineSubtotalMinor: String(deriveCartLineSubtotal(line)),
  categoryIds: [...line.categoryIds],
  collectionIds: [...line.collectionIds],
  hasExistingPromotion: line.hasExistingPromotion,
  hasExistingDiscount: line.hasExistingDiscount,
});

export interface UseRuntimeSimulationOptions {
  initialLines?: RuntimeSimulationLine[];
  autoEvaluate?: boolean;
  onEvaluateStateChange?: (state: { result: RuntimeEvaluateResponseDto | null; error: string | null; evaluating: boolean; isValid: boolean }) => void;
}

export const useRuntimeSimulation = ({ initialLines, autoEvaluate = false, onEvaluateStateChange }: UseRuntimeSimulationOptions = {}) => {
  const { showSnackbar } = useSnackbar();
  const defaultLinesRef = useRef(initialLines ?? [createEmptyLine(0)]);
  const skipDraftClearEffectRef = useRef(true);

  const [evaluatedAt, setEvaluatedAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [customerMode, setCustomerMode] = useState<'guest' | 'logged-in'>('guest');
  const [customerId, setCustomerId] = useState('');
  const [selectedDraftId, setSelectedDraftId] = useState('');
  const [selectedVoucherCodes, setSelectedVoucherCodes] = useState<string[]>([]);
  const [voucherDiscovery, setVoucherDiscovery] = useState<PromotionSimulationVoucherDiscoverResponseDto | null>(null);
  const [voucherDiscoveryLoading, setVoucherDiscoveryLoading] = useState(false);
  const [voucherDiscoveryError, setVoucherDiscoveryError] = useState<string | null>(null);
  const [lines, setLines] = useState<RuntimeSimulationLine[]>(initialLines ?? [createEmptyLine(0)]);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<RuntimeEvaluateResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voucher, setVoucher] = useState<SandboxVoucherState>(INITIAL_VOUCHER_STATE);

  const requestPayload: RuntimeEvaluateRequestDto | null = useMemo(() => {
    const invalidLine = lines.some((line) => !line.lineId || !line.skuId || line.quantity < 1);
    if (invalidLine || lines.length === 0) return null;

    const couponCodes = Array.from(new Set([...selectedVoucherCodes.map(normalizeVoucherCode).filter(Boolean), ...(voucher.appliedCode ? [normalizeVoucherCodeInput(voucher.appliedCode)] : [])]));
    return {
      scopes: [...CHECKOUT_PIPELINE_SCOPES],
      evaluatedAt: resolveEvaluatedAtIso(evaluatedAt),
      customer: {
        customerId: customerMode === 'logged-in' ? customerId.trim() || null : null,
        segmentIds: [],
      },
      cart: {
        cartId: null,
        currency: 'VND',
      },
      lines: lines.map(buildRuntimeLine),
      ...(couponCodes.length > 0 ? { couponCodes } : {}),
    };
  }, [evaluatedAt, customerId, lines, customerMode, selectedVoucherCodes, voucher.appliedCode]);

  const simulationMode: RuntimeSimulationMode = selectedDraftId.trim() ? 'draft' : 'runtime';
  const canEvaluate = Boolean(requestPayload);

  const handleEvaluate = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      const payload = requestPayload;
      if (!payload) {
        if (!silent) {
          showSnackbar({ type: SnackbarType.ERROR, message: 'Vui lòng thêm ít nhất một biến thể vào giỏ hàng giả lập.' });
        }
        setResult(null);
        setError(null);
        return;
      }
      setEvaluating(true);
      if (!silent) {
        setError(null);
        setResult(null);
      }

      try {
        const response = simulationMode === 'draft' ? await promotionApi.simulatePromotionDraft(selectedDraftId.trim(), payload) : await promotionApi.evaluateRuntime(payload);
        setResult(response);
        setError(null);
        if (import.meta.env.DEV) {
          console.info('[promotion-sandbox] evaluate request', payload);
          console.info('[promotion-sandbox] evaluate response', response);
        }
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Không thể kết nối đến server.');
        setError(message);
        if (!silent) {
          showSnackbar({ type: SnackbarType.ERROR, message });
        }
      } finally {
        setEvaluating(false);
      }
    },
    [requestPayload, selectedDraftId, showSnackbar, simulationMode],
  );

  const handleLoadSimulationVouchers = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      const draftId = selectedDraftId.trim();

      setVoucherDiscoveryLoading(true);
      setVoucherDiscoveryError(null);
      try {
        if (simulationMode === 'draft' && draftId) {
          const response = await promotionApi.discoverPromotionDraftSimulationVouchers(draftId, { evaluatedAt: resolveEvaluatedAtIso(evaluatedAt) });
          setVoucherDiscovery(response);
          setSelectedVoucherCodes((prev) => {
            const selectableCodes = new Set(response.sections.flatMap((section) => section.items.filter(isSelectableVoucher).map((item) => normalizeVoucherCode(item.code))));
            return prev.filter((code) => selectableCodes.has(code));
          });
        } else {
          const response = await promotionApi.discoverPromotionVouchers();
          setVoucherDiscovery(response as unknown as PromotionSimulationVoucherDiscoverResponseDto);
          setSelectedVoucherCodes((prev) => {
            const selectableCodes = new Set(
              response.sections.flatMap((section) => section.items.filter((item) => isSelectableVoucher(item as PromotionSimulationVoucherItemDto)).map((item) => normalizeVoucherCode(item.code))),
            );
            return prev.filter((code) => selectableCodes.has(code));
          });
        }
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Không tải được voucher giả lập.');
        setVoucherDiscoveryError(message);
        if (!silent) {
          showSnackbar({ type: SnackbarType.ERROR, message });
        }
      } finally {
        setVoucherDiscoveryLoading(false);
      }
    },
    [evaluatedAt, selectedDraftId, showSnackbar, simulationMode],
  );

  const handleToggleVoucherCode = useCallback((voucher: PromotionSimulationVoucherItemDto) => {
    if (!isSelectableVoucher(voucher)) return;
    const code = normalizeVoucherCode(voucher.code);
    setSelectedVoucherCodes((prev) => (prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code]));
  }, []);

  const handleClearSelectedVouchers = useCallback(() => setSelectedVoucherCodes([]), []);

  const simulationSignature = useMemo(
    () =>
      JSON.stringify({
        evaluatedAt,
        customerMode,
        customerId,
        simulationMode,
        selectedDraftId,
        selectedVoucherCodes,
        appliedCouponCode: voucher.appliedCode,
        lines: lines.map((line) => ({
          lineId: line.lineId,
          skuId: line.skuId,
          quantity: line.quantity,
          unitPriceMinor: line.unitPriceMinor,
        })),
      }),
    [evaluatedAt, customerMode, customerId, lines, selectedDraftId, selectedVoucherCodes, simulationMode, voucher.appliedCode],
  );

  useEffect(() => {
    if (!autoEvaluate) return;
    if (!requestPayload || !canEvaluate) {
      setResult(null);
      setError(null);
      return;
    }
    const timer = window.setTimeout(() => {
      void handleEvaluate({ silent: true });
    }, SANDBOX_AUTO_EVALUATE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [autoEvaluate, canEvaluate, handleEvaluate, requestPayload, simulationSignature]);

  useEffect(() => {
    void handleLoadSimulationVouchers({ silent: true });
  }, [handleLoadSimulationVouchers]);

  useEffect(() => {
    if (skipDraftClearEffectRef.current) {
      skipDraftClearEffectRef.current = false;
      return;
    }
    if (selectedDraftId !== '') return;

    setLines([...defaultLinesRef.current]);
    setResult(null);
    setError(null);
    setVoucherDiscovery(null);
    setSelectedVoucherCodes([]);
    setVoucher(INITIAL_VOUCHER_STATE);
  }, [selectedDraftId]);

  const handleAddSku = useCallback((item: WmsSkuSearchListItem) => {
    const pick = mapSkuToPick(item);
    if (!pick) return;

    setLines((prev) => {
      const existing = prev.find((line) => line.skuId === pick.skuId);
      if (existing) {
        return prev.map((line) => {
          if (line.skuId !== pick.skuId) return line;
          const nextQty = line.quantity + 1;
          const changed = { ...line, quantity: nextQty };
          return { ...changed, lineSubtotalMinor: deriveCartLineSubtotal(changed) };
        });
      }

      const nextLine: RuntimeSimulationLine = {
        ...createEmptyLine(prev.length),
        skuId: pick.skuId,
        skuCode: pick.skuCode,
        skuName: pick.skuName,
        skuImageUrl: pick.imageUrl,
        unitPriceMinor: pick.priceMinor !== '0' ? pick.priceMinor : '0',
        categoryIds: [...pick.categoryIds],
        categoryNames: [...pick.categoryNames],
        collectionIds: [...pick.collectionIds],
        collectionNames: [...pick.collectionNames],
      };
      return [...prev, { ...nextLine, lineSubtotalMinor: deriveCartLineSubtotal(nextLine) }];
    });
  }, []);

  const handleQuantityChange = useCallback((lineId: string, quantity: number) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.lineId !== lineId) return line;
        const changed = { ...line, quantity };
        return { ...changed, lineSubtotalMinor: deriveCartLineSubtotal(changed) };
      }),
    );
  }, []);

  const handleUnitPriceChange = useCallback((lineId: string, unitPriceMinor: string) => {
    setLines((prev) =>
      prev.map((line) => {
        if (line.lineId !== lineId) return line;
        const changed = { ...line, unitPriceMinor };
        return { ...changed, lineSubtotalMinor: deriveCartLineSubtotal(changed) };
      }),
    );
  }, []);

  const handleRemoveLineById = useCallback((lineId: string) => {
    setLines((prev) => prev.filter((line) => line.lineId !== lineId));
  }, []);

  const setVoucherInput = useCallback((input: string) => {
    setVoucher((prev) => ({
      ...prev,
      input,
      status: prev.appliedCode && normalizeVoucherCodeInput(input) !== prev.appliedCode ? 'idle' : prev.status,
      message: prev.appliedCode && normalizeVoucherCodeInput(input) !== prev.appliedCode ? '' : prev.message,
    }));
  }, []);

  const handleClearVoucher = useCallback(() => {
    setVoucher(INITIAL_VOUCHER_STATE);
  }, []);

  const handleApplyVoucher = useCallback(async () => {
    const inputError = validateVoucherCodeInput(voucher.input);
    if (inputError) {
      setVoucher((prev) => ({
        ...prev,
        status: 'invalid',
        message: inputError,
        appliedCode: null,
        cardTitle: null,
      }));
      return;
    }

    const normalizedCode = normalizeVoucherCodeInput(voucher.input);
    setVoucher((prev) => ({ ...prev, status: 'validating', message: 'Đang kiểm tra mã voucher...' }));

    try {
      const response = await promotionApi.validatePromotionVoucherCode({ code: normalizedCode });
      if (!response.valid || !response.card) {
        setVoucher((prev) => ({
          ...prev,
          status: 'invalid',
          message: response.message || 'Mã voucher không hợp lệ.',
          appliedCode: null,
          cardTitle: null,
        }));
        return;
      }

      setVoucher({
        input: normalizedCode,
        status: 'valid',
        message: response.message || 'Mã voucher hợp lệ.',
        appliedCode: response.card.code || normalizedCode,
        cardTitle: response.card.title || response.card.promotionName || null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể kiểm tra mã voucher.';
      setVoucher((prev) => ({
        ...prev,
        status: 'invalid',
        message,
        appliedCode: null,
        cardTitle: null,
      }));
    }
  }, [voucher.input]);

  const simulatedSubtotal = useMemo(() => String(sumLinesSubtotal(lines)), [lines]);
  const selection = result?.selection ?? null;
  const selectedDiscount = selection?.totalSelectedDiscountAmountMinor ?? '0';
  const afterDiscountVal = BigInt(simulatedSubtotal) - BigInt(selectedDiscount);
  const afterDiscountStr = afterDiscountVal <= 0n ? '0' : afterDiscountVal.toString();
  const simulationIsValid = Boolean(result) && !error && afterDiscountVal >= 0n && lines.some((line) => line.skuId);

  useEffect(() => {
    onEvaluateStateChange?.({ result, error, evaluating, isValid: simulationIsValid });
  }, [error, evaluating, onEvaluateStateChange, result, simulationIsValid]);

  return {
    evaluatedAt,
    setEvaluatedAt,
    customerMode,
    setCustomerMode,
    customerId,
    setCustomerId,
    simulationMode,
    selectedDraftId,
    setSelectedDraftId,
    selectedVoucherCodes,
    voucherDiscovery,
    voucherDiscoveryLoading,
    voucherDiscoveryError,
    canEvaluate,
    lines,
    evaluating,
    result,
    error,
    requestPayload,
    simulatedSubtotal,
    selectedDiscount,
    afterDiscountStr,
    handleEvaluate,
    handleAddSku,
    handleQuantityChange,
    handleUnitPriceChange,
    handleRemoveLineById,
    handleLoadSimulationVouchers,
    handleToggleVoucherCode,
    handleClearSelectedVouchers,
    voucher,
    setVoucherInput,
    handleApplyVoucher,
    handleClearVoucher,
  };
};

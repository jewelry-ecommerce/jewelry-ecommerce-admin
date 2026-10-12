import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  promotionApi,
  PromotionDraftSchemaType,
  VoucherCodeStatus,
  type DraftVoucherCodeResponseDto,
  type PromotionDetailDto,
  type PromotionDraft,
  type PromotionDraftComponentsResponseDto,
  type PromotionDraftSchema,
  type PromotionDraftSchemaComponentsResponseDto,
} from '../../../apis';
import { getErrorMessage } from '../../../common/utils';
import { SnackbarType, useSnackbar } from '@/hooks/use-snackbar.hook';
import { getPromotionPublishReadiness } from '../components/promotion-publish';
import { createEmptySchemaComponents, getComponents } from '../utils/promotion-detail.helpers';
import { getPromotionDetailSections } from '../promotion.constant';

export const usePromotionDetailData = () => {
  const { promotionId } = useParams<{ promotionId: string }>();
  const [searchParams] = useSearchParams();
  const { showSnackbar } = useSnackbar();

  const source: 'draft' | 'published' = searchParams.get('source') === 'published' ? 'published' : 'draft';

  const [promotionDraft, setPromotionDraft] = useState<PromotionDraft | null>(null);
  const [promotionPublished, setPromotionPublished] = useState<PromotionDetailDto | null>(null);
  const [components, setComponents] = useState<PromotionDraftComponentsResponseDto | null>(null);
  const [schemas, setSchemas] = useState<PromotionDraftSchema[]>([]);
  const [schemaComponentsBySchemaId, setSchemaComponentsBySchemaId] = useState<Record<string, PromotionDraftSchemaComponentsResponseDto>>({});
  const [voucherCodesBySchemaId, setVoucherCodesBySchemaId] = useState<Record<string, DraftVoucherCodeResponseDto | null>>({});
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('general');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const sectionKeys = useMemo(() => getPromotionDetailSections(source).map((s) => s.key), [source]);

  const fetchDetail = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!promotionId) return;
      if (!options?.silent) setLoading(true);
      try {
        if (source === 'published') {
          const detail = await promotionApi.getPublishedPromotionDetail(promotionId);
          setPromotionPublished(detail);
          setPromotionDraft(null);
          try {
            setComponents(await promotionApi.getPublishedPromotionComponents(promotionId));
          } catch {
            setComponents(null);
          }
        } else {
          const draft = await promotionApi.getPromotionDraftDetail(promotionId);
          setPromotionDraft(draft);
          setPromotionPublished(null);
          try {
            setComponents(await promotionApi.getPromotionDraftComponents(promotionId));
          } catch {
            setComponents(null);
          }
        }
      } catch (error) {
        showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
      } finally {
        if (!options?.silent) setLoading(false);
      }
    },
    [promotionId, source, showSnackbar],
  );

  const refreshComponents = useCallback(async () => {
    if (!promotionId) return;
    try {
      if (source === 'published') {
        setComponents(await promotionApi.getPublishedPromotionComponents(promotionId));
        return;
      }
      const [nextComponents, draft] = await Promise.all([promotionApi.getPromotionDraftComponents(promotionId), promotionApi.getPromotionDraftDetail(promotionId)]);
      setComponents(nextComponents);
      setPromotionDraft(draft);
    } catch {
      setComponents(null);
    }
  }, [promotionId, source]);

  const fetchSchemaComponentsForSchemas = useCallback(
    async (nextSchemas: PromotionDraftSchema[]) => {
      if (!promotionId || nextSchemas.length === 0) {
        setSchemaComponentsBySchemaId({});
        return;
      }

      const entries = await Promise.all(
        nextSchemas.map(async (schema) => {
          let response = createEmptySchemaComponents();
          try {
            response =
              source === 'published' ? await promotionApi.getPublishedPromotionSchemaComponents(promotionId, schema.id) : await promotionApi.getPromotionDraftSchemaComponents(promotionId, schema.id);
          } catch {
            response = createEmptySchemaComponents();
          }
          return [schema.id, response] as const;
        }),
      );
      setSchemaComponentsBySchemaId(Object.fromEntries(entries));
    },
    [promotionId, source],
  );

  const fetchVoucherCodesForSchemas = useCallback(
    async (nextSchemas: PromotionDraftSchema[]) => {
      if (!promotionId) return;

      const voucherSchemas = nextSchemas.filter((schema) => schema.schemaType === PromotionDraftSchemaType.VOUCHER);
      if (voucherSchemas.length === 0) {
        setVoucherCodesBySchemaId({});
        return;
      }

      const entries = await Promise.all(
        voucherSchemas.map(async (schema) => {
          try {
            const response =
              source === 'published' ? await promotionApi.getPublishedPromotionVoucherCodes(promotionId, schema.id) : await promotionApi.getPromotionDraftVoucherCodes(promotionId, schema.id);
            const voucherCode = response.items.find((item) => item.status === VoucherCodeStatus.ACTIVE) ?? response.items[0] ?? null;
            return [schema.id, voucherCode] as const;
          } catch {
            return [schema.id, null] as const;
          }
        }),
      );

      setVoucherCodesBySchemaId(Object.fromEntries(entries));
    },
    [promotionId, source],
  );

  const fetchSchemas = useCallback(async () => {
    if (!promotionId) {
      setSchemas([]);
      setSchemaComponentsBySchemaId({});
      setVoucherCodesBySchemaId({});
      return;
    }
    try {
      const response = source === 'published' ? await promotionApi.getPublishedPromotionSchemas(promotionId) : await promotionApi.getPromotionDraftSchemas(promotionId);
      setSchemas(response.items);
      await fetchSchemaComponentsForSchemas(response.items);
      await fetchVoucherCodesForSchemas(response.items);
      if (source === 'draft') {
        // BE syncs draft status (EDITING ↔ READY_TO_PUBLISH) on schema/component changes.
        // Refresh draft so Publish button matches checklist without full page reload.
        try {
          setPromotionDraft(await promotionApi.getPromotionDraftDetail(promotionId));
        } catch {
          /* keep current draft if status refresh fails */
        }
      }
    } catch {
      setSchemas([]);
      setSchemaComponentsBySchemaId({});
      setVoucherCodesBySchemaId({});
    }
  }, [fetchSchemaComponentsForSchemas, fetchVoucherCodesForSchemas, promotionId, source]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    void fetchSchemas();
  }, [fetchSchemas, source]);

  const { target, audience, applicability } = useMemo(() => getComponents(components), [components]);

  const publishReadiness = useMemo(
    () => (source === 'draft' && promotionDraft ? getPromotionPublishReadiness({ promotion: promotionDraft, components, schemas, schemaComponentsBySchemaId, voucherCodesBySchemaId }) : null),
    [components, promotionDraft, schemaComponentsBySchemaId, schemas, voucherCodesBySchemaId, source],
  );

  const showConfigurationSections = Boolean(promotionDraft || promotionPublished);

  const name = source === 'published' ? (promotionPublished?.name ?? '') : (promotionDraft?.name ?? '');
  const description = source === 'published' ? (promotionPublished?.description ?? '') : (promotionDraft?.description ?? '');
  const startsAt = source === 'published' ? (promotionPublished?.startsAt ?? '') : (promotionDraft?.startsAt ?? '');
  const endsAt = source === 'published' ? (promotionPublished?.endsAt ?? '') : (promotionDraft?.endsAt ?? '');

  const handleNavigateSection = useCallback((key: string) => {
    setActiveSection(key);
    document.getElementById(`promotion-section-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root || loading) return;

    const onScroll = () => {
      const top = root.getBoundingClientRect().top + 100;
      let current = sectionKeys[0];
      for (const key of sectionKeys) {
        const el = document.getElementById(`promotion-section-${key}`);
        if (el && el.getBoundingClientRect().top <= top) current = key;
      }
      setActiveSection(current);
    };

    root.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => root.removeEventListener('scroll', onScroll);
  }, [loading, sectionKeys]);

  return {
    promotionId,
    source,
    promotionDraft,
    promotionPublished,
    components,
    schemas,
    schemaComponentsBySchemaId,
    voucherCodesBySchemaId,
    loading,
    activeSection,
    target,
    audience,
    applicability,
    publishReadiness,
    showConfigurationSections,
    name,
    description,
    startsAt,
    endsAt,
    fetchDetail,
    refreshComponents,
    fetchSchemas,
    handleNavigateSection,
    scrollContainerRef,
  };
};

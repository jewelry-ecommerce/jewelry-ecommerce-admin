import { useCallback, useEffect, useRef, useState } from 'react';

export type SectionNavItem<T extends string> = {
  key: T;
  label: string;
};

const SCROLL_CLICK_GUARD_MS = 600;

type UseSectionNavigationOptions<T extends string> = {
  visibleSections: ReadonlyArray<SectionNavItem<T>>;
  initialActiveKey: T;
};

export const useSectionNavigation = <T extends string>({ visibleSections, initialActiveKey }: UseSectionNavigationOptions<T>) => {
  const [activeKey, setActiveKey] = useState<T>(initialActiveKey);
  const sectionRefs = useRef<Partial<Record<T, HTMLElement | null>>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const guardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearGuard = useCallback(() => {
    if (guardTimerRef.current) {
      clearTimeout(guardTimerRef.current);
      guardTimerRef.current = null;
    }
  }, []);

  const handleNavigate = useCallback(
    (next: T) => {
      setActiveKey(next);
      const root = scrollContainerRef.current;
      const section = sectionRefs.current[next];
      if (!root || !section) return;

      isProgrammaticScrollRef.current = true;
      clearGuard();

      const rootRect = root.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const offset = sectionRect.top - rootRect.top + root.scrollTop - 8;
      root.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });

      guardTimerRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
        guardTimerRef.current = null;
      }, SCROLL_CLICK_GUARD_MS);
    },
    [clearGuard],
  );

  useEffect(
    () => () => {
      clearGuard();
    },
    [clearGuard],
  );

  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root || visibleSections.length === 0) return;

    const updateActiveFromScroll = () => {
      if (isProgrammaticScrollRef.current) return;
      const buffer = 96;
      const lineY = root.getBoundingClientRect().top + buffer;
      let current: T = visibleSections[0].key;
      for (const s of visibleSections) {
        const el = sectionRefs.current[s.key];
        if (!el) continue;
        if (el.getBoundingClientRect().top <= lineY) {
          current = s.key;
        }
      }
      setActiveKey((prev) => (prev === current ? prev : current));
    };

    root.addEventListener('scroll', updateActiveFromScroll, { passive: true });
    updateActiveFromScroll();

    return () => root.removeEventListener('scroll', updateActiveFromScroll);
  }, [visibleSections]);

  return {
    activeKey,
    setActiveKey,
    sectionRefs,
    scrollContainerRef,
    handleNavigate,
  };
};

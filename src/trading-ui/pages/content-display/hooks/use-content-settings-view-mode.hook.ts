import { useCallback, useState } from 'react';

export const useContentSettingsViewMode = (onCancelEdit?: () => void) => {
  const [viewMode, setViewMode] = useState(true);

  const enterEditMode = useCallback(() => {
    setViewMode(false);
  }, []);

  const cancelEditMode = useCallback(() => {
    onCancelEdit?.();
    setViewMode(true);
  }, [onCancelEdit]);

  const exitEditModeAfterSave = useCallback(() => {
    setViewMode(true);
  }, []);

  return {
    viewMode,
    enterEditMode,
    cancelEditMode,
    exitEditModeAfterSave,
  };
};

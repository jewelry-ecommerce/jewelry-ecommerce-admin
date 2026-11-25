import { Box, Checkbox, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";

import {
  getUserPagePermissions,
  listAccessUsers,
  listPermissionPages,
  putUserPagePermissions,
  type AdminAccessUser,
  type PermissionPageCatalogItem,
} from "@/apis/java/java-page-permission.api";
import type { PagePermissionGrant } from "@/apis/auth/auth.interface";
import { CustomButton } from "@/trading-ui/components/button";
import { LoadingComponent } from "@/trading-ui/components/loading/loading.component";
import { TYPOGRAPHY_STYLES } from "@/trading-ui/common/constant/typography.constant";
import { SnackbarType, useSnackbar } from "@/hooks/use-snackbar.hook";
import { getErrorMessage } from "@/trading-ui/common/utils";
import { useAppSelector } from "@/redux/store.redux";
import { Navigate } from "react-router-dom";
import { ROUTE_PATH } from "@/router/route.path";

const emptyGrant = (pageCode: string): PagePermissionGrant => ({ pageCode, view: false, edit: false, delete: false });

const buildDraftFromServer = (
  pages: PermissionPageCatalogItem[],
  grants: PagePermissionGrant[] | undefined,
): Record<string, PagePermissionGrant> => {
  const next: Record<string, PagePermissionGrant> = {};
  for (const page of pages) next[page.code] = emptyGrant(page.code);
  for (const grant of grants ?? []) {
    next[grant.pageCode] = {
      pageCode: grant.pageCode,
      view: Boolean(grant.view),
      edit: Boolean(grant.edit),
      delete: Boolean(grant.delete),
    };
  }
  return next;
};

const UserPagePermissionsPage = () => {
  const { showSnackbar } = useSnackbar();
  const me = useAppSelector((state) => state.auth.user);
  const isRoot = Boolean(me?.root || me?.roles?.includes("ROOT"));

  const pagesSwr = useSWR(isRoot ? "admin/permission-pages" : null, listPermissionPages);
  const usersSwr = useSWR(isRoot ? "admin/users" : null, listAccessUsers);

  const staffUsers = useMemo(
    () =>
      (usersSwr.data ?? []).filter((user) => {
        const roles = user.roles ?? [];
        if (roles.includes("ROOT")) return false;
        return roles.some((role) => role === "ADMIN" || role === "CATALOG_MANAGER" || role === "ORDER_MANAGER");
      }),
    [usersSwr.data],
  );

  const [pickedUserId, setPickedUserId] = useState<string | null>(null);
  const selectedUserId = pickedUserId ?? (staffUsers[0] ? String(staffUsers[0].id) : "");

  const [localDraft, setLocalDraft] = useState<Record<string, PagePermissionGrant> | null>(null);
  const [saving, setSaving] = useState(false);

  const grantsSwr = useSWR(
    isRoot && selectedUserId ? `admin/users/${selectedUserId}/page-permissions` : null,
    () => getUserPagePermissions(selectedUserId),
  );

  const serverDraft = useMemo(
    () => buildDraftFromServer(pagesSwr.data ?? [], grantsSwr.data),
    [grantsSwr.data, pagesSwr.data],
  );
  const draft = localDraft ?? serverDraft;

  const selectUser = useCallback((userId: string) => {
    setPickedUserId(userId);
    setLocalDraft(null);
  }, []);

  const patchGrant = useCallback(
    (pageCode: string, key: "view" | "edit" | "delete", value: boolean) => {
      setLocalDraft((prev) => {
        const base = prev ?? serverDraft;
        const current = base[pageCode] ?? emptyGrant(pageCode);
        const next = { ...current, [key]: value };
        if (key === "edit" && value) next.view = true;
        if (key === "delete" && value) next.view = true;
        if (key === "view" && !value) {
          next.edit = false;
          next.delete = false;
        }
        return { ...base, [pageCode]: next };
      });
    },
    [serverDraft],
  );

  const handleSave = useCallback(async () => {
    if (!selectedUserId) return;
    setSaving(true);
    try {
      const items = Object.values(draft).filter((item) => item.view || item.edit || item.delete);
      await putUserPagePermissions(selectedUserId, items);
      showSnackbar({ message: "Đã lưu phân quyền trang.", type: SnackbarType.SUCCESS });
      setLocalDraft(null);
      await grantsSwr.mutate();
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setSaving(false);
    }
  }, [draft, grantsSwr, selectedUserId, showSnackbar]);

  if (!isRoot) return <Navigate to={ROUTE_PATH.NO_ACCESS} replace />;
  if (pagesSwr.isLoading || usersSwr.isLoading) return <LoadingComponent />;

  const pages: PermissionPageCatalogItem[] = pagesSwr.data ?? [];
  const selectedUser: AdminAccessUser | undefined = staffUsers.find((user) => String(user.id) === selectedUserId);

  return (
    <Box sx={{ p: 3 }}>
      <Stack gap={2}>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.xl.semibold, color: "#101828" }}>Phân quyền người dùng</Typography>
        <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: "#667085" }}>
          Chỉ tài khoản ROOT dùng màn này. Chọn user staff rồi tick xem / sửa / xóa theo từng trang.
        </Typography>

        <TextField
          select
          label="Tài khoản"
          value={selectedUserId}
          onChange={(event) => selectUser(event.target.value)}
          sx={{ maxWidth: 420 }}
        >
          {staffUsers.length === 0 ? <MenuItem value="">Chưa có user staff</MenuItem> : null}
          {staffUsers.map((user) => (
            <MenuItem key={user.id} value={String(user.id)}>
              {user.fullName} ({user.phone}) — {(user.roles ?? []).join(", ")}
            </MenuItem>
          ))}
        </TextField>

        {selectedUser ? (
          <Box sx={{ border: "1px solid #E5E7EB", borderRadius: 2, overflow: "hidden" }}>
            <Stack direction="row" sx={{ bgcolor: "#F9FAFB", px: 2, py: 1.5, borderBottom: "1px solid #E5E7EB" }}>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, flex: 1 }}>Trang</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, width: 88, textAlign: "center" }}>Xem</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, width: 88, textAlign: "center" }}>Sửa</Typography>
              <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semibold, width: 88, textAlign: "center" }}>Xóa</Typography>
            </Stack>
            {pages
              .filter((page) => page.code !== "permission.access")
              .map((page) => {
                const grant = draft[page.code] ?? emptyGrant(page.code);
                return (
                  <Stack
                    key={page.code}
                    direction="row"
                    alignItems="center"
                    sx={{ px: 2, py: 0.5, borderBottom: "1px solid #F2F4F7" }}
                  >
                    <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, flex: 1, color: "#101828" }}>{page.label}</Typography>
                    <Box sx={{ width: 88, display: "flex", justifyContent: "center" }}>
                      <Checkbox checked={grant.view} onChange={(_, checked) => patchGrant(page.code, "view", checked)} />
                    </Box>
                    <Box sx={{ width: 88, display: "flex", justifyContent: "center" }}>
                      <Checkbox checked={grant.edit} onChange={(_, checked) => patchGrant(page.code, "edit", checked)} />
                    </Box>
                    <Box sx={{ width: 88, display: "flex", justifyContent: "center" }}>
                      <Checkbox checked={grant.delete} onChange={(_, checked) => patchGrant(page.code, "delete", checked)} />
                    </Box>
                  </Stack>
                );
              })}
          </Box>
        ) : null}

        <Stack direction="row" gap={1.5} alignItems="center">
          <CustomButton
            variant="primary"
            fullWidth={false}
            disabled={!selectedUserId || saving || grantsSwr.isLoading}
            onClick={() => void handleSave()}
          >
            {saving ? "Đang lưu…" : "Lưu phân quyền"}
          </CustomButton>
          {grantsSwr.isValidating ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: "#667085" }}>Đang tải…</Typography>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
};

export default UserPagePermissionsPage;

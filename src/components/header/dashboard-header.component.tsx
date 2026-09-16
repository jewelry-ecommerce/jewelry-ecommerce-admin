import { LogoutRounded, NotificationsNoneRounded, PersonOutlineRounded } from "@mui/icons-material";
import { Avatar, Badge, Divider, IconButton, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { authApi } from "@/apis";
import { commonConfig } from "@/common/config/app.config";
import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { ROLE_LABELS } from "@/permissions/role.constant";
import { clearAuth } from "@/redux/auth/auth.slice";
import { useAppDispatch, useAppSelector } from "@/redux/store.redux";
import { ROUTE_PATH } from "@/router/route.path";
import { COLOR, STYLE } from "@/theme/design-tokens";

const UNREAD_NOTIFICATION_COUNT = 3;

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);

  const handleLogout = async () => {
    setUserMenuAnchor(null);
    try {
      await authApi.logout();
    } finally {
      dispatch(clearAuth());
      navigate(ROUTE_PATH.LOGIN, { replace: true });
    }
  };

  return (
    <Stack
      component="header"
      direction="row"
      alignItems="center"
      sx={{
        position: "fixed",
        inset: "0 0 auto 0",
        zIndex: (theme) => theme.zIndex.appBar,
        height: STYLE.HEIGHT_HEADER,
        px: 2,
        bgcolor: "#141414",
      }}
    >
      <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#FFFFFF" }}>{commonConfig.BRAND_NAME} Admin</Typography>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ ml: "auto" }}>
        <Typography
          sx={{ px: 1.25, py: 0.75, border: "1px solid #64748B", borderRadius: 1, color: "#FFFFFF", ...TYPOGRAPHY_STYLES.sm.bold }}
        >
          JEWELRY
        </Typography>
        <IconButton aria-label={`${UNREAD_NOTIFICATION_COUNT} thông báo chưa đọc`} sx={{ color: "#FFFFFF" }}>
          <Badge badgeContent={UNREAD_NOTIFICATION_COUNT} color="error">
            <NotificationsNoneRounded fontSize="small" />
          </Badge>
        </IconButton>
        <Divider orientation="vertical" flexItem sx={{ borderColor: "#FFFFFF", mx: 0.5 }} />
        <IconButton aria-label="Tài khoản" onClick={(event) => setUserMenuAnchor(event.currentTarget)} sx={{ p: 0.25 }}>
          <Avatar
            src={user?.avatar ?? undefined}
            alt={user?.displayName ?? "Admin"}
            sx={{ width: 38, height: 38, border: "3px solid #FFFFFF", bgcolor: "#334155" }}
          >
            <PersonOutlineRounded sx={{ fontSize: 17 }} />
          </Avatar>
        </IconButton>
        <Typography sx={{ color: "#FFFFFF", ...TYPOGRAPHY_STYLES.base.bold }}>{user?.displayName ?? "Admin"}</Typography>
      </Stack>
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={() => setUserMenuAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Stack spacing={0.25} sx={{ px: 2, py: 1.25 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.semiBold }}>{user?.displayName ?? "Admin"}</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: COLOR.NEUTRAL[500] }}>{user?.email ?? "—"}</Typography>
          {user ? (
            <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.regular, color: COLOR.BRAND[600] }}>{ROLE_LABELS[user.role]}</Typography>
          ) : null}
        </Stack>
        <Divider />
        <MenuItem onClick={() => void handleLogout()} sx={{ gap: 1, color: COLOR.STATUS.dangerFg }}>
          <LogoutRounded fontSize="small" />
          Đăng xuất
        </MenuItem>
      </Menu>
    </Stack>
  );
};

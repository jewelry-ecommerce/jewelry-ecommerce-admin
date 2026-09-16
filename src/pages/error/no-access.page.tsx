import { LockOutlined } from "@mui/icons-material";
import { Stack, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { ButtonElement } from "@/components/button/button-element.component";
import { WrapperComponent } from "@/components/wrapper/wrapper.component";
import { ROUTE_PATH } from "@/router/route.path";
import { COLOR, STYLE } from "@/theme/design-tokens";

const ICON_SIZE = 32;

const REASON_COPY: Record<string, string> = {
  permission: "Your role does not include this action. Ask an administrator to grant it.",
  route: "Your role does not include this screen. Ask an administrator to grant access to the section.",
};

/** Landing page for a blocked route or action. Reachable by every signed-in role. */
const NoAccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason") ?? "permission";

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: "border-box", minHeight: 0 }}>
      <WrapperComponent label="No access">
        <Stack spacing={1.5} alignItems="center" justifyContent="center" sx={{ flex: 1, textAlign: "center", px: 3 }}>
          <LockOutlined sx={{ fontSize: ICON_SIZE, color: COLOR.NEUTRAL[400] }} />
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xl.bold, color: COLOR.NEUTRAL[900] }}>This area is restricted</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: COLOR.NEUTRAL[500], maxWidth: 460 }}>
            {REASON_COPY[reason] ?? REASON_COPY.permission}
          </Typography>
          <ButtonElement variant="primary" content="Back to dashboard" onClick={() => navigate(ROUTE_PATH.DASHBOARD, { replace: true })} />
        </Stack>
      </WrapperComponent>
    </Stack>
  );
};

export default NoAccessPage;

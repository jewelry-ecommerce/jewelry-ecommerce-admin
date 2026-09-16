import { Stack, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { ButtonElement } from "@/components/button/button-element.component";
import { WrapperComponent } from "@/components/wrapper/wrapper.component";
import { ROUTE_PATH } from "@/router/route.path";
import { COLOR, STYLE } from "@/theme/design-tokens";

/** Catch-all route. Keeps the dashboard shell so navigation stays available. */
const NotFoundPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Stack sx={{ height: `calc(100vh - ${STYLE.HEIGHT_HEADER}px)`, boxSizing: "border-box", minHeight: 0 }}>
      <WrapperComponent label="Không tìm thấy trang">
        <Stack spacing={1.5} alignItems="center" justifyContent="center" sx={{ flex: 1, textAlign: "center", px: 3 }}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES["4xl"].bold, color: COLOR.NEUTRAL[300] }}>404</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.xl.bold, color: COLOR.NEUTRAL[900] }}>Trang bạn tìm không tồn tại</Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: COLOR.NEUTRAL[500], maxWidth: 460, wordBreak: "break-all" }}>
            {pathname}
          </Typography>
          <ButtonElement variant="primary" content="Về trang tổng quan" onClick={() => navigate(ROUTE_PATH.DASHBOARD, { replace: true })} />
        </Stack>
      </WrapperComponent>
    </Stack>
  );
};

export default NotFoundPage;

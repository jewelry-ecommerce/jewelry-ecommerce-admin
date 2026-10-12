import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { authApi } from "@/apis";
import { commonConfig } from "@/common/config/app.config";
import { TYPOGRAPHY_STYLES } from "@/common/constant/typography.constant";
import { getErrorMessage } from "@/common/utils/get-error-message.util";
import { ButtonElement } from "@/components/button/button-element.component";
import { TextInput } from "@/components/form/text-input.component";
import { SnackbarType, useSnackbar } from "@/hooks/use-snackbar.hook";
import { MOCK_ADMIN_CREDENTIAL_HINTS } from "@/mocks/data/admin-user.data";
import { ROLE_LABELS } from "@/permissions/role.constant";
import { setSession } from "@/redux/auth/auth.slice";
import { useAppDispatch } from "@/redux/store.redux";
import { ROUTE_PATH } from "@/router/route.path";
import { COLOR, STYLE } from "@/theme/design-tokens";
import { DEFAULT_LOGIN_FORM_VALUES, loginFormSchema, isPhoneLogin, type LoginFormValues } from "@/pages/auth/login.constant";

const CARD_WIDTH = 420;

/**
 * Sign-in screen.
 *
 * The submit control is intentionally a plain `ButtonElement`: there is no session yet, so the
 * permission context denies everything and a gated button would render disabled. Every action behind
 * the session is gated.
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, setValue } = useForm<LoginFormValues>({
    resolver: yupResolver(loginFormSchema),
    mode: "onSubmit",
    defaultValues: DEFAULT_LOGIN_FORM_VALUES,
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (values) => {
    setLoading(true);
    try {
      const session = await authApi.login({ email: values.email.trim(), password: values.password });
      dispatch(setSession(session));
      showSnackbar({ message: `Welcome back, ${session.user.displayName}.`, type: SnackbarType.SUCCESS });
      navigate(ROUTE_PATH.DASHBOARD, { replace: true });
    } catch (error) {
      showSnackbar({ message: getErrorMessage(error), type: SnackbarType.ERROR });
    } finally {
      setLoading(false);
    }
  };

  const applyDemoAccount = (email: string, password: string) => {
    setValue("email", email);
    setValue("password", password);
  };

  return (
    <Stack alignItems="center" justifyContent="center" sx={{ minHeight: "100vh", p: 3, bgcolor: COLOR.NEUTRAL[100] }}>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: CARD_WIDTH,
          p: 3,
          border: `1px solid ${COLOR.NEUTRAL[200]}`,
          borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT_WRAPPER}px`,
          bgcolor: COLOR.COMMON.white,
        }}
      >
        <Stack spacing={0.5} sx={{ mb: 3 }}>
          <Box
            aria-hidden
            sx={{
              width: 40,
              height: 40,
              mb: 1,
              borderRadius: `${STYLE.BORDER_RADIUS_ELEMENT}px`,
              bgcolor: COLOR.BRAND[500],
              color: COLOR.COMMON.white,
              display: "grid",
              placeItems: "center",
              ...TYPOGRAPHY_STYLES.md.bold,
            }}
          >
            A
          </Box>
          <Typography component="h1" sx={{ ...TYPOGRAPHY_STYLES["2xl"].bold, color: COLOR.NEUTRAL[900] }}>
            {commonConfig.BRAND_NAME} admin
          </Typography>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.base.regular, color: COLOR.NEUTRAL[500] }}>
            Sign in to manage the catalog, orders and content.
          </Typography>
        </Stack>

        <Stack
          component="form"
          noValidate
          spacing={2}
          onSubmit={(event) => {
            void handleSubmit(onSubmit)(event);
          }}
        >
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                requiredMark
                id="login-email"
                label={isPhoneLogin() ? "Số điện thoại" : "Email"}
                type={isPhoneLogin() ? "tel" : "email"}
                autoComplete="username"
                placeholder={isPhoneLogin() ? "Nhập số điện thoại tài khoản ADMIN" : "you@aurelia.test"}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                inputRef={field.ref}
                error={Boolean(fieldState.error)}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                requiredMark
                id="login-password"
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                inputRef={field.ref}
                error={Boolean(fieldState.error)}
                errorMessage={fieldState.error?.message}
              />
            )}
          />

          <ButtonElement type="submit" variant="primary" size="md" loading={loading} content="Sign in" sx={{ width: "100%" }} />
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Stack spacing={1}>
          <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.semiBold, color: COLOR.NEUTRAL[700] }}>Demo accounts</Typography>
          {(isPhoneLogin() ? [] : MOCK_ADMIN_CREDENTIAL_HINTS).map((hint) => (
            <Stack key={hint.email} direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Stack sx={{ minWidth: 0 }}>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.sm.medium, color: COLOR.NEUTRAL[900] }}>{hint.email}</Typography>
                <Typography sx={{ ...TYPOGRAPHY_STYLES.xs.regular, color: COLOR.NEUTRAL[500] }}>{ROLE_LABELS[hint.role]}</Typography>
              </Stack>
              <ButtonElement variant="ghost" size="sm" content="Use" onClick={() => applyDemoAccount(hint.email, hint.password)} />
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default LoginPage;

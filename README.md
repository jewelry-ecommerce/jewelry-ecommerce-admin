# Jewelry Commerce Admin

Back-office console for the jewelry commerce platform. React 19 + Vite + TypeScript, MUI 7 for UI,
Redux Toolkit for cross-route state, SWR for server state, React Hook Form + Yup for forms.

It is the sibling of `jewelry-commerce-client` (the storefront) and shares its visual language: the
design tokens and typography scale in `src/theme` / `src/common/constant` carry the same values as
the storefront constants, so one status chip or one gold accent looks identical in both apps.

## Run it

```bash
npm install
npm run dev          # http://localhost:6100
```

Other scripts:

| Script           | What it does                                     |
| ---------------- | ------------------------------------------------ |
| `npm run lint`   | ESLint (flat config) over `src`                  |
| `npm run check`  | lint + `tsc -b`                                  |
| `npm run build`  | lint + type-check + production bundle            |
| `npm run format` | Prettier over `src`                              |
| `npm run test`   | Vitest (single run); `test:watch` for watch mode  |

Copy `.env.example` to `.env` before the first run. Port 6100 is the default and can be overridden
with `VITE_PORT`.

## Data source switch

`VITE_DATA_SOURCE` decides where every API call lands:

- `MOCK` (default) resolves calls against the in-memory fixtures in `src/mocks`, with
  `VITE_MOCK_LATENCY_MS` of artificial delay so loading and disabled states are exercised.
- `HTTP` sends the identical calls to `VITE_API_BASE_URL`.

Call sites do not know which mode is active, so switching a screen to the real backend needs no
component change.

## No internal design-system packages

This app deliberately does **not** depend on `sevago-sso-fe` or `sevatech-library`, the internal
packages the older admin app imports. Nothing in `package.json`, the Vite chunking rules, or the
source tree references them. Local replacements:

| Internal package provided | Local module                                                                 |
| ------------------------- | ---------------------------------------------------------------------------- |
| `STYLE`, `COLOR`, `OPACITY`, `getLimitLineCss` | `src/theme/design-tokens.ts`                                |
| Palette modes, `Mode`     | `src/theme/theme-mode.ts`                                                    |
| `getTheme` / MUI overrides | `src/theme/theme.utils.ts`                                                  |
| Typography scale          | `src/common/constant/typography.constant.ts`                                 |
| Styled `Stack` / `Typography` primitives | `src/components/styled/`                                      |
| `ButtonElement`, `IconButtonElement` | `src/components/button/button-element.component.tsx`              |
| Tooltip wrapper           | `src/components/tooltip/tooltip-on-hover.component.tsx`                      |

Icons come from `@mui/icons-material` only — no extra icon dependency.

## Demo credentials

While `VITE_DATA_SOURCE=MOCK`, the mock admin sign-in accepts:

```
admin@aurelia.test / admin1234
```

Demo-only fixture data. It is not a real secret, it lives in `src/mocks`, and it grants access to
nothing beyond the local in-memory data.

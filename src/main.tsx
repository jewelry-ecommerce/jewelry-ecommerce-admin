import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { SWRConfig } from "swr";

import App from "@/App";
import { commonConfig } from "@/common/config/app.config";
import { SnackbarProvider } from "@/hooks/snackbar-provider.component";
import { persistor, store } from "@/redux/store.redux";
import "@/styles/app.css";

/** Retry twice, then surface the error: an admin needs to see a failure, not an endless spinner. */
const SWR_ERROR_RETRY_COUNT = 2;

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root is missing from index.html.");

document.title = commonConfig.DOCUMENT_TITLE;

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <SWRConfig value={{ errorRetryCount: SWR_ERROR_RETRY_COUNT, revalidateOnFocus: false }}>
              <SnackbarProvider>
                <App />
              </SnackbarProvider>
            </SWRConfig>
          </LocalizationProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>,
);

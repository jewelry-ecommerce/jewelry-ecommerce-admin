const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

/**
 * Reads `message` off the `{ code, message }` envelope every API / mock rejection carries. Narrowed
 * with `in` rather than a cast, so nothing here relies on an assertion.
 */
const readPayloadMessage = (error: unknown): string | null => {
  if (typeof error !== "object" || error === null || !("message" in error)) return null;
  const { message } = error;
  return typeof message === "string" && message.trim() ? message : null;
};

const readPayloadCode = (error: unknown): string | null => {
  if (typeof error !== "object" || error === null || !("code" in error)) return null;
  const { code } = error;
  return typeof code === "string" && code.trim() ? code : null;
};

/**
 * Resolves a user-facing message from anything thrown by the data layer. Order matters: the typed
 * `{ code, message }` contract wins, then a native `Error`, then a raw string, then the fallback.
 */
export const getErrorMessage = (error: unknown, fallback = FALLBACK_MESSAGE): string => {
  const payloadMessage = readPayloadMessage(error);
  if (payloadMessage) return payloadMessage;
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
};

/** Stable error code for logging and branching. Empty string when the throw carried no code. */
export const getErrorCode = (error: unknown): string => readPayloadCode(error) ?? "";

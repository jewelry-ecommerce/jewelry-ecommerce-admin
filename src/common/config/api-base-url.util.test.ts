import { describe, expect, it } from "vitest";
import { composeApiBaseUrl } from "./api-base-url.util";

describe("composeApiBaseUrl", () => {
  it("joins the origin and versioned prefix", () => {
    expect(composeApiBaseUrl(" http://localhost:8082/ ", "/api/v1/")).toBe("http://localhost:8082/api/v1");
  });
  it("does not duplicate a prefix already included in the URL", () => {
    expect(composeApiBaseUrl("http://localhost:8082/api/v1/", "/api/v1")).toBe("http://localhost:8082/api/v1");
  });
  it("preserves full legacy and mock URLs without a prefix", () => {
    expect(composeApiBaseUrl("http://localhost:3100/api/mock/")).toBe("http://localhost:3100/api/mock");
    expect(composeApiBaseUrl("http://localhost:8082/api/v2", "")).toBe("http://localhost:8082/api/v2");
  });
  it("supports a deployment subpath and a different API version", () => {
    expect(composeApiBaseUrl("https://example.test/shop/", "/api/v2")).toBe("https://example.test/shop/api/v2");
  });
});

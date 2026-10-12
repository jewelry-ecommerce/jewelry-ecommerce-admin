import { beforeEach, expect, test, vi } from "vitest";
const transport = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock("../backend-request", () => ({ backendRequest: transport.request }));
import { javaCollectionList, javaSaveCollection, javaCollectionView } from "./java-collection.api";
import { CollectionStatus } from "@/trading-ui/apis/collection/collection.enum";
const collection = { id: 12, name: "Summer", slug: "summer", status: "PUBLISHED" };
beforeEach(() => {
  transport.request.mockReset();
  transport.request.mockImplementation(async (path: string, method?: string, body?: object) =>
    path.includes("/products?") ? { list: [], pagination: { hasNextPage: false } } :
    method === "POST" ? { ...collection, ...body } : [collection]);
});
test("published collections appear as active in the original UI and label picker", async () => {
  expect(javaCollectionView(collection).status).toBe(CollectionStatus.ACTIVE);
  expect((await javaCollectionList({ status: CollectionStatus.ACTIVE, isPagination: false })).list).toHaveLength(1);
});
test("create active collection sends PUBLISHED to Java, not ACTIVE", async () => {
  await javaSaveCollection({ name: "Summer", status: CollectionStatus.ACTIVE });
  expect(transport.request.mock.calls.find(call => call[1] === "POST")?.[2]).toMatchObject({ status: "PUBLISHED" });
});

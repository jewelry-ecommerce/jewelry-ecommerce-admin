import { expect, test } from "vitest";
import { unwrapJava, normalizeJavaPage, javaEnvelopeFailure } from "./java-envelope";
test("business errors inside HTTP success expose code/status/message",()=>{
  expect(javaEnvelopeFailure({status:404,message:"Không tìm thấy",errors:[{code:"NOT_FOUND"}]}))
    .toEqual({status:404,message:"Không tìm thấy",code:"NOT_FOUND"});
  expect(javaEnvelopeFailure({status:200,data:{id:12}})).toBeUndefined();
});
test("unwrap success and keep Java business errors intact", () => {
  expect(unwrapJava({ status: 200, data: { id: 12 } })).toEqual({ id: 12 });
  const failure = { status: 422, data: null, code: "OUT_OF_STOCK", message: "Hết hàng" };
  expect(unwrapJava(failure)).toBe(failure);
});
test("normalize Spring page", () => {
  expect(normalizeJavaPage({ content: [{ id: 1 }], page: 2, size: 20, totalElements: 45, totalPages: 3 }))
    .toMatchObject({ list: [{ id: 1 }], total: 45, pagination: { currentPage: 2, take: 20, hasNextPage: true } });
});
test("normalize badge/banner/customer-request page without losing counts", () => {
  expect(normalizeJavaPage({ items: [{ id: 2 }], total: 21, page: 1, take: 20, counts: { active: 5 } }))
    .toMatchObject({ list: [{ id: 2 }], total: 21, counts: { active: 5 }, pagination: { page: 1, hasNextPage: true } });
});
test("flat array responses remain arrays, not fabricated pages", () => {
  const input = [{ id: 4 }];
  expect(normalizeJavaPage(input)).toBe(input);
});

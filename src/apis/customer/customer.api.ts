import type { Customer, CustomerDetail, CustomerListQuery, CustomerRow } from "@/apis/customer/customer.interface";
import type { Paginated } from "@/apis/product/product.interface";
import { apiRequest } from "@/apis/transport";
import { CUSTOMERS, findCustomerById, findLoyaltyByCustomerId } from "@/mocks/data/customer.data";
import { ORDERS } from "@/mocks/data/order.data";
import { cloneDeep, matchesSearch, MockApiError, normalizeSearch, paginate, withLatency } from "@/mocks/mock-transport";

const toCustomerRow = (customer: Customer): CustomerRow => ({
  id: customer.id,
  code: customer.code,
  fullName: customer.fullName,
  email: customer.email,
  phone: customer.phone,
  avatar: customer.avatar,
  tier: customer.tier,
  pointBalance: findLoyaltyByCustomerId(customer.id)?.pointBalance ?? 0,
  orderCount: customer.orderCount,
  lifetimeValue: customer.lifetimeValue,
  createdAt: customer.createdAt,
});

const requireCustomer = (customerId: string): Customer => {
  const customer = findCustomerById(customerId);
  if (!customer) throw new MockApiError("CUSTOMER_NOT_FOUND", `No customer matches the id ${customerId}.`, 404);
  return customer;
};

/** GET admin/customers */
export const getCustomerList = (query: CustomerListQuery = {}): Promise<Paginated<CustomerRow>> =>
  apiRequest({
    method: "GET",
    path: "admin/customers",
    query: { ...query },
    mock: () =>
      withLatency(() => {
        const search = normalizeSearch(query.search);
        const matched = CUSTOMERS.filter((customer) => {
          if (query.tier && customer.tier !== query.tier) return false;
          return matchesSearch([customer.fullName, customer.code, customer.email, customer.phone], search);
        });
        const page = paginate(matched, query.page ?? 1, query.take ?? 20);
        return { ...page, list: page.list.map(toCustomerRow) };
      }),
  });

/** GET admin/customers/{customerId} */
export const getCustomerDetail = (customerId: string): Promise<CustomerDetail> =>
  apiRequest({
    method: "GET",
    path: `admin/customers/${encodeURIComponent(customerId)}`,
    mock: () =>
      withLatency(() => {
        const customer = requireCustomer(customerId);
        return {
          customer: cloneDeep(customer),
          loyalty: cloneDeep(findLoyaltyByCustomerId(customerId) ?? null),
          recentOrderCodes: ORDERS.filter((order) => order.customerId === customerId)
            .sort((left, right) => right.placedAt.localeCompare(left.placedAt))
            .slice(0, 10)
            .map((order) => order.code),
        };
      }),
  });

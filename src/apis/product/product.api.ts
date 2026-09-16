import type {
  AdminProductListQuery,
  AdminProductRow,
  Attribute,
  AttributePayload,
  Category,
  CategoryPayload,
  Collection,
  CollectionPayload,
  JewelryDescriptorRow,
  JewelryGemstone,
  JewelryMaterial,
  Paginated,
  Product,
  ProductPayload,
  ProductVariant,
  StockStatus,
} from "@/apis/product/product.interface";
import { apiRequest } from "@/apis/transport";
import {
  ALL_VARIANTS,
  ATTRIBUTES,
  CATEGORIES,
  COLLECTIONS,
  findProductById,
  GEMSTONE_LABELS,
  MATERIAL_LABELS,
  PRODUCTS,
} from "@/mocks/data/catalog.data";
import { cloneDeep, matchesSearch, MockApiError, normalizeSearch, paginate, withLatency } from "@/mocks/mock-transport";

const PRIMARY_MEDIA_FALLBACK = "";

const resolvePrimaryImage = (product: Product): string =>
  product.media.find((asset) => asset.isPrimary)?.url ?? product.media[0]?.url ?? PRIMARY_MEDIA_FALLBACK;

const resolveRollupStockStatus = (product: Product): StockStatus => {
  if (product.preOrder) return "PRE_ORDER";
  const total = product.variants.reduce((sum, variant) => sum + variant.availableStock, 0);
  if (total <= 0) return "OUT_OF_STOCK";
  return total <= product.variants.length * 2 ? "LOW_STOCK" : "IN_STOCK";
};

const toAdminProductRow = (product: Product): AdminProductRow => ({
  id: product.id,
  code: product.code,
  name: product.name,
  slug: product.slug,
  image: resolvePrimaryImage(product),
  status: product.status,
  categoryName: product.category.name,
  categorySlug: product.category.slug,
  collectionNames: product.collections.map((collection) => collection.name),
  occasion: product.occasion,
  variantCount: product.variants.length,
  priceFrom: product.priceFrom,
  compareAtPrice: product.compareAtPrice,
  totalAvailableStock: product.variants.reduce((sum, variant) => sum + variant.availableStock, 0),
  stockStatus: resolveRollupStockStatus(product),
  createdAt: product.createdAt,
  publishedAt: product.publishedAt,
});

const sortProducts = (rows: Product[], sort: AdminProductListQuery["sort"]): Product[] => {
  const sorted = [...rows];
  switch (sort) {
    case "NEWEST":
      return sorted.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    case "PRICE_ASC":
      return sorted.sort((left, right) => left.priceFrom - right.priceFrom);
    case "PRICE_DESC":
      return sorted.sort((left, right) => right.priceFrom - left.priceFrom);
    case "RATING_DESC":
      return sorted.sort((left, right) => right.ratingAverage - left.ratingAverage);
    default:
      return sorted;
  }
};

const filterProducts = (query: AdminProductListQuery): Product[] => {
  const search = normalizeSearch(query.search);

  return PRODUCTS.filter((product) => {
    if (query.status && product.status !== query.status) return false;
    if (query.categorySlug && product.category.slug !== query.categorySlug) return false;
    if (query.collectionSlug && !product.collections.some((collection) => collection.slug === query.collectionSlug)) return false;
    if (query.material && !product.variants.some((variant) => variant.material === query.material)) return false;
    if (query.gemstone && !product.variants.some((variant) => variant.gemstone === query.gemstone)) return false;
    return matchesSearch([product.name, product.code, product.slug, ...product.variants.map((variant) => variant.skuCode)], search);
  });
};

const requireProduct = (productId: string): Product => {
  const product = findProductById(productId);
  if (!product) throw new MockApiError("PRODUCT_NOT_FOUND", `No product matches the id ${productId}.`, 404);
  return product;
};

const nextSequence = (prefix: string, existing: string[]): string => {
  const highest = existing.reduce((max, value) => {
    const parsed = Number(value.replace(/\D+/g, ""));
    return Number.isFinite(parsed) && parsed > max ? parsed : max;
  }, 0);
  return `${prefix}${String(highest + 1).padStart(4, "0")}`;
};

/** GET admin/catalog/products */
export const getProductList = (query: AdminProductListQuery = {}): Promise<Paginated<AdminProductRow>> =>
  apiRequest({
    method: "GET",
    path: "admin/catalog/products",
    query: { ...query },
    mock: () =>
      withLatency(() => {
        const filtered = sortProducts(filterProducts(query), query.sort);
        const page = paginate(filtered, query.page ?? 1, query.take ?? 20);
        return { ...page, list: page.list.map(toAdminProductRow) };
      }),
  });

/** GET admin/catalog/products/{productId} */
export const getProductDetail = (productId: string): Promise<Product> =>
  apiRequest({
    method: "GET",
    path: `admin/catalog/products/${encodeURIComponent(productId)}`,
    mock: () => withLatency(() => cloneDeep(requireProduct(productId))),
  });

/** POST admin/catalog/products */
export const createProduct = (payload: ProductPayload): Promise<Product> =>
  apiRequest({
    method: "POST",
    path: "admin/catalog/products",
    body: payload,
    mock: () =>
      withLatency(() => {
        if (PRODUCTS.some((product) => product.code === payload.code)) {
          throw new MockApiError("PRODUCT_CODE_TAKEN", `Product code ${payload.code} already exists.`, 409);
        }
        const category = CATEGORIES.find((entry) => entry.id === payload.categoryId);
        if (!category) throw new MockApiError("CATEGORY_NOT_FOUND", `No category matches the id ${payload.categoryId}.`, 404);

        const productId = `prd-${payload.slug}`;
        const createdAt = new Date().toISOString();
        const variants: ProductVariant[] = payload.variants.map((variant, index) => ({
          id: `${productId}-v${index + 1}`,
          skuCode: variant.skuCode,
          productId,
          name: `${payload.name} — ${variant.skuCode}`,
          status: variant.status,
          material: variant.material,
          gemstone: variant.gemstone,
          caratWeight: variant.caratWeight,
          sizeLabel: variant.sizeLabel,
          metalColorLabel: MATERIAL_LABELS[variant.material],
          listPrice: variant.listPrice,
          salePrice: variant.salePrice,
          weightGram: variant.weightGram,
          media: [],
          stockStatus: "OUT_OF_STOCK",
          availableStock: 0,
          isDefault: index === 0,
        }));

        const created: Product = {
          id: productId,
          code: payload.code,
          name: payload.name,
          slug: payload.slug,
          shortDescription: payload.shortDescription,
          description: payload.description,
          status: payload.status,
          category: { id: category.id, name: category.name, slug: category.slug },
          collections: COLLECTIONS.filter((collection) => payload.collectionIds.includes(collection.id)).map((collection) => ({
            id: collection.id,
            name: collection.name,
            slug: collection.slug,
          })),
          brandName: PRODUCTS[0]?.brandName ?? "Aurelia Fine Jewelry",
          occasion: payload.occasion,
          media: [],
          variants,
          priceFrom: variants.reduce((lowest, variant) => Math.min(lowest, variant.salePrice), variants[0]?.salePrice ?? 0),
          compareAtPrice: null,
          ratingAverage: 0,
          ratingCount: 0,
          badges: payload.badges,
          preOrder: null,
          seo: payload.seo,
          createdAt,
          publishedAt: payload.status === "PUBLISHED" ? createdAt : null,
        };

        PRODUCTS.push(created);
        ALL_VARIANTS.push(...variants);
        return cloneDeep(created);
      }),
  });

/** PUT admin/catalog/products/{productId} */
export const updateProduct = (productId: string, payload: ProductPayload): Promise<Product> =>
  apiRequest({
    method: "PUT",
    path: `admin/catalog/products/${encodeURIComponent(productId)}`,
    body: payload,
    mock: () =>
      withLatency(() => {
        const product = requireProduct(productId);
        const category = CATEGORIES.find((entry) => entry.id === payload.categoryId) ?? null;

        product.name = payload.name;
        product.slug = payload.slug;
        product.shortDescription = payload.shortDescription;
        product.description = payload.description;
        product.status = payload.status;
        product.occasion = payload.occasion;
        product.badges = payload.badges;
        product.seo = payload.seo;
        if (category) product.category = { id: category.id, name: category.name, slug: category.slug };
        product.collections = COLLECTIONS.filter((collection) => payload.collectionIds.includes(collection.id)).map((collection) => ({
          id: collection.id,
          name: collection.name,
          slug: collection.slug,
        }));
        if (payload.status === "PUBLISHED" && !product.publishedAt) product.publishedAt = new Date().toISOString();

        return cloneDeep(product);
      }),
  });

/** PATCH admin/catalog/products/{productId}/archive */
export const archiveProduct = (productId: string): Promise<Product> =>
  apiRequest({
    method: "PATCH",
    path: `admin/catalog/products/${encodeURIComponent(productId)}/archive`,
    mock: () =>
      withLatency(() => {
        const product = requireProduct(productId);
        product.status = "ARCHIVED";
        product.publishedAt = null;
        return cloneDeep(product);
      }),
  });

/** GET admin/catalog/products/{productId}/variants */
export const getProductVariants = (productId: string): Promise<ProductVariant[]> =>
  apiRequest({
    method: "GET",
    path: `admin/catalog/products/${encodeURIComponent(productId)}/variants`,
    mock: () => withLatency(() => cloneDeep(requireProduct(productId).variants)),
  });

/** GET admin/catalog/variants */
export const getVariantList = (search?: string): Promise<ProductVariant[]> =>
  apiRequest({
    method: "GET",
    path: "admin/catalog/variants",
    query: { search },
    mock: () =>
      withLatency(() => {
        const needle = normalizeSearch(search);
        return cloneDeep(ALL_VARIANTS.filter((variant) => matchesSearch([variant.skuCode, variant.name], needle)));
      }),
  });

/** GET admin/catalog/categories */
export const getCategoryList = (): Promise<Category[]> =>
  apiRequest({
    method: "GET",
    path: "admin/catalog/categories",
    mock: () => withLatency(() => cloneDeep(CATEGORIES)),
  });

/** POST admin/catalog/categories */
export const createCategory = (payload: CategoryPayload): Promise<Category> =>
  apiRequest({
    method: "POST",
    path: "admin/catalog/categories",
    body: payload,
    mock: () =>
      withLatency(() => {
        if (CATEGORIES.some((category) => category.slug === payload.slug)) {
          throw new MockApiError("CATEGORY_SLUG_TAKEN", `Category slug ${payload.slug} already exists.`, 409);
        }
        const created: Category = {
          id: nextSequence(
            "cat-",
            CATEGORIES.map((category) => category.id),
          ),
          name: payload.name,
          slug: payload.slug,
          parentId: payload.parentId,
          description: payload.description,
          image: "",
          productCount: 0,
          sortOrder: payload.sortOrder,
        };
        CATEGORIES.push(created);
        return cloneDeep(created);
      }),
  });

/** PUT admin/catalog/categories/{categoryId} */
export const updateCategory = (categoryId: string, payload: CategoryPayload): Promise<Category> =>
  apiRequest({
    method: "PUT",
    path: `admin/catalog/categories/${encodeURIComponent(categoryId)}`,
    body: payload,
    mock: () =>
      withLatency(() => {
        const category = CATEGORIES.find((entry) => entry.id === categoryId);
        if (!category) throw new MockApiError("CATEGORY_NOT_FOUND", `No category matches the id ${categoryId}.`, 404);
        Object.assign(category, {
          name: payload.name,
          slug: payload.slug,
          parentId: payload.parentId,
          description: payload.description,
          sortOrder: payload.sortOrder,
        });
        return cloneDeep(category);
      }),
  });

/** GET admin/catalog/collections */
export const getCollectionList = (): Promise<Collection[]> =>
  apiRequest({
    method: "GET",
    path: "admin/catalog/collections",
    mock: () => withLatency(() => cloneDeep(COLLECTIONS)),
  });

/** POST admin/catalog/collections */
export const createCollection = (payload: CollectionPayload): Promise<Collection> =>
  apiRequest({
    method: "POST",
    path: "admin/catalog/collections",
    body: payload,
    mock: () =>
      withLatency(() => {
        if (COLLECTIONS.some((collection) => collection.slug === payload.slug)) {
          throw new MockApiError("COLLECTION_SLUG_TAKEN", `Collection slug ${payload.slug} already exists.`, 409);
        }
        const created: Collection = {
          id: nextSequence(
            "col-",
            COLLECTIONS.map((collection) => collection.id),
          ),
          name: payload.name,
          slug: payload.slug,
          description: payload.description,
          heroImage: "",
          productIds: payload.productIds,
          status: payload.status,
        };
        COLLECTIONS.push(created);
        return cloneDeep(created);
      }),
  });

/** PUT admin/catalog/collections/{collectionId} */
export const updateCollection = (collectionId: string, payload: CollectionPayload): Promise<Collection> =>
  apiRequest({
    method: "PUT",
    path: `admin/catalog/collections/${encodeURIComponent(collectionId)}`,
    body: payload,
    mock: () =>
      withLatency(() => {
        const collection = COLLECTIONS.find((entry) => entry.id === collectionId);
        if (!collection) throw new MockApiError("COLLECTION_NOT_FOUND", `No collection matches the id ${collectionId}.`, 404);
        Object.assign(collection, {
          name: payload.name,
          slug: payload.slug,
          description: payload.description,
          status: payload.status,
          productIds: payload.productIds,
        });
        return cloneDeep(collection);
      }),
  });

/** GET admin/catalog/attributes */
export const getAttributeList = (): Promise<Attribute[]> =>
  apiRequest({
    method: "GET",
    path: "admin/catalog/attributes",
    mock: () => withLatency(() => cloneDeep(ATTRIBUTES)),
  });

/** POST admin/catalog/attributes */
export const createAttribute = (payload: AttributePayload): Promise<Attribute> =>
  apiRequest({
    method: "POST",
    path: "admin/catalog/attributes",
    body: payload,
    mock: () =>
      withLatency(() => {
        if (ATTRIBUTES.some((attribute) => attribute.code === payload.code)) {
          throw new MockApiError("ATTRIBUTE_CODE_TAKEN", `Attribute code ${payload.code} already exists.`, 409);
        }
        const created: Attribute = {
          id: nextSequence(
            "attr-",
            ATTRIBUTES.map((attribute) => attribute.id),
          ),
          code: payload.code,
          name: payload.name,
          displayType: payload.displayType,
          values: payload.values,
        };
        ATTRIBUTES.push(created);
        return cloneDeep(created);
      }),
  });

/** PUT admin/catalog/attributes/{attributeId} */
export const updateAttribute = (attributeId: string, payload: AttributePayload): Promise<Attribute> =>
  apiRequest({
    method: "PUT",
    path: `admin/catalog/attributes/${encodeURIComponent(attributeId)}`,
    body: payload,
    mock: () =>
      withLatency(() => {
        const attribute = ATTRIBUTES.find((entry) => entry.id === attributeId);
        if (!attribute) throw new MockApiError("ATTRIBUTE_NOT_FOUND", `No attribute matches the id ${attributeId}.`, 404);
        Object.assign(attribute, { name: payload.name, displayType: payload.displayType, values: payload.values });
        return cloneDeep(attribute);
      }),
  });

/** GET admin/catalog/materials */
export const getMaterialList = (): Promise<JewelryDescriptorRow<JewelryMaterial>[]> =>
  apiRequest({
    method: "GET",
    path: "admin/catalog/materials",
    mock: () =>
      withLatency(() =>
        (Object.keys(MATERIAL_LABELS) as JewelryMaterial[]).map((code) => ({
          code,
          label: MATERIAL_LABELS[code],
          variantCount: ALL_VARIANTS.filter((variant) => variant.material === code).length,
        })),
      ),
  });

/** GET admin/catalog/gemstones */
export const getGemstoneList = (): Promise<JewelryDescriptorRow<JewelryGemstone>[]> =>
  apiRequest({
    method: "GET",
    path: "admin/catalog/gemstones",
    mock: () =>
      withLatency(() =>
        (Object.keys(GEMSTONE_LABELS) as JewelryGemstone[]).map((code) => ({
          code,
          label: GEMSTONE_LABELS[code],
          variantCount: ALL_VARIANTS.filter((variant) => variant.gemstone === code).length,
        })),
      ),
  });

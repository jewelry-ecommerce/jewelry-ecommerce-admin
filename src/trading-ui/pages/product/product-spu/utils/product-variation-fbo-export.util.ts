import { getImportExportTopicConfigs, getImportExportWorkerQueueProfiles, postImportExportTopicConfig } from '../../../../apis/import-export/import-export.api';
import { TopicAction } from '../../../../apis/import-export/import-export.enum';

export const PIM_WORKER_CODE = 'pim-worker';
export const PRODUCT_VARIATION_FBO_EXPORT_ROUTING_KEY = 'export.product.variation';
export const PRODUCT_VARIATION_FBO_EXPORT_BULK_SIZE = 100;

/** Topic seed — worker giữ cố định cột Fast FBO Danh mục vật tư. */
export const PRODUCT_VARIATION_FBO_EXPORT_COLUMN_MAPPING: Record<string, string> = {
  'Mã vật tư': 'Mã vật tư',
  'Tên vật tư': 'Tên vật tư',
  'Tên khác': 'Tên khác',
  'Đơn vị tính': 'Đơn vị tính',
  'Nhiều đvt': 'Nhiều đvt',
  'Bán hàng theo đvt': 'Bán hàng theo đvt',
  'Theo dõi tồn kho': 'Theo dõi tồn kho',
  'Theo dõi lô': 'Theo dõi lô',
  'Theo dõi kiểm kê': 'Theo dõi kiểm kê',
  'Cách tính giá tồn kho': 'Cách tính giá tồn kho',
  'Loại vật tư': 'Loại vật tư',
  'Nhóm vật tư 1': 'Nhóm vật tư 1',
  'Nhóm vật tư 2': 'Nhóm vật tư 2',
  'Nhóm vật tư 3': 'Nhóm vật tư 3',
  'Nhóm giá': 'Nhóm giá',
  'Mã kho': 'Mã kho',
  'Mã vị trí': 'Mã vị trí',
  'Thuế giá trị gia tăng': 'Thuế giá trị gia tăng',
  'Thuế nhập khẩu': 'Thuế nhập khẩu',
  'Tk vật tư': 'Tk vật tư',
  'Sửa tk vật tư': 'Sửa tk vật tư',
  'Tk giá vốn': 'Tk giá vốn',
  'Tk doanh thu': 'Tk doanh thu',
  'Tk doanh thu nội bộ': 'Tk doanh thu nội bộ',
  'Tk hàng bán trả lại': 'Tk hàng bán trả lại',
  'Tk đại lý': 'Tk đại lý',
  'Tk sản phẩm dở dang': 'Tk sản phẩm dở dang',
  'Tk chênh lệch giá vốn': 'Tk chênh lệch giá vốn',
  'Tk chiết khấu': 'Tk chiết khấu',
  'Tk chi phí khuyến mãi': 'Tk chi phí khuyến mãi',
  'Kiểu lô': 'Kiểu lô',
  'Cách xuất': 'Cách xuất',
  'Vòng đời sp (số ngày)': 'Vòng đời sp (số ngày)',
  'TG bảo hành (số ngày)': 'TG bảo hành (số ngày)',
  'Cho phép tạo lô ngay khi nhập': 'Cho phép tạo lô ngay khi nhập',
  'Số lượng tồn tối thiểu': 'Số lượng tồn tối thiểu',
  'Số lượng tồn tối đa': 'Số lượng tồn tối đa',
  'Thể tích': 'Thể tích',
  'Khối lượng': 'Khối lượng',
  'Phân loại tài sản': 'Phân loại tài sản',
  'Phân loại công cụ': 'Phân loại công cụ',
};

export const PRODUCT_VARIATION_FBO_EXPORT_FILTER_FIELDS = [
  'categoryUuid',
  'brandId',
  'seasonUuid',
  'collectionUuid',
  'hasPendingApproval',
  'status',
  'createdById',
  'timeFilter',
  'timeFrom',
  'timeTo',
  'minPrice',
  'maxPrice',
  'search',
  'productIds',
  'page',
  'take',
  'isPagination',
  'orderBy',
  'orderType',
] as const;

export const resolveProductVariationFboExportTopicConfigId = async (): Promise<string> => {
  const profiles = await getImportExportWorkerQueueProfiles();
  const pimWorkerProfile = profiles.find((profile) => profile.workerCode === PIM_WORKER_CODE && profile.action === TopicAction.EXPORT);

  if (!pimWorkerProfile?.id) {
    throw new Error('Không tìm thấy cấu hình worker export sản phẩm (pim-worker).');
  }

  const topicConfigs = await getImportExportTopicConfigs();
  const existingConfig = topicConfigs.find((config) => config.routingKey === PRODUCT_VARIATION_FBO_EXPORT_ROUTING_KEY && config.workerQueueProfile?.id === pimWorkerProfile.id);

  if (existingConfig?.id) {
    return existingConfig.id;
  }

  const createdConfig = await postImportExportTopicConfig({
    workerQueueProfileId: pimWorkerProfile.id,
    routingKey: PRODUCT_VARIATION_FBO_EXPORT_ROUTING_KEY,
    columnMapping: PRODUCT_VARIATION_FBO_EXPORT_COLUMN_MAPPING,
    filterFields: [...PRODUCT_VARIATION_FBO_EXPORT_FILTER_FIELDS],
    bulkSize: PRODUCT_VARIATION_FBO_EXPORT_BULK_SIZE,
  });

  return createdConfig.id;
};

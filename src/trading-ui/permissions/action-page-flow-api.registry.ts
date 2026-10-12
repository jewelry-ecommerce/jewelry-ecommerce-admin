/**
 * API phụ thuộc luồng trang (page flow) — bổ sung ngoài apiCode gắn trực tiếp trên nút.
 * Generator `generate-action-api-mapping.ts` merge vào `ACTION_API_MAPPING`.
 *
 * Quy tắc: action mở màn / thao tác nhiều bước → gắn đủ API mà màn đó gọi (discover, lookup, fee, …).
 */

/** Tạo / clone đơn OMS — `use-order-draft-form-page` + voucher + địa chỉ. */
export const ORDER_DRAFT_FORM_FLOW_API_CODES = [
  'api_order_create',
  'api_order_products',
  'api_order_product_detail',
  'api_order_product_variations',
  'api_order_customers_by_phone',
  'api_order_services_with_leadtime',
  'api_order_fee_calculate',
  'api_iam_location_provinces',
  'api_iam_location_wards',
  'api_promotion_voucher_discover',
  'api_promotion_voucher_validate',
] as const;

/** Sửa đơn OMS — không gọi discover voucher / lookup khách theo SĐT. */
export const ORDER_DRAFT_FORM_EDIT_FLOW_API_CODES = [
  'api_order_create',
  'api_order_products',
  'api_order_product_detail',
  'api_order_product_variations',
  'api_order_fee_calculate',
  'api_iam_location_provinces',
  'api_iam_location_wards',
] as const;

/** Chi tiết đơn — `use-order-detail`. */
export const ORDER_DETAIL_FLOW_API_CODES = [
  'api_order_detail',
  'api_order_ship',
  'api_order_check_paid',
  'api_order_cancel',
  'api_order_payment_status',
  'api_order_retry_payment',
  'api_order_confirm_payment',
  'api_order_product_detail',
  'api_refund_proposal_create',
] as const;

/** Danh sách đơn — `use-order-data-page` + filter tỉnh. Sync GHN gắn riêng `order.list.sync_shipment`. */
export const ORDER_LIST_FLOW_API_CODES = [
  'api_order_list',
  'api_order_guest_list',
  'api_iam_location_provinces',
  'api_order_recall',
  'api_order_cancel',
  'api_order_export',
  'api_importexport_get_worker_queue_profiles',
  'api_importexport_get_topic_configs',
  'api_importexport_post_topic_configs',
  'api_ie_job_status',
] as const;

/** Export đổi trả — IE job + resolve topic (giống `ORDER_LIST_FLOW` export). */
export const ORDER_RETURN_EXPORT_FLOW_API_CODES = [
  'api_order_return_export',
  'api_importexport_get_worker_queue_profiles',
  'api_importexport_get_topic_configs',
  'api_importexport_post_topic_configs',
  'api_ie_job_status',
] as const;

/** Export hoàn tiền — IE job + resolve topic. */
export const ORDER_REFUND_EXPORT_FLOW_API_CODES = [
  'api_refund_proposal_export',
  'api_importexport_get_worker_queue_profiles',
  'api_importexport_get_topic_configs',
  'api_importexport_post_topic_configs',
  'api_ie_job_status',
] as const;

/** Export hóa đơn — IE job + resolve topic. */
export const ORDER_INVOICE_EXPORT_FLOW_API_CODES = [
  'api_invoice_export',
  'api_importexport_get_worker_queue_profiles',
  'api_importexport_get_topic_configs',
  'api_importexport_post_topic_configs',
  'api_ie_job_status',
] as const;

/** Export vận đơn — IE job + resolve topic (shipping-worker). */
export const SHIPMENT_EXPORT_FLOW_API_CODES = [
  'api_shipment_export',
  'api_importexport_get_worker_queue_profiles',
  'api_importexport_get_topic_configs',
  'api_importexport_post_topic_configs',
  'api_ie_job_status',
] as const;

/** Form đổi trả — màn returns-exchanges. Sync GHN gắn riêng `order.returns.sync_shipment`. */
export const ORDER_RETURN_FORM_FLOW_API_CODES = [
  'api_order_return_create',
  'api_order_return_update',
  'api_order_return_detail',
  'api_order_return_list',
  'api_order_products',
  'api_order_fee_calculate',
  'api_order_detail',
  'api_order_cancel',
  'api_iam_location_provinces',
  'api_iam_location_wards',
] as const;

/** Form tạo/sửa SPU — category tree, attribute tree, SKU matrix, upload ảnh, brand. */
export const PRODUCT_SPU_FORM_FLOW_API_CODES = [
  'api_category_tree',
  'api_attribute_tree',
  'api_product_sku_matrix_preview',
  'api_product_sku_search',
  'api_file_media_upload',
  'api_product_packaging_relations',
  'api_brand_list',
  'api_ie_job_status',
  'api_product_audit_logs',
] as const;

/** Chi tiết SPU + lifecycle (publish, archive, duyệt). */
export const PRODUCT_SPU_DETAIL_FLOW_API_CODES = [
  'api_product_detail',
  'api_attribute_tree',
  'api_product_sku_search',
  'api_product_status_patch',
  'api_product_approval_cancel',
  'api_product_audit_logs',
  'api_product_packaging_relations',
  'api_file_media_upload',
  'api_ie_job_status',
  'api_product_list',
] as const;

/** Danh sách SPU + bulk actions + import/export inline. */
export const PRODUCT_SPU_LIST_FLOW_API_CODES = [
  'api_product_list',
  'api_category_tree',
  'api_product_status_patch',
  'api_product_approval_review',
  'api_product_approval_cancel',
  'api_product_submit',
  'api_product_cost_export',
  'api_product_import',
  'api_ie_topic_configs',
  'api_ie_jobs_list',
  'api_ie_job_status',
] as const;

/** Import/export & task manager (export / task_manager actions). */
export const PRODUCT_SPU_IE_FLOW_API_CODES = ['api_product_cost_export', 'api_product_import', 'api_ie_topic_configs', 'api_ie_jobs_list', 'api_ie_job_status'] as const;

/** Import Excel SKU chiến dịch đặt trước (IE `import.badge.sku` + apply result-rows). */
export const PRE_ORDER_CAMPAIGN_IE_FLOW_API_CODES = [
  'api_product_import',
  'api_ie_topic_configs',
  'api_ie_jobs_list',
  'api_ie_job_status',
  'api_ie_job_result_rows',
  'api_ie_jobs_reference_transfer',
] as const;

export const PRODUCT_ATTRIBUTE_FORM_FLOW_API_CODES = ['api_file_media_upload'] as const;

export const PRODUCT_CATEGORY_FLOW_API_CODES = ['api_category_tree', 'api_category_detail', 'api_attribute_list', 'api_category_create', 'api_category_update', 'api_category_delete'] as const;

export const PRODUCT_COLLECTION_LIST_FLOW_API_CODES = ['api_collection_create', 'api_collection_delete', 'api_collection_update_products', 'api_product_list', 'api_brand_list'] as const;

export const PRODUCT_COLLECTION_FORM_FLOW_API_CODES = ['api_collection_detail', 'api_collection_update_products', 'api_product_list'] as const;

export const PRODUCT_BRAND_FLOW_API_CODES = ['api_brand_list', 'api_brand_create', 'api_brand_delete', 'api_brand_update'] as const;

/** Wizard CMS — `use-cms-page-wizard` + banner placement builder. */
export const CMS_PAGE_WIZARD_FLOW_API_CODES = [
  'api_cms_page_list',
  'api_cms_page_detail',
  'api_cms_page_create',
  'api_cms_page_update',
  'api_cms_page_delete',
  'api_cms_page_restore',
  'api_cms_page_overwrite',
  'api_cms_block_type_list',
  'api_cms_block_type_create',
  'api_cms_layout_create',
  'api_cms_layout_update',
  'api_cms_layout_detail',
  'api_cms_layout_version_create',
  'api_cms_layout_version_detail',
  'api_cms_layout_version_publish',
  'api_cms_version_block_create',
  'api_cms_version_block_update',
  'api_cms_version_block_bulk_sort',
  'api_cms_version_block_delete',
  'api_banner_list',
  'api_banner_placement_list',
  'api_banner_placement_create',
  'api_banner_create_slot',
  'api_banner_update_slot',
  'api_banner_placement_layout_list',
  'api_banner_placement_layout_detail',
  'api_banner_placement_layout_create',
  'api_banner_placement_layout_item_patch',
  'api_file_media_upload',
  'api_product_list',
  'api_category_tree',
  'api_collection_list',
  'api_banner_create',
  'api_banner_update',
  'api_banner_delete',
] as const;

export const CONTENT_LABEL_LIST_FLOW_API_CODES = [
  'api_badge_get_admin_badges',
  'api_badge_get_admin_badges_id',
  'api_badge_post_admin_badges',
  'api_badge_patch_admin_badges_id',
  'api_badge_patch_admin_badges_id_status',
  'api_badge_delete_admin_badges_id',
  'api_badge_get_admin_badge_flows',
  'api_file_media_upload',
] as const;

export const CONTENT_LABEL_DISPLAY_FLOW_API_CODES = [
  'api_badge_get_admin_badge_flows',
  'api_badge_get_admin_badge_flows_id',
  'api_badge_post_admin_badge_flows',
  'api_badge_patch_admin_badge_flows_id',
  'api_badge_patch_admin_badge_flows_id_activate',
  'api_badge_patch_admin_badge_flows_id_deactivate',
  'api_badge_delete_admin_badge_flows_id',
  'api_badge_get_admin_badges',
  'api_category_tree',
  'api_ie_topic_configs',
  'api_ie_jobs_list',
  'api_product_sku_search',
] as const;

export const CONTENT_BANNER_SETTINGS_FLOW_API_CODES = ['api_banner_list', 'api_banner_create', 'api_banner_update', 'api_banner_delete', 'api_category_tree', 'api_file_media_upload'] as const;

export const CONTENT_NAVIGATION_FLOW_API_CODES = [
  'api_cms_get_admin_navigations',
  'api_cms_get_admin_navigations_id',
  'api_cms_post_admin_navigations',
  'api_cms_navigation_list',
  'api_cms_navigation_update',
  'api_cms_patch_admin_navigations_id_archive',
  'api_cms_navigation_publish',
  'api_cms_page_list',
  'api_category_tree',
  'api_file_media_upload',
] as const;

export const CONTENT_SEARCH_PINNED_FLOW_API_CODES = [
  'api_product_search_pinned_list',
  'api_pim_get_admin_search_pinned_products',
  'api_product_search_pinned_create',
  'api_pim_post_admin_search_pinned_products',
  'api_product_search_pinned_update',
  'api_pim_patch_admin_search_pinned_products_uuid',
  'api_product_search_pinned_delete',
  'api_pim_delete_admin_search_pinned_products_uuid',
  'api_product_list',
  'api_product_detail',
] as const;

export const CONTENT_TOP_BANNER_FLOW_API_CODES = [
  'api_cms_header_list',
  'api_cms_get_admin_headers_1',
  'api_cms_header_detail',
  'api_cms_get_admin_headers_id',
  'api_cms_header_audit_logs',
  'api_cms_get_admin_headers_id_audit_logs',
  'api_cms_header_update',
  'api_cms_post_admin_headers',
  'api_cms_header_status',
  'api_cms_patch_admin_headers_id_status',
  'api_cms_header_delete',
  'api_cms_delete_admin_headers_id',
  'api_cms_header_restore_from_audit',
  'api_cms_post_admin_headers_id_restore_from_audit',
  'api_file_media_upload',
] as const;

/** Luồng khuyến mãi — list / create / update / detail / schema / sandbox. */
export const PROMOTION_LIST_FLOW_API_CODES = [
  'api_promotion_draft_list',
  'api_promotion_campaigns_list',
  'api_promotion_get_promotion_campaigns',
  'api_promotion_campaign_overview',
  'api_promotion_draft_detail',
  'api_promotion_published_detail',
  'api_promotion_draft_create',
  'api_promotion_draft_update',
  'api_promotion_draft_publish',
  'api_promotion_draft_delete',
  'api_promotion_runtime_evaluate',
  'api_promotion_pause',
  'api_promotion_resume',
  'api_promotion_end',
  'api_promotion_schema_unpublish',
  'api_promotion_post_promotions_id_schemas_schemaid_unpublish',
  'api_promotion_voucher_discover',
  'api_promotion_voucher_validate',
  'api_promotion_draft_components',
  'api_promotion_draft_target',
  'api_promotion_draft_audience',
  'api_promotion_draft_applicability',
  'api_promotion_draft_schemas',
  'api_promotion_draft_schema_create',
  'api_promotion_draft_schema_detail',
  'api_promotion_draft_schema_update',
  'api_promotion_draft_schema_delete',
  'api_promotion_draft_schema_components',
  'api_promotion_condition_config_options',
  'api_promotion_benefit_config_options',
  'api_promotion_schema_component_condition',
  'api_promotion_schema_component_benefit',
  'api_promotion_draft_voucher_codes',
  'api_promotion_draft_voucher_code_upsert',
  'api_promotion_draft_voucher_code_delete',
  'api_promotion_draft_simulate',
  'api_promotion_draft_simulation_voucher_discover',
  'api_promotion_published_components',
  'api_promotion_published_schemas',
  'api_promotion_published_schema_components',
  'api_category_tree',
  'api_collection_list',
  'api_product_sku_search',
  'api_file_media_upload',
] as const;

export const PROMOTION_SANDBOX_FLOW_API_CODES = [
  'api_promotion_draft_list',
  'api_promotion_draft_schemas',
  'api_promotion_draft_schema_components',
  'api_promotion_runtime_evaluate',
  'api_promotion_draft_simulate',
  'api_promotion_draft_simulation_voucher_discover',
  'api_promotion_voucher_discover',
  'api_promotion_voucher_validate',
  'api_category_tree',
  'api_collection_list',
  'api_product_sku_search',
] as const;

export const WAREHOUSE_PDA_PUTAWAY_FLOW_API_CODES = [
  'api_warehouse_pda_putaway_assigned',
  'api_warehouse_pda_putaway_route',
  'api_warehouse_pda_putaway_start',
  'api_warehouse_pda_putaway_confirm',
  'api_warehouse_pda_putaway_accept_alternative',
  'api_warehouse_pda_putaway_alternate_bin',
  'api_warehouse_pda_putaway_report_blocked',
] as const;

export const WAREHOUSE_PURCHASE_ORDER_FLOW_API_CODES = [
  'api_warehouse_purchase_order_filter',
  'api_warehouse_purchase_order_detail',
  'api_warehouse_purchase_order_create',
  'api_warehouse_purchase_order_update',
  'api_warehouse_purchase_order_delete',
  'api_warehouse_purchase_order_force_close',
  'api_warehouse_pda_purchase_order_qc_scan',
  'api_warehouse_pda_purchase_order_qc_submit',
  'api_warehouse_pda_purchase_order_qc_complete',
  ...WAREHOUSE_PDA_PUTAWAY_FLOW_API_CODES,
  'api_ie_topic_configs',
  'api_product_import',
  'api_order_import',
] as const;

export const WAREHOUSE_CYCLE_COUNT_FLOW_API_CODES = [
  'api_warehouse_cycle_count_filter',
  'api_warehouse_cycle_count_summary',
  'api_warehouse_cycle_count_detail',
  'api_warehouse_cycle_count_create',
  'api_warehouse_cycle_count_cancel',
  'api_warehouse_cycle_count_approve',
  'api_warehouse_cycle_count_variance_report',
  'api_warehouse_cycle_count_allow_recount',
  'api_warehouse_cycle_count_emergency',
  'api_warehouse_pda_cycle_count_assign',
  'api_warehouse_pda_cycle_count_start',
  'api_warehouse_pda_cycle_count_route',
  'api_warehouse_pda_cycle_count_validate_bin',
  'api_warehouse_pda_cycle_count_submit',
  'api_warehouse_pda_cycle_count_complete',
  'api_warehouse_product_sku_search',
] as const;

export const WAREHOUSE_RMA_FLOW_API_CODES = [
  'api_warehouse_rma_filter',
  'api_warehouse_rma_summary',
  'api_warehouse_rma_detail',
  'api_warehouse_rma_create',
  'api_warehouse_rma_update',
  'api_warehouse_rma_cancel',
  'api_warehouse_rma_resolve',
  'api_warehouse_rma_order_lookup',
  'api_warehouse_rma_lines_approve',
  'api_warehouse_rma_lines_approve_bulk',
  'api_warehouse_rma_lines_reject',
  'api_warehouse_rma_lines_reject_bulk',
  'api_warehouse_rma_lines_sent_to_supplier',
  'api_warehouse_rma_lines_sent_to_supplier_bulk',
  'api_warehouse_product_sku_search',
  'api_warehouse_pda_rma_by_tracking_code',
  'api_warehouse_pda_rma_receive',
  'api_warehouse_pda_rma_validation_detail',
  'api_warehouse_pda_rma_save_evidence',
  'api_warehouse_pda_rma_confirm',
  'api_file_media_upload',
] as const;

export const WAREHOUSE_PUTAWAY_FLOW_API_CODES = ['api_warehouse_putaway_filter', 'api_warehouse_putaway_summary', 'api_warehouse_putaway_detail', 'api_warehouse_putaway_export_fast_fbo'] as const;

export const WAREHOUSE_WAVE_FLOW_API_CODES = [
  'api_warehouse_wave_filter',
  'api_warehouse_wave_filter_by_sku',
  'api_warehouse_wave_create',
  'api_warehouse_wave_detail',
  'api_warehouse_fulfillment_order_filter',
  'api_warehouse_pda_home',
  'api_warehouse_pda_wave_picking_assigned',
  'api_warehouse_pda_wave_picking_confirm',
  'api_warehouse_pda_wave_picking_short_pick',
  'api_warehouse_pda_wave_picking_route',
  'api_warehouse_pda_wave_picking_by_order_assigned',
  'api_warehouse_pda_wave_picking_by_order_confirm',
  'api_warehouse_pda_wave_picking_by_order_short_pick',
  'api_warehouse_pda_wave_picking_by_order_route',
  'api_warehouse_pda_wave_picking_by_order_summary',
  'api_warehouse_pda_wave_picking_auto_assigned',
  'api_warehouse_pda_wave_picking_auto_confirm',
  'api_warehouse_pda_wave_picking_auto_short_pick',
  'api_warehouse_pda_wave_picking_auto_route',
] as const;

export const WAREHOUSE_PDA_RMA_FLOW_API_CODES = [
  'api_warehouse_pda_rma_by_tracking_code',
  'api_warehouse_pda_rma_receive',
  'api_warehouse_pda_rma_validation_detail',
  'api_warehouse_pda_rma_save_evidence',
  'api_warehouse_pda_rma_confirm',
] as const;

export const WAREHOUSE_FULFILLMENT_FLOW_API_CODES = ['api_warehouse_fulfillment_order_filter', 'api_warehouse_fulfillment_order_detail', 'api_warehouse_fulfillment_order_summary'] as const;

export const WAREHOUSE_PRE_ORDER_FLOW_API_CODES = [
  'api_warehouse_pre_order_filter',
  'api_warehouse_pre_order_detail',
  'api_warehouse_pre_order_demand_report',
  'api_warehouse_product_sku_search',
] as const;

export const WAREHOUSE_INVENTORY_FLOW_API_CODES = [
  'api_pim_post_admin_skus_search',
  'api_warehouse_location_area_list',
  'api_warehouse_inventory_balance_sku_summary',
  'api_warehouse_inventory_sku_summary',
  'api_warehouse_inventory_bin_summary',
  'api_warehouse_inventory_transaction_filter',
  'api_warehouse_product_sku_search',
  'api_warehouse_pda_home',
  'api_warehouse_pda_wave_picking_by_order_summary',
  'api_warehouse_fulfillment_order_filter',
  'api_warehouse_fulfillment_order_summary',
] as const;

export const WAREHOUSE_PACKING_FLOW_API_CODES = [
  'api_warehouse_fulfillment_order_filter',
  'api_warehouse_fulfillment_order_detail',
  'api_warehouse_fulfillment_order_summary',
  'api_warehouse_outbound_putback_confirm',
  'api_warehouse_putaway_putback_summary',
  'api_warehouse_pda_packing_complete',
  'api_warehouse_packing_start',
  'api_warehouse_packing_scan',
] as const;

export const WAREHOUSE_PDA_FLOW_API_CODES = [
  'api_warehouse_pda_home',
  'api_warehouse_pda_cycle_count_assign',
  ...WAREHOUSE_PDA_RMA_FLOW_API_CODES,
  ...WAREHOUSE_PDA_PUTAWAY_FLOW_API_CODES,
  'api_warehouse_pda_wave_picking_assigned',
  'api_warehouse_pda_wave_picking_confirm',
  'api_warehouse_pda_wave_picking_short_pick',
  'api_warehouse_pda_wave_picking_route',
  'api_warehouse_pda_wave_picking_by_order_assigned',
  'api_warehouse_pda_wave_picking_by_order_confirm',
  'api_warehouse_pda_wave_picking_by_order_short_pick',
  'api_warehouse_pda_wave_picking_by_order_route',
  'api_warehouse_pda_wave_picking_by_order_summary',
  'api_warehouse_pda_wave_picking_auto_assigned',
  'api_warehouse_pda_wave_picking_auto_confirm',
  'api_warehouse_pda_wave_picking_auto_short_pick',
  'api_warehouse_pda_wave_picking_auto_route',
] as const;

export const PERMISSION_ROLES_FLOW_API_CODES = [
  'api_permission_bundle_list',
  'api_permission_catalog_action_update',
  'api_permission_branch_menu_create',
  'api_permission_menu_tab_create',
  'api_permission_catalog_endpoints_search',
  'api_permission_catalog_endpoints_sync',
  'api_ie_topic_configs',
  'api_product_import',
  'api_ie_job_status',
  'api_ie_jobs_list',
  'api_order_import',
  'api_employee_register',
  'api_employee_update',
  'api_employee_reset_password',
  'api_iam_permission_assign_bundles',
  'api_file_media_upload',
] as const;

export const PERMISSION_USER_ACCESS_FLOW_API_CODES = [
  'api_employee_register',
  'api_employee_update',
  'api_employee_reset_password',
  'api_iam_permission_assign_bundles',
  'api_permission_bundle_list',
  'api_permission_branch_menu_create',
  'api_permission_catalog_action_update',
  'api_permission_catalog_endpoints_search',
  'api_permission_catalog_endpoints_sync',
  'api_permission_menu_tab_create',
  'api_file_media_upload',
  'api_ie_topic_configs',
  'api_ie_jobs_list',
  'api_ie_job_status',
  'api_product_import',
  'api_order_import',
] as const;

export const LOYALTY_MEMBERSHIP_FLOW_API_CODES = ['api_loyalty_tier_list', 'api_loyalty_tier_create', 'api_loyalty_tier_update', 'api_loyalty_tier_delete', 'api_loyalty_tier_activities'] as const;

/**
 * API luồng chung cho mọi action trong tab (`pageKey` = `menu.tab`).
 * Merge sau `defaultApiCodes`, trước `ACTION_FLOW_API_SUPPLEMENTS`.
 */
export const TAB_DEFAULT_FLOW_API_CODES: Readonly<Record<string, readonly string[]>> = {
  'content.cms_pages': CMS_PAGE_WIZARD_FLOW_API_CODES,
  'content.label_display': CONTENT_LABEL_DISPLAY_FLOW_API_CODES,
  'content.label_list': CONTENT_LABEL_LIST_FLOW_API_CODES,
  'content.banner_settings': CONTENT_BANNER_SETTINGS_FLOW_API_CODES,
  'content.footer': ['api_cms_footer_list', 'api_cms_footer_update', 'api_cms_logo_list', 'api_file_media_upload'],
  'content.logo': ['api_cms_logo_list', 'api_cms_logo_update', 'api_file_media_upload'],
  'content.media': ['api_file_media_upload'],
  'content.navigation': CONTENT_NAVIGATION_FLOW_API_CODES,
  'content.search_pinned': CONTENT_SEARCH_PINNED_FLOW_API_CODES,
  'content.top_banner': CONTENT_TOP_BANNER_FLOW_API_CODES,
  'content.discount_label': ['api_cms_get_admin_global_config_discount_label', 'api_cms_put_admin_global_config_discount_label'],
  'customer.list': [
    'api_loyalty_customer_list',
    'api_loyalty_customer_detail',
    'api_iam_location_provinces',
    'api_iam_location_wards',
    'api_loyalty_member_address_create',
    'api_loyalty_member_address_update',
    'api_loyalty_tier_list',
  ],
  /** Sync HĐĐT gắn riêng `order.invoice.sync`; export gắn riêng `order.invoice.export`. */
  'order.invoice': ['api_invoice_list', 'api_invoice_detail'],
  'order.refunds': ['api_refund_proposal_list', 'api_refund_proposal_detail', 'api_refund_proposal_create', 'api_order_detail'],
  'order.pre_order_campaign': [
    'api_pre_order_campaign_list',
    'api_pre_order_campaign_detail',
    'api_pre_order_campaign_badge_templates',
    'api_pre_order_campaign_skus_search',
    'api_pre_order_campaign_create',
    'api_pre_order_campaign_update',
    'api_pre_order_campaign_delete',
    'api_collection_list',
    'api_category_list',
    'api_pim_get_admin_skus',
    'api_pim_post_admin_skus_search',
  ],
  'order.pre_order_statistics': ['api_pre_order_campaign_statistics_list', 'api_pre_order_campaign_statistics_detail'],
  'order.pre_order_orders': [
    'api_pre_order_order_list',
    'api_pre_order_order_detail',
    'api_pre_order_order_update',
    'api_pre_order_order_cancel',
    'api_pre_order_order_send_zns',
    'api_pre_order_order_bulk_send_zns',
    'api_pre_order_order_resend_zns',
    'api_pre_order_order_move_awaiting_payment',
  ],
  'order.returns': ORDER_RETURN_FORM_FLOW_API_CODES,
  'order.shipping': ['api_shipment_list', 'api_shipment_export'],
  'loyalty.membership': LOYALTY_MEMBERSHIP_FLOW_API_CODES,
  'loyalty.points': ['api_loyalty_point_config_update', 'api_loyalty_point_config_activities', 'api_loyalty_tier_list'],
  'promotion.dashboard': ['api_promotion_campaign_overview'],
  'promotion.list': PROMOTION_LIST_FLOW_API_CODES,
  'promotion.sandbox': PROMOTION_SANDBOX_FLOW_API_CODES,
  'report.da': ['api_metabase_embed_token'],
  'permission.profile': ['api_employee_update', 'api_employee_change_password', 'api_file_media_upload'],
  'permission.roles': PERMISSION_ROLES_FLOW_API_CODES,
  'permission.user_access': PERMISSION_USER_ACCESS_FLOW_API_CODES,
  'warehouse.cycle_count': WAREHOUSE_CYCLE_COUNT_FLOW_API_CODES,
  'warehouse.fulfillment': WAREHOUSE_FULFILLMENT_FLOW_API_CODES,
  'warehouse.handover': ['api_warehouse_handover_list', 'api_warehouse_handover_confirm'],
  'warehouse.inventory': WAREHOUSE_INVENTORY_FLOW_API_CODES,
  'warehouse.layout': ['api_warehouse_location_area_list', 'api_warehouse_location_area_update'],
  'warehouse.list': ['api_warehouse_location_area_list'],
  'warehouse.packing': WAREHOUSE_PACKING_FLOW_API_CODES,
  'warehouse.pda': WAREHOUSE_PDA_FLOW_API_CODES,
  'warehouse.pre_order': WAREHOUSE_PRE_ORDER_FLOW_API_CODES,
  'warehouse.purchase_order': WAREHOUSE_PURCHASE_ORDER_FLOW_API_CODES,
  'warehouse.putaway': WAREHOUSE_PUTAWAY_FLOW_API_CODES,
  'warehouse.rma': WAREHOUSE_RMA_FLOW_API_CODES,
  'warehouse.wave': WAREHOUSE_WAVE_FLOW_API_CODES,
};

/** Action dùng supplement riêng — không merge TAB default (`order.list` / returns / invoice). */
const CATALOG_KEYS_WITHOUT_TAB_DEFAULT = new Set([
  'order.list.create',
  'order.list.edit',
  'order.list.open_detail',
  'order.list.ship',
  'order.list.sync_shipment',
  'order.list.check_paid',
  'order.list.import',
  'order.list.return_create',
  'order.list.recall',
  'order.returns.sync_shipment',
  'order.invoice.sync',
  'order.invoice.export',
  'warehouse.cycle_count.open_detail',
  'warehouse.list.open_detail',
  'warehouse.list.create',
  'warehouse.list.edit',
  'warehouse.list.clone',
  'warehouse.list.update_status',
  'warehouse.list.assign_staff',
  'warehouse.list.remove_staff',
]);

/**
 * Bổ sung API theo `pageKey.actionCode`.
 * Chỉ khai báo phần flow; `defaultApiCodes` trong registry vẫn giữ API chính của nút.
 */
export const ACTION_FLOW_API_SUPPLEMENTS: Readonly<Record<string, readonly string[]>> = {
  'order.list.view': ORDER_LIST_FLOW_API_CODES,
  'order.list.filter': ORDER_LIST_FLOW_API_CODES,
  'order.list.export': ORDER_LIST_FLOW_API_CODES,
  'order.list.create': [
    ...ORDER_DRAFT_FORM_FLOW_API_CODES,
    'api_oms_post_orders_pricing_context_quote',
    'api_oms_post_admin_promotion_vouchers_discover',
    'api_oms_post_admin_promotion_vouchers_validate_code',
    'api_order_detail',
    'api_order_update',
    'api_order_cancel',
  ],
  'order.list.edit': [...ORDER_DRAFT_FORM_EDIT_FLOW_API_CODES, 'api_order_update', 'api_order_detail', 'api_order_cancel'],
  'order.list.open_detail': ORDER_DETAIL_FLOW_API_CODES,
  'order.list.ship': ['api_order_ship', 'api_order_detail'],
  'order.list.sync_shipment': ['api_order_shipment_ghn_sync', 'api_order_list'],
  'order.list.check_paid': ['api_order_check_paid', 'api_order_detail'],
  'order.list.view_history': ['api_oms_get_orders_audit_logs', 'api_order_detail'],
  'order.list.return_create': ['api_order_return_create', 'api_order_detail', 'api_order_return_list'],
  'order.list.recall': ['api_order_recall', 'api_order_detail'],
  'order.refunds.view_history': ['api_oms_get_refund_proposals_audit_logs', 'api_refund_proposal_detail'],
  'order.returns.view_history': ['api_oms_get_order_returns_audit_logs', 'api_oms_get_orders_audit_logs', 'api_order_return_detail'],
  'order.shipping.view_history': ['api_oms_get_orders_audit_logs', 'api_shipment_list'],
  'order.returns.view': ['api_order_return_list'],
  'order.returns.filter': ['api_order_return_list'],
  'order.returns.export': ORDER_RETURN_EXPORT_FLOW_API_CODES,
  'order.returns.open_detail': ['api_order_return_detail', 'api_order_return_update'],
  'order.returns.update': [...ORDER_RETURN_FORM_FLOW_API_CODES],
  'order.returns.create_step_back': ORDER_RETURN_FORM_FLOW_API_CODES,
  'order.returns.edit_step_back': ORDER_RETURN_FORM_FLOW_API_CODES,
  'order.returns.exchange_add_product': ORDER_RETURN_FORM_FLOW_API_CODES,
  'order.returns.sync_shipment': ['api_order_shipment_ghn_sync', 'api_order_return_list'],
  'order.refunds.view': ['api_refund_proposal_list'],
  'order.refunds.filter': ['api_refund_proposal_list'],
  'order.refunds.export': ORDER_REFUND_EXPORT_FLOW_API_CODES,
  'order.refunds.open_detail': ['api_refund_proposal_detail'],
  'order.refunds.create': ['api_refund_proposal_create', 'api_order_detail'],
  'order.pre_order_campaign.view': ['api_pre_order_campaign_list'],
  'order.pre_order_campaign.open_detail': ['api_pre_order_campaign_detail', 'api_pre_order_campaign_badge_templates'],
  'order.pre_order_campaign.create': [
    'api_pre_order_campaign_create',
    'api_pre_order_campaign_badge_templates',
    'api_pre_order_campaign_skus_search',
    'api_collection_list',
    'api_category_list',
    'api_pim_get_admin_skus',
    'api_pim_post_admin_skus_search',
  ],
  'order.pre_order_campaign.edit': [
    'api_pre_order_campaign_update',
    'api_pre_order_campaign_detail',
    'api_pre_order_campaign_badge_templates',
    'api_pre_order_campaign_skus_search',
    'api_collection_list',
    'api_category_list',
    'api_pim_get_admin_skus',
    'api_pim_post_admin_skus_search',
  ],
  'order.pre_order_campaign.delete': ['api_pre_order_campaign_delete'],
  'order.pre_order_campaign.filter': ['api_pre_order_campaign_list'],
  'order.pre_order_statistics.view': ['api_pre_order_campaign_statistics_list'],
  'order.pre_order_statistics.open_detail': ['api_pre_order_campaign_statistics_detail'],
  'order.pre_order_statistics.filter': ['api_pre_order_campaign_statistics_list'],
  'order.pre_order_orders.view': ['api_pre_order_order_list'],
  'order.pre_order_orders.open_detail': ['api_pre_order_order_detail'],
  'order.pre_order_orders.edit': ['api_pre_order_order_update', 'api_pre_order_order_detail'],
  'order.pre_order_orders.cancel': ['api_pre_order_order_cancel'],
  'order.pre_order_orders.send_zns': ['api_pre_order_order_send_zns', 'api_pre_order_order_bulk_send_zns'],
  'order.pre_order_orders.resend_zns': ['api_pre_order_order_resend_zns'],
  'order.pre_order_orders.move_awaiting_payment': ['api_pre_order_order_move_awaiting_payment'],
  'order.pre_order_orders.filter': ['api_pre_order_order_list'],
  'order.pre_order_orders.filter_time': ['api_pre_order_order_list'],
  'order.pre_order_orders.copy_pre_order_code': ['api_pre_order_order_list'],
  'order.pre_order_orders.export': ['api_pre_order_order_list'],
  'order.shipping.view': ['api_shipment_list'],
  'order.shipping.export': SHIPMENT_EXPORT_FLOW_API_CODES,
  'order.invoice.view': ['api_invoice_list', 'api_invoice_detail'],
  'order.invoice.open_detail': ['api_invoice_detail', 'api_invoice_list'],
  'order.invoice.export': ORDER_INVOICE_EXPORT_FLOW_API_CODES,
  'order.invoice.sync': ['api_invoice_sync', 'api_invoice_return_sync', 'api_invoice_list'],
  'customer.list.view': ['api_loyalty_customer_list', 'api_loyalty_customer_detail', 'api_iam_location_provinces', 'api_iam_location_wards'],
  'customer.list.view_history': ['api_loyalty_customer_detail'],
  'customer.list.address_create_cancel': ['api_loyalty_member_address_create', 'api_iam_location_provinces', 'api_iam_location_wards'],
  'customer.list.address_edit_cancel': ['api_loyalty_member_address_update', 'api_iam_location_provinces', 'api_iam_location_wards'],
  'loyalty.membership.view': ['api_loyalty_tier_list'],
  'loyalty.membership.view_history': ['api_loyalty_tier_activities', 'api_loyalty_tier_list'],
  'loyalty.points.view': ['api_loyalty_point_config_update'],
  'loyalty.points.view_history': ['api_loyalty_point_config_activities'],
  'product.list.view': PRODUCT_SPU_LIST_FLOW_API_CODES,
  'product.list.open_detail': PRODUCT_SPU_DETAIL_FLOW_API_CODES,
  'product.list.create': ['api_product_create', 'api_product_submit', 'api_product_list', ...PRODUCT_SPU_FORM_FLOW_API_CODES],
  'product.list.edit': [
    'api_product_update',
    'api_product_submit',
    'api_product_detail',
    ...PRODUCT_SPU_FORM_FLOW_API_CODES,
    'api_product_status_patch',
    'api_product_approval_cancel',
    'api_product_list',
  ],
  'product.list.view_history': ['api_product_audit_logs', 'api_product_detail'],
  'product.list.submit': ['api_product_submit', 'api_product_detail'],
  'product.list.approve': ['api_product_approval_review', ...PRODUCT_SPU_LIST_FLOW_API_CODES],
  'product.list.reject': ['api_product_approval_review', ...PRODUCT_SPU_LIST_FLOW_API_CODES],
  'product.list.cancel_approval': ['api_product_approval_cancel', 'api_product_detail'],
  'product.list.publish': ['api_product_status_patch', 'api_product_detail'],
  'product.list.discontinue': ['api_product_status_patch', 'api_product_detail'],
  'product.list.archive': ['api_product_status_patch', 'api_product_detail'],
  'product.list.restore_published': ['api_product_status_patch', 'api_product_detail'],
  'product.list.restore': ['api_product_status_patch', 'api_product_detail'],
  'product.list.task_manager': [...PRODUCT_SPU_IE_FLOW_API_CODES, 'api_product_list'],
  'product.list.export': [...PRODUCT_SPU_IE_FLOW_API_CODES, 'api_product_list'],
  'product.list.deactivate_brand': PRODUCT_BRAND_FLOW_API_CODES,
  'product.list.create_brand': PRODUCT_BRAND_FLOW_API_CODES,
  'product.list.edit_brand': PRODUCT_BRAND_FLOW_API_CODES,
  'product.list.delete_brand': PRODUCT_BRAND_FLOW_API_CODES,
  'product.attributes.view': ['api_attribute_list'],
  'product.attributes.open_detail': ['api_attribute_detail', ...PRODUCT_ATTRIBUTE_FORM_FLOW_API_CODES],
  'product.attributes.create': ['api_attribute_create', ...PRODUCT_ATTRIBUTE_FORM_FLOW_API_CODES],
  'product.attributes.create_cancel': ['api_attribute_create'],
  'product.attributes.edit': ['api_attribute_update', 'api_attribute_detail', ...PRODUCT_ATTRIBUTE_FORM_FLOW_API_CODES],
  'product.attributes.edit_cancel': ['api_attribute_update', 'api_attribute_detail'],
  'product.attributes.delete': ['api_attribute_delete', 'api_attribute_list'],
  'product.attributes.dialog_close': ['api_attribute_delete'],
  'product.category.view': PRODUCT_CATEGORY_FLOW_API_CODES,
  'product.category.open_detail': PRODUCT_CATEGORY_FLOW_API_CODES,
  'product.category.create': ['api_category_create', ...PRODUCT_CATEGORY_FLOW_API_CODES],
  'product.category.edit': ['api_category_update', ...PRODUCT_CATEGORY_FLOW_API_CODES],
  'product.category.delete': ['api_category_delete', 'api_category_tree'],
  'product.category.dialog_close': ['api_category_delete'],
  'product.collection.view': ['api_collection_list', ...PRODUCT_COLLECTION_LIST_FLOW_API_CODES],
  'product.collection.open_detail': PRODUCT_COLLECTION_FORM_FLOW_API_CODES,
  'product.collection.create': ['api_collection_create', ...PRODUCT_COLLECTION_FORM_FLOW_API_CODES],
  'product.collection.edit': ['api_collection_update', 'api_collection_create', ...PRODUCT_COLLECTION_FORM_FLOW_API_CODES],
  'product.collection.delete': ['api_collection_delete', 'api_collection_list'],
  'product.reviews.view': ['api_product_review_list', 'api_product_approval_review', 'api_product_detail'],
  'product.reviews.dialog_close': ['api_product_approval_review'],
  'promotion.list.view': PROMOTION_LIST_FLOW_API_CODES,
  'promotion.list.open_detail': PROMOTION_LIST_FLOW_API_CODES,
  'promotion.list.refresh': PROMOTION_LIST_FLOW_API_CODES,
  'promotion.list.create': PROMOTION_LIST_FLOW_API_CODES,
  'promotion.list.edit': PROMOTION_LIST_FLOW_API_CODES,
  'promotion.list.publish': PROMOTION_LIST_FLOW_API_CODES,
  'promotion.list.delete': PROMOTION_LIST_FLOW_API_CODES,
  'promotion.list.evaluate': PROMOTION_LIST_FLOW_API_CODES,
  'promotion.list.pause': ['api_promotion_pause', ...PROMOTION_LIST_FLOW_API_CODES],
  'promotion.list.resume': ['api_promotion_resume', ...PROMOTION_LIST_FLOW_API_CODES],
  'promotion.list.end': ['api_promotion_end', ...PROMOTION_LIST_FLOW_API_CODES],
  'promotion.list.unpublish_schema': ['api_promotion_post_promotions_id_schemas_schemaid_unpublish', 'api_promotion_schema_unpublish', ...PROMOTION_LIST_FLOW_API_CODES],
  'promotion.sandbox.view': PROMOTION_SANDBOX_FLOW_API_CODES,
  'permission.roles.view': ['api_permission_bundle_list'],
  'permission.roles.view_bundle': ['api_permission_bundle_list', 'api_permission_catalog_action_update'],
  'permission.roles.map_action_api': ['api_permission_catalog_action_update', 'api_permission_catalog_endpoints_search', 'api_permission_catalog_endpoints_sync'],
  'permission.user_access.view': ['api_employee_register'],
  'permission.user_access.assign_permission': ['api_iam_permission_assign_bundles', 'api_permission_bundle_list'],
  'permission.user_access.assign_save': ['api_iam_permission_assign_bundles', 'api_permission_bundle_list'],
  'warehouse.rma.approve_line': ['api_warehouse_rma_lines_approve_bulk'],
  'warehouse.rma.reject_line': ['api_warehouse_rma_lines_reject_bulk'],
  'warehouse.rma.sent_to_supplier_line': ['api_warehouse_rma_lines_sent_to_supplier_bulk'],
  'warehouse.rma.create_publish': ['api_warehouse_rma_order_lookup', 'api_warehouse_product_sku_search'],
  'warehouse.rma.edit_save': ['api_warehouse_rma_detail', 'api_warehouse_product_sku_search'],
  'warehouse.rma.add_variant': ['api_warehouse_rma_order_lookup'],
  'warehouse.rma.remove_variant': ['api_warehouse_rma_detail'],
  'warehouse.rma.lookup_order': ['api_warehouse_product_sku_search'],
  'warehouse.rma.filter_status': ['api_warehouse_rma_summary'],
  'warehouse.rma.receive': ['api_warehouse_pda_rma_by_tracking_code'],
  'warehouse.rma.classify': ['api_warehouse_pda_rma_validation_detail', 'api_warehouse_pda_rma_save_evidence', 'api_file_media_upload'],
  'warehouse.putaway.view': WAREHOUSE_PUTAWAY_FLOW_API_CODES,
  'warehouse.putaway.filter_status': ['api_warehouse_putaway_summary'],
  'import_export.list.view': ['api_ie_jobs_list', 'api_ie_job_status'],
  'system.scheduler.view': ['api_cronjob_scheduler_list'],
  'system.scheduler.view_detail': ['api_cronjob_scheduler_detail'],
  'system.scheduler.create': ['api_cronjob_scheduler_create'],
  'system.scheduler.edit': ['api_cronjob_scheduler_update', 'api_cronjob_scheduler_detail'],
  'system.scheduler.enable': ['api_cronjob_scheduler_enable'],
  'system.scheduler.disable': ['api_cronjob_scheduler_disable'],
  'system.scheduler.trigger': ['api_cronjob_scheduler_trigger'],
  'system.scheduler.delete': ['api_cronjob_scheduler_delete'],
  'system.scheduler.open_dashboard': ['api_cronjob_scheduler_dashboard_url'],
  'warehouse.cycle_count.filter_status': ['api_warehouse_cycle_count_summary'],
  'warehouse.cycle_count.open_detail': ['api_warehouse_cycle_count_detail', 'api_endpoint_17', 'api_warehouse_cycle_count_filter'],
  'warehouse.cycle_count.allow_recount': ['api_warehouse_cycle_count_variance_report'],
  'warehouse.cycle_count.pda_cycle_count': [
    'api_warehouse_pda_cycle_count_assign',
    'api_warehouse_pda_cycle_count_start',
    'api_warehouse_pda_cycle_count_complete',
    'api_warehouse_product_sku_search',
  ],
  'warehouse.cycle_count.pda_commit_barcode': ['api_warehouse_pda_cycle_count_route'],
  'warehouse.cycle_count.pda_submit_count': ['api_warehouse_pda_cycle_count_route', 'api_warehouse_product_sku_search'],
  'warehouse.handover.filter_reset': ['api_warehouse_handover_list'],
  'warehouse.wave.filter_reset': ['api_warehouse_wave_filter'],
  'warehouse.fulfillment.filter_reset': ['api_warehouse_fulfillment_order_filter'],
  'warehouse.fulfillment.filter_cancel': ['api_warehouse_fulfillment_order_filter'],
  'warehouse.packing.filter_reset': ['api_warehouse_fulfillment_order_filter'],
  'warehouse.pre_order.view': ['api_warehouse_pre_order_filter'],
  'warehouse.pre_order.open_detail': ['api_warehouse_pre_order_detail'],
  'warehouse.pre_order.filter': ['api_warehouse_pre_order_filter'],
  'warehouse.pre_order.filter_time': ['api_warehouse_pre_order_filter'],
  'warehouse.pre_order.filter_reset': ['api_warehouse_pre_order_filter'],
  'warehouse.pre_order.copy_pre_order_code': ['api_warehouse_pre_order_filter'],
  'warehouse.pre_order.copy_order_code': ['api_warehouse_pre_order_filter'],
  'warehouse.pre_order.view_demand_report': ['api_warehouse_pre_order_demand_report', 'api_warehouse_product_sku_search'],
  'warehouse.layout.location_layout_edit': ['api_warehouse_location_area_update'],
  'warehouse.purchase_order.filter_reset': ['api_warehouse_purchase_order_filter'],
  'warehouse.purchase_order.filter_cancel': ['api_warehouse_purchase_order_filter'],
};

/** Folder gốc theo tab — dùng audit coverage khi chưa khai `ACTION_PAGE_AUDIT_ROOTS` theo action. */
export const TAB_PAGE_AUDIT_ROOTS: Readonly<Record<string, readonly string[]>> = {
  'content.cms_pages': ['pages/content-display/cms', 'common/utils/image-upload.utils.ts'],
  'content.banner_settings': ['pages/content-display/cms/product-list-banner-settings'],
  'content.footer': ['pages/content-display/site-layout/site-footer'],
  'content.logo': ['pages/content-display/site-layout/site-logo', 'common/utils/image-upload.utils.ts'],
  'content.media': ['pages/content-display/media-upload', 'common/utils/image-upload.utils.ts'],
  'content.navigation': ['pages/content-display/site-layout/site-navigation'],
  'content.search_pinned': ['pages/content-display/site-layout/search-pinned'],
  'content.top_banner': ['pages/content-display/site-layout/site-top-banner', 'common/utils/image-upload.utils.ts'],
  'content.discount_label': ['pages/content-display/cms/discount-label-settings'],
  'content.label_display': ['pages/content-display/label/label-display', 'pages/content-display/label/components'],
  'content.label_list': ['pages/content-display/label/label-content'],
  'promotion.list': ['pages/promotion'],
  'promotion.sandbox': ['pages/promotion/promotion-sandbox', 'pages/promotion/components/promotion-runtime-evaluate-panel'],
  'promotion.dashboard': ['pages/promotion/promotion-dashboard'],
  'report.da': ['pages/report'],
  'warehouse.purchase_order': ['pages/warehouse/purchase-order', 'pages/warehouse/inbound-qc', 'pages/warehouse/putaway-pda', 'hooks/use-purchase-order-list-page.hook.ts'],
  'warehouse.cycle_count': ['pages/warehouse/cycle-count', 'hooks/use-cycle-count-list-page.hook.ts'],
  'warehouse.rma': ['pages/warehouse/rma'],
  'warehouse.putaway': ['pages/warehouse/putaway', 'hooks/use-putaway-list-page.hook.ts'],
  'warehouse.wave': ['pages/warehouse/wave-management', 'pages/warehouse/wave-picking', 'hooks/use-wave-monitoring.hook.ts', 'hooks/use-wave-setup-order-step.hook.ts'],
  'warehouse.fulfillment': ['pages/warehouse/fulfillment-order', 'hooks/use-fulfillment-order-list-page.hook.ts'],
  'warehouse.pre_order': ['pages/warehouse/pre-order', 'hooks/use-pre-order-list-page.hook.ts'],
  'warehouse.handover': ['pages/warehouse/handover', 'hooks/use-handover-list-page.hook.ts'],
  'warehouse.inventory': ['pages/warehouse/inventory', 'hooks/use-warehouse-inventory-page.hook.ts'],
  'warehouse.layout': ['pages/warehouse/location-area'],
  'warehouse.packing': ['pages/warehouse/packing-station', 'hooks/use-packing-station-list-page.hook.ts', 'hooks/use-packing-station-check-slip.hook.ts'],
  'warehouse.pda': ['pages/warehouse/pda', 'pages/warehouse/cycle-count/pda-cycle-count-entry.page.tsx'],
  'permission.roles': ['pages/permission', 'hooks/permission'],
  'permission.user_access': [
    'pages/permission/components/permission-user-access.tab.tsx',
    'pages/permission/components/permission-create-user-dialog.component.tsx',
    'pages/permission/components/permission-edit-user-dialog.component.tsx',
    'pages/permission/components/permission-reset-password-dialog.component.tsx',
    'pages/permission/components/permission-remove-assignment-dialog.component.tsx',
    'pages/permission/permission-users.page.tsx',
    'hooks/permission',
  ],
  'permission.profile': ['pages/account', 'hooks/use-account-profile.hook.ts'],
  'system.scheduler': ['pages/cronjob', 'hooks/use-scheduler-list-page.hook.ts'],
  'loyalty.membership': ['pages/loyalty/loyalty-membership'],
  'loyalty.points': ['pages/loyalty/loyalty-point'],
  'customer.list': ['pages/loyalty/loyalty-customer', 'pages/customer'],
};

/** File/folder gốc để script audit quét import API — key = `pageKey.actionCode`. */
export const ACTION_PAGE_AUDIT_ROOTS: Readonly<Record<string, readonly string[]>> = {
  'order.list.create': [
    'pages/order/create-order/create-order.page.tsx',
    'pages/order/create-order/parts',
    'hooks/use-order-draft-form-page.hook.ts',
    'hooks/use-order-catalog.hook.ts',
    'hooks/order/use-admin-order-voucher.hook.ts',
    'hooks/order/use-admin-order-voucher-discover.hook.ts',
    'common/utils/order/order-shipping-service.utils.ts',
  ],
  'order.list.edit': ['pages/order/create-order/edit', 'hooks/use-order-draft-form-page.hook.ts', 'hooks/use-order-catalog.hook.ts'],
  'order.list.open_detail': ['pages/order/order-detail'],
  'order.list.view': ['pages/order/order-data.page.tsx', 'hooks/use-order-data-page.hook.ts', 'pages/order/components/order-advanced-filter-dialog.tsx'],
  'order.invoice.open_detail': ['pages/invoice/invoice-document-detail', 'hooks/invoice-documents/use-invoice-document-detail.hook.ts'],
  'order.invoice.view': ['pages/invoice/invoice-documents-list.page.tsx', 'hooks/invoice-documents/use-invoice-documents-list.hook.ts'],
  'order.returns.update': ['pages/order/returns-exchanges'],
  'product.list.view': ['pages/product/product-spu/product-spu-list'],
  'product.list.create': ['pages/product/product-spu/product-spu-create', 'pages/product/product-spu/components', 'common/utils/image-upload.utils.ts'],
  'product.list.edit': ['pages/product/product-spu/product-spu-update', 'pages/product/product-spu/components', 'common/utils/image-upload.utils.ts'],
  'product.list.open_detail': ['pages/product/product-spu/product-spu-detail', 'pages/product/product-spu/components'],
  'product.attributes.create': ['pages/product/product-attribute/product-attribute-create', 'common/utils/image-upload.utils.ts'],
  'product.attributes.edit': ['pages/product/product-attribute/product-attribute-update', 'common/utils/image-upload.utils.ts'],
  'product.category.view': ['pages/product/product-category/category'],
  'product.collection.view': ['pages/product/product-category/collection/collection-list'],
  'product.collection.edit': ['pages/product/product-category/collection/collection-detail', 'pages/product/product-category/collection/collection-form'],
};

export const pageKeyFromCatalogKey = (catalogKey: string): string => {
  const parts = catalogKey.split('.');
  if (parts.length < 2) return catalogKey;
  return parts.slice(0, -1).join('.');
};

export const mergeActionApiCodes = (catalogKey: string, registryApiCodes: readonly string[]): string[] => {
  const pageKey = pageKeyFromCatalogKey(catalogKey);
  const tabDefaults = CATALOG_KEYS_WITHOUT_TAB_DEFAULT.has(catalogKey) ? [] : (TAB_DEFAULT_FLOW_API_CODES[pageKey] ?? []);
  const supplements = ACTION_FLOW_API_SUPPLEMENTS[catalogKey] ?? [];
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const code of [...registryApiCodes, ...tabDefaults, ...supplements]) {
    const normalized = code.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    merged.push(normalized);
  }
  return merged;
};

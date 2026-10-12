import {javaDiscountList,javaDeleteDiscount,JavaDiscountKind,JavaDiscountStatus,JavaDiscountType,type JavaDiscount} from '@/apis/java/java-discount.api';
import {PromotionDraftStatus,PublishedPromotionStatus,PromotionSalesChannel,PromotionDraftSchemaType} from './promotion.enum';
import {CampaignAvailableAction,type CampaignOverviewItemResponseDto,type GetCampaignOverviewQueryDto,type GetCampaignOverviewResponseDto} from './promotion.interface';
import { javaTimeRange } from '@/apis/java/java-time-range';
import { unsupportedJavaFields } from '@/apis/java/java-unsupported';
function publishedStatus(discount:JavaDiscount):PublishedPromotionStatus{
 if(Date.parse(discount.endsAt)<Date.now())return PublishedPromotionStatus.ENDED;
 return Date.parse(discount.startsAt)>Date.now()?PublishedPromotionStatus.SCHEDULED:PublishedPromotionStatus.ACTIVE;
}
function campaign(discount:JavaDiscount):CampaignOverviewItemResponseDto{
 const source=discount.status===JavaDiscountStatus.PUBLISHED?'PUBLISHED':'DRAFT';
 return {id:String(discount.id),source,name:discount.name??discount.code??'',draftStatus:source==='DRAFT'?PromotionDraftStatus.EDITING:undefined,
  promotionStatus:source==='PUBLISHED'?publishedStatus(discount):undefined,startsAt:discount.startsAt,endsAt:discount.endsAt,createdAt:discount.createdDate,
  availableActions:[CampaignAvailableAction.VIEW,CampaignAvailableAction.DELETE],salesChannels:[PromotionSalesChannel.ONLINE],
  schemas:[{name:discount.name??'',schemaType:discount.discountType===JavaDiscountType.FLAT_PRICE?PromotionDraftSchemaType.FLAT_PRICE:PromotionDraftSchemaType.MARKDOWN,
  benefitSummary:String(discount.discountValue)+(discount.discountType===JavaDiscountType.PERCENT?'%':' đ')}]};
}
export async function getJavaCampaignOverview(query:GetCampaignOverviewQueryDto):Promise<GetCampaignOverviewResponseDto>{
 const all=(await javaDiscountList(JavaDiscountKind.PROMOTION)).map(campaign),search=query.search?.trim().toLowerCase();
 const dates=javaTimeRange(query.timeFilter,query.timeFrom,query.timeTo);
 if((dates.start||dates.end)&&all.some(row=>!row.createdAt))unsupportedJavaFields('admin/promotions',['createdAt/timeFilter']);
 const filtered=all.filter(row=>(!search||row.name.toLowerCase().includes(search))&&(!query.source||query.source===row.source)
 &&(!query.draftStatus||row.draftStatus===query.draftStatus)&&(!query.promotionStatus||row.promotionStatus===query.promotionStatus)
 &&(!query.schemaType||row.schemas.some(schema=>schema.schemaType===query.schemaType))
 &&(!dates.start||Date.parse(row.createdAt??'')>=Date.parse(dates.start))&&(!dates.end||Date.parse(row.createdAt??'')<=Date.parse(dates.end)));
 const page=query.page??1,limit=query.limit??20;
 return {items:filtered.slice((page-1)*limit,page*limit),meta:{total:filtered.length,page,limit,draftCount:all.filter(row=>row.source==='DRAFT').length,publishedCount:all.filter(row=>row.source==='PUBLISHED').length}};
}
export async function deleteJavaCampaign(id:string){await javaDeleteDiscount(JavaDiscountKind.PROMOTION,Number(id));}

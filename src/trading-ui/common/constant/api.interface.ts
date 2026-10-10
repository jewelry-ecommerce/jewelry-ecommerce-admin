import type { OrderType } from '../../adapters/library';
export interface BaseEntity { id: string; createdAt: Date; updatedAt: Date; createdById?: string }
export interface PageOptionsDto<T> {
 orderType?: OrderType; orderBy?: keyof T; page: number; take: number; search?: string;
 isRelations?: boolean; isDeleted?: boolean; isPagination?: boolean;
}

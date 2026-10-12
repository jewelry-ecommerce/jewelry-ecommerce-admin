import type { OrderType } from '../../adapters/library';
export interface Success {success:boolean}
export interface ResList<T> {total:number;list:T[];pagination?:{total:number;currentPage:number;nextPage:boolean;previousPage:boolean;hasNextPage:boolean;hasPreviousPage:boolean;totalPage:number}}
export interface BaseEntity { id: string; createdAt: Date; updatedAt: Date; createdById?: string }
export interface PageOptionsDto<T> {
 orderType?: OrderType; orderBy?: keyof T; page: number; take: number; search?: string;
 isRelations?: boolean; isDeleted?: boolean; isPagination?: boolean;
}
export interface Pagination {
  total: number;
  currentPage: number;
  nextPage: boolean;
  previousPage: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalPage: number;
}

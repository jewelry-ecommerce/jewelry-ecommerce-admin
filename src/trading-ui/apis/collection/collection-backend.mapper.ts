
import type { Collection } from './collection.entities';
import { mapProduct, type WireProduct } from '../product/product-backend.mapper';
import type { CollectionStatus } from './collection.enum';
export interface WireCollection {
  id:number;name:string;slug:string;description?:string;image?:string;status:CollectionStatus;
  createdAt:string;updatedAt:string;productIds:number[];productCollections?:{
    id:number;collectionId:number;productId:number;order:number;createdAt:string;updatedAt:string;product:WireProduct;
  }[];
}
export function mapCollection(input:WireCollection):Collection {
  return {...input,id:String(input.id),createdAt:new Date(input.createdAt),updatedAt:new Date(input.updatedAt),
    productCollections:input.productCollections?.map(member=>({...member,id:String(member.id),
      collectionId:String(member.collectionId),productId:String(member.productId),createdAt:new Date(member.createdAt),
      updatedAt:new Date(member.updatedAt),product:mapProduct(member.product)}))};
}

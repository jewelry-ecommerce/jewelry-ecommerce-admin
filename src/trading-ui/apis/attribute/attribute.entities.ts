
import { type AttributeDisplayType } from './attribute.enum';
import { type AttributeStatus } from './attribute.enum';

export interface AttributeCategory {
  id: string;
  attributeId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  attribute?: Attribute;
  category?: { id: string; name: string };
}

export interface AttributeValue {
  id: string;
  code: string;
  value: string;
  image?: string | null;
  attributeId: string;
}

export interface Attribute {
  id: string;
  tenantCode?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  name: string;
  code: string;
  index: number;
  status: AttributeStatus;
  isGlobal: boolean;
  isFilterable: boolean;
  isVariantAxis: boolean;
  displayType: AttributeDisplayType;
  values?: AttributeValue[];
  categoryMappings?: AttributeCategory[];
}

export type AttributeTreeItem = Attribute & { children?: AttributeValue[] };

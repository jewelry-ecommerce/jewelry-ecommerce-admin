export type CmsBlockSchemaEnumValue = string | number;

interface CmsBlockSchemaBase {
  title?: string;
  description?: string;
  default?: unknown;
}

export interface CmsBlockObjectSchemaDefinition extends CmsBlockSchemaBase {
  type: 'object';
  'x-propertyOrder'?: string[];
  properties?: Record<string, CmsBlockSchemaDefinition>;
  required?: string[];
}

export interface CmsBlockStringSchemaDefinition extends CmsBlockSchemaBase {
  type: 'string';
  format?: 'html' | 'textarea' | 'json';
  enum?: string[];
  enumNames?: string[];
}

export interface CmsBlockNumberSchemaDefinition extends CmsBlockSchemaBase {
  type: 'number';
  enum?: number[];
  enumNames?: string[];
  minimum?: number;
  maximum?: number;
}

export interface CmsBlockBooleanSchemaDefinition extends CmsBlockSchemaBase {
  type: 'boolean';
}

export interface CmsBlockArraySchemaDefinition extends CmsBlockSchemaBase {
  type: 'array';
  items?: CmsBlockSchemaDefinition;
  minItems?: number;
  maxItems?: number;
}

// prettier-ignore
export type CmsBlockSchemaDefinition =
  CmsBlockObjectSchemaDefinition | CmsBlockStringSchemaDefinition | CmsBlockNumberSchemaDefinition | CmsBlockBooleanSchemaDefinition | CmsBlockArraySchemaDefinition;

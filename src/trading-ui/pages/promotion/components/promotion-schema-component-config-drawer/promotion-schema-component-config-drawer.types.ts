import { type ComponentKind } from '../../../../apis/promotion/promotion.enum';

export type SchemaComponentDrawerKind = ComponentKind.CONDITION | ComponentKind.BENEFIT;

export type SchemaComponentValidationErrors = Record<string, string>;


import { expect, test } from 'vitest';
import { CategoryStatus } from './category.enum';
import { mapCategory, type WireCategory } from './category-backend.mapper';
test('category IDs map to UI keys while tree, tax and SEO are retained',()=>{
  const category:WireCategory={id:12,parentId:null,name:'Nhẫn',slug:'nhan',level:1,taxRate:8,
    status:CategoryStatus.ACTIVE,directAttributeIds:[3],createdAt:'2026-10-10T00:00:00Z',updatedAt:'2026-10-10T00:00:00Z',
    metaTitle:'Danh mục nhẫn',children:[]};
  const mapped=mapCategory(category);
  expect(mapped.id).toBe('12');
  expect(mapped.directAttributeIds).toEqual(['3']);
  expect(mapped.taxRate).toBe(8);
  expect(mapped.metaTitle).toBe('Danh mục nhẫn');
  expect(mapped.children).toEqual([]);
});

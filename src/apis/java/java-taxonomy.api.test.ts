import { beforeEach, expect, test, vi } from 'vitest';
import { AttributeDisplayType, AttributeStatus } from '@/trading-ui/apis/attribute/attribute.enum';
const request = vi.hoisted(()=>vi.fn());
vi.mock('../backend-request',()=>({backendRequest:request}));
import { javaAttributeDetail, javaSaveAttribute, javaCategoryTree, javaAttributeTree } from './java-taxonomy.api';
const attribute={id:7,name:'Màu',code:'COLOR',type:'SELECT',status:'ACTIVE',displayType:'IMAGE',options:['Đỏ'],
  values:[{id:21,code:'RED',value:'Đỏ',imageUrl:'/red.png'}]};
const root={id:1,parentId:null,name:'Nhẫn',slug:'nhan',code:'RING',status:'ACTIVE',level:1,
  directAttributeIds:[7],inheritedAttributeIds:[],effectiveAttributeIds:[7]};
beforeEach(()=>{
  request.mockReset();
  request.mockImplementation(async(path:string,method?:string,body?:Record<string,unknown>)=>{
    if(path.includes('/attributes')) return method?{...attribute,...body,values:attribute.values}:[attribute];
    return [root,{...root,id:2,parentId:1,level:2,code:'CHILD',directAttributeIds:[],inheritedAttributeIds:[7]}];
  });
});
test('values use stable entity IDs and preserve code/image/status',async()=>{
  const value=await javaAttributeDetail('7');
  expect(value.values?.[0]).toMatchObject({id:'21',code:'RED',value:'Đỏ',image:'/red.png'});
  expect(value.displayType).toBe(AttributeDisplayType.IMAGE);
});
test('editing values sends existing ID even when names change',async()=>{
  await javaSaveAttribute({name:'Màu',code:'COLOR',status:AttributeStatus.ACTIVE,displayType:AttributeDisplayType.IMAGE,
    values:[{id:'21',code:'RED',value:'Đỏ đậm',image:'/new.png'}]},'7');
  expect(request).toHaveBeenLastCalledWith('admin/catalog/attributes/7','PUT',
    expect.objectContaining({values:[{id:21,code:'RED',value:'Đỏ đậm',imageUrl:'/new.png'}]}));
});
test('category tree retains level, code and inherited attribute scope',async()=>{
  const tree=await javaCategoryTree();
  expect(tree[0]).toMatchObject({code:'RING',level:1,directAttributeIds:['7']});
  expect(tree[0].children?.[0].inheritedAttributes?.[0].id).toBe('7');
  expect((await javaAttributeTree('2')).list[0].children?.[0].id).toBe('21');
});

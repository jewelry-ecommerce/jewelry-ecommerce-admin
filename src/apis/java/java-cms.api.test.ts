import {beforeEach,expect,test,vi} from 'vitest';
const transport=vi.hoisted(()=>({request:vi.fn()}));
vi.mock('../backend-request',()=>({backendRequest:transport.request}));
import {javaCmsPage,javaSaveCmsPage} from './java-cms.api';
import {CmsDemoBlockType,CmsDemoStatus} from '../cms-demo/cms-demo.interface';
const page={id:17,name:'Test',slug:'test',status:CmsDemoStatus.DRAFT,locale:'vi-VN',isActive:true,seo:{title:'Test',description:''},blocks:[{id:29,type:CmsDemoBlockType.BANNER,sortOrder:1,isVisible:true,config:{placementCode:'hero'}}]};
beforeEach(()=>transport.request.mockReset().mockResolvedValue(page));
test('numeric Java IDs are normalized at the UI boundary, including block IDs',async()=>{
 const result=await javaCmsPage('17');expect(result.id).toBe('17');expect(result.blocks[0].id).toBe('29');
});
test('saving an existing page uses PUT rather than creating a duplicate page',async()=>{
 const result=await javaCmsPage('17');await javaSaveCmsPage({...result,status:CmsDemoStatus.PUBLISHED});
 expect(transport.request).toHaveBeenLastCalledWith('admin/cms/pages/17','PUT',expect.objectContaining({status:'PUBLISHED',blocks:[expect.objectContaining({type:'BANNER'})]}));
});
